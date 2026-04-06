// ── Database row types ────────────────────────────────────────

export interface Provider {
  id: string;
  name: string;
  base_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "user" | "admin";
  status: "active" | "suspended";
  wallet_balance: number;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
}

export interface Model {
  id: string;
  provider_id: string | null;
  category: "image" | "video" | "audio" | "music" | "text";
  code: string;
  name: string;
  variant: string | null;
  price_usd: number;
  billing_unit: string;
  is_active: boolean;
  is_public: boolean;
  created_at: string;
}

export type JobStatus = "queued" | "processing" | "completed" | "failed" | "cancelled";
export type JobSource = "api" | "playground";

export interface Job {
  id: string;
  user_id: string;
  api_key_id: string | null;
  model_id: string | null;
  source: JobSource;
  status: JobStatus;
  input_data: Record<string, unknown>;
  pricing_snapshot: { price_usd?: number; model_code?: string };
  external_request_id: string | null;
  error_message: string | null;
  queued_at: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  // joined
  model?: Pick<Model, "name" | "code" | "variant" | "category">;
}

export interface JobOutput {
  id: string;
  job_id: string;
  output_type: "image" | "video" | "audio" | "text" | "json";
  text_content: string | null;
  file_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type TransactionType = "usage" | "payment" | "refund" | "adjustment";
export type TransactionStatus = "pending" | "paid" | "failed" | "refunded";

export interface Transaction {
  id: string;
  user_id: string;
  job_id: string | null;
  type: TransactionType;
  amount_usd: number;
  status: TransactionStatus;
  metadata: Record<string, unknown>;
  created_at: string;
}
