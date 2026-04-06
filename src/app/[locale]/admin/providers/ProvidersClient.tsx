"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Provider } from "@/lib/types";

export function ProvidersClient({ initialProviders }: { initialProviders: Provider[] }) {
  const [providers, setProviders] = useState(initialProviders);
  const [loading, setLoading] = useState<string | null>(null);

  const toggle = async (p: Provider) => {
    setLoading(p.id);
    const res = await fetch(`/api/admin/providers/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !p.is_active }),
    });
    if (res.ok) {
      setProviders((prev) => prev.map((x) => x.id === p.id ? { ...x, is_active: !x.is_active } : x));
    }
    setLoading(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Providers</h1>
        <p className="text-sm text-gray-700 mt-0.5">{providers.length} provider{providers.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="rounded-2xl border border-ocean-600/60 bg-ocean-800 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_200px_100px_80px] gap-3 px-5 py-3 bg-ocean-900/60 border-b border-ocean-600/40">
          {["Name", "Base URL", "Created", "Status"].map((h) => (
            <p key={h} className="text-sm font-semibold text-white/60">{h}</p>
          ))}
        </div>

        {providers.length === 0 ? (
          <p className="px-5 py-10 text-sm text-white/40 text-center">No providers yet.</p>
        ) : (
          <div className="divide-y divide-ocean-600/30">
            {providers.map((p) => (
              <div key={p.id} className="flex flex-col sm:grid sm:grid-cols-[1fr_200px_100px_80px] sm:gap-3 sm:items-center px-5 py-4 hover:bg-ocean-700/30 transition-colors">
                <p className="text-sm font-semibold text-white">{p.name}</p>
                <p className="text-xs text-white/40 font-mono mt-1 sm:mt-0 truncate">{p.base_url ?? "—"}</p>
                <p className="text-xs text-white/40 mt-1 sm:mt-0">{new Date(p.created_at).toLocaleDateString()}</p>
                <div className="mt-2 sm:mt-0">
                  <button
                    onClick={() => toggle(p)}
                    disabled={loading === p.id}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors disabled:opacity-50",
                      p.is_active
                        ? "bg-aqua-400/10 text-aqua-400 border-aqua-400/30 hover:bg-coral-400/10 hover:text-coral-400 hover:border-coral-400/30"
                        : "bg-white/5 text-white/40 border-white/10 hover:bg-aqua-400/10 hover:text-aqua-400 hover:border-aqua-400/30"
                    )}
                  >
                    {loading === p.id ? "..." : p.is_active ? "Active" : "Inactive"}
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
