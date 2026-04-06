import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardStats, getJobs } from "@/lib/data";
import { UsageClient } from "./UsageClient";

export default async function UsagePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [stats, jobs] = await Promise.all([
    getDashboardStats(supabase, user.id),
    getJobs(supabase, 200),
  ]);

  const dayMap = new Map<string, { requests: number; spend: number }>();
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dayMap.set(d.toISOString().slice(0, 10), { requests: 0, spend: 0 });
  }
  for (const job of jobs) {
    const key = job.created_at.slice(0, 10);
    if (dayMap.has(key)) {
      const entry = dayMap.get(key)!;
      entry.requests += 1;
      entry.spend += Number(job.pricing_snapshot?.price_usd ?? 0);
    }
  }
  const dailyData = Array.from(dayMap.entries()).map(([date, v]) => ({ date, ...v }));

  return <UsageClient stats={stats} dailyData={dailyData} />;
}
