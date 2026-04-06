import { NextRequest, NextResponse } from "next/server";
import { validateAdmin, isAdminError } from "@/lib/auth/validate-admin";
import { adminSetUserStatus, adminSetUserRole } from "@/lib/admin-data";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateAdmin();
  if (isAdminError(auth)) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const body = await request.json();

  if (body.status !== undefined) {
    if (!["active", "suspended"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    await adminSetUserStatus(id, body.status);
  }

  if (body.role !== undefined) {
    if (!["user", "admin"].includes(body.role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }
    await adminSetUserRole(id, body.role);
  }

  return NextResponse.json({ ok: true });
}
