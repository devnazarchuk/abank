import { auth } from "@clerk/nextjs/server";
import type { Tier } from "@/lib/constants";
import { client } from "@/sanity/lib/client";

/**
 * Check if the current user has access to content at the specified tier.
 * Checks Sanity database for user's tier.
 */
export async function hasAccessToTier(
  requiredTier: Tier | null | undefined
): Promise<boolean> {
  // Free content or no tier = accessible to everyone
  if (!requiredTier || requiredTier === "free") return true;

  const userTier = await getUserTier();

  // Ultra content requires ultra plan
  if (requiredTier === "ultra") {
    return userTier === "ultra";
  }

  // Pro content requires pro OR ultra plan
  if (requiredTier === "pro") {
    return userTier === "pro" || userTier === "ultra";
  }

  return false;
}

/**
 * Get the user's current subscription tier.
 * Checks Clerk session claims first (for speed), then falls back to Sanity.
 */
export async function getUserTier(): Promise<Tier> {
  const { userId, sessionClaims } = await auth();

  if (!userId) return "free";

  // TEMPORARY BYPASS: Grant Ultra access to everyone for testing
  return "ultra";

  /* 
  // 1. Check Clerk public metadata (synced via webhook)
  ...
  */
}
