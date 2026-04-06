// Server-side data fetchers — call from Server Components or Route Handlers
// All functions expect an authenticated Supabase client

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, ApiKey, Job, Transaction, Model } from "./types";

// ── Profile ──────────────────────────────────────────────────

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data ?? null;
}

// ── API Keys ─────────────────────────────────────────────────

export async function getApiKeys(supabase: SupabaseClient): Promise<ApiKey[]> {
  const { data } = await supabase
    .from("api_keys")
    .select("id, user_id, name, key_prefix, is_active, last_used_at, created_at, revoked_at")
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ── Jobs ─────────────────────────────────────────────────────

export async function getJobs(
  supabase: SupabaseClient,
  limit = 50
): Promise<Job[]> {
  const { data } = await supabase
    .from("jobs")
    .select(`
      *,
      model:models(name, code, variant, category)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Job[];
}

export async function getJob(
  supabase: SupabaseClient,
  jobId: string
): Promise<Job | null> {
  const { data } = await supabase
    .from("jobs")
    .select(`*, model:models(name, code, variant, category)`)
    .eq("id", jobId)
    .single();
  return data ?? null;
}

// ── Transactions ─────────────────────────────────────────────

export async function getTransactions(
  supabase: SupabaseClient,
  limit = 50
): Promise<Transaction[]> {
  const { data } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

// ── Models ───────────────────────────────────────────────────

export async function getPublicModels(supabase: SupabaseClient): Promise<Model[]> {
  const { data } = await supabase
    .from("models")
    .select("*")
    .eq("is_active", true)
    .eq("is_public", true)
    .order("category", { ascending: true });
  return data ?? [];
}

// ── Dashboard stats ──────────────────────────────────────────

export interface DashboardStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalSpend: number;   // sum of usage transactions
  todayJobs: number;
  todaySpend: number;
}

export async function getDashboardStats(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardStats> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [jobsRes, txRes, todayJobsRes, todayTxRes] = await Promise.all([
    supabase
      .from("jobs")
      .select("status", { count: "exact" })
      .eq("user_id", userId),
    supabase
      .from("transactions")
      .select("amount_usd")
      .eq("user_id", userId)
      .eq("type", "usage"),
    supabase
      .from("jobs")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .gte("created_at", todayStart.toISOString()),
    supabase
      .from("transactions")
      .select("amount_usd")
      .eq("user_id", userId)
      .eq("type", "usage")
      .gte("created_at", todayStart.toISOString()),
  ]);

  const jobs = jobsRes.data ?? [];
  const totalSpend = (txRes.data ?? []).reduce((s, t) => s + Number(t.amount_usd), 0);
  const todaySpend = (todayTxRes.data ?? []).reduce((s, t) => s + Number(t.amount_usd), 0);

  return {
    totalJobs:      jobsRes.count ?? 0,
    completedJobs:  jobs.filter((j) => j.status === "completed").length,
    failedJobs:     jobs.filter((j) => j.status === "failed").length,
    totalSpend,
    todayJobs:      todayJobsRes.count ?? 0,
    todaySpend,
  };
}
