import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

function ringFor(streak: number) {
  if (streak >= 60) return "Gold Ring";
  if (streak >= 21) return "Silver Ring";
  if (streak >= 7) return "Bronze Ring";
  return "Building toward Bronze Ring (7 days)";
}

export default defineTool({
  name: "get_ritual_streak",
  title: "Get my ritual streak",
  description: "Get the signed-in member's current daily ritual streak, ring status and today's progress.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("ritual_logs")
      .select("logged_date, completed")
      .eq("user_id", ctx.getUserId())
      .eq("completed", true)
      .order("logged_date", { ascending: false })
      .limit(365);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const logs = data ?? [];
    const uniqueDates = [...new Set(logs.map((l) => l.logged_date))].sort().reverse();
    let streak = 0;
    for (let i = 0; i < uniqueDates.length; i++) {
      const expected = new Date();
      expected.setDate(expected.getDate() - i);
      if (uniqueDates[i] === expected.toISOString().slice(0, 10)) streak++;
      else break;
    }
    const today = new Date().toISOString().slice(0, 10);
    const completedToday = logs.filter((l) => l.logged_date === today).length;
    const result = { streak, ring: ringFor(streak), completedToday, activeDays: uniqueDates.length };
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
      structuredContent: result,
    };
  },
});
