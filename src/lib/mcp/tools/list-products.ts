import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_products",
  title: "List products",
  description: "List the OmniaVital ritual products with pricing, category and tagline.",
  inputSchema: {
    category: z
      .string()
      .trim()
      .optional()
      .describe("Optional category filter, e.g. morning, focus or evening."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category }) => {
    const supabase = supabaseAnon();
    let query = supabase
      .from("products")
      .select("id, slug, name, tagline, description, category, price")
      .order("name");
    if (category) query = query.eq("category", category);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { products: data ?? [] },
    };
  },
});
