import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { writeClient } from "@/sanity/lib/client";
import { createClerkClient } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
    apiVersion: "2025-01-27.acacia" as any,
});

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        if (!session?.metadata?.userId) {
            return new NextResponse("User ID is required", { status: 400 });
        }

        const { userId, tier } = session.metadata;

        // 1. Sync to Clerk Metadata
        await (await clerkClient).users.updateUserMetadata(userId, {
            publicMetadata: {
                tier,
            },
        });

        // 2. Update Sanity
        // Check if user exists in Sanity
        const existingUser = await writeClient.fetch(
            `*[_type == "user" && clerkId == $userId][0]`,
            { userId }
        );

        if (existingUser) {
            // Update existing user
            await writeClient
                .patch(existingUser._id)
                .set({
                    tier,
                    stripeCustomerId: session.customer as string,
                    stripeSubscriptionId: subscription.id,
                })
                .commit();
        } else {
            // Create new user (fallback if not created via webhook on signup)
            await writeClient.create({
                _type: "user",
                clerkId: userId,
                email: session.customer_details?.email!,
                name: session.customer_details?.name!,
                tier,
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: subscription.id,
            });
        }
    }

    return new NextResponse(null, { status: 200 });
}
