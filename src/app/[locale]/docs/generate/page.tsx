import type { Metadata } from "next";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { H1, H2, H3, P, Lead, CodeBlock, Callout, Endpoint, ParamTable, Code } from "@/components/docs/DocsComponents";
import { GlowLine } from "@/components/effects/WaveDivider";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Generate Image" };

const ON_THIS_PAGE = [
  { id: "overview",   label: "Overview" },
  { id: "request",    label: "Request" },
  { id: "response",   label: "Response" },
  { id: "modes",      label: "Modes" },
  { id: "image-input","label": "Image input" },
  { id: "examples",   label: "Examples" },
  { id: "errors",     label: "Errors" },
];

const REQUEST_PARAMS = [
  { name: "prompt",         type: "string",  required: true,  desc: "Text description of the image to generate. Max 2000 characters." },
  { name: "mode",           type: "string",  required: true,  desc: 'Generation mode. Must be "1k" (1024×1024) or "2k" (2048×2048).' },
  { name: "image",          type: "string",  required: false, desc: "Base64-encoded source image for image-to-image generation. JPEG or PNG, max 10MB." },
  { name: "image_strength", type: "number",  required: false, desc: "How strongly the source image influences the output. Range 0.0–1.0. Default: 0.5." },
];

const RESPONSE_FIELDS = [
  { name: "job_id",         type: "string", required: true,  desc: "Unique identifier for this job. Use with GET /v1/jobs/:id to poll status." },
  { name: "status",         type: "string", required: true,  desc: 'Initial job status. Always "queued" on creation.' },
  { name: "estimated_cost", type: "string", required: true,  desc: "Estimated cost of this job (e.g. \"$0.30\"). Final cost confirmed on completion." },
  { name: "poll_url",       type: "string", required: true,  desc: "Convenience URL for polling this job's status." },
  { name: "created_at",     type: "string", required: true,  desc: "ISO 8601 timestamp of job creation." },
];

const TEXT_ONLY_CURL = `curl -X POST https://api.sharkapi.dev/v1/generate \\
  -H "Authorization: Bearer sk_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "mode": "2k",
    "prompt": "A great white shark swimming through bioluminescent waters, cinematic, 8K"
  }'`;

const IMAGE_INPUT_CURL = `curl -X POST https://api.sharkapi.dev/v1/generate \\
  -H "Authorization: Bearer sk_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "mode": "2k",
    "prompt": "Transform into a watercolor painting",
    "image": "'"$(base64 -w 0 ./input.jpg)"'",
    "image_strength": 0.6
  }'`;

const RESPONSE_EXAMPLE = `{
  "job_id":         "job_8f2a9d3c",
  "status":         "queued",
  "estimated_cost": "$0.02",
  "poll_url":       "https://api.sharkapi.dev/v1/jobs/job_8f2a9d3c",
  "created_at":     "2024-01-15T10:23:44Z"
}`;

const JS_EXAMPLE = `async function generateImage(prompt, mode = "2k") {
  const res = await fetch("https://api.sharkapi.dev/v1/generate", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${process.env.SHARKAPI_TOKEN}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, mode }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error.message);
  }

  const { job_id } = await res.json();
  return job_id;
}`;

export default function GenerateDocsPage() {
  return (
    <DocsLayout onThisPage={ON_THIS_PAGE}>
      <Badge variant="info" className="mb-4">Endpoints</Badge>
      <H1>POST — Generate Image</H1>
      <Lead>
        Submit an image generation job. Returns a <Code>job_id</Code> immediately — poll
        the Job Status endpoint until complete.
      </Lead>
      <GlowLine className="mb-8" />

      <H2 id="overview">Overview</H2>
      <Endpoint method="POST" path="https://api.sharkapi.dev/v1/generate" />
      <P>
        This endpoint is fully async. It does not wait for image generation to complete.
        Instead, it returns a <Code>job_id</Code> that you use to poll for the result every 2 seconds.
      </P>
      <Callout type="info">
        Your wallet is only charged once a job reaches <Code>status: "complete"</Code> and an{" "}
        <Code>image_url</Code> is returned. Failed or moderated jobs are never charged.
      </Callout>

      <H2 id="request">Request</H2>
      <H3>Headers</H3>
      <ParamTable rows={[
        { name: "Authorization", type: "string", required: true, desc: 'Bearer token. Format: "Bearer sk_live_..."' },
        { name: "Content-Type",  type: "string", required: true, desc: '"application/json"' },
      ]} />

      <H3>Body parameters</H3>
      <ParamTable rows={REQUEST_PARAMS} />

      <H2 id="response">Response</H2>
      <P>HTTP <Code>202 Accepted</Code> on success.</P>
      <ParamTable rows={RESPONSE_FIELDS} />
      <CodeBlock code={RESPONSE_EXAMPLE} lang="json" title="Response" color="text-aqua-300" />

      <H2 id="modes">Modes</H2>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {[
          { key: "1k", res: "1024 × 1024", price: "$0.01", desc: "Fast standard resolution. Great for prototyping and high-volume use." },
          { key: "2k", res: "2048 × 2048", price: "$0.02", desc: "High-resolution output. Ideal for print and detail-critical applications." },
        ].map((m) => (
          <div key={m.key} className="rounded-xl border border-ocean-500/30 bg-ocean-800/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-bold text-ocean-100">mode: "{m.key}"</span>
              <span className="text-electric-400 font-bold text-sm">{m.price}</span>
            </div>
            <p className="text-xs text-ocean-300 mb-1 font-mono">{m.res}</p>
            <p className="text-xs text-ocean-400">{m.desc}</p>
          </div>
        ))}
      </div>

      <H2 id="image-input">Image input (img2img)</H2>
      <P>
        Pass a Base64-encoded image in the <Code>image</Code> field to guide generation using a
        reference image. Supported formats: JPEG, PNG. Maximum size: 10MB.
      </P>
      <P>
        The <Code>image_strength</Code> parameter (0.0–1.0) controls how much the source image
        influences the output. Higher values preserve more of the original image.
      </P>
      <CodeBlock code={IMAGE_INPUT_CURL} lang="bash" title="Image-to-image request" />

      <H2 id="examples">Examples</H2>
      <H3>Text-only (cURL)</H3>
      <CodeBlock code={TEXT_ONLY_CURL} lang="bash" />
      <H3>JavaScript / Node.js</H3>
      <CodeBlock code={JS_EXAMPLE} lang="javascript" color="text-amber-300" />

      <H2 id="errors">Errors</H2>
      <ParamTable rows={[
        { name: "400 Bad Request",           type: "HTTP", desc: "Invalid or missing request body fields." },
        { name: "402 Payment Required",      type: "HTTP", desc: "Insufficient wallet balance. Top up before retrying." },
        { name: "403 Forbidden",             type: "HTTP", desc: "Token is revoked or account is suspended." },
        { name: "422 Unprocessable Entity",  type: "HTTP", desc: "Prompt or image failed content moderation check." },
        { name: "429 Too Many Requests",     type: "HTTP", desc: "Rate limit exceeded. Slow down your requests." },
        { name: "503 Service Unavailable",   type: "HTTP", desc: "Generation service is temporarily unavailable. Retry after 30 seconds." },
      ]} />
    </DocsLayout>
  );
}
