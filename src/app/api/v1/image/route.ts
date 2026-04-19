import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, isApiKeyError } from "@/lib/auth/validate-api-key";
import { createServiceClient } from "@/lib/supabase/service";
import { validateImageInput } from "@/lib/validation/image-input";
import { enqueueJob } from "@/lib/queue/enqueue";
import { uploadBase64Input, uploadUrlInput } from "@/lib/storage/upload-input";

// POST /api/v1/image
export async function POST(request: NextRequest) {
  // ── 1. Authenticate ──────────────────────────────────────────
  const auth = await validateApiKey(request);
  if (isApiKeyError(auth)) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { userId, keyId } = auth;

  // ── 2. Parse & validate body ─────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validated = validateImageInput(body);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: validated.status });
  }

  const { prompt, variant, image_url, image } = validated;

  const service = createServiceClient();

  // ── 3. Model lookup (before upload to fail fast) ────────────
  const { data: model } = await service
    .from("models")
    .select("id, name, code, variant, price_usd, billing_unit, is_active")
    .eq("category", "image")
    .eq("variant", variant)
    .eq("is_active", true)
    .single();

  if (!model) {
    return NextResponse.json(
      { error: `No active model found for variant '${variant}'.` },
      { status: 422 }
    );
  }

  // ── 4. Wallet check ──────────────────────────────────────────
  const { data: profile } = await service
    .from("profiles")
    .select("wallet_balance, status")
    .eq("id", userId)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "User profile not found." }, { status: 403 });
  }

  if (profile.status !== "active") {
    return NextResponse.json({ error: "Account is suspended." }, { status: 403 });
  }

  if (Number(profile.wallet_balance) < Number(model.price_usd)) {
    return NextResponse.json(
      { error: "Insufficient wallet balance.", code: "INSUFFICIENT_BALANCE" },
      { status: 402 }
    );
  }

  // ── 5. Upload input image to our storage (if provided) ──────
  // Never store base64 in DB — always mirror to Supabase first.
  let storedImageUrl: string | undefined;

  if (image) {
    const result = await uploadBase64Input(userId, image);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    storedImageUrl = result.url;
  } else if (image_url) {
    const result = await uploadUrlInput(userId, image_url);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    storedImageUrl = result.url;
  }

  // ── 6. Create job ────────────────────────────────────────────
  const inputData: Record<string, unknown> = { prompt, variant };
  if (storedImageUrl) inputData.image_url = storedImageUrl;

  const { data: job, error: jobError } = await service
    .from("jobs")
    .insert({
      user_id:          userId,
      api_key_id:       keyId,
      model_id:         model.id,
      source:           "api",
      status:           "queued",
      input_data:       inputData,
      pricing_snapshot: {
        model_code:   model.code,
        model_name:   model.name,
        variant:      model.variant,
        price_usd:    model.price_usd,
        billing_unit: model.billing_unit,
      },
      queued_at: new Date().toISOString(),
    })
    .select("id, status, created_at")
    .single();

  if (jobError || !job) {
    console.error("job insert error:", jobError);
    return NextResponse.json({ error: "Failed to create job." }, { status: 500 });
  }

  await enqueueJob(job.id);

  return NextResponse.json(
    {
      job_id:     job.id,
      status:     job.status,
      created_at: job.created_at,
      model: {
        name:      model.name,
        variant:   model.variant,
        price_usd: model.price_usd,
      },
      poll_url: `/api/v1/jobs/${job.id}`,
    },
    { status: 202 }
  );
}
