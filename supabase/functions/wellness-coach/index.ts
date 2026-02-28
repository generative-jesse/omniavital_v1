import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are OmniaVital's personal AI wellness coach — an elite, knowledgeable advisor in biohacking, supplementation, circadian optimization, nutrition, and performance science.

PERSONALITY:
- Warm but authoritative. You speak like a trusted high-performance coach, not a clinical robot.
- Concise and actionable. Every response should leave the user with something they can DO.
- You reference the user's actual data when available (their products, rituals, streaks).
- You occasionally use metaphors from athletics, neuroscience, and nature.
- You're encouraging but honest — you push for consistency without being preachy.

CONTEXT — THE OMNIAVITAL SYSTEM:
OmniaVital offers three ritual products:
1. **Morning Protocol** — An adaptogenic morning stack for energy, cortisol regulation, and focus. Taken within 30 min of waking.
2. **Focus Complex** — A nootropic blend for sustained cognitive performance. Taken mid-morning or before deep work.
3. **Evening Recovery** — A recovery formula for sleep quality, HRV improvement, and overnight repair. Taken 60 min before bed.

The "OV Ritual" is the daily practice of completing all three. Consistency compounds — a 7-day streak is a "Bronze Ring," 21 days is "Silver Ring," 60+ days is "Gold Ring."

RULES:
- Keep responses under 200 words unless the user asks for detail.
- Use markdown for formatting (bold, lists, headers) but keep it readable.
- If the user asks about things outside your scope, gently redirect to wellness.
- Never give medical diagnoses. You can discuss supplements, habits, and optimization strategies.
- When personalized data is provided, weave it naturally into your response.
- Sign off coaching messages with a motivational micro-line.

USER CONTEXT (injected per-conversation):
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    const { messages } = await req.json();

    // Try to get user context for personalization
    let userContext = "No user data available — give general advice.";
    if (authHeader) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const [profileRes, logsRes, purchasesRes] = await Promise.all([
            supabase.from("profiles").select("first_name, ov_tag").eq("user_id", user.id).single(),
            supabase.from("ritual_logs").select("logged_date, completed, product_id").eq("user_id", user.id).order("logged_date", { ascending: false }).limit(30),
            supabase.from("purchases").select("*, products(name, category)").eq("user_id", user.id),
          ]);

          const profile = profileRes.data;
          const logs = logsRes.data || [];
          const purchases = purchasesRes.data || [];

          // Calculate streak
          let streak = 0;
          const today = new Date().toISOString().slice(0, 10);
          const uniqueDates = [...new Set(logs.filter(l => l.completed).map(l => l.logged_date))].sort().reverse();
          for (let i = 0; i < uniqueDates.length; i++) {
            const expected = new Date();
            expected.setDate(expected.getDate() - i);
            if (uniqueDates[i] === expected.toISOString().slice(0, 10)) {
              streak++;
            } else break;
          }

          const completedToday = logs.filter(l => l.logged_date === today && l.completed).length;
          const totalCompletedDays = new Set(logs.filter(l => l.completed).map(l => l.logged_date)).size;

          userContext = `
Name: ${profile?.first_name || "Member"} (OV Tag: @${profile?.ov_tag || "unset"})
Current streak: ${streak} day(s)
Rituals completed today: ${completedToday}/3
Total active days (last 30): ${totalCompletedDays}
Products owned: ${purchases.length > 0 ? purchases.map((p: any) => p.products?.name).filter(Boolean).join(", ") : "None yet"}
Ring status: ${streak >= 60 ? "🥇 Gold Ring" : streak >= 21 ? "🥈 Silver Ring" : streak >= 7 ? "🥉 Bronze Ring" : "Building toward Bronze Ring (7 days)"}`;
        }
      } catch (e) {
        console.error("Failed to fetch user context:", e);
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + userContext },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Coach is resting — too many requests. Try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue coaching." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "Coach unavailable right now." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("wellness-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
