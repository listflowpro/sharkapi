import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { notifyDailySummary } from "@/lib/notifications/telegram";

// Vercel Cron calls this with Authorization: Bearer <CRON_SECRET>
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const service  = createServiceClient();
  const since    = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: newUsers },
    { count: totalJobs },
    { count: completedJobs },
    { count: failedJobs },
    { data: revenueRows },
    { count: totalUsers },
  ] = await Promise.all([
    service.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", since),
    service.from("jobs").select("*", { count: "exact", head: true }).gte("created_at", since),
    service.from("jobs").select("*", { count: "exact", head: true }).eq("status", "completed").gte("created_at", since),
    service.from("jobs").select("*", { count: "exact", head: true }).eq("status", "failed").gte("created_at", since),
    service.from("transactions").select("amount_usd").eq("type", "usage").eq("status", "paid").gte("created_at", since),
    service.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  const totalRevenue = (revenueRows ?? []).reduce((sum, r) => sum + Number(r.amount_usd), 0);

  await notifyDailySummary({
    newUsers:      newUsers      ?? 0,
    totalJobs:     totalJobs     ?? 0,
    completedJobs: completedJobs ?? 0,
    failedJobs:    failedJobs    ?? 0,
    totalRevenue,
    totalUsers:    totalUsers    ?? 0,
  });

  return NextResponse.json({ ok: true });
}
