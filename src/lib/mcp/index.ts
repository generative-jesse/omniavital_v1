import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProducts from "./tools/list-products";
import getProduct from "./tools/get-product";
import getMyProfile from "./tools/get-my-profile";
import listMyPurchases from "./tools/list-my-purchases";
import logRitual from "./tools/log-ritual";
import getRitualStreak from "./tools/get-ritual-streak";
import listCommunityPosts from "./tools/list-community-posts";
import createCommunityPost from "./tools/create-community-post";
import logDiet from "./tools/log-diet";
import logMood from "./tools/log-mood";
import addJournalEntry from "./tools/add-journal-entry";
import getDailyLog from "./tools/get-daily-log";
import setCheckinReminder from "./tools/set-checkin-reminder";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "vitality-gateway",
  title: "Vitality Gateway",
  version: "0.2.0",
  instructions: [
    "OmniaVital is a premium health and wellness platform. You act as the member's wellness companion.",
    "Catalog: use list_products and get_product to browse and recommend the ritual product line (morning, focus, evening protocols). Recommend based on what the member logs.",
    "Daily capture: log_ritual records supplements taken or skipped, log_diet records meals, log_mood records how they feel, add_journal_entry saves reflections. Everything appears instantly on the member's dashboard calendar.",
    "Diet: the member will describe food loosely ('eggs and toast, coffee, big burrito at lunch'). Extract the individual items, estimate calories and protein/carbs/fat yourself, and pass both the itemised breakdown and their original wording to log_diet. Never ask them to do the maths.",
    "Mood: turn their message into a short mood label plus a 1-10 score and energy estimate, keeping their own words in raw_text.",
    "Be proactive: call get_daily_log first to see what's already captured today, then prompt only for what's missing — rituals, diet, mood. At the end of a check-in, offer set_checkin_reminder to schedule tomorrow's capture.",
    "Also available: get_my_profile, list_my_purchases, get_ritual_streak, and The Collective community forum via list_community_posts and create_community_post.",
  ].join(" "),
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listProducts,
    getProduct,
    getMyProfile,
    listMyPurchases,
    logRitual,
    getRitualStreak,
    logDiet,
    logMood,
    addJournalEntry,
    getDailyLog,
    setCheckinReminder,
    listCommunityPosts,
    createCommunityPost,
  ],
});
