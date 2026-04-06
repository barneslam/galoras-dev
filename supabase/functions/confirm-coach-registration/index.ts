import Stripe from "https://esm.sh/stripe@14";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIER_LABELS: Record<string, string> = {
  pro:    "Pro — $49/month",
  elite:  "Elite — $99/month",
  master: "Master — $197/month",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { setupIntentId } = await req.json();

    // Retrieve setup intent from Stripe to get payment method
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
    if (setupIntent.status !== "succeeded") {
      return new Response(JSON.stringify({ error: "Setup not completed" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const paymentMethodId = typeof setupIntent.payment_method === "string"
      ? setupIntent.payment_method
      : setupIntent.payment_method?.id;

    // Update registration record
    const { data: reg } = await supabase
      .from("coach_registrations")
      .update({
        stripe_payment_method_id: paymentMethodId,
        stripe_setup_intent_id: setupIntentId,
        status: "pending_review",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select("registration_token, selected_tier, full_name, email")
      .single();

    if (!reg) {
      return new Response(JSON.stringify({ error: "Registration not found" }), {
        status: 404, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Send confirmation + registration link email via Resend (if configured)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://galoras-dev.netlify.app";
    const registrationLink = `${siteUrl}/complete-registration?token=${reg.registration_token}`;
    const tierLabel = TIER_LABELS[reg.selected_tier] ?? reg.selected_tier;

    if (RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Galoras <noreply@galoras.com>",
          to: [reg.email],
          subject: "Your Galoras Coach Application — Next Steps",
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
              <h2 style="color:#000">Welcome to Galoras, ${reg.full_name ?? "Coach"}!</h2>
              <p>Thank you for applying to join the Galoras Coach Ecosystem as a <strong>${tierLabel}</strong> coach.</p>
              <p>Your payment method has been securely saved. <strong>You will not be charged until your application has been reviewed and approved</strong> by our team.</p>
              <p>To complete your application, please fill in your coach profile using the link below:</p>
              <p style="margin:24px 0">
                <a href="${registrationLink}"
                   style="background:#38bdf8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
                  Complete My Coach Profile →
                </a>
              </p>
              <p style="color:#666;font-size:13px">This link is unique to your account. If you are not logged in, you will be asked to sign in first.</p>
              <p style="color:#666;font-size:13px">If you did not apply to join Galoras, please ignore this email.</p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
              <p style="color:#999;font-size:12px">© Galoras · galoras.com</p>
            </div>
          `,
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true, registrationLink }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err: any) {
    console.error("confirm-coach-registration error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
