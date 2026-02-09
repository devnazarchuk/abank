// @ts-nocheck
import { tool } from "ai";
import { z } from "zod";

const searchSchema = z.object({
    query: z.string().describe("Search query for YouTube videos"),
    maxResults: z
        .number()
        .optional()
        .default(5)
        .describe("Maximum number of results to return (1-10)"),
    maxDuration: z
        .number()
        .optional()
        .describe("Maximum video duration in minutes (optional filter)"),
    language: z
        .string()
        .optional()
        .default("en")
        .describe("Language code (e.g., 'en', 'uk', 'de')"),
});

/**
 * YouTube Search Tool
 * Searches YouTube for videos based on query and returns relevant results
 */
export const youtubeSearchTool = tool({
    description:
        "Search YouTube for educational videos. Use this to find relevant video content for course lessons.",
    parameters: searchSchema,
    execute: async (args: any) => {
        const { query, maxResults, maxDuration, language } = args;
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!apiKey) {
            return {
                success: false,
                error:
                    "YouTube API key not configured. Please add YOUTUBE_API_KEY to .env.local",
                videos: [],
            };
        }

        try {
            // Build YouTube Data API v3 search request
            const params = new URLSearchParams({
                part: "snippet",
                q: query,
                type: "video",
                maxResults: Math.min(maxResults, 10).toString(),
                videoEmbeddable: "true",
                videoSyndicated: "true",
                relevanceLanguage: language,
                key: apiKey,
            });

            // Add duration filter if specified
            if (maxDuration) {
                // short: < 4 min, medium: 4-20 min, long: > 20 min
                if (maxDuration <= 4) {
                    params.append("videoDuration", "short");
                } else if (maxDuration <= 20) {
                    params.append("videoDuration", "medium");
                }
            }

            const searchResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/search?${params}`,
            );

            if (!searchResponse.ok) {
                const errorData = await searchResponse.json();
                return {
                    success: false,
                    error: `YouTube API error: ${errorData.error?.message || "Unknown error"}`,
                    videos: [],
                };
            }

            const searchData = await searchResponse.json();

            // Get video details (duration, viewCount, etc.)
            const videoIds = searchData.items
                .map((item: any) => item.id.videoId)
                .join(",");

            const detailsResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id=${videoIds}&key=${apiKey}`,
            );

            const detailsData = await detailsResponse.json();

            // Format results
            const videos = detailsData.items.map((item: any) => {
                // Parse duration from ISO 8601 format (e.g., "PT15M33S")
                const duration = parseDuration(item.contentDetails.duration);

                return {
                    id: item.id,
                    title: item.snippet.title,
                    description: item.snippet.description,
                    channelTitle: item.snippet.channelTitle,
                    thumbnailUrl: item.snippet.thumbnails.medium.url,
                    duration: duration,
                    durationFormatted: formatDuration(duration),
                    viewCount: parseInt(item.statistics.viewCount || "0", 10),
                    embedUrl: `https://www.youtube.com/embed/${item.id}`,
                    watchUrl: `https://www.youtube.com/watch?v=${item.id}`,
                };
            });

            return {
                success: true,
                videos,
                query,
                totalResults: searchData.pageInfo?.totalResults || 0,
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to search YouTube: ${error instanceof Error ? error.message : "Unknown error"}`,
                videos: [],
            };
        }
    },
});

// Helper function to parse ISO 8601 duration to seconds
function parseDuration(isoDuration: string): number {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = isoDuration.match(regex);

    if (!matches) return 0;

    const hours = parseInt(matches[1] || "0", 10);
    const minutes = parseInt(matches[2] || "0", 10);
    const seconds = parseInt(matches[3] || "0", 10);

    return hours * 3600 + minutes * 60 + seconds;
}

// Helper function to format seconds to readable duration
function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
        return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
}
