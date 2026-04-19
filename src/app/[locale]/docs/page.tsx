import type { Metadata } from "next";
import {
  H1, H2, H3, P, Lead, CodeBlock, Callout, Endpoint, ParamTable, Code,
} from "@/components/docs/DocsComponents";
import { GlowLine } from "@/components/effects/WaveDivider";
import { Badge } from "@/components/ui/Badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "API Documentation — SharkAPI",
  description: "Complete SharkAPI reference: authentication, image generation, polling, errors and examples.",
};

const ON_THIS_PAGE = [
  { id: "overview",      label: "Overview" },
  { id: "base-url",      label: "Base URL" },
  { id: "auth",          label: "Authentication" },
  { id: "how-it-works",  label: "How it works" },
  { id: "pricing",       label: "Pricing & wallet" },
  { id: "generate",      label: "POST — Generate image" },
  { id: "image-input",   label: "↳ Sending an image" },
  { id: "poll",          label: "GET — Job status" },
  { id: "job-statuses",  label: "↳ Job statuses" },
  { id: "errors",        label: "Errors" },
  { id: "examples",      label: "Full examples" },
  { id: "coming-soon",   label: "Coming soon" },
];

/* ── Code snippets ─────────────────────────────────────────────── */

const QUICKSTART = `# Step 1 — submit a job
curl -X POST https://www.sharkapi.dev/api/v1/image \\
  -H "X-API-Key: sk_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "A great white shark in bioluminescent deep ocean, cinematic, 8K"}'

# → 202 Accepted
# { "job_id": "3a8f2c1d-...", "status": "queued", "poll_url": "/api/v1/jobs/3a8f2c1d-..." }

# Step 2 — poll every 2 seconds until completed
curl https://www.sharkapi.dev/api/v1/jobs/3a8f2c1d-... \\
  -H "X-API-Key: sk_live_••••••••"

# → { "status": "completed", "image_url": "https://...supabase.co/.../generated-images/..." }`;

const AUTH_HEADER = `X-API-Key: sk_live_your_token_here`;

const GENERATE_CURL_TEXT = `curl -X POST https://www.sharkapi.dev/api/v1/image \\
  -H "X-API-Key: sk_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "A great white shark in bioluminescent deep ocean, cinematic, 8K",
    "variant": "1k"
  }'`;

const GENERATE_RESPONSE = `{
  "job_id":     "3a8f2c1d-7b4e-4f9a-b2d6-1c5e8f3a9b7d",
  "status":     "queued",
  "poll_url":   "/api/v1/jobs/3a8f2c1d-7b4e-4f9a-b2d6-1c5e8f3a9b7d",
  "price_usd":  0.03,
  "created_at": "2025-01-15T10:23:44Z"
}`;

const IMAGE_BASE64_CURL = `# Encode your file to base64 first
IMAGE_B64=$(base64 -w 0 ./reference.jpg)   # Linux
# IMAGE_B64=$(base64 -i ./reference.jpg)   # macOS

curl -X POST https://www.sharkapi.dev/api/v1/image \\
  -H "X-API-Key: sk_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d "{
    \\"prompt\\": \\"Transform this into a watercolor painting\\",
    \\"image\\": \\"$IMAGE_B64\\"
  }"`;

const IMAGE_URL_CURL = `curl -X POST https://www.sharkapi.dev/api/v1/image \\
  -H "X-API-Key: sk_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Transform this into a watercolor painting",
    "image_url": "https://your-cdn.com/photo.jpg"
  }'`;

const POLL_CURL = `curl https://www.sharkapi.dev/api/v1/jobs/3a8f2c1d-7b4e-4f9a-b2d6-1c5e8f3a9b7d \\
  -H "X-API-Key: sk_live_••••••••"`;

const POLL_QUEUED = `{
  "job_id":       "3a8f2c1d-7b4e-4f9a-b2d6-1c5e8f3a9b7d",
  "status":       "queued",
  "image_url":    null,
  "cost":         null,
  "error":        null,
  "queued_at":    "2025-01-15T10:23:44Z",
  "started_at":   null,
  "completed_at": null,
  "created_at":   "2025-01-15T10:23:44Z"
}`;

const POLL_COMPLETED = `{
  "job_id":       "3a8f2c1d-7b4e-4f9a-b2d6-1c5e8f3a9b7d",
  "status":       "completed",
  "image_url":    "https://your-project.supabase.co/storage/v1/object/public/generated-images/user-id/3a8f2c1d-xxxx.png",
  "cost":         "$0.03",
  "error":        null,
  "queued_at":    "2025-01-15T10:23:44Z",
  "started_at":   "2025-01-15T10:23:46Z",
  "completed_at": "2025-01-15T10:24:18Z",
  "created_at":   "2025-01-15T10:23:44Z"
}`;

const POLL_FAILED = `{
  "job_id":       "9b3c1a2d-4f8e-4c7b-a1e5-2d9f6b4a8c3e",
  "status":       "failed",
  "image_url":    null,
  "cost":         null,
  "error":        "Provider request timed out after 180s.",
  "queued_at":    "2025-01-15T10:30:00Z",
  "started_at":   "2025-01-15T10:30:02Z",
  "completed_at": null,
  "created_at":   "2025-01-15T10:30:00Z"
}`;

const ERROR_RESPONSE = `{
  "error": "Insufficient wallet balance."
}

// Some errors also include a machine-readable code:
{
  "error": "Insufficient wallet balance.",
  "code":  "INSUFFICIENT_BALANCE"
}`;

const FULL_JS = `// ── SharkAPI — complete JavaScript / Node.js example ──────────────

const SHARKAPI_KEY = process.env.SHARKAPI_KEY; // sk_live_...
const BASE_URL     = "https://www.sharkapi.dev";

// 1. Submit a generation job
async function generateImage(prompt, options = {}) {
  const body = { prompt, variant: "1k" };

  // Optional: attach a reference image (base64 or URL, not both)
  if (options.imageBase64) body.image     = options.imageBase64;
  if (options.imageUrl)    body.image_url = options.imageUrl;

  const res = await fetch(\`\${BASE_URL}/api/v1/image\`, {
    method: "POST",
    headers: {
      "X-API-Key": SHARKAPI_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? \`HTTP \${res.status}\`);
  }

  return res.json(); // { job_id, status: "queued", poll_url, price_usd }
}

// 2. Poll until completed or failed
async function waitForJob(jobId, timeoutMs = 180_000) {
  const url      = \`\${BASE_URL}/api/v1/jobs/\${jobId}\`;
  const headers  = { "X-API-Key": SHARKAPI_KEY };
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(\`Poll failed: HTTP \${res.status}\`);

    const job = await res.json();

    if (job.status === "completed") return job; // job.image_url is ready
    if (job.status === "failed")    throw new Error(job.error ?? "Job failed");

    // queued / processing — wait and retry
    await new Promise(r => setTimeout(r, 2000));
  }

  throw new Error("Job timed out after 3 minutes");
}

// 3. Full flow
async function main() {
  console.log("Submitting job...");
  const { job_id } = await generateImage(
    "A great white shark in bioluminescent deep ocean, cinematic, 8K"
  );

  console.log(\`Job created: \${job_id} — polling...\`);
  const job = await waitForJob(job_id);

  console.log("Done!");
  console.log("Image URL:", job.image_url);
  console.log("Cost:     ", job.cost);
}

main().catch(console.error);`;

const FULL_PYTHON = `# ── SharkAPI — complete Python example ────────────────────────────
import os, time, httpx

SHARKAPI_KEY = os.environ["SHARKAPI_KEY"]  # sk_live_...
BASE_URL     = "https://www.sharkapi.dev"

def generate_image(prompt: str, image_path: str | None = None, image_url: str | None = None) -> dict:
    """Submit a generation job. Returns the job dict with job_id."""
    headers = {
        "X-API-Key": SHARKAPI_KEY,
        "Content-Type": "application/json",
    }
    body = {"prompt": prompt, "variant": "1k"}

    if image_path:
        import base64
        with open(image_path, "rb") as f:
            body["image"] = base64.b64encode(f.read()).decode()
    elif image_url:
        body["image_url"] = image_url

    res = httpx.post(f"{BASE_URL}/api/v1/image", headers=headers, json=body, timeout=30)
    res.raise_for_status()
    return res.json()  # { job_id, status, poll_url, price_usd }


def wait_for_job(job_id: str, timeout: int = 180) -> dict:
    """Poll until completed or failed. Returns the completed job dict."""
    url      = f"{BASE_URL}/api/v1/jobs/{job_id}"
    headers  = {"X-API-Key": SHARKAPI_KEY}
    deadline = time.time() + timeout

    while time.time() < deadline:
        res = httpx.get(url, headers=headers, timeout=10)
        res.raise_for_status()
        job = res.json()

        if job["status"] == "completed":
            return job  # job["image_url"] is ready
        if job["status"] == "failed":
            raise RuntimeError(job.get("error") or "Job failed — no charge applied")

        time.sleep(2)  # queued / processing — keep polling

    raise TimeoutError("Job timed out after 3 minutes")


# Full flow
if __name__ == "__main__":
    print("Submitting job...")
    job_info = generate_image(
        "A great white shark in bioluminescent deep ocean, cinematic, 8K"
    )
    job_id = job_info["job_id"]
    print(f"Job created: {job_id} — polling...")

    job = wait_for_job(job_id)
    print("Done!")
    print("Image URL:", job["image_url"])
    print("Cost:     ", job["cost"])`;

const FULL_CURL = `#!/bin/bash
# ── SharkAPI — complete shell script example ──────────────────────

TOKEN="sk_live_••••••••"
BASE="https://www.sharkapi.dev"

# 1. Submit job
RESPONSE=$(curl -s -X POST "$BASE/api/v1/image" \\
  -H "X-API-Key: $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt":"A great white shark in bioluminescent deep ocean, cinematic, 8K"}')

JOB_ID=$(echo "$RESPONSE" | grep -o '"job_id":"[^"]*"' | cut -d'"' -f4)
echo "Job created: $JOB_ID"

# 2. Poll every 2 seconds
while true; do
  POLL=$(curl -s "$BASE/api/v1/jobs/$JOB_ID" \\
    -H "X-API-Key: $TOKEN")

  STATUS=$(echo "$POLL" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
  echo "Status: $STATUS"

  if [ "$STATUS" = "completed" ]; then
    echo "Image URL: $(echo $POLL | grep -o '"image_url":"[^"]*"' | cut -d'"' -f4)"
    break
  fi

  if [ "$STATUS" = "failed" ]; then
    echo "Job failed — no charge applied"
    break
  fi

  sleep 2
done`;

/* ── Page ─────────────────────────────────────────────────────────── */

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen pt-16">
        {/* Main content */}
        <div className="flex-1 min-w-0 flex justify-center">
          <main className="flex-1 px-6 md:px-10 py-10 max-w-3xl w-full">
      <Badge variant="info" className="mb-4">API Reference</Badge>
      <H1>SharkAPI Documentation</H1>
      <Lead>
        Complete reference for the SharkAPI image generation API.
        Generate 1024×1024 AI images asynchronously — submit a job, poll for the result.
      </Lead>
      <GlowLine className="mb-8" />

      {/* ── Overview ─────────────────────────────────────────── */}
      <H2 id="overview">Overview</H2>
      <P>
        SharkAPI is an asynchronous image generation API. You submit a prompt (and optionally
        a reference image), receive a <Code>job_id</Code> immediately, then poll every 2 seconds
        until your image is ready. Generation typically takes <strong>30–120 seconds</strong>.
      </P>
      <P>
        Billing is wallet-based — you load credit in advance and are charged only when a job
        successfully completes with an image. <strong>Failed jobs are never charged.</strong>
      </P>
      <Callout type="info">
        <strong>3 free trial generations</strong> are included with every new account. No credit
        card required to start.
      </Callout>

      {/* ── Base URL ─────────────────────────────────────────── */}
      <H2 id="base-url">Base URL</H2>
      <CodeBlock code="https://www.sharkapi.dev" lang="text" color="text-aqua-300" />
      <P>All endpoints are under this base URL. Always use HTTPS.</P>

      {/* ── Authentication ───────────────────────────────────── */}
      <H2 id="auth">Authentication</H2>
      <P>
        Every request must include your API key in the{" "}
        <Code>X-API-Key</Code> header. Get your key from{" "}
        <strong>Dashboard → API Tokens</strong>.
      </P>
      <CodeBlock code={AUTH_HEADER} lang="http" color="text-aqua-300" title="Required header" />

      <div className="flex flex-col gap-2.5 mb-6">
        {[
          "Store keys in environment variables — never hardcode in source files.",
          "Never expose keys in browser/client-side JavaScript.",
          "Create a separate key per project or environment.",
          "Revoke a key immediately if you suspect it has been leaked.",
          "The full key is shown only once — copy it right after creation.",
        ].map((tip) => (
          <div key={tip} className="flex items-start gap-2 text-sm text-ocean-200">
            <span className="text-electric-400 shrink-0 mt-0.5">→</span>
            {tip}
          </div>
        ))}
      </div>

      <ParamTable rows={[
        { name: "401 Unauthorized", type: "HTTP", desc: "X-API-Key header is missing or the key is invalid." },
        { name: "403 Forbidden",    type: "HTTP", desc: "Key exists but has been revoked, or account is suspended." },
      ]} />

      {/* ── How it works ─────────────────────────────────────── */}
      <H2 id="how-it-works">How it works</H2>
      <P>Every image generation follows this async pattern:</P>
      <div className="flex flex-col gap-0 mb-6">
        {[
          { n: "1", label: "POST /api/v1/image",   desc: "Submit your prompt → receive job_id instantly (~200ms)",           color: "border-electric-400/50 text-electric-400" },
          { n: "2", label: "Worker picks up job",  desc: "Background worker claims the job, starts generation (30–120s)",    color: "border-amber-400/50 text-amber-400"   },
          { n: "3", label: "GET /api/v1/jobs/:id", desc: "Poll every 2 seconds — status moves from queued → processing",     color: "border-ocean-400/50 text-ocean-300"   },
          { n: "4", label: "status: completed",    desc: "image_url is ready. Wallet charged. Job done.",                    color: "border-aqua-400/50 text-aqua-400"     },
        ].map((step, i) => (
          <div key={step.n} className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0">
              <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${step.color}`}>
                {step.n}
              </span>
              {i < 3 && <span className="w-0.5 h-6 bg-ocean-600/40 my-1" />}
            </div>
            <div className="pt-1 pb-4">
              <p className="text-sm font-mono font-semibold text-ocean-100">{step.label}</p>
              <p className="text-xs text-ocean-400 mt-0.5">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <H3>Quick start</H3>
      <CodeBlock code={QUICKSTART} lang="bash" title="Full flow in 2 commands" />

      {/* ── Pricing ──────────────────────────────────────────── */}
      <H2 id="pricing">Pricing &amp; wallet</H2>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-electric-400/30 bg-electric-400/5 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-sm font-bold text-white">1K Mode</span>
            <span className="text-electric-400 font-bold text-lg">$0.03</span>
          </div>
          <p className="text-xs text-ocean-300 font-mono mb-1">1024 × 1024 px</p>
          <p className="text-xs text-ocean-400">Fast standard resolution. Currently available.</p>
          <span className="inline-block mt-2 text-[10px] px-1.5 py-0.5 rounded bg-electric-400/15 text-electric-400 border border-electric-400/30 font-bold">
            MOST POPULAR
          </span>
        </div>
        <div className="rounded-xl border border-ocean-600/30 bg-ocean-800/30 p-4 opacity-50">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-sm font-bold text-white/50">2K Mode</span>
            <span className="text-white/30 font-bold text-lg">$0.05</span>
          </div>
          <p className="text-xs text-ocean-500 font-mono mb-1">2048 × 2048 px</p>
          <p className="text-xs text-ocean-500">High-resolution output.</p>
          <span className="inline-block mt-2 text-[10px] px-1.5 py-0.5 rounded bg-ocean-700/50 text-ocean-400 border border-ocean-600/30 font-bold">
            COMING SOON
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2 mb-6 text-sm text-ocean-200">
        {[
          "Minimum wallet load: $10. Only multiples of $10 accepted ($10, $20, $50, $100…).",
          "Charged only on successful completion — failed or moderated jobs are always free.",
          "Wallet balance never expires.",
          "Payments processed securely via Stripe.",
        ].map((rule) => (
          <div key={rule} className="flex items-start gap-2">
            <span className="text-electric-400 shrink-0">·</span>
            {rule}
          </div>
        ))}
      </div>

      {/* ── Generate ─────────────────────────────────────────── */}
      <H2 id="generate">POST — Generate image</H2>
      <Endpoint method="POST" path="https://www.sharkapi.dev/api/v1/image" />
      <P>
        Submit an image generation job. Returns <Code>202 Accepted</Code> with a{" "}
        <Code>job_id</Code> immediately. The job is processed asynchronously.
      </P>

      <H3>Request headers</H3>
      <ParamTable rows={[
        { name: "X-API-Key", type: "string", required: true,  desc: 'Your API key. Example: "sk_live_..."' },
        { name: "Content-Type",  type: "string", required: true,  desc: '"application/json"' },
      ]} />

      <H3>Request body</H3>
      <ParamTable rows={[
        { name: "prompt",    type: "string", required: true,  desc: "Text description of the image to generate. Maximum 2000 characters." },
        { name: "variant",   type: "string", required: false, desc: 'Resolution variant. Currently only "1k" (1024×1024) is available. Defaults to "1k" if omitted.' },
        { name: "image",     type: "string", required: false, desc: "Base64-encoded reference image for image-to-image. JPEG, PNG, or WebP. Max 10 MB. Cannot be combined with image_url." },
        { name: "image_url", type: "string", required: false, desc: "Publicly accessible URL of a reference image. Max 10 MB. Cannot be combined with image." },
      ]} />

      <Callout type="warning">
        <Code>image</Code> and <Code>image_url</Code> are mutually exclusive. Send one or
        the other — never both in the same request.
      </Callout>

      <H3>Response — 202 Accepted</H3>
      <ParamTable rows={[
        { name: "job_id",     type: "string", required: true, desc: "Unique job ID. Use this to poll for the result." },
        { name: "status",     type: "string", required: true, desc: 'Always "queued" on creation.' },
        { name: "poll_url",   type: "string", required: true, desc: "Relative URL to poll: GET {poll_url}" },
        { name: "price_usd",  type: "number", required: true, desc: "Cost of this job in USD. Charged only on success." },
        { name: "created_at", type: "string", required: true, desc: "ISO 8601 creation timestamp." },
      ]} />
      <CodeBlock code={GENERATE_RESPONSE} lang="json" color="text-aqua-300" title="202 Response" />

      <H3>Text-only cURL</H3>
      <CodeBlock code={GENERATE_CURL_TEXT} lang="bash" />

      {/* ── Image input ──────────────────────────────────────── */}
      <H2 id="image-input">Sending a reference image</H2>
      <P>
        To use image-to-image generation, attach a reference image using either base64
        or a URL. We mirror all inputs to our own storage before sending to the generation
        engine — your original file is never exposed externally.
      </P>

      <H3>Option A — Base64</H3>
      <P>
        Encode your file as base64 and pass it in the <Code>image</Code> field.
        Both raw base64 and the <Code>data:image/...;base64,</Code> prefix format are accepted.
      </P>
      <CodeBlock code={IMAGE_BASE64_CURL} lang="bash" title="Base64 input" />

      <H3>Option B — URL</H3>
      <P>
        Pass a publicly accessible URL in the <Code>image_url</Code> field. The URL must
        be reachable from our servers without authentication. For private images, use base64.
      </P>
      <CodeBlock code={IMAGE_URL_CURL} lang="bash" title="URL input" />

      {/* ── Poll ─────────────────────────────────────────────── */}
      <H2 id="poll">GET — Job status</H2>
      <Endpoint method="GET" path="https://www.sharkapi.dev/api/v1/jobs/:id" />
      <P>
        Poll this endpoint every 2 seconds. Replace <Code>:id</Code> with the{" "}
        <Code>job_id</Code> from the generate response. Returns <Code>200 OK</Code> with
        the current job state — check the <Code>status</Code> field to know if generation
        is done.
      </P>

      <H3>Request</H3>
      <ParamTable rows={[
        { name: "X-API-Key", type: "string", required: true, desc: 'Your API key. Example: "sk_live_..."' },
        { name: ":id (path)",    type: "string", required: true, desc: "The job_id from the POST response." },
      ]} />
      <CodeBlock code={POLL_CURL} lang="bash" title="Poll request" />

      <H3>Response fields</H3>
      <ParamTable rows={[
        { name: "job_id",       type: "string",        required: true, desc: "Job identifier." },
        { name: "status",       type: "string",        required: true, desc: '"queued" | "processing" | "completed" | "failed"' },
        { name: "image_url",    type: "string | null", required: true, desc: 'Permanent image URL. Set only when status is "completed".' },
        { name: "cost",         type: "string | null", required: true, desc: 'Final cost, e.g. "$0.03". Set only when status is "completed".' },
        { name: "error",        type: "string | null", required: true, desc: 'Error description when status is "failed". Null otherwise.' },
        { name: "queued_at",    type: "string",        required: true, desc: "ISO 8601 timestamp when job entered the queue." },
        { name: "started_at",   type: "string | null", required: true, desc: "ISO 8601 timestamp when the worker began. Null if still queued." },
        { name: "completed_at", type: "string | null", required: true, desc: "ISO 8601 timestamp of completion. Null if not finished." },
        { name: "created_at",   type: "string",        required: true, desc: "ISO 8601 timestamp of job creation." },
      ]} />

      <H3>While queued or processing</H3>
      <CodeBlock code={POLL_QUEUED} lang="json" color="text-ocean-300" />

      <H3>Completed — image ready</H3>
      <CodeBlock code={POLL_COMPLETED} lang="json" color="text-aqua-300" />

      <H3>Failed — no charge applied</H3>
      <CodeBlock code={POLL_FAILED} lang="json" color="text-coral-300" />

      {/* ── Job statuses ─────────────────────────────────────── */}
      <H2 id="job-statuses">Job statuses</H2>
      <div className="flex flex-col gap-2 mb-6">
        {[
          { status: "queued",     color: "bg-ocean-400/15 text-ocean-200 border-ocean-400/30",  desc: "Job received and waiting for the generation worker to pick it up." },
          { status: "processing", color: "bg-amber-400/15 text-amber-400 border-amber-400/30",  desc: "Worker is actively generating the image. Typically 30–120 seconds." },
          { status: "completed",  color: "bg-aqua-400/15  text-aqua-400  border-aqua-400/30",   desc: "Done. image_url is a permanent URL. Wallet has been charged." },
          { status: "failed",     color: "bg-coral-400/15 text-coral-400 border-coral-400/30",  desc: "Generation failed (timeout or provider error). No charge. Safe to retry." },
        ].map((s) => (
          <div key={s.status} className="flex items-start gap-3 p-3 rounded-xl border border-ocean-500/20 bg-ocean-800/20">
            <span className={`text-xs font-mono font-bold px-2 py-1 rounded border shrink-0 ${s.color}`}>
              {s.status}
            </span>
            <p className="text-sm text-ocean-200">{s.desc}</p>
          </div>
        ))}
      </div>
      <Callout type="info">
        Poll every <strong>2 seconds</strong>. Set a client-side timeout of 3 minutes —
        if a job is still not <Code>completed</Code> after that, it will be automatically
        marked <Code>failed</Code> with no charge.
      </Callout>

      {/* ── Errors ───────────────────────────────────────────── */}
      <H2 id="errors">Errors</H2>
      <P>
        All error responses are JSON with an <Code>error</Code> string field. Some errors
        also include a <Code>code</Code> field for programmatic handling.
      </P>
      <CodeBlock code={ERROR_RESPONSE} lang="json" color="text-coral-300" title="Error response format" />

      <div className="flex flex-col gap-2 mb-6">
        {[
          { status: "400", color: "text-coral-400",   desc: "Bad request — missing or invalid body fields (e.g. no prompt, both image and image_url sent, image too large)." },
          { status: "401", color: "text-coral-400",   desc: "Unauthorized — X-API-Key header is missing or the key is invalid." },
          { status: "402", color: "text-amber-400",   desc: "Payment required — wallet balance is below the cost of this request. Top up your account and retry." },
          { status: "403", color: "text-coral-400",   desc: "Forbidden — API key has been revoked or account is suspended." },
          { status: "404", color: "text-ocean-300",   desc: "Not found — job ID does not exist or belongs to a different account." },
          { status: "422", color: "text-amber-400",   desc: "Unprocessable — no active model for the requested variant. Only \"1k\" is currently available." },
          { status: "500", color: "text-coral-400",   desc: "Server error — unexpected failure. Retry after a few seconds. Your wallet is not charged." },
        ].map((e) => (
          <div key={e.status} className="flex items-start gap-3 p-3 rounded-xl border border-ocean-500/20 bg-ocean-800/20">
            <span className={`text-xs font-mono font-bold px-2 py-1 rounded border shrink-0 bg-ocean-800 border-ocean-600/40 ${e.color}`}>
              {e.status}
            </span>
            <p className="text-sm text-ocean-200">{e.desc}</p>
          </div>
        ))}
      </div>

      <Callout type="info">
        Retry <strong>500</strong> errors with exponential backoff (wait 2s, then 4s, then 8s).
        For <strong>400/401/403/422</strong> errors, fix the request before retrying.
        For <strong>402</strong>, top up your wallet first.
      </Callout>

      {/* ── Full examples ────────────────────────────────────── */}
      <H2 id="examples">Full examples</H2>
      <P>
        Each example below implements the complete flow: submit a job, poll until done,
        print the image URL.
      </P>

      <H3>JavaScript / Node.js</H3>
      <CodeBlock code={FULL_JS} lang="javascript" color="text-amber-300" />

      <H3>Python</H3>
      <CodeBlock code={FULL_PYTHON} lang="python" color="text-electric-300" />

      <H3>Shell (bash / cURL)</H3>
      <CodeBlock code={FULL_CURL} lang="bash" />

      {/* ── Coming soon ──────────────────────────────────────── */}
      <H2 id="coming-soon">Coming soon</H2>
      <div className="rounded-xl border border-ocean-600/30 bg-ocean-800/30 p-5 flex items-start gap-4">
        <div className="w-9 h-9 rounded-lg bg-ocean-700/50 border border-ocean-600/30 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-ocean-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-white mb-1">2K Mode — 2048×2048 px at $0.05/image</p>
          <p className="text-sm text-ocean-300">
            High-resolution output for print, detailed renders, and premium applications.
            When 2K launches, you will be able to pass <Code>{"variant: \"2k\""}</Code> and
            the API behaviour stays identical — just poll the same way.
            No integration changes needed on your side.
          </p>
        </div>
      </div>
          </main>

          {/* Right "On this page" */}
          <aside className="hidden xl:block w-56 shrink-0 py-10 pr-6">
            <div className="sticky top-24">
              <p className="text-[11px] font-semibold text-ocean-300 uppercase tracking-wider mb-3">
                On this page
              </p>
              <ul className="flex flex-col gap-1.5">
                {ON_THIS_PAGE.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-xs text-ocean-400 hover:text-electric-400 transition-colors duration-150"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}
