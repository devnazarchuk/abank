"use client";

import Link from "next/link";
import { SignUpButton } from "@clerk/nextjs";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

interface PricingCardsProps {
    isSignedIn: boolean;
}

export function PricingCards({ isSignedIn }: PricingCardsProps) {
    const [loadingTier, setLoadingTier] = useState<string | null>(null);

    const handleCheckout = async (tier: string) => {
        try {
            setLoadingTier(tier);
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                body: JSON.stringify({ tier }),
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error("Checkout error:", error);
        } finally {
            setLoadingTier(null);
        }
    };

    return (
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Free Plan */}
            <div className="relative group p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)]">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-emerald-400 mb-2">Free</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black">$0</span>
                        <span className="text-zinc-500 font-medium">/month</span>
                    </div>
                    <p className="mt-2 text-zinc-400 text-sm">
                        Perfect for getting started.
                    </p>
                </div>
                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-sm text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Foundation library</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Community Discord</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Basic exercises</span>
                    </div>
                </div>
                {isSignedIn ? (
                    <Link
                        href="/dashboard/courses"
                        className="block w-full py-4 rounded-xl font-bold text-center bg-zinc-800 hover:bg-zinc-700 transition-colors"
                    >
                        Browse Free Courses
                    </Link>
                ) : (
                    <SignUpButton mode="modal">
                        <button className="w-full py-4 rounded-xl font-bold text-center bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer">
                            Get Started
                        </button>
                    </SignUpButton>
                )}
            </div>

            {/* Pro Plan */}
            <div className="relative group p-8 rounded-2xl bg-zinc-900 border-2 border-violet-500 transition-all duration-300 shadow-[0_20px_40px_-15px_rgba(139,92,246,0.3)]">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-violet-500 text-xs font-black tracking-widest uppercase">
                    Most Popular
                </div>
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-violet-400 mb-2">Pro</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black">$29</span>
                        <span className="text-zinc-500 font-medium">/month</span>
                    </div>
                    <p className="mt-2 text-zinc-400 text-sm">
                        Everything you need to master.
                    </p>
                </div>
                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-sm text-zinc-100">
                        <CheckCircle2 className="w-4 h-4 text-violet-500" />
                        <span>All Pro courses</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-100">
                        <CheckCircle2 className="w-4 h-4 text-violet-500" />
                        <span>Real-world projects</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-100">
                        <CheckCircle2 className="w-4 h-4 text-violet-500" />
                        <span>Certificates of completion</span>
                    </div>
                </div>
                {isSignedIn ? (
                    <button
                        onClick={() => handleCheckout("pro")}
                        disabled={loadingTier !== null}
                        className="w-full py-4 rounded-xl font-bold text-center bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-[0_4px_15px_rgba(139,92,246,0.4)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loadingTier === "pro" ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Upgrade to Pro"
                        )}
                    </button>
                ) : (
                    <SignUpButton mode="modal">
                        <button className="w-full py-4 rounded-xl font-bold text-center bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-[0_4px_15px_rgba(139,92,246,0.4)] cursor-pointer">
                            Upgrade to Pro
                        </button>
                    </SignUpButton>
                )}
            </div>

            {/* Ultra Plan */}
            <div className="relative group p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.2)]">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-cyan-400 mb-2">Ultra</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black">$99</span>
                        <span className="text-zinc-500 font-medium">/month</span>
                    </div>
                    <p className="mt-2 text-zinc-400 text-sm">
                        Ultimate access and AI tools.
                    </p>
                </div>
                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-sm text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                        <span>AI Learning Assistant</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                        <span>1-on-1 Sessions</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                        <span>Lifetime updates</span>
                    </div>
                </div>
                {isSignedIn ? (
                    <button
                        onClick={() => handleCheckout("ultra")}
                        disabled={loadingTier !== null}
                        className="w-full py-4 rounded-xl font-bold text-center bg-cyan-600 hover:bg-cyan-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loadingTier === "ultra" ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Get Ultra"
                        )}
                    </button>
                ) : (
                    <SignUpButton mode="modal">
                        <button className="w-full py-4 rounded-xl font-bold text-center bg-cyan-600 hover:bg-cyan-500 transition-colors cursor-pointer">
                            Get Ultra
                        </button>
                    </SignUpButton>
                )}
            </div>
        </div>
    );
}
