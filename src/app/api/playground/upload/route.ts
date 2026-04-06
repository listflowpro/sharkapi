import { NextRequest, NextResponse } from "next/server";
import { validateSession, isSessionError } from "@/lib/auth/validate-session";
import { createServiceClient } from "@/lib/supabase/service";
import { randomBytes } from "crypto";

const BUCKET = "playground-refs";
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg":  "jpg",
  "image/png":  "png",
  "image/webp": "webp",
};

// POST /api/playground/upload
// Content-Type: multipart/form-data
// Field: file (image)
export async function POST(request: NextRequest) {
  // ── 1. Auth ──────────────────────────────────────────────────
  const session = await validateSession();
  if (isSessionError(session)) {
    return NextResponse.json({ error: session.error }, { status: session.status });
  }
  const { userId } = session;

  // ── 2. Parse multipart form ──────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  // ── 3. Validate type ─────────────────────────────────────────
  const mimeType = file.type.toLowerCase();
  const ext = ALLOWED_TYPES[mimeType];
  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported file type. Use JPEG, PNG, or WebP." },
      { status: 400 }
    );
  }

  // ── 4. Validate size ─────────────────────────────────────────
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File exceeds maximum size of 10 MB." },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty." }, { status: 400 });
  }

  // ── 5. Safe filename — never use user-supplied name ──────────
  const randomId = randomBytes(16).toString("hex");
  const storagePath = `${userId}/${randomId}.${ext}`;

  // ── 6. Upload to Supabase Storage ────────────────────────────
  const service = createServiceClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await service.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    console.error("storage upload error:", uploadError.message);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }

  // ── 7. Get public URL ────────────────────────────────────────
  const { data: urlData } = service.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  return NextResponse.json({ url: urlData.publicUrl }, { status: 200 });
}
