import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "log_mood",
  title: "Log mood",
  description:
    "Log how the member is feeling. Summarise their message into a short mood label, estimate a 1-10 score and energy level, pull out a few tags, and keep their original words in raw_text.",
  inputSchema: {
    mood: z.string().trim().describe("Short mood label, e.g. 'focused', 'anxious', 'calm'."),
    raw_text: z.string().trim().optional().describe("The member's original words."),
    score: z.number().optional().describe("Overall mood 1 (worst) to 10 (best)."),
    energy: z.number().optional().describe("Energy level 1 (depleted) to 10 (peak)."),
    tags: z.array(z.string()).optional().describe("Short themes, e.g. ['work stress','poor sleep']."),
    logged_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Date in YYYY-MM-DD. Defaults to today."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const clamp = (n?: number) =>
      typeof n === "number" ? Math.max(1, Math.min(10, Math.round(n))) : null;
    const supabase = supabaseForUser(ctx);
    const row = {
      user_id: ctx.getUserId(),
      logged_date: input.logged_date ?? new Date().toISOString().slice(0, 10),
      mood: input.mood,
      raw_text: input.raw_text ?? null,
      score: clamp(input.score),
      energy: clamp(input.energy),
      tags: (input.tags ?? []).slice(0, 8),
      source: "agent",
    };
    const { data, error } = await supabase.from("mood_logs").insert(row).select().maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Logged mood "${row.mood}" for ${row.logged_date}.` }],
      structuredContent: { mood_log: data },
    };
  },
});
