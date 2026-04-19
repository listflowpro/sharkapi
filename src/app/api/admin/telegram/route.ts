import { NextRequest, NextResponse } from "next/server";
import { validateAdmin } from "@/lib/auth/validate-admin";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(_req: NextRequest) {
  const auth = await validateAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const service = createServiceClient();
  const { data, error } = await service
    .from("telegram_configs")
    .select("id, name, chat_id, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ configs: data });
}

export async function POST(req: NextRequest) {
  const auth = await validateAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  const { name, chat_id } = body as { name?: string; chat_id?: string };

  if (!name?.trim() || !chat_id?.trim()) {
    return NextResponse.json({ error: "name and chat_id are required." }, { status: 400 });
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from("telegram_configs")
    .insert({ name: name.trim(), chat_id: chat_id.trim() })
    .select("id, name, chat_id, is_active, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ config: data });
}
