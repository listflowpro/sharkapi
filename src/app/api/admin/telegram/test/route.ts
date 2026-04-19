import { NextRequest, NextResponse } from "next/server";
import { validateAdmin } from "@/lib/auth/validate-admin";
import { sendTelegram } from "@/lib/notifications/telegram";

export async function POST(_req: NextRequest) {
  const auth = await validateAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await sendTelegram("✅ <b>SharkAPI test bildirimi</b>\nTelegram bağlantısı başarıyla çalışıyor!");
  return NextResponse.json({ ok: true });
}
