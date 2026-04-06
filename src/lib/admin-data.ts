// Admin-only data fetchers — call from Server Components after verifying admin role.
// All use service client to bypass RLS.

import { createServiceClient } from "@/lib/supabase/service";
import type { Provider, Model, Job, Transaction, Profile } from "./types";

function svc() {
  return createServiceClient();
}

// ── Providers ─────────────────────────────────────────────────
export async function adminGetProviders(): Promise<Provider[]> {
  const { data } = await svc()
    .from("providers")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function adminToggleProvider(id: string, is_active: boolean): Promise<void> {
  await svc().from("providers").update({ is_active }).eq("id", id);
}

// ── Models ────────────────────────────────────────────────────
export type AdminModel = Model & { provider_name: string | null };

export async function adminGetModels(): Promise<AdminModel[]> {
  const { data } = await svc()
    .from("models")
    .select("*, provider:providers(name)")
    .order("category")
    .order("created_at", { ascending: false });

  return (data ?? []).map((m) => ({
    ...m,
    provider_name:
      m.provider && typeof m.provider === "object" && "name" in m.provider
        ? String((m.provider as { name: string }).name)
        : null,
  }));
}

export async function adminToggleModel(id: string, is_active: boolean): Promise<void> {
  await svc().from("models").update({ is_active }).eq("id", id);
}

// ── Jobs ──────────────────────────────────────────────────────
export type AdminJob = Job & { user_email: string | null };

export async function adminGetJobs(limit = 200): Promise<AdminJob[]> {
  const { data } = await svc()
    .from("jobs")
    .select("*, model:models(name, code, variant, category), profile:profiles(email)")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((j) => ({
    ...j,
    model: j.model as Job["model"],
    user_email:
      j.profile && typeof j.profile === "object" && "email" in j.profile
        ? String((j.profile as { email: string }).email)
        : null,
  }));
}

// ── Users ─────────────────────────────────────────────────────
export async function adminGetUsers(): Promise<Profile[]> {
  const { data } = await svc()
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function adminSetUserStatus(id: string, status: "active" | "suspended"): Promise<void> {
  await svc().from("profiles").update({ status }).eq("id", id);
}

export async function adminSetUserRole(id: string, role: "user" | "admin"): Promise<void> {
  await svc().from("profiles").update({ role }).eq("id", id);
}

// ── Transactions ──────────────────────────────────────────────
export type AdminTransaction = Transaction & { user_email: string | null };

export async function adminGetTransactions(limit = 200): Promise<AdminTransaction[]> {
  const { data } = await svc()
    .from("transactions")
    .select("*, profile:profiles(email)")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((t) => ({
    ...t,
    user_email:
      t.profile && typeof t.profile === "object" && "email" in t.profile
        ? String((t.profile as { email: string }).email)
        : null,
  }));
}
