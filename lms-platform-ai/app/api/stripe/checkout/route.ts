import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
    apiVersion: "2025-01-27.acacia" as any,
});

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { tier } = await req.json();

        if (!tier || !["pro", "ultra"].includes(tier)) {
            return new NextResponse("Invalid tier", { status: 400 });
        }

        const priceAmount = tier === "pro" ? 2900 : 9900;
        const tierName = tier === "pro" ? "Pro Plan" : "Ultra Plan";

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: tierName,
                            description: `Upgrade to ${tierName} and unlock exclusive content.`,
                        },
                        unit_amount: priceAmount,
                        recurring: {
                            interval: "month",
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
            metadata: {
                userId,
                tier,
            },
            customer_email: user.emailAddresses[0].emailAddress,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("[STRIPE_CHECKOUT_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
