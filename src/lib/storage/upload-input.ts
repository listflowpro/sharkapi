/**
 * Uploads a user-supplied image (base64 or external URL) to our
 * Supabase "input-images" bucket and returns a stable internal URL.
 *
 * This ensures:
 *  - base64 is never stored in the database
 *  - external URLs are mirrored so the worker can always access them
 *  - the provider always receives images from our own infrastructure
 */

import { createServiceClient } from "@/lib/supabase/service";
import { randomBytes } from "crypto";

const BUCKET = "input-images";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export type UploadInputResult =
  | { url: string; path: string }
  | { error: string };

/**
 * Upload a base64-encoded image string to Supabase input-images bucket.
 * Accepts raw base64 or data URI format (data:image/png;base64,...).
 */
export async function uploadBase64Input(
  userId: string,
  base64: string
): Promise<UploadInputResult> {
  // Strip data URI prefix if present
  const clean = base64.replace(/^data:image\/[a-z+]+;base64,/, "");

  let buffer: Buffer;
  try {
    buffer = Buffer.from(clean, "base64");
  } catch {
    return { error: "Invalid base64 image data." };
  }

  if (buffer.length > MAX_BYTES) {
    return { error: "Image exceeds 10 MB limit." };
  }

  return uploadBuffer(userId, buffer, "image/png", "png");
}

/**
 * Download an external URL and upload to Supabase input-images bucket.
 * Rejects internal/private addresses (SSRF protection handled upstream).
 */
export async function uploadUrlInput(
  userId: string,
  url: string
): Promise<UploadInputResult> {
  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  } catch (err) {
    return { error: `Failed to fetch image URL: ${(err as Error).message}` };
  }

  if (!res.ok) {
    return { error: `Image URL returned HTTP ${res.status}.` };
  }

  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const mime = contentType.split(";")[0].trim();
  const ext  = mimeToExt(mime) ?? "jpg";

  const arrayBuf = await res.arrayBuffer();
  const buffer   = Buffer.from(arrayBuf);

  if (buffer.length > MAX_BYTES) {
    return { error: "Remote image exceeds 10 MB limit." };
  }

  return uploadBuffer(userId, buffer, mime, ext);
}

async function uploadBuffer(
  userId: string,
  buffer: Buffer,
  mimeType: string,
  ext: string
): Promise<UploadInputResult> {
  const service  = createServiceClient();
  const randomId = randomBytes(16).toString("hex");
  const path     = `${userId}/${randomId}.${ext}`;

  const { error } = await service.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: false });

  if (error) {
    console.error("[upload-input] storage error:", error.message);
    return { error: "Failed to store input image." };
  }

  // Private bucket — return the storage path; worker accesses via service client
  const { data } = service.storage.from(BUCKET).getPublicUrl(path);

  return { url: data.publicUrl, path };
}

function mimeToExt(mime: string): string | null {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg":  "jpg",
    "image/png":  "png",
    "image/webp": "webp",
    "image/gif":  "gif",
  };
  return map[mime] ?? null;
}
