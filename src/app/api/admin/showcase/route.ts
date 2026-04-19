import { NextRequest, NextResponse } from "next/server";
import { validateAdmin } from "@/lib/auth/validate-admin";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(_req: NextRequest) {
  const auth = await validateAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const service = createServiceClient();
  const { data, error } = await service
    .from("showcase_images")
    .select("id, url, alt, is_active, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ images: data });
}

export async function POST(req: NextRequest) {
  const auth = await validateAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  const { url, alt } = body as { url?: string; alt?: string };

  if (!url?.trim()) return NextResponse.json({ error: "url is required." }, { status: 400 });

  const service = createServiceClient();

  // Auto sort_order: max + 1
  const { data: last } = await service
    .from("showcase_images")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sort_order = (last?.sort_order ?? 0) + 1;

  const { data, error } = await service
    .from("showcase_images")
    .insert({ url: url.trim(), alt: alt?.trim() ?? null, sort_order })
    .select("id, url, alt, is_active, sort_order, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ image: data });
}
