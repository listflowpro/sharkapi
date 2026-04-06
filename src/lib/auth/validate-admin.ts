import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export interface AdminContext {
  userId: string;
}

export interface AdminError {
  error: string;
  status: 401 | 403;
}

export async function validateAdmin(): Promise<AdminContext | AdminError> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized", status: 401 };

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { error: "Forbidden", status: 403 };
  }

  return { userId: user.id };
}

export function isAdminError(r: AdminContext | AdminError): r is AdminError {
  return "error" in r;
}
