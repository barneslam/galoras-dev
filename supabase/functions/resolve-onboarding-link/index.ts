import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shortId } = await req.json();

    if (!shortId) {
      return new Response(
        JSON.stringify({ error: "shortId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Look up the onboarding link by short_id
    const { data: link, error } = await supabase
      .from("onboarding_links")
      .select("onboarding_token, expires_at")
      .eq("short_id", shortId)
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Database error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!link) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired link" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiry
    if (new Date(link.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "This onboarding link has expired" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Do NOT mark used_at here — allow retries and device switches
    // used_at is set only by complete-onboarding after successful completion

    return new Response(
      JSON.stringify({ token: link.onboarding_token }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
