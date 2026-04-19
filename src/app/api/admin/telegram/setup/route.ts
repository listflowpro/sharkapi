import { NextRequest, NextResponse } from "next/server";
import { validateAdmin } from "@/lib/auth/validate-admin";

// POST — register our /api/telegram/updates as Telegram's webhook (one-time setup)
export async function POST(_req: NextRequest) {
  const auth = await validateAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set." }, { status: 500 });

  const webhookUrl = "https://www.sharkapi.dev/api/telegram/updates";

  const res  = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl }),
  });
  const data = await res.json();

  return NextResponse.json(data);
}

// GET — check current webhook status
export async function GET(_req: NextRequest) {
  const auth = await validateAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set." }, { status: 500 });

  const res  = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
  const data = await res.json();
  return NextResponse.json(data);
}
