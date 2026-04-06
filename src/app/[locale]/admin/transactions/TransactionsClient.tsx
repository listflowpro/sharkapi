"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { AdminTransaction } from "@/lib/admin-data";
import type { TransactionType } from "@/lib/types";

const TYPE_COLORS: Record<TransactionType, string> = {
  payment:    "bg-aqua-400/15 text-aqua-400 border-aqua-400/30",
  usage:      "bg-white/5 text-white/50 border-white/10",
  refund:     "bg-electric-400/15 text-electric-400 border-electric-400/30",
  adjustment: "bg-amber-400/15 text-amber-400 border-amber-400/30",
};

const ALL_TYPES: Array<TransactionType | "all"> = ["all", "payment", "usage", "refund", "adjustment"];

export function TransactionsClient({ transactions }: { transactions: AdminTransaction[] }) {
  const [filter, setFilter] = useState<TransactionType | "all">("all");

  const filtered = filter === "all" ? transactions : transactions.filter((t) => t.type === filter);

  const totalAmount = filtered.reduce((s, t) => s + Number(t.amount_usd), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-sm text-gray-700 mt-0.5">{transactions.length} total (last 200)</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["payment", "usage", "refund", "adjustment"] as TransactionType[]).map((type) => {
          const count = transactions.filter((t) => t.type === type).length;
          const sum = transactions.filter((t) => t.type === type).reduce((s, t) => s + Number(t.amount_usd), 0);
          return (
            <div key={type} className="rounded-xl border border-ocean-600/60 bg-ocean-800 p-3">
              <p className="text-xs text-white/50 capitalize mb-1">{type}</p>
              <p className="text-base font-bold text-white">${sum.toFixed(2)}</p>
              <p className="text-xs text-white/30">{count} tx</p>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {ALL_TYPES.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all capitalize",
              filter === t
                ? "bg-electric-400 text-ocean-900 border-electric-400"
                : "bg-ocean-800 text-white/60 border-ocean-600/50 hover:text-white"
            )}>
            {t}
            {t !== "all" && (
              <span className="ml-1.5 text-xs opacity-60">({transactions.filter((x) => x.type === t).length})</span>
            )}
          </button>
        ))}
        {filtered.length > 0 && (
          <span className="ml-auto self-center text-sm text-white/40">
            Total: <span className="text-white font-mono">${totalAmount.toFixed(4)}</span>
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-ocean-600/60 bg-ocean-800 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_90px_110px_90px_90px] gap-3 px-5 py-3 bg-ocean-900/60 border-b border-ocean-600/40">
          {["User", "Type", "Amount", "Status", "Date"].map((h) => (
            <p key={h} className="text-sm font-semibold text-white/60">{h}</p>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="px-5 py-10 text-sm text-white/40 text-center">No transactions found.</p>
        ) : (
          <div className="divide-y divide-ocean-600/30">
            {filtered.map((tx) => (
              <div key={tx.id} className="flex flex-col sm:grid sm:grid-cols-[1fr_90px_110px_90px_90px] sm:gap-3 sm:items-center px-5 py-3 hover:bg-ocean-700/30 transition-colors">
                <p className="text-sm text-white/70 truncate">{tx.user_email ?? "—"}</p>
                <div className="mt-1 sm:mt-0">
                  <span className={cn("text-xs px-1.5 py-0.5 rounded border font-mono capitalize", TYPE_COLORS[tx.type])}>
                    {tx.type}
                  </span>
                </div>
                <p className="text-sm font-mono font-bold text-white mt-1 sm:mt-0">
                  ${Number(tx.amount_usd).toFixed(4)}
                </p>
                <p className="text-xs text-white/40 mt-1 sm:mt-0 capitalize">{tx.status}</p>
                <p className="text-xs text-white/40 mt-1 sm:mt-0">{new Date(tx.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
