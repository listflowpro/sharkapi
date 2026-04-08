"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useDashboardUser } from "@/components/dashboard/DashboardUserProvider";
import type { Transaction, TransactionType } from "@/lib/types";

const TYPE_COLORS: Record<TransactionType, string> = {
  topup:      "bg-aqua-400/15 text-aqua-400 border-aqua-400/30",
  payment:    "bg-aqua-400/15 text-aqua-400 border-aqua-400/30",
  usage:      "bg-ocean-800/40 text-white/70 border-ocean-600/60",
  refund:     "bg-electric-400/15 text-electric-400 border-electric-400/30",
  adjustment: "bg-amber-400/15 text-amber-400 border-amber-400/30",
};

function TxTypeBadge({ type }: { type: TransactionType }) {
  return (
    <span className={cn("text-xs font-medium px-2 py-0.5 rounded border shrink-0 capitalize", TYPE_COLORS[type])}>
      {type}
    </span>
  );
}

export function WalletClient({
  recentTransactions,
  totalTopUp,
  totalCharged,
}: {
  recentTransactions: Transaction[];
  totalTopUp: number;
  totalCharged: number;
}) {
  const user = useDashboardUser();
  const balance = user?.walletBalance ?? 0;
  const memberSince = user?.memberSince ?? "Unknown";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        <p className="text-sm text-gray-700 mt-0.5">Your balance and transaction history.</p>
      </div>

      {/* Balance hero card */}
      <div className="rounded-2xl border border-ocean-600/60 bg-ocean-800 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-electric-400/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-aqua-400/5 blur-2xl pointer-events-none" />

        <p className="text-sm text-white/60 font-medium mb-2">Available Balance</p>
        <p className="text-5xl font-black text-aqua-400 tracking-tight mb-1">
          ${balance.toFixed(2)}
        </p>
        <p className="text-sm text-white/50 mb-6">
          Member since {memberSince} · Balance never expires
        </p>

        <Link
          href="/dashboard/add-balance"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-electric-400 text-ocean-900 text-sm font-semibold hover:bg-electric-300 transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Balance
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total topped up", value: `$${totalTopUp.toFixed(2)}`, color: "text-aqua-400" },
          { label: "Total charged",   value: `$${totalCharged.toFixed(2)}`, color: "text-coral-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-ocean-600/60 bg-ocean-800/40 p-4 text-center">
            <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
            <p className="text-sm text-white/50 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="rounded-2xl border border-ocean-600/60 bg-ocean-800">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ocean-600/60">
          <h2 className="text-sm font-semibold text-white">Recent Transactions</h2>
          <Link href="/dashboard/transactions" className="text-sm text-electric-400 hover:text-electric-300 transition-colors">
            View all →
          </Link>
        </div>
        {recentTransactions.length === 0 ? (
          <p className="px-5 py-10 text-sm text-white/40 text-center">No transactions yet.</p>
        ) : (
          <div className="divide-y divide-ocean-600/30">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-ocean-700/30 transition-colors">
                <TxTypeBadge type={tx.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/40">{new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
                <span className={cn(
                  "text-sm font-mono font-bold shrink-0",
                  tx.type === "topup" || tx.type === "payment" || tx.type === "refund" ? "text-aqua-400" : "text-coral-400"
                )}>
                  {tx.type === "topup" || tx.type === "payment" || tx.type === "refund" ? "+" : "-"}${Math.abs(Number(tx.amount_usd)).toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
