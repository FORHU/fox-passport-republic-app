import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let { stripeAccountId } = body;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({ type: "express" });
      stripeAccountId = account.id;
    }

    const accountSession = await stripe.accountSessions.create({
      account: stripeAccountId,
      components: {
        account_onboarding: { enabled: true },
        payments: { enabled: true },
        balances: { enabled: true },
        payouts: { enabled: true },
      },
    });

    return NextResponse.json({
      clientSecret: accountSession.client_secret,
      stripeAccountId,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create Stripe session";
    console.error("[Stripe Session Error]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
