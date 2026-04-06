"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Transaction, TransactionType } from "@/lib/types";

const TYPE_COLORS: Record<TransactionType, string> = {
  usage:      "bg-coral-400/15 text-coral-400 border-coral-400/30",
  payment:    "bg-aqua-400/15 text-aqua-400 border-aqua-400/30",
  refund:     "bg-electric-400/15 text-electric-400 border-electric-400/30",
  adjustment: "bg-amber-400/15 text-amber-400 border-amber-400/30",
};

const FILTERS = ["all", "usage", "payment", "refund", "adjustment"] as const;
type Filter = typeof FILTERS[number];

export function TransactionsClient({ transactions }: { transactions: Transaction[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = filter === "all" ? transactions : transactions.filter((tx) => tx.type === filter);

  const totalCharged = transactions.filter((t) => t.type === "usage").reduce((s, t) => s + Number(t.amount_usd), 0);
  const totalRefunds = transactions.filter((t) => t.type === "refund").reduce((s, t) => s + Number(t.amount_usd), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-sm text-gray-700 mt-0.5">All charges, payments and refunds on your account.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-ocean-600/60 bg-ocean-800 p-4">
          <p className="text-sm text-white/60 mb-1">Total Charged</p>
          <p className="text-xl font-bold text-coral-400">-${totalCharged.toFixed(4)}</p>
        </div>
        <div className="rounded-2xl border border-ocean-600/60 bg-ocean-800 p-4">
          <p className="text-sm text-white/60 mb-1">Total Refunded</p>
          <p className="text-xl font-bold text-aqua-400">+${totalRefunds.toFixed(4)}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
              filter === f
                ? "bg-electric-400 text-ocean-900 border-electric-400"
                : "bg-ocean-800 text-white/60 border-ocean-600/50 hover:text-white hover:border-ocean-400/60"
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-ocean-600/60 bg-ocean-800 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_120px_100px_90px] gap-4 px-5 py-3 bg-ocean-900/60 border-b border-ocean-600/40">
          <p className="text-sm font-semibold text-white/60">Details</p>
          <p className="text-sm font-semibold text-white/60">Type</p>
          <p className="text-sm font-semibold text-white/60">Date</p>
          <p className="text-sm font-semibold text-white/60 text-right">Amount</p>
        </div>

        {filtered.length === 0 ? (
          <p className="px-5 py-10 text-sm text-white/40 text-center">No transactions found.</p>
        ) : (
          <div className="divide-y divide-ocean-600/30">
            {filtered.map((tx) => (
              <div key={tx.id} className="flex flex-col sm:grid sm:grid-cols-[1fr_120px_100px_90px] sm:gap-4 px-5 py-4 hover:bg-ocean-700/30 transition-colors">
                <div>
                  <p className="text-sm text-white font-mono">{tx.id.slice(0, 12)}…</p>
                  {tx.job_id && <p className="text-xs text-white/40 mt-0.5">job: {tx.job_id.slice(0, 8)}…</p>}
                </div>
                <div className="flex items-center mt-1.5 sm:mt-0">
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded border", TYPE_COLORS[tx.type])}>
                    {tx.type}
                  </span>
                </div>
                <div className="flex items-center mt-1 sm:mt-0">
                  <p className="text-sm text-white/60">{new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center mt-1 sm:mt-0 sm:justify-end">
                  <span className={cn(
                    "text-sm font-mono font-bold",
                    tx.type === "usage" ? "text-coral-400" : "text-aqua-400"
                  )}>
                    {tx.type === "usage" ? "-" : "+"}${Math.abs(Number(tx.amount_usd)).toFixed(4)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
