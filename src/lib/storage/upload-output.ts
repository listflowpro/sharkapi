/**
 * Downloads a generated image from the provider's temporary URL and
 * uploads it to our Supabase "generated-images" bucket.
 *
 * This gives the user a permanent, CDN-backed URL that we control —
 * provider URLs are ephemeral and can be deleted at any time.
 */

import { createServiceClient } from "@/lib/supabase/service";
import { randomBytes } from "crypto";

const BUCKET = "generated-images";

export type UploadOutputResult =
  | { url: string; path: string }
  | { error: string };

/**
 * Download an image from a provider-returned URL and store it permanently.
 */
export async function uploadOutputFromUrl(
  userId: string,
  jobId: string,
  providerUrl: string
): Promise<UploadOutputResult> {
  let res: Response;
  try {
    res = await fetch(providerUrl, { signal: AbortSignal.timeout(60_000) });
  } catch (err) {
    return { error: `Failed to download provider image: ${(err as Error).message}` };
  }

  if (!res.ok) {
    return { error: `Provider image URL returned HTTP ${res.status}.` };
  }

  const contentType = res.headers.get("content-type") ?? "image/png";
  const mime = contentType.split(";")[0].trim();
  const ext  = mimeToExt(mime) ?? "png";

  const arrayBuf = await res.arrayBuffer();
  const buffer   = Buffer.from(arrayBuf);

  return uploadBuffer(userId, jobId, buffer, mime, ext);
}

/**
 * Store a provider-returned base64 image permanently.
 */
export async function uploadOutputFromBase64(
  userId: string,
  jobId: string,
  base64: string,
  mimeType = "image/png"
): Promise<UploadOutputResult> {
  const clean = base64.replace(/^data:image\/[a-z+]+;base64,/, "");
  const buffer = Buffer.from(clean, "base64");
  const ext    = mimeToExt(mimeType) ?? "png";
  return uploadBuffer(userId, jobId, buffer, mimeType, ext);
}

async function uploadBuffer(
  userId: string,
  jobId: string,
  buffer: Buffer,
  mimeType: string,
  ext: string
): Promise<UploadOutputResult> {
  const service  = createServiceClient();
  // Deterministic path: easy to find by job if needed
  const suffix   = randomBytes(4).toString("hex");
  const path     = `${userId}/${jobId}-${suffix}.${ext}`;

  const { error } = await service.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: false });

  if (error) {
    console.error("[upload-output] storage error:", error.message);
    return { error: "Failed to store generated image." };
  }

  const { data } = service.storage.from(BUCKET).getPublicUrl(path);

  return { url: data.publicUrl, path };
}

function mimeToExt(mime: string): string | null {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg":  "jpg",
    "image/png":  "png",
    "image/webp": "webp",
  };
  return map[mime] ?? null;
}
