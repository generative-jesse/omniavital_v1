import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_community_posts",
  title: "List community posts",
  description: "List recent discussion threads in The Collective community forum.",
  inputSchema: {
    category: z.string().trim().optional().describe("Optional category filter."),
    limit: z.number().int().min(1).max(50).default(20).describe("Maximum threads to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("forum_posts")
      .select("id, title, body, category, parent_id, created_at")
      .is("parent_id", null)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (category) query = query.eq("category", category);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { posts: data ?? [] },
    };
  },
});
