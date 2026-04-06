import { NextRequest, NextResponse } from "next/server";
import { validateAdmin, isAdminError } from "@/lib/auth/validate-admin";
import { adminToggleProvider } from "@/lib/admin-data";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateAdmin();
  if (isAdminError(auth)) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const { is_active } = await request.json();
  await adminToggleProvider(id, Boolean(is_active));
  return NextResponse.json({ ok: true });
}
