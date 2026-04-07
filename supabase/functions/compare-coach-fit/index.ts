import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const {
      coachIds,
      userGoals,
      userChallenges,
      userIndustry,
      userRole,
      coachingAreas,
    } = await req.json();

    if (!coachIds || coachIds.length === 0) {
      return new Response(JSON.stringify({ error: "Missing coachIds" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fetch coach profiles
    const { data: coaches, error: coachError } = await supabase
      .from("coaches")
      .select("id, display_name, headline, bio, positioning_statement, methodology, specialties, audience, tier")
      .in("id", coachIds);

    if (coachError || !coaches || coaches.length === 0) {
      return new Response(JSON.stringify({ error: "Coaches not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Build user context string
    const userContext = [
      userRole     ? `Role: ${userRole}` : null,
      userIndustry ? `Industry: ${userIndustry}` : null,
      userGoals?.length
        ? `Goals: ${userGoals.join(", ")}`
        : null,
      coachingAreas?.length
        ? `Coaching areas wanted: ${coachingAreas.join(", ")}`
        : null,
      userChallenges
        ? `Current challenges: ${userChallenges}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    // Build coach summaries for the prompt
    const coachSummaries = coaches
      .map((c: any) => `
COACH: ${c.display_name} (ID: ${c.id})
Tier: ${c.tier || "pro"}
Headline: ${c.headline || "—"}
Specialties: ${(c.specialties || []).join(", ") || "—"}
Audience: ${(c.audience || []).join(", ") || "—"}
Positioning: ${c.positioning_statement || c.bio || "—"}
Methodology: ${c.methodology || "—"}
`.trim())
      .join("\n\n---\n\n");

    const prompt = `You are a Galoras Compass analyst. A client is comparing ${coaches.length} coaches and needs to understand how each one addresses their specific situation.

CLIENT PROFILE:
${userContext || "No profile data provided — give a general assessment."}

COACHES BEING COMPARED:
${coachSummaries}

For EACH coach, return a JSON object with:
- id: the coach's ID (exactly as given)
- summary: 2–3 sentences explaining specifically how this coach addresses the client's stated goals and challenges. Be concrete — reference the client's actual goals and the coach's real specialties.
- strengths: array of 3 short phrases (max 6 words each) showing this coach's strongest fit points for this client
- consideration: one sentence on what this coach may NOT fully cover for the client (honest gap)
- matchScore: integer 0–100 rating how well this coach fits this specific client

Respond with only a valid JSON array: [{ id, summary, strengths, consideration, matchScore }, ...]`;

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      console.error("Anthropic error:", err);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const aiData = await anthropicRes.json();
    const raw = aiData.content?.[0]?.text || "[]";

    // Parse the JSON array from the response
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const fits = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return new Response(JSON.stringify({ fits }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("compare-coach-fit error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
