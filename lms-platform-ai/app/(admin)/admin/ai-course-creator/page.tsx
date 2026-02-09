"use client";

import { useState } from "react";
import { CourseWizard } from "@/components/admin/ai/CourseWizard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function AICourseCreatorPage() {
    const router = useRouter();
    const [showWizard, setShowWizard] = useState(false);

    const handleComplete = (courseId: string) => {
        // Redirect to the course editor or show success message
        router.push(`/admin/courses/${courseId}`);
    };

    const handleCancel = () => {
        // Confirm cancellation
        if (
            confirm(
                "Are you sure you want to cancel? Your progress will be lost.",
            )
        ) {
            setShowWizard(false);
        }
    };

    if (!showWizard) {
        return (
            <div className="min-h-screen bg-[#09090b] text-white p-8">
                <div className="max-w-4xl mx-auto">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/admin")}
                        className="mb-8 text-zinc-400 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Admin
                    </Button>

                    <div className="text-center py-16">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>

                        <h1 className="text-4xl font-bold mb-4">
                            AI Course Creator
                        </h1>
                        <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
                            Let AI help you create comprehensive, structured courses in
                            minutes. I'll guide you through the entire process with
                            intelligent suggestions and automated content generation.
                        </p>

                        <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
                            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                                <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center mb-4">
                                    <span className="text-2xl">💬</span>
                                </div>
                                <h3 className="font-semibold mb-2">Conversational Wizard</h3>
                                <p className="text-sm text-zinc-400">
                                    Simple questions guide you through course creation step by
                                    step
                                </p>
                            </div>

                            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                                <div className="w-12 h-12 rounded-lg bg-fuchsia-500/20 flex items-center justify-center mb-4">
                                    <span className="text-2xl">🎥</span>
                                </div>
                                <h3 className="font-semibold mb-2">Smart Video Search</h3>
                                <p className="text-sm text-zinc-400">
                                    Automatically find and integrate relevant YouTube videos
                                </p>
                            </div>

                            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-4">
                                    <span className="text-2xl">✨</span>
                                </div>
                                <h3 className="font-semibold mb-2">Quality Content</h3>
                                <p className="text-sm text-zinc-400">
                                    AI generates comprehensive lessons with structured content
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={() => setShowWizard(true)}
                            size="lg"
                            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-lg px-8 h-14"
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            Create Course with AI
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-8">
            <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)]">
                <CourseWizard onComplete={handleComplete} onCancel={handleCancel} />
            </div>
        </div>
    );
}
