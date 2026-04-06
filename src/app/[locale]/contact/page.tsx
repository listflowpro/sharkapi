"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OceanBackground } from "@/components/effects/OceanBackground";
import { WaveDivider } from "@/components/effects/WaveDivider";
import { GlowOrbs } from "@/components/effects/BubbleField";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function ContactForm() {
  const t = useTranslations("contact");
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1500);
  };

  if (sent) {
    return (
      <Card variant="bordered" padding="lg" className="text-center">
        <div className="w-16 h-16 rounded-full bg-aqua-400/10 border-2 border-aqua-400/50 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-aqua-400" stroke="currentColor" strokeWidth="2">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-ocean-50 mb-2">{t("form.successTitle")}</h3>
        <p className="text-ocean-200 text-sm">{t("form.successDesc")}</p>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label={t("form.name")} placeholder={t("form.namePlaceholder")} required />
          <Input label={t("form.email")} type="email" placeholder={t("form.emailPlaceholder")} required />
        </div>
        <Input label={t("form.subject")} placeholder={t("form.subjectPlaceholder")} required />
        <Textarea label={t("form.message")} placeholder={t("form.messagePlaceholder")} required />
        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
          {t("form.submit")}
        </Button>
      </form>
    </Card>
  );
}

export default function ContactPage() {
  const t = useTranslations("contact");

  const INFO = [
    {
      icon: "🛟",
      title: t("info.supportTitle"),
      desc:  t("info.supportDesc"),
      email: "support@sharkapi.dev",
    },
    {
      icon: "🤝",
      title: t("info.businessTitle"),
      desc:  t("info.businessDesc"),
      email: "business@sharkapi.dev",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <OceanBackground intensity="medium" caustics className="relative pt-32 pb-16">
          <GlowOrbs />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <Badge variant="info" className="mb-5">{t("badge")}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-ocean-50 mb-4">{t("title")}</h1>
            <p className="text-ocean-200 text-lg">{t("subtitle")}</p>
          </div>
          <WaveDivider variant="gentle" fillColor="#060E1A" className="mt-12" />
        </OceanBackground>

        {/* Main content */}
        <section className="bg-ocean-900 py-16 relative overflow-hidden">
          <GlowOrbs />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-[1fr_380px] gap-10">

              {/* Form */}
              <div>
                <h2 className="text-2xl font-bold text-ocean-50 mb-6">Send a message</h2>
                <ContactForm />
              </div>

              {/* Info panel */}
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-2 text-xs text-ocean-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-aqua-400 animate-pulse" />
                  {t("info.responseTime")}
                </div>

                {INFO.map((item) => (
                  <Card key={item.title} variant="default" padding="md">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h3 className="font-semibold text-ocean-50 mb-1">{item.title}</h3>
                        <p className="text-sm text-ocean-300 mb-2">{item.desc}</p>
                        <a
                          href={`mailto:${item.email}`}
                          className="text-sm text-electric-400 hover:text-electric-300 transition-colors font-mono"
                        >
                          {item.email}
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}

                {/* Shark mascot card */}
                <Card variant="bordered" padding="md" className="relative overflow-hidden">
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,174,239,0.06) 0%, transparent 70%)" }}
                    aria-hidden="true"
                  />
                  <div className="relative">
                    <div className="text-3xl mb-2">🦈</div>
                    <p className="text-sm font-semibold text-ocean-100 mb-1">Shark Assistant</p>
                    <p className="text-xs text-ocean-300 leading-relaxed mb-3">
                      Need a quick answer? Our AI shark is ready to bite into your problem 24/7.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Start live chat
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
