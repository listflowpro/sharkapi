/**
 * DropThatShip AI provider adapter.
 * Server-side only. Never import in client components.
 */

const PROVIDER_ENDPOINT = "https://api.dropthatship.io/v1/image";
const TIMEOUT_MS = 180_000; // 180 seconds

export interface ProviderRequest {
  message: string;
  image_url?: string;
  image?: string;
}

// Discriminated union — worker handles each type differently
export type ProviderResult =
  | { type: "url";    url: string;  raw: unknown }
  | { type: "base64"; data: string; mimeType: string; raw: unknown };

export async function generateImage(input: ProviderRequest): Promise<ProviderResult> {
  const apiKey = process.env.PROVIDER_API_KEY;
  if (!apiKey) {
    throw new Error("PROVIDER_API_KEY is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(PROVIDER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        message: input.message,
        ...(input.image_url ? { image_url: input.image_url } : {}),
        ...(input.image     ? { image: input.image }         : {}),
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new Error("Provider request timed out after 180s.");
    }
    throw new Error(`Provider network error: ${(err as Error).message}`);
  } finally {
    clearTimeout(timeout);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Provider returned non-JSON (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    // Extract a safe error message — do not expose body details externally
    const providerMsg = extractErrorMessage(body);
    console.error(`[provider] HTTP ${response.status}:`, safeLog(body));
    throw new Error(providerMsg ?? `Provider error (HTTP ${response.status}).`);
  }

  // ── Parse response ───────────────────────────────────────────
  const result = parseProviderResponse(body);
  if (!result) {
    console.error("[provider] Unrecognised response shape:", safeLog(body));
    throw new Error("Provider response did not contain a usable image.");
  }

  return result;
}

// ── Response parsers ─────────────────────────────────────────────

function parseProviderResponse(body: unknown): ProviderResult | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  // ── Try URL fields first ─────────────────────────────────────
  const urlCandidates = [
    b.url, b.image_url, b.output, b.result,
    (b.data as Record<string, unknown>)?.url,
    (b.data as Record<string, unknown>)?.image_url,
    Array.isArray(b.data) ? (b.data[0] as Record<string, unknown>)?.url : undefined,
    Array.isArray(b.images) ? (b.images[0] as Record<string, unknown>)?.url : undefined,
    Array.isArray(b.images) ? b.images[0] : undefined,
  ];

  for (const candidate of urlCandidates) {
    if (typeof candidate === "string" && isUrl(candidate)) {
      return { type: "url", url: candidate, raw: body };
    }
  }

  // ── Try base64 fields ─────────────────────────────────────────
  const b64Candidates = [
    { val: b.image,      mime: "image/png" },
    { val: b.b64_json,   mime: "image/png" },
    { val: b.base64,     mime: "image/png" },
    { val: b.output,     mime: "image/png" },
    { val: b.result,     mime: "image/png" },
    Array.isArray(b.data)
      ? { val: (b.data[0] as Record<string, unknown>)?.b64_json, mime: "image/png" }
      : null,
  ];

  for (const entry of b64Candidates) {
    if (!entry) continue;
    const { val, mime } = entry;
    if (typeof val === "string" && looksLikeBase64(val)) {
      // Strip data URI prefix if present
      const clean = val.replace(/^data:image\/[a-z+]+;base64,/, "");
      return { type: "base64", data: clean, mimeType: mime, raw: body };
    }
  }

  return null;
}

function extractErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const msg = b.error ?? b.message ?? b.detail ?? b.msg;
  if (typeof msg === "string" && msg) return msg.slice(0, 200);
  return null;
}

function isUrl(s: string): boolean {
  return s.startsWith("http://") || s.startsWith("https://");
}

function looksLikeBase64(s: string): boolean {
  if (s.length < 100) return false;
  // Allow data URI prefix or raw base64
  const clean = s.replace(/^data:image\/[a-z+]+;base64,/, "");
  return /^[A-Za-z0-9+/=]{100,}$/.test(clean);
}

/** Strips API key from any object before logging */
function safeLog(body: unknown): unknown {
  if (!body || typeof body !== "object") return body;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { api_key, apiKey, key, token, authorization, ...safe } =
    body as Record<string, unknown>;
  return safe;
}
