import { courseGeneratorAgent } from "@/lib/ai/course-generator-agent";
import { streamText } from "ai";

export const maxDuration = 60; // 60 seconds timeout

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Stream response from course generator agent
        const result = streamText({
            model: courseGeneratorAgent.model,
            messages: messages as any,
            system: courseGeneratorAgent.instructions,
            tools: courseGeneratorAgent.tools,
            maxSteps: 10,
        } as any);

        // Use toDataStreamResponse for tool support (cast to any if type definition is missing)
        return (result as any).toDataStreamResponse();
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
