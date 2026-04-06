"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Job, JobStatus } from "@/lib/types";

const STATUSES: Array<JobStatus | "all"> = ["all", "queued", "processing", "completed", "failed", "cancelled"];

const STATUS_COLORS: Record<JobStatus, string> = {
  completed:  "bg-aqua-400/15 text-aqua-400 border-aqua-400/30",
  failed:     "bg-coral-400/15 text-coral-400 border-coral-400/30",
  processing: "bg-electric-400/15 text-electric-400 border-electric-400/30",
  queued:     "bg-amber-400/15 text-amber-400 border-amber-400/30",
  cancelled:  "bg-white/10 text-white/40 border-white/20",
};

export function HistoryClient({ jobs }: { jobs: Job[] }) {
  const [filter, setFilter] = useState<JobStatus | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Request History</h1>
        <p className="text-sm text-gray-700 mt-0.5">All jobs submitted via Playground or API.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
              filter === s
                ? "bg-electric-400 text-ocean-900 border-electric-400"
                : "bg-ocean-800 text-white/60 border-ocean-600/50 hover:text-white hover:border-ocean-400/60"
            )}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== "all" && <span className="ml-1.5 text-xs opacity-60">({jobs.filter((j) => j.status === s).length})</span>}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-ocean-600/60 bg-ocean-800 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[140px_1fr_100px_80px_90px] gap-3 px-5 py-3 bg-ocean-900/60 border-b border-ocean-600/40">
          {["Job ID", "Model / Source", "Mode", "Cost", "Status"].map((h) => (
            <p key={h} className="text-sm font-semibold text-white/60">{h}</p>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="px-5 py-10 text-sm text-white/40 text-center">No jobs found.</p>
        ) : (
          <div className="divide-y divide-ocean-600/30">
            {filtered.map((job) => (
              <div key={job.id}>
                <div
                  className="flex flex-col sm:grid sm:grid-cols-[140px_1fr_100px_80px_90px] sm:gap-3 px-5 py-3 hover:bg-ocean-700/30 transition-colors cursor-pointer"
                  onClick={() => setExpanded(expanded === job.id ? null : job.id)}
                >
                  <p className="text-sm font-mono text-white/70">{job.id.slice(0, 8)}…</p>
                  <div>
                    <p className="text-sm text-white">{job.model?.name ?? "—"}</p>
                    <p className="text-xs text-white/40">{job.source} · {new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm font-mono font-bold text-white mt-1 sm:mt-0">{job.model?.variant?.toUpperCase() ?? "—"}</p>
                  <p className="text-sm font-mono text-white mt-1 sm:mt-0">${Number(job.pricing_snapshot?.price_usd ?? 0).toFixed(2)}</p>
                  <div className="mt-1 sm:mt-0">
                    <span className={cn("text-xs font-mono font-bold px-1.5 py-0.5 rounded border", STATUS_COLORS[job.status])}>
                      {job.status}
                    </span>
                  </div>
                </div>

                {expanded === job.id && (
                  <div className="px-5 pb-4 bg-ocean-900/40 border-t border-ocean-600/30 text-sm space-y-1">
                    <p className="text-white/50 pt-3">Job ID: <span className="text-white font-mono">{job.id}</span></p>
                    {job.input_data?.prompt != null && (
                      <p className="text-white/50">Prompt: <span className="text-white">{String(job.input_data.prompt).slice(0, 200)}</span></p>
                    )}
                    {job.error_message && (
                      <p className="text-coral-400">Error: {job.error_message}</p>
                    )}
                    {job.completed_at && (
                      <p className="text-white/50">Completed: <span className="text-white">{new Date(job.completed_at).toLocaleString()}</span></p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
