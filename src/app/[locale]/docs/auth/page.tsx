import type { Metadata } from "next";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { H1, H2, H3, P, Lead, CodeBlock, Callout, ParamTable, Code, DocsDivider } from "@/components/docs/DocsComponents";
import { GlowLine } from "@/components/effects/WaveDivider";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Authentication" };

const ON_THIS_PAGE = [
  { id: "overview",     label: "Overview" },
  { id: "tokens",       label: "API Tokens" },
  { id: "usage",        label: "Using your token" },
  { id: "security",     label: "Security tips" },
  { id: "errors",       label: "Auth errors" },
];

export default function AuthDocsPage() {
  return (
    <DocsLayout onThisPage={ON_THIS_PAGE}>
      <Badge variant="info" className="mb-4">Authentication</Badge>
      <H1>Authentication</H1>
      <Lead>
        SharkApi.dev uses Bearer token authentication. Every API request must include a valid
        token in the Authorization header.
      </Lead>
      <GlowLine className="mb-8" />

      <H2 id="overview">Overview</H2>
      <P>
        API tokens are long-lived credentials tied to your account. You can create multiple tokens —
        one per project, environment, or team member. Revoking a token immediately invalidates all
        requests using it.
      </P>

      <H2 id="tokens">API Tokens</H2>
      <H3>Creating a token</H3>
      <P>
        Go to <strong>Dashboard → API Tokens</strong> and click <em>New Token</em>. Give it a
        descriptive name (e.g. <Code>production-app</Code> or <Code>staging-backend</Code>).
      </P>
      <Callout type="warning">
        The full token value is shown <strong>only once</strong> at creation time. Copy and store it
        securely immediately — you cannot retrieve it later.
      </Callout>

      <H3>Token states</H3>
      <ParamTable rows={[
        { name: "active",   type: "state", desc: "Token is valid and can authenticate API requests." },
        { name: "revoked",  type: "state", desc: "Token has been manually invalidated. All requests using it will fail." },
        { name: "unused",   type: "state", desc: "Token has never been used to make a request." },
      ]} />

      <H2 id="usage">Using your token</H2>
      <P>
        Include the token as a Bearer credential in the <Code>Authorization</Code> HTTP header on
        every request.
      </P>
      <CodeBlock
        lang="http"
        title="Authorization header"
        color="text-aqua-300"
        code={`Authorization: Bearer sk_live_your_token_here`}
      />
      <CodeBlock
        lang="bash"
        title="cURL example"
        code={`curl https://api.sharkapi.dev/v1/generate \\
  -H "Authorization: Bearer sk_live_your_token_here" \\
  -H "Content-Type: application/json" \\
  -d '{"mode":"1k","prompt":"Bioluminescent deep sea"}'`}
      />
      <CodeBlock
        lang="javascript"
        title="JavaScript / Node.js"
        color="text-amber-300"
        code={`const res = await fetch("https://api.sharkapi.dev/v1/generate", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${process.env.SHARKAPI_TOKEN}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ mode: "1k", prompt: "Bioluminescent deep sea" }),
});`}
      />

      <H2 id="security">Security tips</H2>
      <P>
        Treat your API token like a password. Follow these best practices:
      </P>
      <div className="flex flex-col gap-3 mb-6">
        {[
          "Store tokens in environment variables, never hardcode them in source files.",
          "Never expose tokens in client-side JavaScript or browser code.",
          "Create separate tokens per environment (dev, staging, production).",
          "Rotate tokens periodically and immediately if you suspect a leak.",
          "Revoke unused tokens to reduce your attack surface.",
        ].map((tip) => (
          <div key={tip} className="flex items-start gap-2.5 text-sm text-ocean-200">
            <span className="text-electric-400 shrink-0 mt-0.5">→</span>
            {tip}
          </div>
        ))}
      </div>
      <Callout type="danger">
        If a token is exposed publicly (e.g. pushed to a public GitHub repo), revoke it immediately
        from your dashboard and create a new one.
      </Callout>

      <H2 id="errors">Authentication errors</H2>
      <ParamTable rows={[
        { name: "401 Unauthorized",  type: "HTTP", desc: "Missing or malformed Authorization header." },
        { name: "403 Forbidden",     type: "HTTP", desc: "Token is valid but has been revoked or belongs to a suspended account." },
        { name: "429 Too Many",      type: "HTTP", desc: "Rate limit exceeded. Slow down your requests." },
      ]} />
    </DocsLayout>
  );
}
