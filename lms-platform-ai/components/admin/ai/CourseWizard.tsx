"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
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

// Local Message interface to avoid import issues
interface Message {
    id: string;
    role: string;
    content?: string;
    parts?: any[];
    toolInvocations?: any[];
}

interface CourseWizardProps {
    onComplete?: (courseId: string) => void;
    onCancel?: () => void;
}

export function CourseWizard({ onComplete, onCancel }: CourseWizardProps) {
    const [isPaused, setIsPaused] = useState(false);
    const [inputValue, setInputValue] = useState("");

    // Cast useChat to any and follow the pattern in TutorChat.tsx
    const { messages, sendMessage, status, error } =
        (useChat as any)({
            api: "/api/ai/course-generator",
            onFinish: (message: Message) => {
                const text = getMessageText(message);
                // Check if course is complete
                if (text.includes("🎉 Course Complete")) {
                    // Extract course ID from message if available
                    const match = text.match(/course-id: ([a-z0-9-]+)/);
                    if (match && onComplete) {
                        onComplete(match[1]);
                    }
                }
            },
        });

    const isLoading = status === "streaming" || status === "submitted";

    const handlePause = () => {
        setIsPaused(!isPaused);
    };

    const onFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading || isPaused) return;

        sendMessage({ text: inputValue });
        setInputValue("");
    };

    const startCreating = () => {
        sendMessage({ text: "start" }); // Or whatever triggers the flow
    };

    const currentPhase = detectPhase(messages as Message[]);

    return (
        <div className="flex flex-col h-full bg-zinc-900 rounded-xl border border-zinc-800">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">AI Course Creator</h2>
                        <p className="text-sm text-zinc-400">
                            Стадія {currentPhase.number}: {currentPhase.name}
                            {currentPhase.number === 4 && messages.length > 0 && (() => {
                                const lastText = getMessageText(messages[messages.length - 1]);
                                const match = lastText.match(/Module (\d+) of (\d+)/);
                                return match ? ` • Модуль ${match[1]}/${match[2]}` : '';
                            })()}
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
                    {[
                        "Discovery",
                        "Research",
                        "Structure",
                        "Modules",
                        "Complete",
                    ].map((phase, idx) => (
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
                    ))}
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
                            I'll guide you through creating a comprehensive course. We'll start
                            by gathering some basic information.
                        </p>
                        <Button
                            onClick={startCreating}
                            className="mt-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Start Creating
                        </Button>
                    </div>
                )}

                {messages.map((message: Message) => (
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
                                {getMessageText(message)}
                            </div>
                            {getToolParts(message).map((tool: any, idx: number) => (
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
                                            {tool.toolName === "searchYouTube" &&
                                                "🎥 Searching YouTube..."}
                                            {tool.toolName === "webResearch" &&
                                                "🔍 Researching topic..."}
                                            {tool.toolName === "createCourseStructure" &&
                                                "🏗️ Creating structure..."}
                                            {tool.toolName === "populateLesson" &&
                                                "✍️ Adding lesson content..."}
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
                <div className="border-t border-zinc-800 bg-zinc-900/50">
                    {/* Quick Actions for Stage Progression */}
                    {messages.length > 0 && !isLoading && (() => {
                        const lastText = getMessageText(messages[messages.length - 1]);
                        const showNext = /next|наступн/i.test(lastText) && /stage|stadi|стаді/i.test(lastText);
                        const showApprove = /approve|затверд/i.test(lastText);
                        const showRevise = /revise|переглян/i.test(lastText);
                        const showFinalize = /finalize|завершити/i.test(lastText);
                        const hasAnyButton = showNext || showApprove || showRevise || showFinalize;

                        if (!hasAnyButton) return null;

                        return (
                            <div className="px-4 pt-3 flex gap-2 flex-wrap">
                                {showNext && (
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            sendMessage({ text: "next" });
                                        }}
                                        size="sm"
                                        className="bg-violet-600 hover:bg-violet-500"
                                    >
                                        ➡️ Наступна стадія
                                    </Button>
                                )}
                                {showApprove && (
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            sendMessage({ text: "approve" });
                                        }}
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-500"
                                    >
                                        ✅ Затвердити
                                    </Button>
                                )}
                                {showRevise && (
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            sendMessage({ text: "revise" });
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="border-amber-500 text-amber-400 hover:bg-amber-500/10"
                                    >
                                        🔄 Переглянути
                                    </Button>
                                )}
                                {showFinalize && (
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            sendMessage({ text: "finalize" });
                                        }}
                                        size="sm"
                                        className="bg-fuchsia-600 hover:bg-fuchsia-500"
                                    >
                                        🎯 Завершити структуру
                                    </Button>
                                )}
                            </div>
                        );
                    })()}


                    <form
                        onSubmit={onFormSubmit}
                        className="p-4"
                    >
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Введіть вашу відповідь..."
                                className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                disabled={isLoading || !inputValue.trim()}
                                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </Button>
                        </div>

                        {/* Fallback Quick Actions - Always visible */}
                        {messages.length > 0 && !isLoading && (
                            <div className="mt-3">
                                <div className="flex gap-2 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => sendMessage({ text: "next" })}
                                        className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                                    >
                                        Продовжити →
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => sendMessage({ text: "approve" })}
                                        className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                                    >
                                        Затвердити ✓
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => sendMessage({ text: "skip" })}
                                        className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                                    >
                                        Пропустити ⏭
                                    </button>
                                </div>
                                <p className="text-xs text-zinc-500 mt-2">
                                    💡 Підказка: Використовуйте кнопки або введіть команди вручну
                                </p>
                            </div>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
}

// Helpers for AI SDK 6 message format
function getMessageText(message: Message): string {
    if (message.content) return message.content;
    if (!message.parts || message.parts.length === 0) return "";

    return message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("\n");
}

function getToolParts(message: Message): any[] {
    const parts = [];

    // Check legacy toolInvocations
    if (message.toolInvocations) {
        parts.push(...message.toolInvocations);
    }

    // Check AI SDK 6 tool parts
    if (message.parts) {
        const toolParts = message.parts
            .filter((part) => part.type.startsWith("tool-"))
            .map((part) => ({
                ...part,
                toolName: part.toolName || part.type.replace("tool-", ""),
            }));
        parts.push(...toolParts);
    }

    return parts;
}

// Helper function to detect current phase from messages
function detectPhase(messages: Message[]) {
    const lastMessage = messages[messages.length - 1];
    const text = lastMessage ? getMessageText(lastMessage) : "";

    // Stage 5: Complete
    if (text.includes("🎉 Course Complete")) {
        return { number: 5, name: "Complete", progress: 100 };
    }

    // Stage 4: Module Content Creation
    if (
        text.includes("Module") && text.includes("ready!") ||
        text.includes("Type 'next' to create Module") ||
        text.includes("Type 'finalize'") ||
        text.includes("Module") && text.includes("of") && text.includes("complete")
    ) {
        return { number: 4, name: "Module Content", progress: 70 };
    }

    // Stage 3: Structure Planning
    if (
        text.includes("Structure looks good?") ||
        text.includes("Type 'approve' to proceed to Stage 4") ||
        text.includes("List of Modules")
    ) {
        return { number: 3, name: "Structure Planning", progress: 50 };
    }

    // Stage 2: Research
    if (
        text.includes("Research complete!") ||
        text.includes("Type 'next' to move to Stage 3") ||
        text.includes("📚") ||
        text.includes("🎥")
    ) {
        return { number: 2, name: "Research", progress: 30 };
    }

    // Stage 1: Discovery
    if (
        text.includes("Ready to proceed?") ||
        text.includes("Type 'next' to move to Stage 2")
    ) {
        return { number: 1, name: "Discovery", progress: 15 };
    }

    return { number: 1, name: "Discovery", progress: 5 };
}
