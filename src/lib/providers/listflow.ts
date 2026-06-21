/**
 * ListFlow provider adapter — async polling model.
 * Server-side only. Never import in client components.
 *
 * Flow: POST /api/external/generate → poll GET /api/external/jobs/:id until done.
 * LISTFLOW_API_SECRET == EXTERNAL_API_SECRET on the listflow.pro side.
 */

const BASE_URL        = "https://listflow.pro";
const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS  = 300_000; // 5 minutes

export interface ProviderRequest {
  jobId: string;
  message: string;
  image_url?: string;
  image?: string;
}

export type ProviderResult =
  | { type: "url";    url: string;  raw: unknown }
  | { type: "base64"; data: string; mimeType: string; raw: unknown };

export async function generateImage(input: ProviderRequest): Promise<ProviderResult> {
  const apiKey = process.env.LISTFLOW_API_SECRET;
  if (!apiKey) throw new Error("LISTFLOW_API_SECRET is not configured.");

  const headers: Record<string, string> = {
    "Content-Type":  "application/json",
    "Authorization": `Bearer ${apiKey}`,
  };

  // ── Step 1: Create the job ───────────────────────────────────
  let createRes: Response;
  try {
    createRes = await fetch(`${BASE_URL}/api/external/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify({ job_id: input.jobId, prompt: input.message, mode: "both" }),
    });
  } catch (err) {
    throw new Error(`ListFlow network error: ${(err as Error).message}`);
  }

  if (!createRes.ok) {
    const text = await createRes.text().catch(() => "");
    throw new Error(`ListFlow create failed (HTTP ${createRes.status}): ${text.slice(0, 200)}`);
  }

  const { job_id } = (await createRes.json()) as { job_id: string };

  // ── Step 2: Poll until done or timeout ──────────────────────
  const startedAt = Date.now();

  while (true) {
    if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
      throw new Error(`ListFlow job ${job_id} timed out after 5 minutes.`);
    }

    await sleep(POLL_INTERVAL_MS);

    let pollRes: Response;
    try {
      pollRes = await fetch(`${BASE_URL}/api/external/jobs/${job_id}`, { headers });
    } catch (err) {
      throw new Error(`ListFlow poll network error: ${(err as Error).message}`);
    }

    if (!pollRes.ok) {
      throw new Error(`ListFlow poll failed (HTTP ${pollRes.status})`);
    }

    const data = (await pollRes.json()) as Record<string, unknown>;

    if (data.status === "suspended") {
      throw new Error(`ListFlow job ${job_id} suspended after too many worker retries.`);
    }

    if (data.status === "done") {
      const b64 = data.image_base64 as string | undefined;
      if (!b64) throw new Error("ListFlow returned done but image_base64 is missing.");
      return { type: "base64", data: b64, mimeType: "image/png", raw: data };
    }

    // status: "pending" | "processing" → keep polling
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
