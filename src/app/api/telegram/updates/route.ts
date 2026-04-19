import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// Telegram posts every incoming message here (registered via setWebhook).
// We only care about /start <token> messages to complete the link flow.
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = (body.message ?? body.edited_message) as Record<string, unknown> | undefined;
  if (!message) return NextResponse.json({ ok: true });

  const text    = String(message.text ?? "").trim();
  const chat    = message.chat as Record<string, unknown> | undefined;
  const from    = message.from as Record<string, unknown> | undefined;
  const chatId  = String(chat?.id ?? "");
  const firstName = String(from?.first_name ?? from?.username ?? "Telegram");

  // Only handle /start <token>
  const match = text.match(/^\/start\s+([A-Za-z0-9]+)$/);
  if (!match) return NextResponse.json({ ok: true });

  const token   = match[1];
  const service = createServiceClient();

  // Look up pending token
  const { data: pending } = await service
    .from("telegram_pending_links")
    .select("token")
    .eq("token", token)
    .single();

  if (!pending) return NextResponse.json({ ok: true });

  // Save the config
  await service.from("telegram_configs").insert({
    name:      firstName,
    chat_id:   chatId,
    is_active: true,
  });

  // Delete the used token
  await service.from("telegram_pending_links").delete().eq("token", token);

  // Send confirmation to user
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (botToken) {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id:    chatId,
        text:       "✅ Telegram başarıyla bağlandı! Artık SharkAPI bildirimleri buraya gelecek.",
        parse_mode: "HTML",
      }),
    });
  }

  return NextResponse.json({ ok: true });
}
