import type { Metadata } from "next";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { H1, H2, H3, P, Lead, CodeBlock, Callout, Endpoint, ParamTable, Code } from "@/components/docs/DocsComponents";
import { GlowLine } from "@/components/effects/WaveDivider";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Job Status" };

const ON_THIS_PAGE = [
  { id: "overview",  label: "Overview" },
  { id: "request",   label: "Request" },
  { id: "response",  label: "Response" },
  { id: "statuses",  label: "Job statuses" },
  { id: "polling",   label: "Polling pattern" },
  { id: "errors",    label: "Errors" },
];

const RESPONSE_FIELDS = [
  { name: "job_id",       type: "string",       required: true,  desc: "Unique job identifier." },
  { name: "status",       type: "string",       required: true,  desc: 'Current status: "queued" | "processing" | "complete" | "failed" | "moderated".' },
  { name: "image_url",    type: "string | null", required: true, desc: 'S3 URL of the generated image. Present only when status is "complete".' },
  { name: "mode",         type: "string",       required: true,  desc: '"1k" or "2k".' },
  { name: "prompt",       type: "string",       required: true,  desc: "The prompt used for this job." },
  { name: "cost",         type: "string | null", required: true, desc: 'Final cost (e.g. "$0.02"). Set only after status "complete". Null otherwise.' },
  { name: "error",        type: "string | null", required: true, desc: 'Error message if status is "failed". Null otherwise.' },
  { name: "created_at",   type: "string",       required: true,  desc: "ISO 8601 timestamp of job creation." },
  { name: "completed_at", type: "string | null", required: true, desc: "ISO 8601 timestamp of job completion. Null if not yet complete." },
];

const COMPLETE_RESPONSE = `{
  "job_id":       "job_8f2a9d3c",
  "status":       "complete",
  "image_url":    "https://cdn.sharkapi.dev/out/job_8f2a9d3c.jpg",
  "mode":         "2k",
  "prompt":       "A great white shark in bioluminescent waters",
  "cost":         "$0.02",
  "error":        null,
  "created_at":   "2024-01-15T10:23:44Z",
  "completed_at": "2024-01-15T10:23:59Z"
}`;

const FAILED_RESPONSE = `{
  "job_id":    "job_xyz789",
  "status":    "failed",
  "image_url": null,
  "cost":      null,
  "error":     "Generation service timeout. No charge applied.",
  "created_at":"2024-01-15T10:30:00Z",
  "completed_at": null
}`;

const POLLING_JS = `async function waitForJob(jobId, token) {
  const url     = \`https://api.sharkapi.dev/v1/jobs/\${jobId}\`;
  const headers = { "Authorization": \`Bearer \${token}\` };

  while (true) {
    const res = await fetch(url, { headers });
    const job = await res.json();

    switch (job.status) {
      case "complete":
        return job; // ← image_url is ready
      case "failed":
        throw new Error(job.error ?? "Job failed");
      case "moderated":
        throw new Error("Request blocked by content moderation");
      default:
        // queued or processing — keep polling
        await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// Usage
const job = await waitForJob("job_8f2a9d3c", process.env.SHARKAPI_TOKEN);
console.log(job.image_url); // "https://cdn.sharkapi.dev/..."`;

const POLLING_PYTHON = `import time, httpx

def wait_for_job(job_id: str, token: str) -> dict:
    url     = f"https://api.sharkapi.dev/v1/jobs/{job_id}"
    headers = {"Authorization": f"Bearer {token}"}

    while True:
        job = httpx.get(url, headers=headers).json()

        match job["status"]:
            case "complete":
                return job
            case "failed":
                raise RuntimeError(job.get("error", "Job failed"))
            case "moderated":
                raise RuntimeError("Blocked by content moderation")
            case _:
                time.sleep(2)`;

export default function JobStatusDocsPage() {
  return (
    <DocsLayout onThisPage={ON_THIS_PAGE}>
      <Badge variant="info" className="mb-4">Endpoints</Badge>
      <H1>GET — Job Status</H1>
      <Lead>
        Poll the status and retrieve the result of an image generation job.
        Call this every 2 seconds until <Code>status</Code> is <Code>"complete"</Code> or <Code>"failed"</Code>.
      </Lead>
      <GlowLine className="mb-8" />

      <H2 id="overview">Overview</H2>
      <Endpoint method="GET" path="https://api.sharkapi.dev/v1/jobs/:id" />
      <P>
        Replace <Code>:id</Code> with the <Code>job_id</Code> returned from POST /v1/generate.
      </P>
      <Callout type="info">
        Wallet deductions only occur when this endpoint returns <Code>status: "complete"</Code>{" "}
        with a valid <Code>image_url</Code>. Failed or moderated jobs are never charged.
      </Callout>

      <H2 id="request">Request</H2>
      <ParamTable rows={[
        { name: "Authorization", type: "string", required: true,  desc: 'Bearer token. Format: "Bearer sk_live_..."' },
        { name: ":id",           type: "string", required: true,  desc: "Job ID from the generation response (e.g. job_8f2a9d3c)." },
      ]} />

      <H2 id="response">Response</H2>
      <P>HTTP <Code>200 OK</Code> regardless of job status (successful poll, not successful generation).</P>
      <ParamTable rows={RESPONSE_FIELDS} />

      <H3>Completed job</H3>
      <CodeBlock code={COMPLETE_RESPONSE} lang="json" color="text-aqua-300" />
      <H3>Failed job</H3>
      <CodeBlock code={FAILED_RESPONSE} lang="json" color="text-coral-300" />

      <H2 id="statuses">Job statuses</H2>
      <div className="flex flex-col gap-2 mb-6">
        {[
          { status: "queued",     color: "bg-ocean-400/15   text-ocean-200   border-ocean-400/30",   desc: "Job received, waiting to be picked up by the generation worker." },
          { status: "processing", color: "bg-amber-400/15   text-amber-400   border-amber-400/30",   desc: "Generation actively in progress." },
          { status: "complete",   color: "bg-aqua-400/15    text-aqua-400    border-aqua-400/30",    desc: "Done. image_url is set. Wallet has been charged." },
          { status: "failed",     color: "bg-coral-400/15   text-coral-400   border-coral-400/30",   desc: "Generation failed (timeout, server error). No charge applied." },
          { status: "moderated",  color: "bg-amber-400/15   text-amber-400   border-amber-400/30",   desc: "Prompt or image was blocked by content moderation. No charge applied." },
        ].map((s) => (
          <div key={s.status} className="flex items-start gap-3 p-3 rounded-xl border border-ocean-500/20 bg-ocean-800/20">
            <span className={`text-xs font-mono font-bold px-2 py-1 rounded border shrink-0 ${s.color}`}>
              {s.status}
            </span>
            <p className="text-sm text-ocean-200">{s.desc}</p>
          </div>
        ))}
      </div>

      <H2 id="polling">Polling pattern</H2>
      <P>Poll every 2 seconds. Handle all terminal states (complete, failed, moderated).</P>
      <H3>JavaScript / Node.js</H3>
      <CodeBlock code={POLLING_JS} lang="javascript" color="text-amber-300" />
      <H3>Python</H3>
      <CodeBlock code={POLLING_PYTHON} lang="python" color="text-electric-300" />

      <H2 id="errors">Errors</H2>
      <ParamTable rows={[
        { name: "404 Not Found",   type: "HTTP", desc: "Job ID does not exist or does not belong to your account." },
        { name: "401 Unauthorized",type: "HTTP", desc: "Missing or invalid token." },
      ]} />
    </DocsLayout>
  );
}
