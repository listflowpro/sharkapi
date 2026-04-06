import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTransactions } from "@/lib/data";
import { TransactionsClient } from "./TransactionsClient";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const transactions = await getTransactions(supabase, 100);

  return <TransactionsClient transactions={transactions} />;
}
