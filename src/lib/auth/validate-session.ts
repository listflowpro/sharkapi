import { createClient } from "@/lib/supabase/server";

export interface SessionContext {
  userId: string;
}

export interface SessionError {
  error: string;
  status: 401;
}

export async function validateSession(): Promise<SessionContext | SessionError> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  return { userId: user.id };
}

export function isSessionError(
  result: SessionContext | SessionError
): result is SessionError {
  return "error" in result;
}
