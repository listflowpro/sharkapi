import type { Metadata } from "next";
import { LegalLayout, LSection, LP, LList } from "@/components/layout/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "SharkApi.dev Privacy Policy — how we collect, use, and protect your data.",
};

const TOC = [
  { id: "collect",    label: "1. Information We Collect" },
  { id: "use",        label: "2. How We Use Your Information" },
  { id: "sharing",    label: "3. Data Sharing" },
  { id: "security",   label: "4. Data Security" },
  { id: "cookies",    label: "5. Cookies" },
  { id: "rights",     label: "6. Your Rights" },
  { id: "retention",  label: "7. Data Retention" },
  { id: "children",   label: "8. Children's Privacy" },
  { id: "contact",    label: "9. Contact" },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="We take your privacy seriously. This policy explains what data we collect and how we use it."
      lastUpdated="January 15, 2025"
      toc={TOC}
    >
      <LSection id="collect" title="1. Information We Collect">
        <LP>We collect the following categories of information when you use SharkApi.dev:</LP>
        <LP><strong className="text-ocean-100">Account information:</strong></LP>
        <LList items={[
          "Email address (required for registration)",
          "Password (stored as a bcrypt hash — we never store plaintext passwords)",
          "Account creation date and last login timestamp",
        ]} />
        <LP><strong className="text-ocean-100">API usage data:</strong></LP>
        <LList items={[
          "API request logs: timestamp, token used, mode, job status, cost",
          "Prompts submitted for image generation (retained for moderation and compliance)",
          "Input images submitted (retained for moderation, deleted after 30 days)",
          "Generated output image metadata (URL, dimensions, creation time)",
        ]} />
        <LP><strong className="text-ocean-100">Payment information:</strong></LP>
        <LList items={[
          "Wallet top-up history and transaction records",
          "Payment method details are processed and stored by Stripe — we do not store raw card data",
        ]} />
        <LP><strong className="text-ocean-100">Technical data:</strong></LP>
        <LList items={[
          "IP addresses (for rate limiting and abuse detection)",
          "Browser/client User-Agent strings",
          "Session identifiers",
        ]} />
      </LSection>

      <LSection id="use" title="2. How We Use Your Information">
        <LList items={[
          "Providing, maintaining, and improving the Service",
          "Processing API requests and charging your wallet",
          "Detecting and preventing abuse, fraud, and policy violations",
          "Sending service-related emails (billing receipts, security alerts)",
          "Responding to support requests",
          "Complying with legal obligations",
          "Enforcing our Terms of Service and Acceptable Use Policy",
        ]} />
      </LSection>

      <LSection id="sharing" title="3. Data Sharing">
        <LP>
          We do not sell your personal data. We share data only in the following limited circumstances:
        </LP>
        <LList items={[
          "With Stripe for payment processing (subject to Stripe's Privacy Policy)",
          "With AWS for image storage in S3 (subject to AWS's Privacy Policy)",
          "With law enforcement when required by law or to prevent illegal activity",
          "With service providers who assist us in operating the platform, under strict data processing agreements",
        ]} />
      </LSection>

      <LSection id="security" title="4. Data Security">
        <LP>
          We implement industry-standard security measures including:
        </LP>
        <LList items={[
          "TLS encryption for all data in transit",
          "Encryption at rest for sensitive stored data",
          "Access controls and audit logs for internal data access",
          "Regular security reviews and vulnerability scanning",
          "API tokens are stored hashed — we cannot recover your token if lost",
        ]} />
        <LP>
          Despite our efforts, no system is 100% secure. We will notify you promptly in the event
          of a data breach that affects your personal information.
        </LP>
      </LSection>

      <LSection id="cookies" title="5. Cookies">
        <LP>We use minimal cookies for essential functionality only:</LP>
        <LList items={[
          "Session cookies: to maintain your login session",
          "CSRF tokens: to prevent cross-site request forgery",
          "Locale preference: to remember your chosen language",
        ]} />
        <LP>
          We do not use advertising cookies or third-party tracking cookies.
        </LP>
      </LSection>

      <LSection id="rights" title="6. Your Rights">
        <LP>Depending on your location, you may have the following rights:</LP>
        <LList items={[
          "Access: request a copy of the personal data we hold about you",
          "Correction: request that we correct inaccurate data",
          "Deletion: request that we delete your personal data (subject to legal obligations)",
          "Portability: request your data in a machine-readable format",
          "Objection: object to certain types of processing",
        ]} />
        <LP>
          To exercise these rights, contact us at{" "}
          <a href="mailto:privacy@sharkapi.dev" className="text-electric-400 hover:underline">
            privacy@sharkapi.dev
          </a>. We respond to all requests within 30 days.
        </LP>
      </LSection>

      <LSection id="retention" title="7. Data Retention">
        <LList items={[
          "Account data: retained for the lifetime of your account plus 90 days after deletion",
          "API logs: retained for 12 months",
          "Input images: deleted 30 days after job completion",
          "Generated images: stored in S3 for 90 days, then deleted",
          "Financial records: retained for 7 years as required by law",
        ]} />
      </LSection>

      <LSection id="children" title="8. Children's Privacy">
        <LP>
          The Service is not directed at persons under the age of 18. We do not knowingly collect
          personal information from minors. If you believe a minor has provided us with personal
          information, contact us immediately at{" "}
          <a href="mailto:privacy@sharkapi.dev" className="text-electric-400 hover:underline">
            privacy@sharkapi.dev
          </a>.
        </LP>
      </LSection>

      <LSection id="contact" title="9. Contact">
        <LP>
          For privacy-related questions, data requests, or concerns, contact our Data Protection
          team at{" "}
          <a href="mailto:privacy@sharkapi.dev" className="text-electric-400 hover:underline">
            privacy@sharkapi.dev
          </a>.
        </LP>
      </LSection>
    </LegalLayout>
  );
}
