import { defineField, defineType } from "sanity";
import { UserIcon } from "lucide-react";

export const userType = defineType({
    name: "user",
    title: "User",
    type: "document",
    icon: UserIcon,
    fields: [
        defineField({
            name: "clerkId",
            title: "Clerk ID",
            type: "string",
            validation: (Rule) => Rule.required(),
            readOnly: true,
        }),
        defineField({
            name: "name",
            title: "Name",
            type: "string",
        }),
        defineField({
            name: "email",
            title: "Email",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "image",
            title: "User Image",
            type: "url",
        }),
        defineField({
            name: "stripeCustomerId",
            title: "Stripe Customer ID",
            type: "string",
            hidden: true,
        }),
        defineField({
            name: "stripeSubscriptionId",
            title: "Stripe Subscription ID",
            type: "string",
            hidden: true,
        }),
        defineField({
            name: "tier",
            title: "Subscription Tier",
            type: "string",
            options: {
                list: [
                    { title: "Free", value: "free" },
                    { title: "Pro", value: "pro" },
                    { title: "Ultra", value: "ultra" },
                ],
            },
            initialValue: "free",
        }),
    ],
    preview: {
        select: {
            title: "name",
            subtitle: "email",
        },
    },
});
