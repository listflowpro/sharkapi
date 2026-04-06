import type { Metadata } from "next";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { H1, H2, H3, P, Lead, Callout, Code } from "@/components/docs/DocsComponents";
import { GlowLine } from "@/components/effects/WaveDivider";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Moderation" };

const ON_THIS_PAGE = [
  { id: "overview",    label: "Overview" },
  { id: "prohibited",  label: "Prohibited content" },
  { id: "screening",   label: "Screening process" },
  { id: "response",    label: "Moderation response" },
  { id: "appeals",     label: "Appeals" },
];

const PROHIBITED = [
  {
    title: "Child Sexual Abuse Material (CSAM)",
    desc: "Any content depicting or implying sexual activity involving minors. This is illegal and will result in immediate account termination and law enforcement reporting.",
    severity: "danger",
  },
  {
    title: "Non-consensual intimate imagery",
    desc: "Deepfakes or synthetic intimate imagery of real individuals without their consent.",
    severity: "danger",
  },
  {
    title: "Incitement to violence or terrorism",
    desc: "Content that promotes, glorifies, or instructs on acts of violence, terrorism, or mass harm.",
    severity: "danger",
  },
  {
    title: "Targeted harassment",
    desc: "Content designed to harass, intimidate, or harm specific individuals.",
    severity: "warning",
  },
  {
    title: "Deceptive political content",
    desc: "Realistic deepfakes of public figures designed to spread disinformation.",
    severity: "warning",
  },
  {
    title: "Copyright infringement at scale",
    desc: "Systematic reproduction of copyrighted artwork or brand assets without authorization.",
    severity: "warning",
  },
];

export default function ModerationDocsPage() {
  return (
    <DocsLayout onThisPage={ON_THIS_PAGE}>
      <Badge variant="warning" className="mb-4">Reference</Badge>
      <H1>Moderation Policy</H1>
      <Lead>
        SharkApi.dev operates an automated content moderation system that screens all prompts
        and input images before generation begins. Prohibited content is blocked immediately and
        no charge is applied.
      </Lead>
      <GlowLine className="mb-8" />

      <H2 id="overview">Overview</H2>
      <P>
        Our moderation system reviews every generation request in real time. Requests that violate
        our{" "}
        <span className="text-electric-400">Acceptable Use Policy</span> are rejected before
        they reach the generation pipeline — protecting both users and the platform.
      </P>
      <Callout type="success">
        Moderated requests (<Code>status: "moderated"</Code>) are never charged to your wallet.
      </Callout>

      <H2 id="prohibited">Prohibited content</H2>
      <P>
        The following categories of content are strictly prohibited. Violations may result in
        account suspension or termination in addition to the request being rejected.
      </P>
      {PROHIBITED.map((item) => (
        <div
          key={item.title}
          className={`rounded-xl border p-4 mb-3 ${
            item.severity === "danger"
              ? "border-coral-400/30 bg-coral-400/5"
              : "border-amber-400/25 bg-amber-400/5"
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-xs font-bold ${item.severity === "danger" ? "text-coral-400" : "text-amber-400"}`}>
              {item.severity === "danger" ? "⛔ ZERO TOLERANCE" : "⚠ PROHIBITED"}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-ocean-100 mb-1">{item.title}</h3>
          <p className="text-xs text-ocean-300 leading-relaxed">{item.desc}</p>
        </div>
      ))}

      <H2 id="screening">Screening process</H2>
      <H3>Prompt screening</H3>
      <P>
        All text prompts are analyzed by our moderation classifier before the job enters the
        generation queue. Prompts containing prohibited content are rejected with a{" "}
        <Code>422 CONTENT_MODERATED</Code> response.
      </P>
      <H3>Image screening</H3>
      <P>
        When an input image is provided, it is analyzed for prohibited visual content (e.g. CSAM,
        NCII) before the job is accepted. The generated output image is also screened before the
        URL is returned.
      </P>
      <Callout type="warning">
        Repeated attempts to submit prohibited content — even if automatically rejected — will
        trigger enhanced account review and may result in suspension.
      </Callout>

      <H2 id="response">Moderation API response</H2>
      <P>
        When a job is moderated, the job status endpoint returns{" "}
        <Code>status: "moderated"</Code>. No <Code>image_url</Code> is provided and no wallet
        charge is applied.
      </P>
      <div className="rounded-xl border border-amber-400/25 overflow-hidden mb-6">
        <pre className="px-5 py-4 text-xs font-mono text-amber-300 leading-relaxed bg-ocean-900/60">
{`{
  "job_id":    "job_xyz789",
  "status":    "moderated",
  "image_url": null,
  "cost":      null,
  "error":     "Request blocked: content policy violation"
}`}
        </pre>
      </div>

      <H2 id="appeals">Appeals & reporting</H2>
      <P>
        If you believe a request was incorrectly moderated, contact our support team with the{" "}
        <Code>job_id</Code>. We review moderation appeals within 2 business days.
      </P>
      <P>
        To report abuse or suspected policy violations by other users, email{" "}
        <span className="text-electric-400">abuse@sharkapi.dev</span>.
      </P>
      <Callout type="danger">
        Zero-tolerance violations (CSAM, terrorism content) are never eligible for appeal and
        are reported to law enforcement authorities.
      </Callout>
    </DocsLayout>
  );
}
