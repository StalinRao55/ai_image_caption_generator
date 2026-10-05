import { NextResponse } from "next/server";
import Stripe from "stripe";
import { requireUser } from "@/infrastructure/auth/guards";
import { jsonError } from "@/lib/api";
import { z } from "zod";

const schema = z.object({ plan: z.enum(["STARTER", "PRO", "BUSINESS"]) });

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { plan } = schema.parse(await req.json());
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { error: "Stripe is not configured. Set STRIPE_SECRET_KEY or ask an admin to change your plan." },
        { status: 501 },
      );
    }
    const prices: Record<string, string | undefined> = {
      STARTER: process.env.STRIPE_PRICE_STARTER,
      PRO: process.env.STRIPE_PRICE_PRO,
      BUSINESS: process.env.STRIPE_PRICE_BUSINESS,
    };
    const price = prices[plan];
    if (!price) {
      return NextResponse.json({ error: "Missing Stripe price ID for this plan." }, { status: 500 });
    }
    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email ?? undefined,
      line_items: [{ price, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=1`,
      metadata: { userId: user.id, plan },
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    return jsonError(error);
  }
}
