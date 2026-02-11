import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * Common configuration for the AI model used throughout the app.
 * Can be overridden via AI_MODEL environment variable.
 */
export const defaultModel = openrouter(process.env.AI_MODEL || "qwen/qwen3-next-80b-a3b-instruct:free");
