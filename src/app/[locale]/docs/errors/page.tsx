import type { Metadata } from "next";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { H1, H2, P, Lead, CodeBlock, Callout, Code, ErrorTable } from "@/components/docs/DocsComponents";
import { GlowLine } from "@/components/effects/WaveDivider";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Error Codes" };

const ON_THIS_PAGE = [
  { id: "format",   label: "Error format" },
  { id: "4xx",      label: "4xx Client errors" },
  { id: "5xx",      label: "5xx Server errors" },
  { id: "handling", label: "Error handling" },
];

const CLIENT_ERRORS = [
  { code: "INVALID_REQUEST",       status: 400, desc: "Malformed JSON body or missing required fields." },
  { code: "INVALID_MODE",          status: 400, desc: 'mode must be "1k" or "2k".' },
  { code: "PROMPT_TOO_LONG",       status: 400, desc: "Prompt exceeds 2000 character limit." },
  { code: "IMAGE_TOO_LARGE",       status: 400, desc: "Base64-encoded image exceeds 10MB limit." },
  { code: "INVALID_IMAGE_FORMAT",  status: 400, desc: "Image must be JPEG or PNG." },
  { code: "UNAUTHORIZED",          status: 401, desc: "Authorization header missing or malformed." },
  { code: "INVALID_TOKEN",         status: 401, desc: "Token does not exist or has been revoked." },
  { code: "ACCOUNT_SUSPENDED",     status: 403, desc: "Your account has been suspended. Contact support." },
  { code: "INSUFFICIENT_BALANCE",  status: 402, desc: "Wallet balance is below the cost of this request." },
  { code: "JOB_NOT_FOUND",         status: 404, desc: "Job ID does not exist or belongs to another account." },
  { code: "CONTENT_MODERATED",     status: 422, desc: "Prompt or image failed content moderation screening." },
  { code: "RATE_LIMIT_EXCEEDED",   status: 429, desc: "Too many requests. Wait before retrying." },
];

const SERVER_ERRORS = [
  { code: "GENERATION_TIMEOUT",    status: 503, desc: "Generation worker did not respond in time. Job marked failed. No charge." },
  { code: "STORAGE_ERROR",         status: 503, desc: "Image was generated but could not be saved to S3. No charge." },
  { code: "SERVICE_UNAVAILABLE",   status: 503, desc: "API is temporarily unavailable. Check status.sharkapi.dev." },
  { code: "INTERNAL_ERROR",        status: 500, desc: "Unexpected server error. If persistent, contact support with the job_id." },
];

const ERROR_FORMAT = `{
  "error": {
    "code":    "INSUFFICIENT_BALANCE",
    "message": "Your wallet balance ($0.01) is below the cost of this request ($0.02).",
    "status":  402
  }
}`;

const RETRY_JS = `async function apiRequest(url, options, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, options);

    if (res.ok) return res.json();

    const { error } = await res.json();

    // Don't retry client errors (except 429)
    if (res.status !== 429 && res.status < 500) {
      throw new Error(\`\${error.code}: \${error.message}\`);
    }

    // Retry with exponential backoff
    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error("Max retries exceeded");
}`;

export default function ErrorsDocsPage() {
  return (
    <DocsLayout onThisPage={ON_THIS_PAGE}>
      <Badge variant="info" className="mb-4">Reference</Badge>
      <H1>Error Codes</H1>
      <Lead>
        All API errors follow a consistent JSON structure. Use the <Code>code</Code> field to
        programmatically handle specific error cases.
      </Lead>
      <GlowLine className="mb-8" />

      <H2 id="format">Error format</H2>
      <P>Every error response includes an <Code>error</Code> object with three fields:</P>
      <CodeBlock code={ERROR_FORMAT} lang="json" color="text-coral-300" />
      <P>
        The HTTP status code on the response matches the <Code>status</Code> field in the body.
        Always check the <Code>code</Code> field — it's machine-readable and stable across API versions.
      </P>

      <H2 id="4xx">4xx — Client errors</H2>
      <P>These errors are caused by your request. Fix the issue before retrying (except 429).</P>
      <ErrorTable rows={CLIENT_ERRORS} />

      <Callout type="info">
        <Code>INSUFFICIENT_BALANCE</Code> (402) means your wallet is too low. Top up via the
        dashboard or{" "}
        <Code>POST /v1/wallet/topup</Code> before retrying.
      </Callout>

      <H2 id="5xx">5xx — Server errors</H2>
      <P>
        These are unexpected errors on our end. They are safe to retry. Your wallet is never
        charged for server-side failures.
      </P>
      <ErrorTable rows={SERVER_ERRORS} />

      <H2 id="handling">Error handling pattern</H2>
      <P>
        Retry <Code>429</Code> and <Code>5xx</Code> errors with exponential backoff.
        For client errors, fix the request before retrying.
      </P>
      <CodeBlock code={RETRY_JS} lang="javascript" color="text-amber-300" />

      <Callout type="success">
        Failed jobs (5xx at generation time) are automatically tracked in your request history
        and never deduct wallet balance.
      </Callout>
    </DocsLayout>
  );
}
