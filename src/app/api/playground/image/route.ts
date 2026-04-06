import { NextRequest, NextResponse } from "next/server";
import { validateSession, isSessionError } from "@/lib/auth/validate-session";
import { createServiceClient } from "@/lib/supabase/service";
import { validateImageInput } from "@/lib/validation/image-input";

export async function POST(request: NextRequest) {
  // ── 1. Auth ──────────────────────────────────────────────────
  const session = await validateSession();
  if (isSessionError(session)) {
    return NextResponse.json({ error: session.error }, { status: session.status });
  }
  const { userId } = session;

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

  // ── 3. Model lookup ──────────────────────────────────────────
  const { data: model } = await service
    .from("models")
    .select("id, name, code, variant, price_usd, billing_unit, is_active")
    .eq("category", "image")
    .eq("variant", variant)
    .eq("is_active", true)
    .single();

  if (!model) {
    return NextResponse.json(
      { error: `No active model for variant '${variant}'.` },
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
    return NextResponse.json({ error: "Profile not found." }, { status: 403 });
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

  // ── 5. Create job ────────────────────────────────────────────
  const inputData: Record<string, unknown> = { prompt, variant };
  if (image_url) inputData.image_url = image_url;
  if (image)     inputData.image     = image;

  const { data: job, error: jobError } = await service
    .from("jobs")
    .insert({
      user_id:          userId,
      api_key_id:       null,
      model_id:         model.id,
      source:           "playground",
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
    console.error("playground job insert error:", jobError);
    return NextResponse.json({ error: "Failed to create job." }, { status: 500 });
  }

  return NextResponse.json(
    {
      job_id:     job.id,
      status:     job.status,
      created_at: job.created_at,
      price_usd:  model.price_usd,
    },
    { status: 202 }
  );
}
