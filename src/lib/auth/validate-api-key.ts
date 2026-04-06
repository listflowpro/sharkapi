import { createHash } from "crypto";
import { createServiceClient } from "@/lib/supabase/service";

export interface ApiKeyContext {
  userId: string;
  keyId: string;
}

export interface ApiKeyError {
  error: string;
  status: 401 | 403;
}

/**
 * Validates the X-API-Key header against the database.
 * Returns the user_id and key_id on success, or an error object on failure.
 * Plaintext key is never logged.
 */
export async function validateApiKey(
  request: Request
): Promise<ApiKeyContext | ApiKeyError> {
  const raw = request.headers.get("x-api-key");

  if (!raw) {
    return { error: "Missing X-API-Key header.", status: 401 };
  }

  const hash = createHash("sha256").update(raw).digest("hex");

  const service = createServiceClient();
  const { data: key } = await service
    .from("api_keys")
    .select("id, user_id, is_active, revoked_at")
    .eq("key_hash", hash)
    .single();

  if (!key) {
    return { error: "Invalid API key.", status: 401 };
  }

  if (!key.is_active || key.revoked_at) {
    return { error: "API key has been revoked.", status: 403 };
  }

  // Fire-and-forget: update last_used_at without blocking the request
  service
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", key.id)
    .then(() => {});

  return { userId: key.user_id, keyId: key.id };
}

export function isApiKeyError(
  result: ApiKeyContext | ApiKeyError
): result is ApiKeyError {
  return "error" in result;
}
