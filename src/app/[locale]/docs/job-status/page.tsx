import type { Metadata } from "next";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { H1, H2, H3, P, Lead, CodeBlock, Callout, Endpoint, ParamTable, Code } from "@/components/docs/DocsComponents";
import { GlowLine } from "@/components/effects/WaveDivider";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Job Status — SharkAPI Docs" };

const ON_THIS_PAGE = [
  { id: "overview",  label: "Overview" },
  { id: "request",   label: "Request" },
  { id: "response",  label: "Response" },
  { id: "statuses",  label: "Job statuses" },
  { id: "polling",   label: "Polling pattern" },
  { id: "errors",    label: "Errors" },
];

const RESPONSE_FIELDS = [
  { name: "job_id",       type: "string",       required: true, desc: "Unique job identifier." },
  { name: "status",       type: "string",       required: true, desc: '"queued" | "processing" | "completed" | "failed"' },
  { name: "image_url",    type: "string | null", required: true, desc: 'Permanent URL of the generated image. Present only when status is "completed".' },
  { name: "cost",         type: "string | null", required: true, desc: 'Final cost, e.g. "$0.03". Set only when status is "completed".' },
  { name: "error",        type: "string | null", required: true, desc: 'Error message when status is "failed". Null otherwise.' },
  { name: "queued_at",    type: "string",       required: true, desc: "ISO 8601 timestamp when the job entered the queue." },
  { name: "started_at",   type: "string | null", required: true, desc: "ISO 8601 timestamp when the worker began processing. Null if still queued." },
  { name: "completed_at", type: "string | null", required: true, desc: "ISO 8601 timestamp of completion. Null if not yet finished." },
  { name: "created_at",   type: "string",       required: true, desc: "ISO 8601 timestamp of job creation." },
];

const COMPLETE_RESPONSE = `{
  "job_id":       "3a8f2c1d-7b4e-4f9a-b2d6-1c5e8f3a9b7d",
  "status":       "completed",
  "image_url":    "https://your-project.supabase.co/storage/v1/object/public/generated-images/...",
  "cost":         "$0.03",
  "error":        null,
  "queued_at":    "2025-01-15T10:23:44Z",
  "started_at":   "2025-01-15T10:23:46Z",
  "completed_at": "2025-01-15T10:24:18Z",
  "created_at":   "2025-01-15T10:23:44Z"
}`;

const FAILED_RESPONSE = `{
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

const QUEUED_RESPONSE = `{
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

const POLLING_JS = `async function waitForJob(jobId) {
  const url     = \`https://www.sharkapi.dev/api/v1/jobs/\${jobId}\`;
  const headers = { "Authorization": \`Bearer \${process.env.SHARKAPI_KEY}\` };

  while (true) {
    const res = await fetch(url, { headers });

    if (!res.ok) throw new Error(\`Poll failed: HTTP \${res.status}\`);

    const job = await res.json();

    if (job.status === "completed") {
      return job; // job.image_url is ready
    }

    if (job.status === "failed") {
      throw new Error(job.error ?? "Job failed — no charge applied");
    }

    // "queued" or "processing" — keep waiting
    await new Promise(r => setTimeout(r, 2000));
  }
}

// Full flow
const { job_id } = await generateImage("A shark in neon waters");
const job        = await waitForJob(job_id);

console.log(job.image_url); // permanent URL, ready to use
console.log(job.cost);      // "$0.03"`;

const POLLING_PYTHON = `import time, httpx

def wait_for_job(job_id: str) -> dict:
    url     = f"https://www.sharkapi.dev/api/v1/jobs/{job_id}"
    headers = {"Authorization": f"Bearer {SHARKAPI_KEY}"}

    while True:
        res = httpx.get(url, headers=headers, timeout=10)
        res.raise_for_status()
        job = res.json()

        if job["status"] == "completed":
            return job  # job["image_url"] is ready

        if job["status"] == "failed":
            raise RuntimeError(job.get("error") or "Job failed — no charge applied")

        # "queued" or "processing" — keep waiting
        time.sleep(2)

# Full flow
job_id = generate_image("A shark in neon waters")["job_id"]
job    = wait_for_job(job_id)

print(job["image_url"])  # permanent URL
print(job["cost"])       # "$0.03"`;

const CURL_POLL = `curl https://www.sharkapi.dev/api/v1/jobs/3a8f2c1d-7b4e-4f9a-b2d6-1c5e8f3a9b7d \\
  -H "Authorization: Bearer sk_live_••••••••"`;

export default function JobStatusDocsPage() {
  return (
    <DocsLayout onThisPage={ON_THIS_PAGE}>
      <Badge variant="info" className="mb-4">Endpoints</Badge>
      <H1>GET — Job Status</H1>
      <Lead>
        Poll this endpoint every 2 seconds after submitting a generation job.
        When <Code>status</Code> reaches <Code>"completed"</Code>, the{" "}
        <Code>image_url</Code> field contains a permanent URL to your generated image.
      </Lead>
      <GlowLine className="mb-8" />

      {/* ── Overview ── */}
      <H2 id="overview">Overview</H2>
      <Endpoint method="GET" path="https://www.sharkapi.dev/api/v1/jobs/:id" />
      <P>
        Replace <Code>:id</Code> with the <Code>job_id</Code> returned from{" "}
        <Code>POST /api/v1/image</Code>. Generation typically takes{" "}
        <strong>30 – 120 seconds</strong> — poll until the status is terminal.
      </P>
      <Callout type="info">
        A <Code>200 OK</Code> response means the poll succeeded, not that generation
        is complete. Always check the <Code>status</Code> field.
      </Callout>

      {/* ── Request ── */}
      <H2 id="request">Request</H2>
      <ParamTable rows={[
        { name: "Authorization", type: "string", required: true, desc: 'Your API key. Format: "Bearer sk_live_..."' },
        { name: ":id",           type: "string", required: true, desc: "Job ID from the POST /api/v1/image response." },
      ]} />
      <H3>cURL example</H3>
      <CodeBlock code={CURL_POLL} lang="bash" />

      {/* ── Response ── */}
      <H2 id="response">Response</H2>
      <P>HTTP <Code>200 OK</Code>. Check <Code>status</Code> to know if generation is done.</P>
      <ParamTable rows={RESPONSE_FIELDS} />

      <H3>While queued or processing</H3>
      <CodeBlock code={QUEUED_RESPONSE} lang="json" color="text-ocean-300" />

      <H3>Completed — image ready</H3>
      <CodeBlock code={COMPLETE_RESPONSE} lang="json" color="text-aqua-300" />

      <H3>Failed — no charge</H3>
      <CodeBlock code={FAILED_RESPONSE} lang="json" color="text-coral-300" />

      {/* ── Statuses ── */}
      <H2 id="statuses">Job statuses</H2>
      <div className="flex flex-col gap-2 mb-6">
        {[
          { status: "queued",     color: "bg-ocean-400/15 text-ocean-200 border-ocean-400/30",   desc: "Job received and waiting for a worker to pick it up." },
          { status: "processing", color: "bg-amber-400/15 text-amber-400 border-amber-400/30",   desc: "Worker is actively generating your image. Usually 30–120 seconds." },
          { status: "completed",  color: "bg-aqua-400/15  text-aqua-400  border-aqua-400/30",    desc: "Done. image_url is set and your wallet has been charged." },
          { status: "failed",     color: "bg-coral-400/15 text-coral-400 border-coral-400/30",   desc: "Generation failed (timeout or provider error). No charge applied. Safe to retry." },
        ].map((s) => (
          <div key={s.status} className="flex items-start gap-3 p-3 rounded-xl border border-ocean-500/20 bg-ocean-800/20">
            <span className={`text-xs font-mono font-bold px-2 py-1 rounded border shrink-0 ${s.color}`}>
              {s.status}
            </span>
            <p className="text-sm text-ocean-200">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Polling pattern ── */}
      <H2 id="polling">Polling pattern</H2>
      <P>
        Poll every 2 seconds. Handle all terminal states. Do not poll more
        frequently — there is no benefit and it wastes your bandwidth.
      </P>
      <Callout type="warning">
        Set a client-side timeout of ~3 minutes. If a job is still not{" "}
        <Code>completed</Code> after 3 minutes, something went wrong on our end —
        the job will be marked <Code>failed</Code> automatically with no charge.
      </Callout>

      <H3>JavaScript / Node.js</H3>
      <CodeBlock code={POLLING_JS} lang="javascript" color="text-amber-300" />

      <H3>Python</H3>
      <CodeBlock code={POLLING_PYTHON} lang="python" color="text-electric-300" />

      {/* ── Errors ── */}
      <H2 id="errors">Errors</H2>
      <ParamTable rows={[
        { name: "401 Unauthorized", type: "HTTP", desc: "Missing or invalid API key." },
        { name: "404 Not Found",    type: "HTTP", desc: "Job ID does not exist or belongs to a different account." },
      ]} />
    </DocsLayout>
  );
}
