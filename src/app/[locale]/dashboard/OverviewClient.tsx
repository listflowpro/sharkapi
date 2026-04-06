"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useDashboardUser } from "@/components/dashboard/DashboardUserProvider";
import type { DashboardStats } from "@/lib/data";
import type { Job, Transaction } from "@/lib/types";

function StatCard({ label, value, sub, color = "text-white" }: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="rounded-2xl p-5 border border-ocean-600/60 bg-ocean-800">
      <p className="text-sm text-white/60 font-medium mb-1">{label}</p>
      <p className={cn("text-2xl font-bold tracking-tight", color)}>{value}</p>
      {sub && <p className="text-sm text-white/50 mt-1">{sub}</p>}
    </div>
  );
}

function JobBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed:  "bg-aqua-400/15 text-aqua-400 border-aqua-400/30",
    failed:     "bg-coral-400/15 text-coral-400 border-coral-400/30",
    processing: "bg-electric-400/15 text-electric-400 border-electric-400/30",
    queued:     "bg-amber-400/15 text-amber-400 border-amber-400/30",
    cancelled:  "bg-white/10 text-white/40 border-white/20",
  };
  return (
    <span className={cn("text-xs font-mono font-bold px-1.5 py-0.5 rounded border", map[status] ?? "bg-white/10 text-white/40 border-white/20")}>
      {status}
    </span>
  );
}

function TxBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    usage:      "bg-coral-400/15 text-coral-400",
    payment:    "bg-aqua-400/15 text-aqua-400",
    refund:     "bg-electric-400/15 text-electric-400",
    adjustment: "bg-amber-400/15 text-amber-400",
  };
  return (
    <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded-md", map[type] ?? "bg-white/10 text-white/40")}>
      {type}
    </span>
  );
}

export function OverviewClient({ stats, recentJobs, recentTx }: {
  stats: DashboardStats;
  recentJobs: Job[];
  recentTx: Transaction[];
}) {
  const user = useDashboardUser();

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.firstName}.</h1>
          <p className="text-sm text-gray-700 mt-0.5">Here&apos;s what&apos;s happening with your account.</p>
        </div>
        <Link href="/dashboard/playground" className="self-start px-4 py-2 rounded-xl bg-electric-400 text-ocean-900 text-sm font-semibold hover:bg-electric-300 transition-colors shadow-[0_0_20px_rgba(0,174,239,0.25)]">
          + New Job
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Wallet Balance"
          value={`$${user.walletBalance.toFixed(2)}`}
          sub="Pre-paid wallet"
          color="text-aqua-400"
        />
        <StatCard
          label="Today's Jobs"
          value={String(stats.todayJobs)}
          sub={`$${stats.todaySpend.toFixed(4)} spent today`}
          color="text-electric-400"
        />
        <StatCard
          label="Total Jobs"
          value={stats.totalJobs.toLocaleString()}
          sub={`${stats.completedJobs.toLocaleString()} completed`}
        />
        <StatCard
          label="Total Spend"
          value={`$${stats.totalSpend.toFixed(4)}`}
          sub={`${stats.failedJobs} failed`}
        />
      </div>

      {/* Recent jobs + transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent jobs */}
        <div className="rounded-2xl border border-ocean-600/60 bg-ocean-800">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ocean-600/40">
            <h2 className="text-sm font-semibold text-white">Recent Jobs</h2>
            <Link href="/dashboard/history" className="text-xs text-electric-400 hover:text-electric-300">View all →</Link>
          </div>
          {recentJobs.length === 0 ? (
            <p className="px-5 py-8 text-sm text-white/40 text-center">No jobs yet. Try the Playground!</p>
          ) : (
            <div className="divide-y divide-ocean-600/30">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between px-5 py-3 hover:bg-ocean-700/30 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate font-mono">{job.id.slice(0, 8)}…</p>
                    <p className="text-xs text-white/50">{job.model?.name ?? job.model_id?.slice(0, 8) ?? "—"} · {job.source}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-xs text-white/40">${Number(job.pricing_snapshot?.price_usd ?? 0).toFixed(2)}</span>
                    <JobBadge status={job.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="rounded-2xl border border-ocean-600/60 bg-ocean-800">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ocean-600/40">
            <h2 className="text-sm font-semibold text-white">Recent Transactions</h2>
            <Link href="/dashboard/wallet" className="text-xs text-electric-400 hover:text-electric-300">View all →</Link>
          </div>
          {recentTx.length === 0 ? (
            <p className="px-5 py-8 text-sm text-white/40 text-center">No transactions yet.</p>
          ) : (
            <div className="divide-y divide-ocean-600/30">
              {recentTx.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-3 hover:bg-ocean-700/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <TxBadge type={tx.type} />
                    <span className="text-xs text-white/50">{new Date(tx.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className={cn("text-sm font-mono font-semibold", tx.type === "usage" ? "text-coral-400" : "text-aqua-400")}>
                    {tx.type === "usage" ? "-" : "+"}${Math.abs(Number(tx.amount_usd)).toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
