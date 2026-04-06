import { useTranslations } from "next-intl";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OceanBackground } from "@/components/effects/OceanBackground";
import { WaveDivider } from "@/components/effects/WaveDivider";
import { BubbleField, GlowOrbs } from "@/components/effects/BubbleField";
import { PricingFAQ } from "@/components/home/PricingFAQ";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple usage-based pricing. Pay per generation. No subscriptions.",
};

/* Usage table rows */
const USAGE_ROWS = [10, 50, 100, 500, 1000, 5000];

/* Included features */
const FEATURE_KEYS = [
  "wallet", "noFail", "s3", "tokens",
  "history", "moderation", "trial", "async",
] as const;

function IncludedIcon() {
  return (
    <svg className="w-4 h-4 text-aqua-400 shrink-0" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ========================================================
   HERO
   ======================================================== */
function PricingHero() {
  const t = useTranslations("pricingPage.hero");
  return (
    <OceanBackground intensity="medium" caustics className="relative pt-32 pb-20">
      <BubbleField count={8} />
      <GlowOrbs />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <Badge variant="info" className="mb-5">{t("badge")}</Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-ocean-50 mb-5 leading-tight">
          {t("title")}
        </h1>
        <p className="text-xl text-ocean-200 leading-relaxed">{t("subtitle")}</p>
      </div>
      <WaveDivider variant="gentle" fillColor="#060E1A" className="mt-12" />
    </OceanBackground>
  );
}

/* ========================================================
   PRICING CARDS
   ======================================================== */
function PricingCards() {
  const t = useTranslations("pricingPage");
  const tp = useTranslations("pricing");

  const plans = [
    { key: "1k" as const, featured: false },
    { key: "2k" as const, featured: true  },
  ];

  return (
    <section className="bg-ocean-900 py-20 relative overflow-hidden">
      <GlowOrbs />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {plans.map(({ key, featured }) => (
            <Card
              key={key}
              variant={featured ? "bordered" : "elevated"}
              padding="lg"
              className="relative"
            >
              {featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge variant="info">{tp("mostPopular")}</Badge>
                </div>
              )}

              {/* Mode header */}
              <div className="text-center pb-6 mb-6 border-b border-ocean-500/30">
                <h2 className="text-xl font-bold text-ocean-50 mb-1">{t(`modes.${key}.name`)}</h2>
                <div
                  className="text-6xl font-bold mb-1"
                  style={{
                    color: featured ? "#00AEEF" : "#B8D4F0",
                    textShadow: featured ? "0 0 30px rgba(0,174,239,0.4)" : "none",
                  }}
                >
                  {t(`modes.${key}.price`)}
                </div>
                <p className="text-ocean-300 text-sm">{tp("perRequest")}</p>
                <Badge variant="default" size="sm" className="mt-3">{t(`modes.${key}.res`)}</Badge>
              </div>

              {/* Description */}
              <p className="text-ocean-200 text-sm leading-relaxed mb-6 text-center">
                {t(`modes.${key}.desc`)}
              </p>

              <Button
                variant={featured ? "primary" : "secondary"}
                size="lg"
                className="w-full"
              >
                {tp("cta")}
              </Button>
            </Card>
          ))}
        </div>

        {/* What's included */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-ocean-50">{t("features.title")}</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {FEATURE_KEYS.map((key) => (
            <div key={key} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-ocean-800/50 border border-ocean-500/20">
              <IncludedIcon />
              <span className="text-sm text-ocean-200">{t(`features.items.${key}`)}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-ocean-400">{tp("note")}</p>
      </div>
    </section>
  );
}

/* ========================================================
   WALLET INFO
   ======================================================== */
function WalletInfo() {
  const t = useTranslations("pricingPage.wallet");
  const rules = ["rule1", "rule2", "rule3", "rule4"] as const;
  const presets = ["$10", "$20", "$50", "$100"];

  return (
    <section className="relative overflow-hidden">
      <WaveDivider variant="down" fillColor="#0B1929" className="-mb-1" />
      <div className="bg-ocean-800 py-20 relative">
        <GlowOrbs />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-ocean-50 mb-6">{t("title")}</h2>
              <ul className="space-y-4">
                {rules.map((rule, i) => (
                  <li key={rule} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-electric-400/15 border border-electric-400/30 flex items-center justify-center text-xs font-bold text-electric-400 shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-ocean-200 text-sm leading-relaxed">{t(rule)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Top-up preset visual */}
            <div className="flex flex-col gap-4">
              <p className="text-sm text-ocean-300 font-medium">Quick top-up presets</p>
              <div className="grid grid-cols-2 gap-3">
                {presets.map((amount) => (
                  <Card
                    key={amount}
                    variant="bordered"
                    padding="md"
                    hover
                    className="text-center cursor-pointer group"
                  >
                    <div className="text-2xl font-bold text-ocean-50 group-hover:text-electric-400 transition-colors duration-150">
                      {amount}
                    </div>
                    <div className="text-xs text-ocean-400 mt-1">
                      {amount === "$10"  && "1,000 × 1K"}
                      {amount === "$20"  && "2,000 × 1K"}
                      {amount === "$50"  && "5,000 × 1K"}
                      {amount === "$100" && "10,000 × 1K"}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <WaveDivider variant="up" fillColor="#060E1A" className="-mt-1" />
    </section>
  );
}

/* ========================================================
   USAGE TABLE
   ======================================================== */
function UsageTable() {
  const t = useTranslations("pricingPage.table");

  return (
    <section className="bg-ocean-900 py-20 relative overflow-hidden">
      <GlowOrbs />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-ocean-50 mb-3">{t("title")}</h2>
          <p className="text-ocean-200">{t("subtitle")}</p>
        </div>

        <Card variant="default" padding="none" className="overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3 bg-ocean-700/50 border-b border-ocean-500/30">
            {(["requests", "mode1k", "mode2k"] as const).map((col) => (
              <div key={col} className="px-5 py-3 text-xs font-semibold text-ocean-100 uppercase tracking-wide text-center first:text-left">
                {t(`headers.${col}`)}
              </div>
            ))}
          </div>

          {/* Rows */}
          {USAGE_ROWS.map((count, i) => {
            const cost1k = (count * 0.01).toFixed(2);
            const cost2k = (count * 0.02).toFixed(2);
            return (
              <div
                key={count}
                className={cn(
                  "grid grid-cols-3 border-b border-ocean-500/15 transition-colors duration-150 hover:bg-ocean-700/20",
                  i % 2 === 0 ? "bg-transparent" : "bg-ocean-800/20"
                )}
              >
                <div className="px-5 py-3.5 text-sm font-medium text-ocean-100">
                  {count.toLocaleString()}
                </div>
                <div className="px-5 py-3.5 text-sm text-center font-mono text-ocean-200">
                  ${cost1k}
                </div>
                <div className="px-5 py-3.5 text-sm text-center font-mono text-electric-400 font-medium">
                  ${cost2k}
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </section>
  );
}

function cn(...cls: (string | boolean | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}

/* ========================================================
   FAQ
   ======================================================== */
function FaqSection() {
  const t = useTranslations("pricingPage.faq");
  return (
    <section className="bg-ocean-900 pb-20 relative overflow-hidden">
      <GlowOrbs />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <h2 className="text-3xl font-bold text-ocean-50 mb-10 text-center">{t("title")}</h2>
        <PricingFAQ />
      </div>
    </section>
  );
}

/* ========================================================
   CTA
   ======================================================== */
function PricingCta() {
  const t = useTranslations("pricingPage.cta");
  return (
    <OceanBackground intensity="medium" caustics className="relative py-24">
      <BubbleField count={8} />
      <GlowOrbs />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <h2 className="text-4xl font-bold text-ocean-50 mb-4">{t("title")}</h2>
        <p className="text-ocean-200 mb-8 text-lg">{t("subtitle")}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" size="lg">{t("primary")}</Button>
          <Button variant="secondary" size="lg">{t("secondary")}</Button>
        </div>
      </div>
    </OceanBackground>
  );
}

/* ========================================================
   PAGE ROOT
   ======================================================== */
export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PricingHero />
        <PricingCards />
        <WalletInfo />
        <UsageTable />
        <FaqSection />
        <PricingCta />
      </main>
      <Footer />
    </>
  );
}
