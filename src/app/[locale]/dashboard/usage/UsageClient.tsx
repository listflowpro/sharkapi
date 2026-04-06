"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/lib/data";

interface DailyEntry { date: string; requests: number; spend: number }

function BarChart({ data, metric }: { data: DailyEntry[]; metric: "requests" | "spend" }) {
  const values = data.map((d) => metric === "requests" ? d.requests : d.spend);
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d) => {
        const val = metric === "requests" ? d.requests : d.spend;
        const pct = (val / max) * 100;
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
            <div className="w-full rounded-sm bg-electric-400/40 group-hover:bg-electric-400/70 transition-colors"
              style={{ height: `${Math.max(pct, 3)}%` }} />
            <div className="absolute bottom-full mb-1 hidden group-hover:flex pointer-events-none z-10">
              <div className="bg-ocean-700 border border-ocean-500 rounded px-1.5 py-0.5 text-xs text-white whitespace-nowrap">
                {d.date.slice(5)}: {metric === "requests" ? val : `$${val.toFixed(4)}`}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function UsageClient({ stats, dailyData }: { stats: DashboardStats; dailyData: DailyEntry[] }) {
  const [metric, setMetric] = useState<"requests" | "spend">("requests");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usage Analytics</h1>
        <p className="text-sm text-gray-700 mt-0.5">Your API usage over the last 14 days.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Jobs",     value: stats.totalJobs.toLocaleString(),        color: "text-electric-400" },
          { label: "Total Spend",    value: `$${stats.totalSpend.toFixed(4)}`,        color: "text-aqua-400" },
          { label: "Completed",      value: stats.completedJobs.toLocaleString(),     color: "text-aqua-400" },
          { label: "Failed",         value: stats.failedJobs.toLocaleString(),        color: "text-coral-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-ocean-600/60 bg-ocean-800 p-4">
            <p className="text-sm text-white/60 mb-1">{label}</p>
            <p className={cn("text-xl font-bold", color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-ocean-600/60 bg-ocean-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Last 14 Days</h2>
          <div className="flex gap-1">
            {(["requests", "spend"] as const).map((m) => (
              <button key={m} onClick={() => setMetric(m)}
                className={cn("px-3 py-1 rounded-lg text-xs font-medium transition-all",
                  metric === m ? "bg-electric-400 text-ocean-900" : "text-white/50 hover:text-white"
                )}>
                {m === "requests" ? "Requests" : "Spend ($)"}
              </button>
            ))}
          </div>
        </div>
        <BarChart data={dailyData} metric={metric} />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-white/30">{dailyData[0]?.date?.slice(5) ?? ""}</span>
          <span className="text-xs text-white/30">{dailyData[dailyData.length - 1]?.date?.slice(5) ?? ""}</span>
        </div>
      </div>

      {/* Daily table */}
      <div className="rounded-2xl border border-ocean-600/60 bg-ocean-800 overflow-hidden">
        <div className="grid grid-cols-3 px-5 py-3 bg-ocean-900/60 border-b border-ocean-600/40">
          <p className="text-sm font-semibold text-white/60">Date</p>
          <p className="text-sm font-semibold text-white/60">Requests</p>
          <p className="text-sm font-semibold text-white/60">Spend</p>
        </div>
        <div className="divide-y divide-ocean-600/30">
          {[...dailyData].reverse().map((d) => (
            <div key={d.date} className="grid grid-cols-3 px-5 py-3 hover:bg-ocean-700/30 transition-colors">
              <p className="text-sm text-white/70">{d.date}</p>
              <p className="text-sm text-white">{d.requests}</p>
              <p className="text-sm text-white">${d.spend.toFixed(4)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
