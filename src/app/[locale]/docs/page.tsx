import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { H1, H2, H3, P, Lead, CodeBlock, Callout, ParamTable, Code } from "@/components/docs/DocsComponents";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { GlowLine } from "@/components/effects/WaveDivider";

export const metadata: Metadata = {
  title: "Documentation",
  description: "SharkApi.dev API documentation. Quick start, authentication, and endpoint reference.",
};

const ON_THIS_PAGE = [
  { id: "quick-start",    label: "Quick Start" },
  { id: "authentication", label: "Authentication" },
  { id: "request-flow",   label: "Request Flow" },
  { id: "endpoints",      label: "Endpoints" },
  { id: "errors",         label: "Error Handling" },
];

const ENDPOINT_CARDS = [
  { method: "POST", path: "/v1/generate",      desc: "Submit an image generation job",            href: "generate" },
  { method: "GET",  path: "/v1/jobs/:id",       desc: "Poll the status and result of a job",       href: "job-status" },
  { method: "GET",  path: "/v1/wallet/balance", desc: "Retrieve current wallet balance",           href: "wallet" },
  { method: "GET",  path: "/v1/usage",          desc: "List historical requests and usage data",   href: "history" },
];

const METHOD_COLORS: Record<string, string> = {
  POST: "bg-electric-400/15 text-electric-400 border-electric-400/30",
  GET:  "bg-aqua-400/15    text-aqua-400    border-aqua-400/30",
};

const QUICK_START_CODE = `# 1. Create a job
curl -X POST https://api.sharkapi.dev/v1/generate \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"mode":"2k","prompt":"A shark swimming in neon-lit deep ocean"}'

# → { "job_id": "job_abc123", "status": "queued", "estimated_cost": "$0.02" }

# 2. Poll until complete (every 2 seconds)
curl https://api.sharkapi.dev/v1/jobs/job_abc123 \\
  -H "Authorization: Bearer YOUR_TOKEN"

# → { "status": "complete", "image_url": "https://cdn.sharkapi.dev/..." }`;

export default function DocsLanding() {
  const t      = useTranslations("docs.landing");

  return (
    <DocsLayout onThisPage={ON_THIS_PAGE}>
      {/* Header */}
      <Badge variant="info" className="mb-4">{t("badge")}</Badge>
      <H1>{t("title")}</H1>
      <Lead>{t("subtitle")}</Lead>
      <GlowLine className="mb-8" />

      {/* Quick Start */}
      <H2 id="quick-start">Quick Start</H2>
      <P>
        Get your first image generated in under 5 minutes. You'll need an account, an API token,
        and at least $10 in your wallet — or use your 3 free trial generations.
      </P>

      <H3>Step 1 — Get your API token</H3>
      <P>
        After registering, go to{" "}
        <Link href={`/dashboard/tokens`} className="text-electric-400 hover:underline">
          Dashboard → API Tokens
        </Link>{" "}
        and copy your token. Keep it secret — treat it like a password.
      </P>

      <H3>Step 2 — Send a request &amp; poll</H3>
      <CodeBlock code={QUICK_START_CODE} lang="bash" title="Quick start" />

      <Callout type="info">
        The API is <strong>fully async</strong>. You receive a <Code>job_id</Code> immediately and poll
        the job status endpoint until <Code>status === "complete"</Code>. Poll every 2 seconds.
      </Callout>

      {/* Authentication */}
      <H2 id="authentication">Authentication</H2>
      <P>
        All API requests must include a Bearer token in the{" "}
        <Code>Authorization</Code> header.
      </P>
      <CodeBlock
        code={`Authorization: Bearer sk_live_••••••••••••••••••`}
        lang="http"
        title="Request header"
        color="text-aqua-300"
      />
      <ParamTable rows={[
        { name: "Authorization", type: "string", required: true, desc: "Bearer token from your API Tokens page. Never expose this in client-side code." },
      ]} />
      <Callout type="warning">
        Never include API tokens in client-side JavaScript or public repositories.
        Always call the API from your server or backend.
      </Callout>

      {/* Request Flow */}
      <H2 id="request-flow">Request Flow</H2>
      <P>Every image generation follows the same async pattern:</P>
      <div className="flex flex-col gap-0 mb-6">
        {[
          { n: "1", label: "POST /v1/generate",      desc: "Submit job → receive job_id + estimated_cost",    color: "border-electric-400/40 text-electric-400" },
          { n: "2", label: "Check wallet",            desc: "If insufficient balance → 402 error returned",    color: "border-amber-400/40 text-amber-400" },
          { n: "3", label: "GET /v1/jobs/:id",        desc: "Poll every 2s → status: queued → processing",     color: "border-ocean-400/40 text-ocean-300" },
          { n: "4", label: "status: complete",        desc: "image_url returned, wallet deducted",              color: "border-aqua-400/40 text-aqua-400" },
        ].map((step, i) => (
          <div key={step.n} className="flex items-start gap-3">
            <div className={`flex flex-col items-center shrink-0`}>
              <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${step.color}`}>
                {step.n}
              </span>
              {i < 3 && <span className="w-0.5 h-6 bg-ocean-600/50 my-1" />}
            </div>
            <div className="pt-1 pb-4">
              <p className="text-sm font-mono text-ocean-100">{step.label}</p>
              <p className="text-xs text-ocean-400 mt-0.5">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Endpoints */}
      <H2 id="endpoints">Endpoints</H2>
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        {ENDPOINT_CARDS.map((ep) => (
          <Link key={ep.href} href={`/docs/${ep.href}`}>
            <Card variant="elevated" hover padding="md" className="h-full">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${METHOD_COLORS[ep.method]}`}>
                  {ep.method}
                </span>
                <span className="text-xs font-mono text-ocean-200 truncate">{ep.path}</span>
              </div>
              <p className="text-xs text-ocean-300">{ep.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Errors */}
      <H2 id="errors">Error Handling</H2>
      <P>
        All errors follow a consistent JSON format. Check the{" "}
        <Link href={`/docs/errors`} className="text-electric-400 hover:underline">
          Error Codes reference
        </Link>{" "}
        for the full list.
      </P>
      <CodeBlock
        code={`{
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Your wallet balance is too low to process this request.",
    "status": 402
  }
}`}
        lang="json"
        title="Error response"
        color="text-coral-300"
      />
    </DocsLayout>
  );
}
