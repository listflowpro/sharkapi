import { adminGetTransactions } from "@/lib/admin-data";
import { TransactionsClient } from "./TransactionsClient";

export default async function AdminTransactionsPage() {
  const transactions = await adminGetTransactions(200);
  return <TransactionsClient transactions={transactions} />;
}
