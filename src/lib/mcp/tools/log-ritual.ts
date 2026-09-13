import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "log_ritual",
  title: "Log a ritual",
  description: "Record a completed (or skipped) ritual for the signed-in member on a given date.",
  inputSchema: {
    product_slug: z
      .string()
      .trim()
      .min(1)
      .describe("Slug of the ritual product, e.g. morning-protocol."),
    logged_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Date in YYYY-MM-DD. Defaults to today."),
    completed: z.boolean().default(true).describe("Whether the ritual was completed."),
    notes: z.string().trim().max(500).optional().describe("Optional note about the ritual."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ product_slug, logged_date, completed, notes }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name")
      .eq("slug", product_slug)
      .maybeSingle();
    if (productError) return { content: [{ type: "text", text: productError.message }], isError: true };
    if (!product) {
      return { content: [{ type: "text", text: `No product with slug "${product_slug}".` }], isError: true };
    }

    const date = logged_date ?? new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("ritual_logs")
      .insert({
        user_id: ctx.getUserId(),
        product_id: product.id,
        logged_date: date,
        completed,
        notes: notes ?? null,
      })
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Logged ${product.name} for ${date}.` }],
      structuredContent: { log: data },
    };
  },
});
