import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "log_diet",
  title: "Log food / diet",
  description:
    "Log what the member ate. Take their messy, natural description of a meal, extract the individual food items, and estimate calories and macros before calling this. Always pass the member's original wording in raw_text.",
  inputSchema: {
    raw_text: z.string().trim().describe("The member's original description of what they ate."),
    meal: z
      .string()
      .trim()
      .optional()
      .describe("breakfast, lunch, dinner, snack or other. Infer from context or time."),
    items: z
      .array(
        z.object({
          name: z.string().describe("Food item, e.g. 'grilled chicken breast'."),
          quantity: z.string().optional().describe("Portion, e.g. '6 oz' or '1 cup'."),
          calories: z.number().optional(),
          protein_g: z.number().optional(),
          carbs_g: z.number().optional(),
          fat_g: z.number().optional(),
        }),
      )
      .optional()
      .describe("Cleaned, itemised breakdown of the meal with per-item estimates."),
    calories: z.number().optional().describe("Total estimated calories for the meal."),
    protein_g: z.number().optional().describe("Total estimated protein in grams."),
    carbs_g: z.number().optional().describe("Total estimated carbohydrates in grams."),
    fat_g: z.number().optional().describe("Total estimated fat in grams."),
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
    const items = input.items ?? [];
    const sum = (key: "calories" | "protein_g" | "carbs_g" | "fat_g") => {
      const total = items.reduce((acc, i) => acc + (Number(i[key]) || 0), 0);
      return total > 0 ? total : undefined;
    };
    const supabase = supabaseForUser(ctx);
    const row = {
      user_id: ctx.getUserId(),
      logged_date: input.logged_date ?? new Date().toISOString().slice(0, 10),
      meal: input.meal?.toLowerCase() ?? "other",
      raw_text: input.raw_text,
      items,
      calories: Math.round(input.calories ?? sum("calories") ?? 0) || null,
      protein_g: input.protein_g ?? sum("protein_g") ?? null,
      carbs_g: input.carbs_g ?? sum("carbs_g") ?? null,
      fat_g: input.fat_g ?? sum("fat_g") ?? null,
      source: "agent",
    };
    const { data, error } = await supabase.from("diet_logs").insert(row).select().maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [
        {
          type: "text",
          text: `Logged ${row.meal} for ${row.logged_date}${row.calories ? ` (~${row.calories} kcal)` : ""}. It now appears on the member's dashboard.`,
        },
      ],
      structuredContent: { diet_log: data },
    };
  },
});
