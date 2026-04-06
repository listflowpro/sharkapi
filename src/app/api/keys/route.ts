import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createHash, randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  // Validate session
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse body
  let name: string;
  try {
    const body = await request.json();
    name = (body.name ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!name) {
    return NextResponse.json({ error: "Key name is required." }, { status: 400 });
  }

  // Generate key: sk_live_ + 32 random hex chars
  const rawKey = "sk_live_" + randomBytes(32).toString("hex");
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, 16); // "sk_live_" + 8 chars

  // Insert via service client (bypasses RLS)
  const service = createServiceClient();
  const { data: apiKey, error: insertError } = await service
    .from("api_keys")
    .insert({
      user_id: user.id,
      name,
      key_prefix: keyPrefix,
      key_hash: keyHash,
      is_active: true,
    })
    .select("id, user_id, name, key_prefix, is_active, last_used_at, created_at, revoked_at")
    .single();

  if (insertError) {
    console.error("api/keys insert error:", insertError);
    return NextResponse.json({ error: "Failed to create API key." }, { status: 500 });
  }

  return NextResponse.json({ key: rawKey, apiKey }, { status: 201 });
}
