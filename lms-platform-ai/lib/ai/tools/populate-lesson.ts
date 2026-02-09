// @ts-nocheck
import { tool } from "ai";
import { z } from "zod";
import { client } from "@/sanity/lib/client";

const populateLessonSchema = z.object({
    lessonId: z.string().describe("The Sanity document ID of the lesson"),
    description: z
        .string()
        .describe("Comprehensive 2-3 paragraph description of the lesson"),
    content: z
        .array(
            z.object({
                type: z
                    .enum(["heading", "paragraph", "list", "code"])
                    .describe("Type of content block"),
                text: z.string().describe("The content text"),
                level: z
                    .number()
                    .optional()
                    .describe("Heading level (1-6) for heading blocks"),
                language: z
                    .string()
                    .optional()
                    .describe("Programming language for code blocks"),
                items: z
                    .array(z.string())
                    .optional()
                    .describe("List items for list blocks"),
            }),
        )
        .describe("Structured content blocks for the lesson"),
    youtubeUrl: z
        .string()
        .optional()
        .describe("YouTube video URL (if applicable)"),
    externalResources: z
        .array(
            z.object({
                title: z.string(),
                url: z.string(),
                type: z.enum(["video", "article", "documentation"]),
            }),
        )
        .optional()
        .describe("Additional external learning resources"),
});

/**
 * Populate Lesson Tool
 * Adds comprehensive content to a lesson document
 * Includes description, portable text content, and optional YouTube video
 */
export const populateLessonTool = tool({
    description:
        "Populate a lesson with rich content including description, formatted content blocks, and optional video. Use this to fill in lesson details ONE AT A TIME to avoid token limits.",
    parameters: populateLessonSchema,
    execute: async (args: any) => {
        const {
            lessonId,
            description,
            content,
            youtubeUrl,
            externalResources,
        } = args;

        try {
            // Convert structured content to Sanity's portable text format
            const portableTextBlocks = content.flatMap((block: any) => {
                switch (block.type) {
                    case "heading":
                        return [
                            {
                                _type: "block",
                                style: `h${block.level || 2}`,
                                children: [{ _type: "span", text: block.text }],
                            },
                        ];

                    case "paragraph":
                        return [
                            {
                                _type: "block",
                                style: "normal",
                                children: [{ _type: "span", text: block.text }],
                            },
                        ];

                    case "list":
                        return (block.items || []).map((item: string) => ({
                            _type: "block",
                            style: "normal",
                            listItem: "bullet",
                            children: [{ _type: "span", text: item }],
                        }));

                    case "code":
                        // Note: This requires @sanity/code-input plugin
                        // For now, we'll format as a preformatted block
                        return [
                            {
                                _type: "block",
                                style: "normal",
                                children: [
                                    {
                                        _type: "span",
                                        text: `[Code - ${block.language || "plain"}]\n${block.text}`,
                                        marks: ["code"],
                                    },
                                ],
                            },
                        ];

                    default:
                        return [];
                }
            });

            // Build update patch
            const updateData: any = {
                description,
                content: portableTextBlocks,
            };

            // Add YouTube URL if provided
            if (youtubeUrl) {
                updateData.youtubeUrl = youtubeUrl;
            }

            // Add external resources if provided
            if (externalResources && externalResources.length > 0) {
                updateData.externalResources = externalResources;
            }

            // Update the lesson document
            const updatedLesson = await client
                .patch(lessonId)
                .set(updateData)
                .commit();

            return {
                success: true,
                message: `Successfully populated lesson: ${updatedLesson.title}`,
                lesson: {
                    id: updatedLesson._id,
                    title: updatedLesson.title,
                    description: updatedLesson.description,
                    contentBlocks: portableTextBlocks.length,
                    hasVideo: !!youtubeUrl,
                    externalResourcesCount: externalResources?.length || 0,
                },
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to populate lesson: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    },
});
