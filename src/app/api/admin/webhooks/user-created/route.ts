import { NextRequest, NextResponse } from "next/server";
import { notifyNewUser } from "@/lib/notifications/telegram";

// Called by Supabase Database Webhook on INSERT into profiles table.
// Secured with a shared secret (WEBHOOK_SECRET env var).
export async function POST(req: NextRequest) {
  const secret = process.env.WEBHOOK_SECRET;
  if (secret) {
    const incoming = req.headers.get("x-webhook-secret");
    if (incoming !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Supabase sends the new row in body.record
  const record = body.record as Record<string, unknown> | undefined;
  const email  = (record?.email ?? record?.full_name ?? "unknown") as string;

  // Fire-and-forget — don't block Supabase webhook response
  notifyNewUser(email).catch((e) =>
    console.error("[webhooks/user-created] telegram error:", e)
  );

  return NextResponse.json({ ok: true });
}
