import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardStats, getJobs, getTransactions } from "@/lib/data";
import { OverviewClient } from "./OverviewClient";

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [stats, recentJobs, recentTx] = await Promise.all([
    getDashboardStats(supabase, user.id),
    getJobs(supabase, 5),
    getTransactions(supabase, 5),
  ]);

  return <OverviewClient stats={stats} recentJobs={recentJobs} recentTx={recentTx} />;
}
