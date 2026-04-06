import type { Metadata } from "next";
import { LegalLayout, LSection, LP, LList } from "@/components/layout/LegalLayout";

export const metadata: Metadata = {
  title: "Acceptable Use Policy",
  description: "SharkApi.dev Acceptable Use Policy for the image generation API.",
};

const TOC = [
  { id: "overview",    label: "1. Overview" },
  { id: "prohibited",  label: "2. Prohibited Content" },
  { id: "activities",  label: "3. Prohibited Activities" },
  { id: "age",         label: "4. Age Restrictions" },
  { id: "enforcement", label: "5. Enforcement" },
  { id: "reporting",   label: "6. Reporting Violations" },
];

export default function AupPage() {
  return (
    <LegalLayout
      title="Acceptable Use Policy"
      subtitle="Rules governing what content may be generated using the SharkApi.dev API."
      lastUpdated="January 15, 2025"
      toc={TOC}
    >
      <LSection id="overview" title="1. Overview">
        <LP>
          This Acceptable Use Policy ("AUP") governs all use of the SharkApi.dev image generation
          API. It applies to all users, regardless of account type or pricing plan.
        </LP>
        <LP>
          By using the Service, you agree to abide by this AUP. Violations may result in immediate
          account termination, wallet forfeiture, and — where legally required — reporting to
          law enforcement authorities.
        </LP>
        <LP>
          This AUP is incorporated by reference into the SharkApi.dev Terms of Service.
        </LP>
      </LSection>

      <LSection id="prohibited" title="2. Prohibited Content">
        <LP>
          The following categories of content are strictly prohibited. Attempting to generate
          prohibited content — even if the attempt is blocked by our moderation system — is
          a violation of this AUP.
        </LP>

        {/* Zero tolerance */}
        <div className="rounded-xl border border-coral-400/40 bg-coral-400/5 p-5 mb-4">
          <p className="text-xs font-bold text-coral-400 uppercase tracking-wide mb-3">
            ⛔ Zero-tolerance violations — immediate termination & law enforcement referral
          </p>
          <LList items={[
            "Child Sexual Abuse Material (CSAM): any content depicting, simulating, or implying sexual activity involving persons under 18.",
            "Non-consensual intimate imagery (NCII / deepfake pornography) of real individuals.",
            "Content designed to facilitate or incite acts of terrorism, genocide, or mass violence.",
            "Content constituting a specific, credible threat against an identified individual.",
          ]} />
        </div>

        {/* Strictly prohibited */}
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-5 mb-4">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-3">
            ⚠ Strictly prohibited — account suspension
          </p>
          <LList items={[
            "Realistic deepfakes of living public figures without their consent, particularly for political disinformation.",
            "Content designed to harass, intimidate, or stalk a specific individual.",
            "Content that glorifies or celebrates violence, torture, or human suffering.",
            "Non-consensual intimate imagery of private individuals.",
            "Content that violates applicable local, national, or international law.",
          ]} />
        </div>

        {/* Restricted */}
        <div className="rounded-xl border border-ocean-400/30 bg-ocean-800/20 p-5">
          <p className="text-xs font-bold text-ocean-300 uppercase tracking-wide mb-3">
            ℹ Restricted — requires explicit account approval
          </p>
          <LList items={[
            "Adult/sexually explicit content (contact us for adult content API access — separate review required).",
            "Graphic violence in commercial or editorial contexts.",
          ]} />
        </div>
      </LSection>

      <LSection id="activities" title="3. Prohibited Activities">
        <LP>In addition to prohibited content, the following activities are not permitted:</LP>
        <LList items={[
          "Attempting to circumvent our content moderation systems through prompt injection, encoding tricks, or other techniques.",
          "Using the API to train competing AI models or to build datasets without our written consent.",
          "Reselling API access or sharing API tokens with unauthorized third parties.",
          "Automated mass generation of content designed to flood, spam, or manipulate platforms.",
          "Using the API to generate content that infringes the copyright, trademark, or other IP rights of third parties at scale.",
          "Generating content that impersonates or defames specific individuals in a damaging way.",
          "Any use that violates applicable data protection or privacy laws.",
          "Systematic abuse of the free trial system through account creation at scale.",
        ]} />
      </LSection>

      <LSection id="age" title="4. Age Restrictions">
        <LP>
          The Service is available only to users who are 18 years of age or older. Users may not
          use the Service to generate content involving minors in any sexual or exploitative context.
          This is a zero-tolerance policy.
        </LP>
        <LP>
          Users who generate, attempt to generate, or distribute CSAM will be immediately and
          permanently banned, and their information will be reported to the National Center for
          Missing and Exploited Children (NCMEC) and relevant law enforcement agencies.
        </LP>
      </LSection>

      <LSection id="enforcement" title="5. Enforcement">
        <LP>We enforce this AUP through:</LP>
        <LList items={[
          "Automated real-time moderation of all prompts and generated images",
          "Manual review of flagged accounts and requests",
          "Rate limiting and anomaly detection for abuse patterns",
          "Permanent account termination for serious violations",
          "Legal action where warranted",
          "Cooperation with law enforcement investigations",
        ]} />
        <LP>
          We reserve the right to terminate any account at any time for any violation of this AUP,
          with or without prior notice, and without obligation to refund remaining wallet balance.
        </LP>
      </LSection>

      <LSection id="reporting" title="6. Reporting Violations">
        <LP>
          If you encounter content or behavior that violates this AUP, please report it immediately:
        </LP>
        <LList items={[
          "Abuse reports: abuse@sharkapi.dev",
          "CSAM reports: csam@sharkapi.dev (we respond immediately and report to NCMEC)",
          "Law enforcement requests: legal@sharkapi.dev",
        ]} />
        <LP>
          We treat all reports seriously and investigate them promptly. Reporters may remain
          anonymous unless law enforcement involvement requires otherwise.
        </LP>
      </LSection>
    </LegalLayout>
  );
}
