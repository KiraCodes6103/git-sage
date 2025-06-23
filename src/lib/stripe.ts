"use server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function createCheckoutSession(credits:number) {
  const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/create`;
  const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/billing`;

  const { userId } = await auth();
  if (!userId) {
    throw new Error("unauthorized");
  }
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: `${credits} GitSage Credits`,
          },
          unit_amount: Math.round((credits * 2) * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    customer_creation: "always",
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId.toString(),
    metadata: {
      credits,
    },
  });

  return redirect(session.url!);
};
