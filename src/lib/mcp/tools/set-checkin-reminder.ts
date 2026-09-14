import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "set_checkin_reminder",
  title: "Schedule a check-in",
  description:
    "Schedule a check-in so the member is prompted to capture their diet, mood and rituals later. Offer this at the end of a logging conversation. The reminder appears on their dashboard.",
  inputSchema: {
    remind_at: z
      .string()
      .trim()
      .describe("When to check in, as an ISO 8601 timestamp, e.g. 2026-09-15T18:00:00Z."),
    kind: z.string().trim().optional().describe("daily, diet, mood, ritual or once."),
    message: z.string().trim().optional().describe("What to ask the member when checking in."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ remind_at, kind, message }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const when = new Date(remind_at);
    if (Number.isNaN(when.getTime())) {
      return { content: [{ type: "text", text: `"${remind_at}" is not a valid timestamp.` }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("checkin_reminders")
      .insert({
        user_id: ctx.getUserId(),
        kind: kind?.toLowerCase() ?? "daily",
        remind_at: when.toISOString(),
        message: message ?? "Time to capture today's rituals, diet and mood.",
      })
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Check-in scheduled for ${when.toISOString()}.` }],
      structuredContent: { reminder: data },
    };
  },
});
