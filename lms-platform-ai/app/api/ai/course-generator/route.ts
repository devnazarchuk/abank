import { courseGeneratorAgent } from "@/lib/ai/course-generator-agent";
import { createAgentUIStreamResponse } from "ai";
import { auth } from "@clerk/nextjs/server";
import { getUserTier } from "@/lib/course-access";

export const maxDuration = 60; // 60 seconds timeout

export async function POST(req: Request) {
    try {
        let { userId } = await auth();

        // DEV FALLBACK: allow testing even if auth is failing locally
        if (!userId && process.env.NODE_ENV === "development") {
            userId = "dev_user_123";
        }

        console.log("Course Generator API called by user:", userId);

        if (!userId) {
            console.error("Course Generator API: No userId found in auth().");
            return new Response("Unauthorized", { status: 401 });
        }

        // TODO: Re-enable tier check for production
        // Temporarily disabled for testing
        // const userTier = await getUserTier();
        // if (userTier !== "ultra" && process.env.NODE_ENV !== "development") {
        //     return new Response("Ultra membership required", { status: 403 });
        // }



        const { messages } = await req.json();

        // Stream response from course generator agent
        return createAgentUIStreamResponse({
            agent: courseGeneratorAgent as any,
            messages,
            experimental_transform: [
                () =>
                    new TransformStream({
                        transform(part, controller) {
                            // Fix compatibility issue where finishReason is an object but client expects string
                            if (
                                part.type === "finish" &&
                                part.finishReason &&
                                typeof part.finishReason === "object"
                            ) {
                                (part as any).finishReason =
                                    (part.finishReason as any).unified || "stop";
                            }
                            controller.enqueue(part);
                        },
                    }),
            ] as any,
        });
    } catch (error) {
        console.error("Course generator error:", error);
        return new Response(
            JSON.stringify({
                error: "Failed to process request",
                details: error instanceof Error ? error.message : "Unknown error",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
}
