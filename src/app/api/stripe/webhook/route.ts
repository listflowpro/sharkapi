import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { createServiceClient } from "@/lib/supabase/service";

// Disable body parsing — Stripe needs the raw body for signature verification
export const config = { api: { bodyParser: false } };

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  // ── 1. Read raw body & verify signature ──────────────────────
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  const stripe = getStripe();
  let event: ReturnType<typeof stripe.webhooks.constructEvent>;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", (err as Error).message);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  // ── 2. Handle checkout.session.completed ────────────────────
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object;
  const userId    = session.metadata?.user_id;
  const amountUsd = Number(session.metadata?.amount_usd ?? 0);
  const sessionId = session.id;

  if (!userId || !amountUsd) {
    console.error("[stripe/webhook] missing metadata", { userId, amountUsd, sessionId });
    return NextResponse.json({ error: "Missing metadata." }, { status: 400 });
  }

  const service = createServiceClient();

  // ── 3. Idempotency check ─────────────────────────────────────
  const { data: existing } = await service
    .from("transactions")
    .select("id")
    .eq("provider_transaction_id", sessionId)
    .maybeSingle();

  if (existing) {
    console.log(`[stripe/webhook] session ${sessionId} already processed — skipping`);
    return NextResponse.json({ received: true });
  }

  // ── 4. Credit wallet ─────────────────────────────────────────
  const { data: profile } = await service
    .from("profiles")
    .select("wallet_balance")
    .eq("id", userId)
    .single();

  if (!profile) {
    console.error(`[stripe/webhook] profile not found for user ${userId}`);
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const newBalance = Number(profile.wallet_balance) + amountUsd;

  await Promise.all([
    service
      .from("profiles")
      .update({ wallet_balance: newBalance })
      .eq("id", userId),

    service.from("transactions").insert({
      user_id:                userId,
      job_id:                 null,
      type:                   "topup",
      amount_usd:             amountUsd,
      status:                 "paid",
      provider_transaction_id: sessionId,
      metadata: {
        stripe_payment_intent: session.payment_intent,
        stripe_customer:       session.customer,
        amount_usd:            amountUsd,
      },
    }),
  ]);

  console.log(`[stripe/webhook] credited $${amountUsd} to user ${userId} (session ${sessionId})`);
  return NextResponse.json({ received: true });
}
