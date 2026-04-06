"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { AdminJob } from "@/lib/admin-data";
import type { JobStatus } from "@/lib/types";

const STATUS_COLORS: Record<JobStatus, string> = {
  completed:  "bg-aqua-400/15 text-aqua-400 border-aqua-400/30",
  failed:     "bg-coral-400/15 text-coral-400 border-coral-400/30",
  processing: "bg-electric-400/15 text-electric-400 border-electric-400/30",
  queued:     "bg-amber-400/15 text-amber-400 border-amber-400/30",
  cancelled:  "bg-white/10 text-white/40 border-white/20",
};

const ALL_STATUSES: Array<JobStatus | "all"> = ["all", "queued", "processing", "completed", "failed", "cancelled"];

export function JobsClient({ jobs }: { jobs: AdminJob[] }) {
  const [filter, setFilter] = useState<JobStatus | "all">("all");

  const filtered = filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
        <p className="text-sm text-gray-700 mt-0.5">{jobs.length} total jobs (last 200)</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {ALL_STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
              filter === s
                ? "bg-electric-400 text-ocean-900 border-electric-400"
                : "bg-ocean-800 text-white/60 border-ocean-600/50 hover:text-white"
            )}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== "all" && (
              <span className="ml-1.5 text-xs opacity-60">({jobs.filter((j) => j.status === s).length})</span>
            )}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-ocean-600/60 bg-ocean-800 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[120px_1fr_130px_90px_80px_90px] gap-3 px-5 py-3 bg-ocean-900/60 border-b border-ocean-600/40">
          {["Job ID", "User / Model", "Source", "Cost", "Status", "Created"].map((h) => (
            <p key={h} className="text-sm font-semibold text-white/60">{h}</p>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="px-5 py-10 text-sm text-white/40 text-center">No jobs found.</p>
        ) : (
          <div className="divide-y divide-ocean-600/30">
            {filtered.map((job) => (
              <div key={job.id} className="flex flex-col sm:grid sm:grid-cols-[120px_1fr_130px_90px_80px_90px] sm:gap-3 sm:items-center px-5 py-3 hover:bg-ocean-700/30 transition-colors">
                <p className="text-xs font-mono text-white/50">{job.id.slice(0, 8)}…</p>
                <div>
                  <p className="text-sm text-white truncate">{job.user_email ?? "—"}</p>
                  <p className="text-xs text-white/40">{job.model?.name ?? "—"} {job.model?.variant ? `(${job.model.variant})` : ""}</p>
                </div>
                <p className="text-xs text-white/50 mt-1 sm:mt-0 capitalize">{job.source}</p>
                <p className="text-sm font-mono text-white mt-1 sm:mt-0">${Number(job.pricing_snapshot?.price_usd ?? 0).toFixed(4)}</p>
                <div className="mt-1 sm:mt-0">
                  <span className={cn("text-xs font-mono font-bold px-1.5 py-0.5 rounded border", STATUS_COLORS[job.status])}>
                    {job.status}
                  </span>
                </div>
                <p className="text-xs text-white/40 mt-1 sm:mt-0">{new Date(job.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
