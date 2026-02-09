// @ts-nocheck
import { tool } from "ai";
import { z } from "zod";

const researchSchema = z.object({
    query: z.string().describe("Research query or topic to search for"),
    maxResults: z
        .number()
        .optional()
        .default(5)
        .describe("Maximum number of results to return"),
});

/**
 * Web Research Tool
 * Performs web search to gather information about course topics
 * Uses Tavily API for comprehensive search results
 */
export const webResearchTool = tool({
    description:
        "Search the web for educational content, tutorials, and learning resources about a topic. Use this to research course content and find relevant learning materials.",
    parameters: researchSchema,
    execute: async (args: any) => {
        const { query, maxResults } = args;
        const apiKey = process.env.TAVILY_API_KEY;

        // If no Tavily API key, return basic search suggestion
        if (!apiKey) {
            return {
                success: false,
                error:
                    "Tavily API key not configured. Add TAVILY_API_KEY to .env.local for web research, or this feature will use basic suggestions.",
                results: [
                    {
                        title: `Learn ${query}`,
                        url: `https://www.google.com/search?q=${encodeURIComponent(`learn ${query} tutorial`)}`,
                        snippet: `Research suggestion: Search for tutorials and courses about ${query}`,
                    },
                ],
            };
        }

        try {
            const response = await fetch("https://api.tavily.com/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    api_key: apiKey,
                    query: `${query} tutorial learning course`,
                    search_depth: "basic",
                    max_results: maxResults,
                    include_answer: true,
                    include_domains: [
                        "developer.mozilla.org",
                        "stackoverflow.com",
                        "github.com",
                        "medium.com",
                        "dev.to",
                        "freecodecamp.org",
                        "udemy.com",
                        "coursera.org",
                    ],
                }),
            });

            if (!response.ok) {
                throw new Error(`Tavily API error: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                success: true,
                results: data.results.map((result: any) => ({
                    title: result.title,
                    url: result.url,
                    snippet: result.content || result.snippet,
                    score: result.score,
                })),
                answer: data.answer, // AI-generated summary of the topic
                query,
            };
        } catch (error) {
            return {
                success: false,
                error: `Web research failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                results: [],
            };
        }
    },
});
