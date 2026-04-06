"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { ApiKey } from "@/lib/types";

export function TokensClient({ initialKeys }: { initialKeys: ApiKey[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [showCreate, setShowCreate] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKeyPlain, setNewKeyPlain] = useState<string | null>(null);
  const [createError, setCreateError] = useState("");

  const handleCreate = async () => {
    if (!keyName.trim()) { setCreateError("Key name is required."); return; }
    setCreating(true);
    setCreateError("");

    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: keyName.trim() }),
    });
    const data = await res.json();

    if (!res.ok) {
      setCreateError(data.error ?? "Failed to create key.");
      setCreating(false);
      return;
    }

    setNewKeyPlain(data.key);
    setKeys((prev) => [data.apiKey, ...prev]);
    setKeyName("");
    setShowCreate(false);
    setCreating(false);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    const supabase = createClient();
    await supabase.from("api_keys").update({ is_active: false, revoked_at: new Date().toISOString() }).eq("id", id);
    setKeys((prev) => prev.map((k) => k.id === id ? { ...k, is_active: false, revoked_at: new Date().toISOString() } : k));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Tokens</h1>
          <p className="text-sm text-gray-700 mt-0.5">Manage your API keys for programmatic access.</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setNewKeyPlain(null); }}
          className="px-4 py-2 rounded-xl bg-electric-400 text-ocean-900 text-sm font-semibold hover:bg-electric-300 transition-colors shrink-0"
        >
          + Create Key
        </button>
      </div>

      {/* New key reveal */}
      {newKeyPlain && (
        <div className="rounded-2xl border border-aqua-400/30 bg-aqua-400/5 p-5 space-y-2">
          <p className="text-sm font-semibold text-aqua-400">Key created — copy it now, it won&apos;t be shown again.</p>
          <div className="flex items-center gap-2 bg-ocean-900/60 rounded-xl px-4 py-3 border border-ocean-600/50">
            <code className="text-sm text-electric-400 font-mono flex-1 break-all">{newKeyPlain}</code>
            <button
              onClick={() => navigator.clipboard.writeText(newKeyPlain)}
              className="text-xs text-white/50 hover:text-white border border-ocean-600/50 px-2 py-1 rounded-lg transition-colors shrink-0"
            >
              Copy
            </button>
          </div>
          <button onClick={() => setNewKeyPlain(null)} className="text-xs text-white/40 hover:text-white/70">Dismiss</button>
        </div>
      )}

      {/* Key list */}
      <div className="rounded-2xl border border-ocean-600/60 bg-ocean-800 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_130px_80px_70px] gap-3 px-5 py-3 bg-ocean-900/60 border-b border-ocean-600/40">
          {["Name / Prefix", "Last Used", "Created", ""].map((h) => (
            <p key={h} className="text-sm font-semibold text-white/60">{h}</p>
          ))}
        </div>

        {keys.length === 0 ? (
          <p className="px-5 py-10 text-sm text-white/40 text-center">No API keys yet. Create one to get started.</p>
        ) : (
          <div className="divide-y divide-ocean-600/30">
            {keys.map((key) => (
              <div key={key.id} className="flex flex-col sm:grid sm:grid-cols-[1fr_130px_80px_70px] sm:gap-3 sm:items-center px-5 py-4 hover:bg-ocean-700/30 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{key.name}</p>
                    {!key.is_active && (
                      <span className="text-xs px-1.5 py-0.5 rounded border bg-white/5 text-white/30 border-white/10">revoked</span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-white/40 mt-0.5">{key.key_prefix}••••••••</p>
                </div>
                <p className="text-xs text-white/50 mt-1 sm:mt-0">
                  {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : "Never"}
                </p>
                <p className="text-xs text-white/50 mt-1 sm:mt-0">{new Date(key.created_at).toLocaleDateString()}</p>
                <div className="mt-2 sm:mt-0">
                  {key.is_active && (
                    <button
                      onClick={() => handleRevoke(key.id)}
                      className="text-xs text-coral-400 hover:text-coral-300 border border-coral-400/30 hover:border-coral-300/50 px-2 py-1 rounded-lg transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ocean-950/80 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-ocean-600/60 bg-ocean-800 p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-semibold text-white">Create API Key</h2>
            <div>
              <label className="text-sm text-white/60 block mb-1.5">Key name</label>
              <input
                autoFocus
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="e.g. My App, Production"
                className="w-full px-3 py-2 rounded-xl bg-ocean-900/60 border border-ocean-600/60 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-electric-400/40"
              />
              {createError && <p className="text-xs text-coral-400 mt-1">{createError}</p>}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl border border-ocean-600/50 text-sm text-white/60 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 rounded-xl bg-electric-400 text-ocean-900 text-sm font-semibold hover:bg-electric-300 disabled:opacity-50 transition-colors"
              >
                {creating ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
