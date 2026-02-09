// @ts-nocheck
import { tool } from "ai";
import { z } from "zod";
import { client } from "@/sanity/lib/client";

const createCourseSchema = z.object({
    course: z.object({
        title: z.string().describe("Course title"),
        description: z.string().describe("Course description"),
        tier: z
            .enum(["free", "pro", "ultra"])
            .describe("Access tier for the course"),
        categoryId: z
            .string()
            .optional()
            .describe("Category ID (if available)"),
        targetAudience: z
            .enum(["beginner", "intermediate", "advanced", "mixed"])
            .optional(),
        estimatedDuration: z.number().optional().describe("Estimated hours"),
    }),
    modules: z.array(
        z.object({
            title: z.string().describe("Module title"),
            description: z.string().describe("Module description"),
            lessons: z.array(
                z.object({
                    title: z.string().describe("Lesson title"),
                    description: z
                        .string()
                        .optional()
                        .describe("Brief lesson description"),
                }),
            ),
        }),
    ),
});

/**
 * Create Course Structure Tool
 * Creates Course, Module, and Lesson documents in Sanity
 * Returns document IDs for further population
 */
export const createCourseStructureTool = tool({
    description:
        "Create the complete course structure in Sanity: Course document, Module documents, and Lesson skeleton documents. Use this after gathering requirements and research.",
    parameters: createCourseSchema,
    execute: async (args: any) => {
        const { course, modules } = args;
        try {
            // Create all lesson documents first
            const lessonPromises = modules.flatMap((module: any) =>
                module.lessons.map((lesson: any) =>
                    client.create({
                        _type: "lesson",
                        title: lesson.title,
                        description: lesson.description || "",
                        slug: {
                            _type: "slug",
                            current: generateSlug(lesson.title),
                        },
                    }),
                ),
            );

            const createdLessons = await Promise.all(lessonPromises);

            // Create module documents with lesson references
            let lessonIndex = 0;
            const modulePromises = modules.map((module: any) => {
                const moduleLessonCount = module.lessons.length;
                const moduleLessonRefs = createdLessons
                    .slice(lessonIndex, lessonIndex + moduleLessonCount)
                    .map((lesson) => ({
                        _type: "reference",
                        _ref: lesson._id,
                    }));
                lessonIndex += moduleLessonCount;

                return client.create({
                    _type: "module",
                    title: module.title,
                    description: module.description,
                    lessons: moduleLessonRefs,
                });
            });

            const createdModules = await Promise.all(modulePromises);

            // Create course document with module references
            const courseDoc = await client.create({
                _type: "course",
                title: course.title,
                description: course.description,
                slug: {
                    _type: "slug",
                    current: generateSlug(course.title),
                },
                tier: course.tier,
                featured: false,
                modules: createdModules.map((module) => ({
                    _type: "reference",
                    _ref: module._id,
                })),
                ...(course.categoryId && {
                    category: {
                        _type: "reference",
                        _ref: course.categoryId,
                    },
                }),
                // Add custom fields if they exist in schema
                aiGenerated: true,
                ...(course.targetAudience && { targetAudience: course.targetAudience }),
                ...(course.estimatedDuration && {
                    estimatedDuration: course.estimatedDuration,
                }),
            });

            // Build structure summary
            const structure = {
                course: {
                    id: courseDoc._id,
                    title: courseDoc.title,
                    slug: courseDoc.slug?.current,
                },
                modules: createdModules.map((module, moduleIdx) => ({
                    id: module._id,
                    title: module.title,
                    lessons: module.lessons?.map(
                        (lessonRef: any, lessonIdx: number) => {
                            const lessonDoc = createdLessons.find(
                                (l) => l._id === lessonRef._ref,
                            );
                            return {
                                id: lessonDoc?._id,
                                title: lessonDoc?.title,
                                slug: lessonDoc?.slug?.current,
                            };
                        },
                    ),
                })),
                stats: {
                    totalModules: createdModules.length,
                    totalLessons: createdLessons.length,
                },
            };

            return {
                success: true,
                message: `Created course "${course.title}" with ${createdModules.length} modules and ${createdLessons.length} lessons`,
                structure,
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to create course structure: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    },
});

// Helper function to generate URL-friendly slugs
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
