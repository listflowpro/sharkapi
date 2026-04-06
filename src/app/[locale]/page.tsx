import { useTranslations } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OceanBackground } from "@/components/effects/OceanBackground";
import { WaveDivider, GlowLine } from "@/components/effects/WaveDivider";
import { BubbleField, GlowOrbs } from "@/components/effects/BubbleField";
import { CodeExamples } from "@/components/home/CodeExamples";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AnimatedHero } from "@/components/hero/AnimatedHero";

/* ========================================================
   HOW IT WORKS
   ======================================================== */
const STEP_KEYS = ["01", "02", "03", "04", "05", "06"] as const;

function HowItWorks() {
  const t = useTranslations("howItWorks");
  return (
    <section className="bg-ocean-900 py-24 relative overflow-hidden">
      <GlowOrbs />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <Badge variant="info" className="mb-4">{t("badge")}</Badge>
          <h2 className="text-4xl font-bold text-ocean-50 mb-4">{t("title")}</h2>
          <p className="text-ocean-200 max-w-xl mx-auto">{t("subtitle")}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {STEP_KEYS.map((key) => (
            <Card key={key} variant="elevated" hover padding="lg">
              <div className="flex items-start gap-4">
                <span className="text-3xl font-bold text-electric-400/30 font-mono leading-none shrink-0">{key}</span>
                <div>
                  <h3 className="font-semibold text-ocean-50 mb-1">{t(`steps.${key}.title`)}</h3>
                  <p className="text-sm text-ocean-200 leading-relaxed">{t(`steps.${key}.desc`)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========================================================
   PRICING PREVIEW
   ======================================================== */
function PricingPreview() {
  const t = useTranslations("pricing");
  const plans = [
    { mode: "1K Mode", price: "$0.01", res: "1024 × 1024", featured: false },
    { mode: "2K Mode", price: "$0.02", res: "2048 × 2048", featured: true  },
  ];
  return (
    <section className="relative overflow-hidden">
      <WaveDivider variant="down" fillColor="#0B1929" className="-mb-1" />
      <div className="bg-ocean-800 py-24 relative">
        <GlowOrbs />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <Badge variant="info" className="mb-4">{t("badge")}</Badge>
            <h2 className="text-4xl font-bold text-ocean-50 mb-4">{t("title")}</h2>
            <p className="text-ocean-200">{t("subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.mode} variant={plan.featured ? "bordered" : "elevated"} padding="lg" className="relative">
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="info">{t("mostPopular")}</Badge>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-ocean-100 mb-1">{plan.mode}</h3>
                  <div className="text-4xl font-bold text-electric-400 mb-1">{plan.price}</div>
                  <div className="text-sm text-ocean-300 mb-4">{t("perRequest")}</div>
                  <Badge variant="default" size="sm">{plan.res}</Badge>
                </div>
                <GlowLine className="mt-6 mb-4" />
                <Button variant={plan.featured ? "primary" : "secondary"} className="w-full">{t("cta")}</Button>
              </Card>
            ))}
          </div>
          <p className="text-center text-xs text-ocean-400 mt-6">{t("note")}</p>
        </div>
      </div>
      <WaveDivider variant="up" fillColor="#060E1A" className="-mt-1" />
    </section>
  );
}

/* ========================================================
   FEATURE GRID
   ======================================================== */
const FEATURE_KEYS = [
  { key: "async",      icon: "⚡" },
  { key: "wallet",     icon: "💳" },
  { key: "tokens",     icon: "🔑" },
  { key: "imageInput", icon: "🖼️" },
  { key: "history",    icon: "📋" },
  { key: "moderation", icon: "🛡️" },
] as const;

function FeatureGrid() {
  const t = useTranslations("features");
  return (
    <section id="features" className="bg-ocean-900 py-24 relative overflow-hidden">
      <GlowOrbs />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <Badge variant="info" className="mb-4">{t("badge")}</Badge>
          <h2 className="text-4xl font-bold text-ocean-50 mb-4">{t("title")}</h2>
          <p className="text-ocean-200 max-w-xl mx-auto">{t("subtitle")}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURE_KEYS.map(({ key, icon }) => (
            <Card key={key} variant="elevated" hover padding="lg">
              <span className="text-3xl block mb-4" aria-hidden="true">{icon}</span>
              <h3 className="font-semibold text-ocean-50 mb-2">{t(`items.${key}.title`)}</h3>
              <p className="text-sm text-ocean-200 leading-relaxed">{t(`items.${key}.desc`)}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========================================================
   TRIAL BANNER
   ======================================================== */
function TrialBanner() {
  const t = useTranslations("trial");
  return (
    <section className="bg-ocean-900 py-16 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card variant="bordered" padding="lg" className="text-center relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(0,174,239,0.07) 0%, transparent 70%)" }}
            aria-hidden="true"
          />
          <BubbleField count={6} className="opacity-30" />
          <div className="relative">
            <Badge variant="active" dot className="mb-4">{t("badge")}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-ocean-50 mb-3">
              {t("title")}{" "}
              <span className="text-electric-400 glow-text">{t("titleHighlight")}</span>
            </h2>
            <p className="text-ocean-200 mb-8 max-w-lg mx-auto">{t("subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" size="lg">{t("ctaTry")}</Button>
              <Button variant="secondary" size="lg">{t("ctaDocs")}</Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

/* ========================================================
   OCEAN CTA — bottom of page
   ======================================================== */
function OceanCta() {
  const t = useTranslations("oceanCta");
  return (
    <OceanBackground intensity="strong" caustics className="relative py-32 overflow-hidden">
      <BubbleField count={10} />
      <GlowOrbs />

      {/* Shark glow watermark */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        aria-hidden="true"
      >
        <div
          style={{
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(0,174,239,0.1) 0%, transparent 65%)",
            filter: "blur(20px)",
            animation: "glow-pulse 5s ease-in-out infinite",
          }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="inline-block mb-6">
          <Badge variant="active" dot>SharkApi.dev</Badge>
        </div>
        <h2 className="text-5xl md:text-6xl font-bold text-ocean-50 mb-6 leading-tight">
          {t("title").split("?")[0]}
          {t("title").includes("?") && <span className="text-electric-400 glow-text">?</span>}
        </h2>
        <p className="text-xl text-ocean-200 mb-10 leading-relaxed max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size="xl">{t("primary")}</Button>
          <Button variant="secondary" size="xl">{t("secondary")}</Button>
        </div>
      </div>
    </OceanBackground>
  );
}

/* ========================================================
   PAGE ROOT
   ======================================================== */
export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <AnimatedHero />
        <HowItWorks />
        <PricingPreview />
        <FeatureGrid />
        <CodeExamples />
        <TrialBanner />
        <OceanCta />
      </main>
      <Footer />
    </>
  );
}
