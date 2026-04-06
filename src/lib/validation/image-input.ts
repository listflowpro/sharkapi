import { isSsrfBlocked } from "@/lib/security/ssrf";

// Max base64 image size: ~5 MB decoded → ~6.7 MB base64
const MAX_BASE64_BYTES = 7 * 1024 * 1024;

export interface ImageInput {
  prompt: string;
  variant: "1k";
  image_url?: string;
  image?: string;
}

export interface ImageInputError {
  error: string;
  status: 400 | 422;
}

export function validateImageInput(body: Record<string, unknown>): ImageInput | ImageInputError {
  const prompt = (body.prompt ?? "").toString().trim();
  const variant = (body.variant ?? "1k").toString();
  const image_url = body.image_url ? String(body.image_url).trim() : undefined;
  const image = body.image ? String(body.image).trim() : undefined;

  if (!prompt) {
    return { error: "prompt is required.", status: 400 };
  }

  if (variant !== "1k") {
    return {
      error: "Only variant '1k' is currently supported.",
      status: 422,
    };
  }

  if (image_url && image) {
    return {
      error: "Provide either image_url or image, not both.",
      status: 400,
    };
  }

  if (image_url) {
    if (isSsrfBlocked(image_url)) {
      return { error: "Invalid image_url.", status: 400 };
    }
  }

  if (image) {
    // Strip data URI prefix if present (data:image/png;base64,...)
    const b64 = image.replace(/^data:image\/[a-z]+;base64,/, "");
    if (b64.length > MAX_BASE64_BYTES) {
      return { error: "image exceeds maximum allowed size.", status: 400 };
    }
    // Basic base64 character check
    if (!/^[A-Za-z0-9+/=]+$/.test(b64)) {
      return { error: "image must be a valid base64 string.", status: 400 };
    }
    return { prompt, variant: "1k", image: b64 };
  }

  return { prompt, variant: "1k", image_url };
}
