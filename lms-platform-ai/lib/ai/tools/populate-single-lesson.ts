// @ts-nocheck
import { tool } from "ai";
import { z } from "zod";
import { writeClient } from "@/sanity/lib/client";

/**
 * Tool to populate a single lesson with detailed markdown content
 * This allows incremental content generation to avoid token limits
 */
export const populateSingleLessonTool = tool({
    description:
        "Populate a SINGLE lesson with detailed markdown content. Use this to add content one lesson at a time.",
    parameters: z.object({
        lessonId: z
            .string()
            .describe("The Sanity document ID of the lesson to populate"),
        content: z
            .string()
            .describe(
                "The full markdown content for this lesson. Should be comprehensive and educational."
            ),
        resources: z
            .array(
                z.object({
                    title: z.string().describe("Resource title"),
                    url: z.string().describe("Resource URL"),
                    type: z
                        .enum(["video", "article", "documentation", "tool"])
                        .describe("Type of resource"),
                })
            )
            .optional()
            .describe("Optional array of learning resources for this lesson"),
    }),
    execute: async (args: any) => {
        const { lessonId, content, resources } = args;
        try {
            // Update the lesson with content
            const updated = await writeClient
                .patch(lessonId)
                .set({
                    content,
                    resources: resources || [],
                    updatedAt: new Date().toISOString(),
                })
                .commit();

            return {
                success: true,
                lessonId: updated._id,
                message: `Lesson "${updated.title || lessonId}" populated successfully with ${content.length} characters of content`,
            };
        } catch (error) {
            console.error("Error populating lesson:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    },
});

