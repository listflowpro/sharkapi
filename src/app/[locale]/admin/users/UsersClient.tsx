"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export function UsersClient({ initialUsers }: { initialUsers: Profile[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState<string | null>(null);

  const patch = async (id: string, body: Record<string, string>, update: Partial<Profile>) => {
    setLoading(id);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, ...update } : u));
    }
    setLoading(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-700 mt-0.5">{users.length} user{users.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="rounded-2xl border border-ocean-600/60 bg-ocean-800 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_100px_90px_110px_90px_130px] gap-3 px-5 py-3 bg-ocean-900/60 border-b border-ocean-600/40">
          {["Email", "Balance", "Role", "Status", "Joined", "Actions"].map((h) => (
            <p key={h} className="text-sm font-semibold text-white/60">{h}</p>
          ))}
        </div>

        {users.length === 0 ? (
          <p className="px-5 py-10 text-sm text-white/40 text-center">No users found.</p>
        ) : (
          <div className="divide-y divide-ocean-600/30">
            {users.map((u) => (
              <div key={u.id} className="flex flex-col sm:grid sm:grid-cols-[1fr_100px_90px_110px_90px_130px] sm:gap-3 sm:items-center px-5 py-4 hover:bg-ocean-700/30 transition-colors">
                <div>
                  <p className="text-sm text-white truncate">{u.email}</p>
                  {u.full_name && <p className="text-xs text-white/40 mt-0.5">{u.full_name}</p>}
                </div>
                <p className="text-sm font-mono font-bold text-aqua-400 mt-1 sm:mt-0">${Number(u.wallet_balance).toFixed(2)}</p>
                <div className="mt-1 sm:mt-0">
                  <span className={cn("text-xs px-1.5 py-0.5 rounded border font-mono",
                    u.role === "admin" ? "text-coral-400 border-coral-400/30 bg-coral-400/10" : "text-white/40 border-white/10"
                  )}>
                    {u.role}
                  </span>
                </div>
                <div className="mt-1 sm:mt-0">
                  <span className={cn("text-xs px-1.5 py-0.5 rounded border",
                    u.status === "active" ? "text-aqua-400 border-aqua-400/30" : "text-coral-400 border-coral-400/30"
                  )}>
                    {u.status}
                  </span>
                </div>
                <p className="text-xs text-white/40 mt-1 sm:mt-0">{new Date(u.created_at).toLocaleDateString()}</p>
                <div className="flex gap-1.5 mt-2 sm:mt-0 flex-wrap" aria-disabled={loading === u.id}>
                  {/* Toggle status */}
                  <button
                    onClick={() => patch(u.id,
                      { status: u.status === "active" ? "suspended" : "active" },
                      { status: u.status === "active" ? "suspended" : "active" }
                    )}
                    disabled={loading === u.id}
                    className={cn(
                      "text-xs px-2 py-0.5 rounded border transition-colors disabled:opacity-40",
                      u.status === "active"
                        ? "text-coral-400 border-coral-400/30 hover:bg-coral-400/10"
                        : "text-aqua-400 border-aqua-400/30 hover:bg-aqua-400/10"
                    )}
                  >
                    {u.status === "active" ? "Suspend" : "Activate"}
                  </button>
                  {/* Toggle role */}
                  <button
                    onClick={() => patch(u.id,
                      { role: u.role === "admin" ? "user" : "admin" },
                      { role: u.role === "admin" ? "user" : "admin" }
                    )}
                    disabled={loading === u.id}
                    className="text-xs px-2 py-0.5 rounded border text-white/40 border-white/10 hover:text-white hover:border-white/30 transition-colors disabled:opacity-40"
                  >
                    {u.role === "admin" ? "→ User" : "→ Admin"}
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
