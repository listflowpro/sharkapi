import type { Metadata } from "next";
import { LegalLayout, LSection, LP, LList } from "@/components/layout/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "SharkApi.dev Terms of Service.",
};

const TOC = [
  { id: "acceptance",     label: "1. Acceptance of Terms" },
  { id: "account",        label: "2. Account Registration" },
  { id: "api-usage",      label: "3. API Usage" },
  { id: "wallet",         label: "4. Wallet & Payments" },
  { id: "acceptable-use", label: "5. Acceptable Use" },
  { id: "ip",             label: "6. Intellectual Property" },
  { id: "privacy",        label: "7. Privacy" },
  { id: "disclaimers",    label: "8. Disclaimers" },
  { id: "liability",      label: "9. Limitation of Liability" },
  { id: "termination",    label: "10. Termination" },
  { id: "governing-law",  label: "11. Governing Law" },
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Please read these terms carefully before using SharkApi.dev."
      lastUpdated="January 15, 2025"
      toc={TOC}
    >
      <LSection id="acceptance" title="1. Acceptance of Terms">
        <LP>
          By accessing or using SharkApi.dev (the "Service"), you agree to be bound by these Terms
          of Service ("Terms"). If you do not agree to these Terms, you may not use the Service.
        </LP>
        <LP>
          These Terms apply to all users of the Service, including users who access the Service
          via the API. We reserve the right to update these Terms at any time with notice provided
          via email or the dashboard.
        </LP>
      </LSection>

      <LSection id="account" title="2. Account Registration">
        <LP>
          To use the Service, you must create an account with a valid email address. You are
          responsible for maintaining the confidentiality of your account credentials and for all
          activities that occur under your account.
        </LP>
        <LList items={[
          "You must be at least 18 years old to use the Service.",
          "You must provide accurate and complete registration information.",
          "You may not create more than one account per person without prior written consent.",
          "You must notify us immediately of any unauthorized use of your account.",
        ]} />
      </LSection>

      <LSection id="api-usage" title="3. API Usage">
        <LP>
          Upon registration, you receive access to the SharkApi.dev API through API tokens. Each
          account may create multiple tokens. You are responsible for all API usage associated with
          your tokens.
        </LP>
        <LP>
          API tokens must be kept confidential. Do not expose tokens in client-side code, public
          repositories, or any publicly accessible location. If a token is compromised, revoke it
          immediately via your dashboard.
        </LP>
        <LList items={[
          "API requests are logged for billing, security, and moderation purposes.",
          "Rate limits apply. Exceeding limits may result in temporary suspension.",
          "We reserve the right to modify API endpoints with reasonable advance notice.",
          "SLA guarantees are not provided under free tier or standard plans.",
        ]} />
      </LSection>

      <LSection id="wallet" title="4. Wallet & Payments">
        <LP>
          The Service uses a pre-paid wallet system. You top up your wallet balance and are charged
          per successful generation. Failed jobs are never charged.
        </LP>
        <LList items={[
          "Minimum wallet top-up is $10. Top-ups are only accepted in multiples of $10.",
          "Payments are processed by Stripe and subject to Stripe's terms of service.",
          "Wallet balance is non-refundable except at our sole discretion.",
          "Wallet balance does not expire.",
          "If your balance is insufficient, API requests will be rejected with a 402 error.",
          "We reserve the right to modify pricing with 30 days notice.",
        ]} />
      </LSection>

      <LSection id="acceptable-use" title="5. Acceptable Use">
        <LP>
          Your use of the Service must comply with our Acceptable Use Policy. You may not use the
          Service to generate content that is illegal, harmful, or violates the rights of others.
          Refer to our{" "}
          <a href="/aup" className="text-electric-400 hover:underline">Acceptable Use Policy</a>{" "}
          for the complete list of prohibited activities.
        </LP>
        <LP>
          Violations of the Acceptable Use Policy may result in immediate account termination
          without refund and, where applicable, reporting to law enforcement authorities.
        </LP>
      </LSection>

      <LSection id="ip" title="6. Intellectual Property">
        <LP>
          You retain ownership of the prompts and input images you submit. You own the output
          images generated from your requests, subject to applicable law and these Terms.
        </LP>
        <LP>
          SharkApi.dev retains all rights to the platform, API, infrastructure, and underlying
          technology. Nothing in these Terms transfers any SharkApi.dev intellectual property to you.
        </LP>
        <LList items={[
          "You are solely responsible for ensuring your prompts and input images do not infringe third-party intellectual property rights.",
          "We do not claim ownership of your generated output images.",
          "We may use anonymized usage data to improve our systems.",
        ]} />
      </LSection>

      <LSection id="privacy" title="7. Privacy">
        <LP>
          Your use of the Service is subject to our{" "}
          <a href="/privacy" className="text-electric-400 hover:underline">Privacy Policy</a>,
          which is incorporated into these Terms by reference. By using the Service, you consent to
          the data practices described in the Privacy Policy.
        </LP>
      </LSection>

      <LSection id="disclaimers" title="8. Disclaimers">
        <LP>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
          EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE,
          OR FREE OF HARMFUL COMPONENTS.
        </LP>
        <LP>
          We do not guarantee the quality, accuracy, or appropriateness of any generated content.
          You are solely responsible for reviewing and validating any output before use.
        </LP>
      </LSection>

      <LSection id="liability" title="9. Limitation of Liability">
        <LP>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, SHARKAPI.DEV SHALL NOT BE LIABLE FOR ANY
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF
          PROFITS, DATA, OR GOODWILL.
        </LP>
        <LP>
          Our total aggregate liability to you for any claims arising from these Terms or your use
          of the Service shall not exceed the amount you paid us in the 12 months preceding the
          claim.
        </LP>
      </LSection>

      <LSection id="termination" title="10. Termination">
        <LP>
          We may suspend or terminate your account at any time for violation of these Terms or our
          Acceptable Use Policy, with or without notice. Upon termination, your right to use the
          Service immediately ceases.
        </LP>
        <LP>
          You may close your account at any time from your dashboard. Any remaining wallet balance
          is subject to our refund policy at the time of closure.
        </LP>
      </LSection>

      <LSection id="governing-law" title="11. Governing Law">
        <LP>
          These Terms shall be governed by and construed in accordance with applicable law.
          Any disputes arising from these Terms shall be resolved through binding arbitration,
          unless prohibited by applicable law.
        </LP>
        <LP>
          If any provision of these Terms is found to be unenforceable, the remaining provisions
          will remain in full force and effect.
        </LP>
      </LSection>
    </LegalLayout>
  );
}
