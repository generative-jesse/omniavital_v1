import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_daily_log",
  title: "Get a day's health log",
  description:
    "Read everything the signed-in member has logged for a date or date range: rituals taken, meals with nutrition, moods and journal entries. Call this before prompting them, so you only ask for what is missing.",
  inputSchema: {
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Start date YYYY-MM-DD. Defaults to today."),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("End date YYYY-MM-DD. Defaults to start_date."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ start_date, end_date }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const uid = ctx.getUserId();
    const start = start_date ?? new Date().toISOString().slice(0, 10);
    const end = end_date ?? start;

    const range = (q: any) => q.eq("user_id", uid).gte("logged_date", start).lte("logged_date", end);

    const [rituals, diet, mood, journal] = await Promise.all([
      range(supabase.from("ritual_logs").select("logged_date, completed, notes, products(name, category)")),
      range(supabase.from("diet_logs").select("logged_date, logged_at, meal, raw_text, items, calories, protein_g, carbs_g, fat_g")),
      range(supabase.from("mood_logs").select("logged_date, logged_at, mood, score, energy, tags, raw_text")),
      range(supabase.from("journal_entries").select("logged_date, logged_at, title, body, tags")),
    ]);

    const firstError = [rituals, diet, mood, journal].find((r) => r.error)?.error;
    if (firstError) return { content: [{ type: "text", text: firstError.message }], isError: true };

    const meals = diet.data ?? [];
    const result = {
      range: { start, end },
      rituals: rituals.data ?? [],
      diet: meals,
      total_calories: meals.reduce((a: number, m: any) => a + (m.calories ?? 0), 0),
      mood: mood.data ?? [],
      journal: journal.data ?? [],
      missing: {
        diet: meals.length === 0,
        mood: (mood.data ?? []).length === 0,
        rituals: (rituals.data ?? []).length === 0,
      },
    };
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
      structuredContent: result,
    };
  },
});
