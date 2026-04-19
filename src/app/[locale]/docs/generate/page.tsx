import type { Metadata } from "next";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { H1, H2, H3, P, Lead, CodeBlock, Callout, Endpoint, ParamTable, Code } from "@/components/docs/DocsComponents";
import { GlowLine } from "@/components/effects/WaveDivider";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Generate Image — SharkAPI Docs" };

const ON_THIS_PAGE = [
  { id: "overview",    label: "Overview" },
  { id: "request",     label: "Request" },
  { id: "image-input", label: "Sending an image" },
  { id: "response",    label: "Response" },
  { id: "examples",    label: "Examples" },
  { id: "errors",      label: "Errors" },
];

const REQUEST_PARAMS = [
  { name: "prompt",   type: "string", required: true,  desc: "Text description of the image to generate. Max 2000 characters." },
  { name: "variant",  type: "string", required: false, desc: 'Resolution variant. Currently only "1k" (1024×1024) is available. Defaults to "1k".' },
  { name: "image",    type: "string", required: false, desc: "Base64-encoded reference image for image-to-image generation. JPEG, PNG, or WebP. Max 10 MB. Cannot be combined with image_url." },
  { name: "image_url",type: "string", required: false, desc: "Publicly accessible URL of a reference image. Max 10 MB. Cannot be combined with image." },
];

const RESPONSE_FIELDS = [
  { name: "job_id",     type: "string", required: true, desc: "Unique identifier for this job. Use with GET /api/v1/jobs/:id to poll for the result." },
  { name: "status",     type: "string", required: true, desc: 'Always "queued" immediately after creation.' },
  { name: "poll_url",   type: "string", required: true, desc: "Relative URL to poll for job status." },
  { name: "price_usd",  type: "number", required: true, desc: "Cost of this job in USD (e.g. 0.03). Charged only on successful completion." },
  { name: "created_at", type: "string", required: true, desc: "ISO 8601 timestamp of job creation." },
];

const CURL_TEXT = `curl -X POST https://www.sharkapi.dev/api/v1/image \\
  -H "Authorization: Bearer sk_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "A great white shark in bioluminescent deep ocean, cinematic lighting, 8K",
    "variant": "1k"
  }'`;

const CURL_BASE64 = `# Encode your image to base64 first
IMAGE_B64=$(base64 -w 0 ./reference.jpg)

curl -X POST https://www.sharkapi.dev/api/v1/image \\
  -H "Authorization: Bearer sk_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d "{
    \\"prompt\\": \\"Transform into a watercolor painting\\",
    \\"variant\\": \\"1k\\",
    \\"image\\": \\"$IMAGE_B64\\"
  }"`;

const CURL_IMAGE_URL = `curl -X POST https://www.sharkapi.dev/api/v1/image \\
  -H "Authorization: Bearer sk_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Transform into a watercolor painting",
    "variant": "1k",
    "image_url": "https://your-cdn.com/reference.jpg"
  }'`;

const RESPONSE_EXAMPLE = `{
  "job_id":     "3a8f2c1d-7b4e-4f9a-b2d6-1c5e8f3a9b7d",
  "status":     "queued",
  "poll_url":   "/api/v1/jobs/3a8f2c1d-7b4e-4f9a-b2d6-1c5e8f3a9b7d",
  "price_usd":  0.03,
  "created_at": "2025-01-15T10:23:44Z"
}`;

const JS_FULL = `async function generateImage(prompt, imageBase64 = null) {
  const body = { prompt, variant: "1k" };
  if (imageBase64) body.image = imageBase64;

  const res = await fetch("https://www.sharkapi.dev/api/v1/image", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${process.env.SHARKAPI_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Request failed");
  }

  return res.json(); // { job_id, status: "queued", poll_url, ... }
}

const job = await generateImage("A shark surfing a neon wave");
console.log(job.job_id); // poll this next`;

const PYTHON_FULL = `import httpx, base64

def generate_image(prompt: str, image_path: str | None = None) -> dict:
    headers = {
        "Authorization": f"Bearer {SHARKAPI_KEY}",
        "Content-Type": "application/json",
    }
    body = {"prompt": prompt, "variant": "1k"}

    if image_path:
        with open(image_path, "rb") as f:
            body["image"] = base64.b64encode(f.read()).decode()

    res = httpx.post(
        "https://www.sharkapi.dev/api/v1/image",
        headers=headers,
        json=body,
        timeout=30,
    )
    res.raise_for_status()
    return res.json()  # { "job_id": "...", "status": "queued", ... }`;

export default function GenerateDocsPage() {
  return (
    <DocsLayout onThisPage={ON_THIS_PAGE}>
      <Badge variant="info" className="mb-4">Endpoints</Badge>
      <H1>POST — Generate Image</H1>
      <Lead>
        Submit an image generation job. Returns a <Code>job_id</Code> immediately —
        then poll <Code>GET /api/v1/jobs/:id</Code> every 2 seconds until the result is ready.
      </Lead>
      <GlowLine className="mb-8" />

      {/* ── Overview ── */}
      <H2 id="overview">Overview</H2>
      <Endpoint method="POST" path="https://www.sharkapi.dev/api/v1/image" />
      <P>
        This endpoint is <strong>fully asynchronous</strong>. It does not wait for
        image generation to finish. Instead it queues the job and returns a{" "}
        <Code>job_id</Code> you use to poll for the result. Generation typically
        takes <strong>30 – 120 seconds</strong>.
      </P>
      <Callout type="info">
        Your wallet is only charged when a job reaches <Code>status: "completed"</Code>{" "}
        and an <Code>image_url</Code> is returned. Failed or moderated jobs are{" "}
        <strong>never charged</strong>.
      </Callout>

      {/* ── Request ── */}
      <H2 id="request">Request</H2>
      <H3>Headers</H3>
      <ParamTable rows={[
        { name: "Authorization", type: "string", required: true, desc: 'Your API key. Format: "Bearer sk_live_..."' },
        { name: "Content-Type",  type: "string", required: true, desc: '"application/json"' },
      ]} />
      <H3>Body parameters</H3>
      <ParamTable rows={REQUEST_PARAMS} />
      <Callout type="warning">
        <Code>image</Code> and <Code>image_url</Code> are mutually exclusive —
        send one or the other, never both.
      </Callout>

      {/* ── Image input ── */}
      <H2 id="image-input">Sending an image (image-to-image)</H2>
      <P>
        You can guide generation with a reference image in two ways:
      </P>

      <H3>Option A — Base64</H3>
      <P>
        Encode your image file as base64 and pass it in the <Code>image</Code> field.
        You can include or omit the <Code>data:image/...;base64,</Code> prefix — both work.
        Supported formats: JPEG, PNG, WebP. Max size: 10 MB.
      </P>
      <CodeBlock code={CURL_BASE64} lang="bash" title="Base64 image input" />

      <H3>Option B — URL</H3>
      <P>
        Pass a publicly accessible URL in the <Code>image_url</Code> field.
        The URL must be reachable from our servers. Private or authenticated URLs
        will fail — use base64 instead.
      </P>
      <CodeBlock code={CURL_IMAGE_URL} lang="bash" title="URL image input" />

      <Callout type="info">
        We mirror both inputs to our own storage before sending to the generation
        engine, so your original file or URL is never exposed to third parties.
      </Callout>

      {/* ── Response ── */}
      <H2 id="response">Response</H2>
      <P>HTTP <Code>202 Accepted</Code> on success. The job has been queued.</P>
      <ParamTable rows={RESPONSE_FIELDS} />
      <CodeBlock code={RESPONSE_EXAMPLE} lang="json" title="202 Response" color="text-aqua-300" />

      {/* ── Examples ── */}
      <H2 id="examples">Examples</H2>

      <H3>Text-only (cURL)</H3>
      <CodeBlock code={CURL_TEXT} lang="bash" />

      <H3>JavaScript / Node.js</H3>
      <CodeBlock code={JS_FULL} lang="javascript" color="text-amber-300" />

      <H3>Python</H3>
      <CodeBlock code={PYTHON_FULL} lang="python" color="text-electric-300" />

      {/* ── Errors ── */}
      <H2 id="errors">Errors</H2>
      <ParamTable rows={[
        { name: "400 Bad Request",          type: "HTTP", desc: "Missing or invalid body fields (e.g. no prompt, both image and image_url sent)." },
        { name: "401 Unauthorized",         type: "HTTP", desc: "Missing or invalid API key." },
        { name: "402 Payment Required",     type: "HTTP", desc: "Insufficient wallet balance. Top up your account before retrying." },
        { name: "403 Forbidden",            type: "HTTP", desc: "API key is revoked or account is suspended." },
        { name: "422 Unprocessable Entity", type: "HTTP", desc: 'No active model for the requested variant. Only "1k" is currently available.' },
        { name: "500 Internal Server Error",type: "HTTP", desc: "Server-side error. Retry after a few seconds." },
      ]} />
    </DocsLayout>
  );
}
