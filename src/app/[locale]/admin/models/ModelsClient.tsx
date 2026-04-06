"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { AdminModel } from "@/lib/admin-data";

const CATEGORY_COLORS: Record<string, string> = {
  image: "text-electric-400 bg-electric-400/10 border-electric-400/30",
  video: "text-aqua-400 bg-aqua-400/10 border-aqua-400/30",
  audio: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  music: "text-coral-400 bg-coral-400/10 border-coral-400/30",
  text:  "text-white/60 bg-white/5 border-white/15",
};

export function ModelsClient({ initialModels }: { initialModels: AdminModel[] }) {
  const [models, setModels] = useState(initialModels);
  const [loading, setLoading] = useState<string | null>(null);

  const toggle = async (m: AdminModel) => {
    setLoading(m.id);
    const res = await fetch(`/api/admin/models/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !m.is_active }),
    });
    if (res.ok) {
      setModels((prev) => prev.map((x) => x.id === m.id ? { ...x, is_active: !x.is_active } : x));
    }
    setLoading(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Models</h1>
        <p className="text-sm text-gray-700 mt-0.5">{models.length} model{models.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="rounded-2xl border border-ocean-600/60 bg-ocean-800 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_80px_80px_100px_80px_80px] gap-3 px-5 py-3 bg-ocean-900/60 border-b border-ocean-600/40">
          {["Name / Code", "Category", "Variant", "Price", "Public", "Status"].map((h) => (
            <p key={h} className="text-sm font-semibold text-white/60">{h}</p>
          ))}
        </div>

        {models.length === 0 ? (
          <p className="px-5 py-10 text-sm text-white/40 text-center">No models yet.</p>
        ) : (
          <div className="divide-y divide-ocean-600/30">
            {models.map((m) => (
              <div key={m.id} className="flex flex-col sm:grid sm:grid-cols-[1fr_80px_80px_100px_80px_80px] sm:gap-3 sm:items-center px-5 py-4 hover:bg-ocean-700/30 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-white">{m.name}</p>
                  <p className="text-xs font-mono text-white/40 mt-0.5">{m.code}</p>
                  {m.provider_name && <p className="text-xs text-white/30 mt-0.5">{m.provider_name}</p>}
                </div>
                <div className="mt-1 sm:mt-0">
                  <span className={cn("text-xs px-1.5 py-0.5 rounded border font-mono", CATEGORY_COLORS[m.category] ?? "text-white/40 border-white/10")}>
                    {m.category}
                  </span>
                </div>
                <p className="text-xs font-mono text-white/60 mt-1 sm:mt-0">{m.variant ?? "—"}</p>
                <p className="text-sm font-mono font-bold text-aqua-400 mt-1 sm:mt-0">${Number(m.price_usd).toFixed(4)}</p>
                <div className="mt-1 sm:mt-0">
                  <span className={cn("text-xs px-1.5 py-0.5 rounded border", m.is_public ? "text-aqua-400 border-aqua-400/30" : "text-white/30 border-white/10")}>
                    {m.is_public ? "Yes" : "No"}
                  </span>
                </div>
                <div className="mt-2 sm:mt-0">
                  <button
                    onClick={() => toggle(m)}
                    disabled={loading === m.id}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors disabled:opacity-50",
                      m.is_active
                        ? "bg-aqua-400/10 text-aqua-400 border-aqua-400/30 hover:bg-coral-400/10 hover:text-coral-400 hover:border-coral-400/30"
                        : "bg-white/5 text-white/40 border-white/10 hover:bg-aqua-400/10 hover:text-aqua-400 hover:border-aqua-400/30"
                    )}
                  >
                    {loading === m.id ? "..." : m.is_active ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
