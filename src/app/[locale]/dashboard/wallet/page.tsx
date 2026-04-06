import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTransactions } from "@/lib/data";
import { WalletClient } from "./WalletClient";

export default async function WalletPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const transactions = await getTransactions(supabase, 10);

  const totalTopUp = transactions
    .filter((t) => t.type === "payment")
    .reduce((s, t) => s + Math.abs(Number(t.amount_usd)), 0);

  const totalCharged = transactions
    .filter((t) => t.type === "usage")
    .reduce((s, t) => s + Math.abs(Number(t.amount_usd)), 0);

  return (
    <WalletClient
      recentTransactions={transactions}
      totalTopUp={totalTopUp}
      totalCharged={totalCharged}
    />
  );
}
