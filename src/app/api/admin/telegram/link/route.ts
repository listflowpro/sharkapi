import { NextRequest, NextResponse } from "next/server";
import { validateAdmin } from "@/lib/auth/validate-admin";
import { createServiceClient } from "@/lib/supabase/service";
import { randomBytes } from "crypto";

const BOT_USERNAME = "Sharkapi_bot";

// POST — generate a one-time link token, return the t.me URL
export async function POST(_req: NextRequest) {
  const auth = await validateAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const token   = randomBytes(12).toString("hex");
  const service = createServiceClient();

  // Clean up tokens older than 10 minutes
  await service
    .from("telegram_pending_links")
    .delete()
    .lt("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());

  await service.from("telegram_pending_links").insert({ token });

  return NextResponse.json({
    token,
    url: `https://t.me/${BOT_USERNAME}?start=${token}`,
  });
}

// GET — poll: did this token get claimed yet?
export async function GET(req: NextRequest) {
  const auth = await validateAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ status: "missing" });

  const service = createServiceClient();
  const { data: pending } = await service
    .from("telegram_pending_links")
    .select("token")
    .eq("token", token)
    .maybeSingle();

  // If token is gone → it was consumed → connected
  return NextResponse.json({ status: pending ? "pending" : "connected" });
}
