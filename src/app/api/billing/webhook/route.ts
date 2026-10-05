import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/infrastructure/db/prisma";
import { MONTHLY_CREDITS } from "@/constants/app";
import { Plan } from "@prisma/client";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 501 });
  }
  const stripe = new Stripe(secret);
  const raw = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  const event = stripe.webhooks.constructEvent(raw, signature, webhookSecret);
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan as Plan | undefined;
    if (userId && plan) {
      await prisma.user.update({
        where: { id: userId },
        data: { plan, credits: MONTHLY_CREDITS[plan], stripeCustomerId: String(session.customer ?? "") },
      });
    }
  }
  return NextResponse.json({ received: true });
}
