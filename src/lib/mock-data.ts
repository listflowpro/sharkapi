/* ================================================================
   MOCK DATA — Phase 1 UI (replace with real API in Phase 4)
   Pricing: 1K = $0.03 / request  ·  2K = $0.05 / request
   ================================================================ */


/* ── API Tokens ─────────────────────────────────────────────── */
export const mockTokens = [
  {
    id:        "tok_1",
    name:      "production-backend",
    prefix:    "sk_live_a7b9",
    suffix:    "••••••••••••••••••",
    status:    "active"  as const,
    created:   "Jan 15, 2025",
    lastUsed:  "2 minutes ago",
    requests:  1431,
  },
  {
    id:        "tok_2",
    name:      "staging-env",
    prefix:    "sk_live_c3d1",
    suffix:    "••••••••••••••••••",
    status:    "active"  as const,
    created:   "Jan 20, 2025",
    lastUsed:  "5 days ago",
    requests:  87,
  },
  {
    id:        "tok_3",
    name:      "old-project",
    prefix:    "sk_live_e5f2",
    suffix:    "••••••••••••••••••",
    status:    "revoked" as const,
    created:   "Jan 1, 2025",
    lastUsed:  "Jan 18, 2025",
    requests:  344,
  },
];

/* ── Transactions ───────────────────────────────────────────── */
export type TxType = "top-up" | "charge" | "refund" | "adjustment" | "trial";
export const mockTransactions = [
  { id: "txn_001", type: "top-up"     as TxType, amount: +20.00, status: "completed", desc: "Wallet top-up via Stripe",             jobId: null,          date: "Jan 20, 2025 · 14:32" },
  { id: "txn_002", type: "charge"     as TxType, amount: -0.05,  status: "completed", desc: "Job job_8f2a9d3c — 2K mode",            jobId: "job_8f2a9d3c", date: "Jan 20, 2025 · 14:35" },
  { id: "txn_003", type: "charge"     as TxType, amount: -0.03,  status: "completed", desc: "Job job_7e1b8c2d — 1K mode",            jobId: "job_7e1b8c2d", date: "Jan 19, 2025 · 09:15" },
  { id: "txn_004", type: "top-up"     as TxType, amount: +30.00, status: "completed", desc: "Wallet top-up via Stripe",             jobId: null,          date: "Jan 15, 2025 · 11:02" },
  { id: "txn_005", type: "charge"     as TxType, amount: -0.03,  status: "completed", desc: "Job job_4b8a5919 — 1K mode",            jobId: "job_4b8a5919", date: "Jan 14, 2025 · 08:22" },
  { id: "txn_006", type: "trial"      as TxType, amount: 0,      status: "completed", desc: "Free trial generation (1 of 3)",        jobId: "job_5c9b6a2e", date: "Jan 15, 2025 · 10:00" },
  { id: "txn_007", type: "charge"     as TxType, amount: -0.05,  status: "completed", desc: "Job job_3a7940e8 — 2K mode",            jobId: "job_3a7940e8", date: "Jan 13, 2025 · 17:09" },
  { id: "txn_008", type: "refund"     as TxType, amount: +0.05,  status: "completed", desc: "Refund for failed job job_2b6830d7",    jobId: "job_2b6830d7", date: "Jan 12, 2025 · 12:44" },
  { id: "txn_009", type: "adjustment" as TxType, amount: +0.50,  status: "completed", desc: "Admin credit — service disruption",     jobId: null,          date: "Jan 10, 2025 · 09:00" },
  { id: "txn_010", type: "top-up"     as TxType, amount: +10.00, status: "completed", desc: "Wallet top-up via Stripe",             jobId: null,          date: "Jan 5, 2025 · 16:00"  },
];

/* ── Request History ────────────────────────────────────────── */
export type JobStatus = "complete" | "failed" | "moderated" | "processing";
export const mockJobs = [
  { id: "job_8f2a9d3c", status: "complete"   as JobStatus, type: "text",       mode: "2k", prompt: "A great white shark in bioluminescent deep ocean, cinematic lighting, 8K",     cost: "$0.05", token: "production-backend", moderation: "passed",   date: "Jan 20, 2025 · 14:35", imageUrl: "https://placehold.co/800x800/0B1929/00AEEF?text=2K+Output" },
  { id: "job_7e1b8c2d", status: "complete"   as JobStatus, type: "text",       mode: "1k", prompt: "Bioluminescent jellyfish, photorealistic, dark ocean background",              cost: "$0.03", token: "staging-env",        moderation: "passed",   date: "Jan 19, 2025 · 09:15", imageUrl: "https://placehold.co/800x800/0B1929/00AEEF?text=1K+Output" },
  { id: "job_6d0a7b1c", status: "failed"     as JobStatus, type: "text+image", mode: "2k", prompt: "Transform this photo into watercolor painting style",                          cost: "$0.00", token: "production-backend", moderation: "passed",   date: "Jan 15, 2025 · 16:45", imageUrl: null },
  { id: "job_5c9b6a2e", status: "complete"   as JobStatus, type: "text",       mode: "1k", prompt: "Deep sea anglerfish glowing in the abyss (free trial)",                       cost: "$0.00", token: "—",                  moderation: "passed",   date: "Jan 15, 2025 · 10:00", imageUrl: "https://placehold.co/800x800/0B1929/00AEEF?text=Trial" },
  { id: "job_4b8a5919", status: "complete"   as JobStatus, type: "text",       mode: "1k", prompt: "Octopus with glowing tentacles, ultra-detailed, underwater photography",       cost: "$0.03", token: "production-backend", moderation: "passed",   date: "Jan 14, 2025 · 08:22", imageUrl: "https://placehold.co/800x800/0B1929/00AEEF?text=1K+Output" },
  { id: "job_3a7940e8", status: "complete"   as JobStatus, type: "text",       mode: "2k", prompt: "Shark silhouette against sunlit ocean surface, minimalist art style",          cost: "$0.05", token: "staging-env",        moderation: "passed",   date: "Jan 13, 2025 · 17:09", imageUrl: "https://placehold.co/800x800/0B1929/00AEEF?text=2K+Output" },
  { id: "job_2b6830d7", status: "failed"     as JobStatus, type: "text",       mode: "2k", prompt: "Neon-lit coral reef at night, macro photography, HDR",                        cost: "$0.00", token: "production-backend", moderation: "passed",   date: "Jan 12, 2025 · 12:40", imageUrl: null },
  { id: "job_1a572ec6", status: "moderated"  as JobStatus, type: "text",       mode: "1k", prompt: "[content removed]",                                                            cost: "$0.00", token: "old-project",        moderation: "blocked",  date: "Jan 10, 2025 · 06:13", imageUrl: null },
];

/* ── Daily usage data — spend = mode1k×$0.01 + mode2k×$0.02 ── */
export const mockDailyData = [
  { date: "Jan 7",  requests: 3,  spend: 0.04,  mode1k: 2,  mode2k: 1  },
  { date: "Jan 8",  requests: 7,  spend: 0.09,  mode1k: 5,  mode2k: 2  },
  { date: "Jan 9",  requests: 5,  spend: 0.07,  mode1k: 3,  mode2k: 2  },
  { date: "Jan 10", requests: 4,  spend: 0.05,  mode1k: 3,  mode2k: 1  },
  { date: "Jan 11", requests: 0,  spend: 0,     mode1k: 0,  mode2k: 0  },
  { date: "Jan 12", requests: 8,  spend: 0.10,  mode1k: 6,  mode2k: 2  },
  { date: "Jan 13", requests: 12, spend: 0.17,  mode1k: 7,  mode2k: 5  },
  { date: "Jan 14", requests: 9,  spend: 0.12,  mode1k: 6,  mode2k: 3  },
  { date: "Jan 15", requests: 15, spend: 0.21,  mode1k: 9,  mode2k: 6  },
  { date: "Jan 16", requests: 6,  spend: 0.08,  mode1k: 4,  mode2k: 2  },
  { date: "Jan 17", requests: 4,  spend: 0.05,  mode1k: 3,  mode2k: 1  },
  { date: "Jan 18", requests: 0,  spend: 0,     mode1k: 0,  mode2k: 0  },
  { date: "Jan 19", requests: 11, spend: 0.14,  mode1k: 8,  mode2k: 3  },
  { date: "Jan 20", requests: 23, spend: 0.32,  mode1k: 14, mode2k: 9  },
];

/* ── Summary stats — totalSpend = 1201×$0.01 + 646×$0.02 ─────── */
export const mockStats = {
  totalRequests:       1862,
  successfulRequests:  1847,
  failedRequests:      11,
  moderatedRequests:   4,
  totalSpend:          24.93,   // 1201×0.01 + 646×0.02
  mode1kCount:         1201,
  mode2kCount:         646,
  todayRequests:       23,
  todaySpend:          0.32,    // 14×0.01 + 9×0.02
};
