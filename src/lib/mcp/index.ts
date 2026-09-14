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
  version: "0.1.0",
  instructions:
    "Tools for OmniaVital. Browse the ritual product catalog, and for the signed-in member: read their profile and orders, log daily rituals, check their streak and ring status, and read or post in The Collective community forum.",
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
    listCommunityPosts,
    createCommunityPost,
  ],
});
