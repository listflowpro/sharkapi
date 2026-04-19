import { createServiceClient } from "@/lib/supabase/service";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function sendTelegram(message: string): Promise<void> {
  if (!BOT_TOKEN) {
    console.warn("[telegram] TELEGRAM_BOT_TOKEN not set — skipping notification");
    return;
  }

  const service = createServiceClient();
  const { data: configs } = await service
    .from("telegram_configs")
    .select("chat_id")
    .eq("is_active", true);

  if (!configs || configs.length === 0) return;

  await Promise.allSettled(
    configs.map((c) =>
      fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id:    c.chat_id,
          text:       message,
          parse_mode: "HTML",
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const body = await res.text();
          console.error(`[telegram] failed to send to ${c.chat_id}: ${body}`);
        }
      })
    )
  );
}

// ── Pre-built notification helpers ───────────────────────────────

export async function notifyNewUser(email: string) {
  await sendTelegram(`🆕 <b>Yeni kullanıcı kaydı</b>\n📧 ${email}`);
}

export async function notifyWalletTopup(email: string, amountUsd: number, newBalance: number) {
  await sendTelegram(
    `💳 <b>Cüzdan doldurma</b>\n` +
    `📧 ${email}\n` +
    `💵 +$${amountUsd.toFixed(2)} → Bakiye: $${newBalance.toFixed(2)}`
  );
}

export async function notifyLowBalance(email: string, balance: number) {
  await sendTelegram(
    `⚠️ <b>Düşük bakiye uyarısı</b>\n` +
    `📧 ${email}\n` +
    `💵 Kalan bakiye: $${balance.toFixed(2)}`
  );
}

export async function notifyJobFailed(userId: string, jobId: string, reason: string) {
  await sendTelegram(
    `❌ <b>Job başarısız</b>\n` +
    `👤 User: ${userId}\n` +
    `🔑 Job: ${jobId.slice(0, 8)}…\n` +
    `📝 ${reason.slice(0, 100)}`
  );
}

export async function notifyDailySummary(stats: {
  newUsers: number;
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalRevenue: number;
  totalUsers: number;
}) {
  const successRate = stats.totalJobs > 0
    ? Math.round((stats.completedJobs / stats.totalJobs) * 100)
    : 0;

  await sendTelegram(
    `📊 <b>Günlük Özet — Son 24 Saat</b>\n\n` +
    `👥 Yeni kullanıcı: <b>${stats.newUsers}</b> (toplam ${stats.totalUsers})\n` +
    `🖼 Toplam istek: <b>${stats.totalJobs}</b>\n` +
    `✅ Başarılı: <b>${stats.completedJobs}</b> (%${successRate})\n` +
    `❌ Başarısız: <b>${stats.failedJobs}</b>\n` +
    `💰 Günlük gelir: <b>$${stats.totalRevenue.toFixed(2)}</b>`
  );
}
