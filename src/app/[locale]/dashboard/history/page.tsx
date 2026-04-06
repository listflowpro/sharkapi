import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getJobs } from "@/lib/data";
import { HistoryClient } from "./HistoryClient";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const jobs = await getJobs(supabase, 100);
  return <HistoryClient jobs={jobs} />;
}
