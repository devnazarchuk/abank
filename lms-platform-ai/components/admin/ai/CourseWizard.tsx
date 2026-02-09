"use client";

import { useState } from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    Send,
    Sparkles,
    CheckCircle2,
    XCircle,
    Pause,
    Play,
} from "lucide-react";

interface CourseWizardProps {
    onComplete?: (courseId: string) => void;
    onCancel?: () => void;
}

export function CourseWizard({ onComplete, onCancel }: CourseWizardProps) {
    const [isPaused, setIsPaused] = useState(false);

    const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
        useChat({
            api: "/api/ai/course-generator",
            onFinish: (message) => {
                // Check if course is complete
                if (message.content.includes("🎉 Course Complete")) {
                    // Extract course ID from message if available
                    // This is a simplified version - you'd parse the actual structure
                    const match = message.content.match(/course-id: ([a-z0-9-]+)/);
                    if (match && onComplete) {
                        onComplete(match[1]);
                    }
                }
            },
        });

    const handlePause = () => {
        setIsPaused(!isPaused);
    };

    const currentPhase = detectPhase(messages);

    return (
        <div className="flex flex-col h-full bg-zinc-900 rounded-xl border border-zinc-800">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            AI Course Creator
                        </h2>
                        <p className="text-sm text-zinc-400">
                            Phase {currentPhase.number}: {currentPhase.name}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePause}
                        className="text-zinc-400 hover:text-white"
                    >
                        {isPaused ? (
                            <>
                                <Play className="w-4 h-4 mr-2" />
                                Resume
                            </>
                        ) : (
                            <>
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                            </>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                        className="text-zinc-400 hover:text-white"
                    >
                        Cancel
                    </Button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-3 bg-zinc-900/50">
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-600 transition-all duration-500"
                            style={{ width: `${currentPhase.progress}%` }}
                        />
                    </div>
                    <span className="text-xs text-zinc-400 font-medium">
                        {currentPhase.progress}%
                    </span>
                </div>
                <div className="flex gap-2 text-xs">
                    {["Requirements", "Research", "Structure", "Content", "Complete"].map(
                        (phase, idx) => (
                            <div
                                key={phase}
                                className={`flex-1 text-center py-1 rounded ${idx < currentPhase.number - 1
                                        ? "bg-violet-500/20 text-violet-300"
                                        : idx === currentPhase.number - 1
                                            ? "bg-violet-500/40 text-violet-200 font-medium"
                                            : "bg-zinc-800/50 text-zinc-500"
                                    }`}
                            >
                                {phase}
                            </div>
                        ),
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-600/20 flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-8 h-8 text-violet-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            Let's create something amazing!
                        </h3>
                        <p className="text-zinc-400 max-w-md mx-auto">
                            I'll guide you through creating a comprehensive course. We'll
                            start by gathering some basic information.
                        </p>
                        <Button
                            onClick={() =>
                                handleSubmit(
                                    new Event("submit") as unknown as React.FormEvent,
                                    {
                                        data: { start: true },
                                    },
                                )
                            }
                            className="mt-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Start Creating
                        </Button>
                    </div>
                )}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user"
                                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                                    : "bg-zinc-800 text-zinc-100"
                                }`}
                        >
                            <div className="text-sm whitespace-pre-wrap">
                                {message.content}
                            </div>
                            {message.toolInvocations?.map((tool, idx) => (
                                <div
                                    key={idx}
                                    className="mt-3 pt-3 border-t border-white/10 text-xs opacity-75"
                                >
                                    <div className="flex items-center gap-2">
                                        {tool.state === "result" ? (
                                            <CheckCircle2 className="w-3 h-3" />
                                        ) : (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        )}
                                        <span>
                                            {tool.toolName === "searchYouTube" && "🎥 Searching YouTube..."}
                                            {tool.toolName === "webResearch" && "🔍 Researching topic..."}
                                            {tool.toolName === "createCourseStructure" && "🏗️ Creating structure..."}
                                            {tool.toolName === "populateLesson" && "✍️ Adding lesson content..."}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-zinc-800 rounded-2xl px-4 py-3">
                            <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm">{error.message}</span>
                    </div>
                )}
            </div>

            {/* Input Area */}
            {!isPaused && (
                <form
                    onSubmit={handleSubmit}
                    className="p-4 border-t border-zinc-800 bg-zinc-900/50"
                >
                    <div className="flex gap-2">
                        <input
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type your response..."
                            className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}

// Helper function to detect current phase from messages
function detectPhase(messages: any[]) {
    const lastMessage = messages[messages.length - 1]?.content || "";

    if (lastMessage.includes("🎉 Course Complete")) {
        return { number: 5, name: "Complete", progress: 100 };
    }
    if (lastMessage.includes("Working on Lesson") || lastMessage.includes("Progress:")) {
        return { number: 4, name: "Content Generation", progress: 75 };
    }
    if (lastMessage.includes("Course Structure Created") || lastMessage.includes("✅")) {
        return { number: 3, name: "Structure Creation", progress: 50 };
    }
    if (lastMessage.includes("Research Results") || lastMessage.includes("📚")) {
        return { number: 2, name: "Research", progress: 25 };
    }

    return { number: 1, name: "Requirements", progress: 10 };
}
