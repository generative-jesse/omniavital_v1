import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "add_journal_entry",
  title: "Add journal entry",
  description:
    "Save a dated journal entry for the signed-in member. Use for reflections, wins, symptoms or anything they want written down.",
  inputSchema: {
    body: z.string().trim().describe("The journal entry text, in the member's voice."),
    title: z.string().trim().optional().describe("Short title for the entry."),
    tags: z.array(z.string()).optional().describe("Short themes for the entry."),
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
    const supabase = supabaseForUser(ctx);
    const row = {
      user_id: ctx.getUserId(),
      logged_date: input.logged_date ?? new Date().toISOString().slice(0, 10),
      title: input.title ?? null,
      body: input.body,
      tags: (input.tags ?? []).slice(0, 8),
      source: "agent",
    };
    const { data, error } = await supabase.from("journal_entries").insert(row).select().maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Journal entry saved for ${row.logged_date}.` }],
      structuredContent: { journal_entry: data },
    };
  },
});
