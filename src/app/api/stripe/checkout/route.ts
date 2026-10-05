import { NextRequest, NextResponse } from "next/server";
import { validateSession, isSessionError } from "@/lib/auth/validate-session";
import { getStripe } from "@/lib/stripe/server";

const MIN_AMOUNT = 50;
const MAX_AMOUNT = 10_000;
const STEP = 50; // wallet is topped up in multiples of $50

export async function POST(request: NextRequest) {
  // ── 1. Auth ──────────────────────────────────────────────────
  const session = await validateSession();
  if (isSessionError(session)) {
    return NextResponse.json({ error: session.error }, { status: session.status });
  }
  const { userId } = session;

  // ── 2. Parse amount ──────────────────────────────────────────
  let body: { amount?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!Number.isInteger(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT || amount % STEP !== 0) {
    return NextResponse.json(
      { error: `Amount must be a multiple of $${STEP} between $${MIN_AMOUNT} and $${MAX_AMOUNT}.` },
      { status: 400 }
    );
  }

  // ── 3. Create Stripe Checkout Session ────────────────────────
  const stripe = getStripe();
  const origin = request.headers.get("origin") ?? "https://sharkapi.dev";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "SharkAPI Wallet Credits",
            description: `$${amount} USD added to your SharkAPI wallet`,
          },
          unit_amount: amount * 100, // cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id:    userId,
      amount_usd: String(amount),
    },
    client_reference_id: userId,
    success_url: `${origin}/dashboard/add-balance/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${origin}/dashboard/add-balance`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
