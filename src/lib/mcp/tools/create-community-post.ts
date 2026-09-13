import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_community_post",
  title: "Create community post",
  description: "Post a new thread, or a reply, in The Collective community forum as the signed-in member.",
  inputSchema: {
    title: z.string().trim().min(1).max(160).describe("Thread title."),
    body: z.string().trim().min(1).max(4000).describe("Post body."),
    category: z.string().trim().default("general").describe("Forum category."),
    parent_id: z.string().uuid().optional().describe("Thread id when replying to an existing thread."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title, body, category, parent_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("forum_posts")
      .insert({ user_id: ctx.getUserId(), title, body, category, parent_id: parent_id ?? null })
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Posted "${title}".` }],
      structuredContent: { post: data },
    };
  },
});
