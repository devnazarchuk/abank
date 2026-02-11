import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { tutorAgent } from "@/lib/ai/tutor-agent";
import { auth } from "@clerk/nextjs/server";
import { getUserTier } from "@/lib/course-access";

export async function POST(request: Request) {
  try {
    // Verify user is authenticated and has Ultra plan
    let { userId } = await auth();

    // DEV FALLBACK: allow testing even if auth is failing locally
    if (!userId && process.env.NODE_ENV === "development") {
      userId = "dev_user_123";
    }

    console.log("Chat API called by user:", userId);

    if (!userId) {
      console.error("Chat API: No userId found in auth().");
      return new Response("Unauthorized", { status: 401 });
    }

    const userTier = await getUserTier();

    // Allow in development OR for ultra members
    if (userTier !== "ultra" && process.env.NODE_ENV !== "development") {
      return new Response("Ultra membership required", { status: 403 });
    }

    const { messages }: { messages: UIMessage[] } = await request.json();

    return createAgentUIStreamResponse({
      agent: tutorAgent as any,
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
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
