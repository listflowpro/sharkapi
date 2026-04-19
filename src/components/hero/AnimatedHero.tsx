"use client";

/* ================================================================
   AnimatedHero — drop-in replacement for the static Hero section.

   What it keeps (unchanged):
     • OceanBackground + BubbleField + GlowOrbs backdrop
     • Two-column grid: headline/CTAs left, API cards right
     • All existing translations + trust-item strip
     • WaveDivider at bottom

   What it adds:
     • SharkMouthLogo SVG layer — absolute-positioned behind content
     • Scroll-driven jaw separation via GSAP ScrollTrigger (scrub)
     • Initial "almost-closed" state with teeth already visible
     • CTA click → dramatic jaw-open + dark-swallow transition → navigate
   ================================================================ */

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { OceanBackground } from "@/components/effects/OceanBackground";
import { WaveDivider } from "@/components/effects/WaveDivider";
import { BubbleField, GlowOrbs } from "@/components/effects/BubbleField";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SharkMouthLogo } from "./SharkMouthLogo";

gsap.registerPlugin(ScrollTrigger);

/* ── Initial jaw separation (teeth just visible) ─────────────── */
const INIT_JAW_Y   = 10;   // px — each jaw displaced from centerline at rest
const SCROLL_JAW_Y = 52;   // additional px at full scroll progress
const CTA_JAW_Y    = 94;   // total from center on CTA click

/* ── CTA button — triggers shark animation before routing ──────── */
function SharkCTAButton({
  href,
  variant,
  children,
  onSharkClick,
}: {
  href: string;
  variant: "primary" | "secondary";
  children: React.ReactNode;
  onSharkClick: (href: string) => void;
}) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 text-base px-7 py-3.5 gap-2";
  const styles = {
    primary:
      `${base} bg-electric-400 text-ocean-900 hover:bg-electric-300 ` +
      `shadow-[0_0_24px_rgba(0,174,239,0.4)] hover:shadow-[0_0_36px_rgba(0,174,239,0.55)]`,
    secondary:
      `${base} bg-ocean-700/50 text-ocean-100 border border-ocean-500/40 ` +
      `hover:bg-ocean-600/60 hover:border-ocean-400/60`,
  };

  return (
    <button
      className={styles[variant]}
      onClick={() => onSharkClick(href)}
    >
      {children}
    </button>
  );
}

/* ── The hero ─────────────────────────────────────────────────── */
export function AnimatedHero() {
  const t    = useTranslations("hero");
  const tApi = useTranslations("api");
  const router = useRouter();

  /* ── Refs ─────────────────────────────────────────────────── */
  const heroRef       = useRef<HTMLDivElement>(null);
  const logoWrapRef   = useRef<HTMLDivElement>(null);
  const upperJawRef   = useRef<SVGGElement>(null);
  const lowerJawRef   = useRef<SVGGElement>(null);
  const upperTeethRef = useRef<SVGGElement>(null);
  const lowerTeethRef = useRef<SVGGElement>(null);
  const circuitRef    = useRef<SVGGElement>(null);
  const glowRef       = useRef<SVGGElement>(null);
  const overlayRef    = useRef<HTMLDivElement>(null);

  const [navigating, setNavigating] = useState(false);

  /* ── GSAP setup ───────────────────────────────────────────── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Promote jaw groups to their own compositor layer up-front.
         force3D tells GSAP to use matrix3d so the browser never
         falls back to a 2D transform path.                         */
      const jawEls = [
        upperJawRef.current, upperTeethRef.current,
        lowerJawRef.current, lowerTeethRef.current,
      ].filter(Boolean);
      gsap.set(jawEls, { force3D: true });

      /* ── Initial "almost-closed" state ─────────────────────── */
      gsap.set([upperJawRef.current, upperTeethRef.current], { y: -INIT_JAW_Y });
      gsap.set([lowerJawRef.current, lowerTeethRef.current], { y:  INIT_JAW_Y });
      gsap.set(circuitRef.current,  { opacity: 0.22 });
      gsap.set(glowRef.current,     { opacity: 0.38 });
      gsap.set(logoWrapRef.current, { opacity: 0.13 });

      /* ── Scroll-driven timeline — single scrub tween, zero
         per-frame JS math. GSAP interpolates internally.          */
      const scrollTl = gsap.timeline({ paused: true });

      scrollTl
        .to(
          [upperJawRef.current, upperTeethRef.current],
          { y: -(INIT_JAW_Y + SCROLL_JAW_Y), force3D: true, ease: "none" },
          0,
        )
        .to(
          [lowerJawRef.current, lowerTeethRef.current],
          { y:  INIT_JAW_Y + SCROLL_JAW_Y, force3D: true, ease: "none" },
          0,
        )
        .to(circuitRef.current,  { opacity: 0.72, ease: "none" }, 0)
        .to(glowRef.current,     { opacity: 0.93, ease: "none" }, 0)
        .to(logoWrapRef.current, { opacity: 0.30, ease: "none" }, 0);

      ScrollTrigger.create({
        trigger:   heroRef.current,
        start:     "top top",
        end:       "bottom 40%",
        scrub:     1.2,           // lag in seconds — feels smooth, not instant
        animation: scrollTl,      // GSAP drives it, no onUpdate overhead
      });
    });

    return () => ctx.revert();
  }, []);

  /* ── CTA click — dramatic bite-and-swallow transition ─────── */
  const handleSharkClick = (href: string) => {
    if (navigating) return;
    setNavigating(true);

    /* Disable scroll trigger so it doesn't fight the click animation */
    ScrollTrigger.getAll().forEach((t) => t.disable());

    const tl = gsap.timeline({
      onComplete: () => router.push(href),
    });

    tl
      /* 1. Quick "close" — dramatic tension before the bite */
      .to([upperJawRef.current, upperTeethRef.current], {
        y: -4, duration: 0.18, ease: "power3.in", force3D: true,
      })
      .to([lowerJawRef.current, lowerTeethRef.current], {
        y:  4, duration: 0.18, ease: "power3.in", force3D: true,
      }, "<")

      /* 2. Slam open — the bite */
      .to([upperJawRef.current, upperTeethRef.current], {
        y: -CTA_JAW_Y, duration: 0.5, ease: "expo.out", force3D: true,
      })
      .to([lowerJawRef.current, lowerTeethRef.current], {
        y:  CTA_JAW_Y, duration: 0.5, ease: "expo.out", force3D: true,
      }, "<")

      /* 3. Logo surges — only opacity+scale, both compositor-only */
      .to(logoWrapRef.current, {
        opacity: 0.7, scale: 1.05, duration: 0.38, ease: "power2.out",
      }, "-=0.38")

      /* 4. Glow flares */
      .to(glowRef.current, {
        opacity: 1, duration: 0.3, ease: "power2.out",
      }, "<0.05")

      /* 5. Dark overlay swallows screen */
      .to(overlayRef.current, {
        opacity: 1, duration: 0.42, ease: "power2.inOut",
      }, "-=0.08");
  };

  /* ── Content ──────────────────────────────────────────────── */
  const curlCmd = [
    `curl -X POST https://api.sharkapi.dev/v1/generate \\`,
    `  -H "Authorization: Bearer sk_live_••••••••" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '{`,
    `    "mode": "1k",`,
    `    "prompt": "Deep ocean shark, cinematic, 8K"`,
    `  }'`,
  ].join("\n");

  const responseJson = [
    `{`,
    `  "job_id": "job_8f2a9d3c",`,
    `  "status": "queued",`,
    `  "estimated_cost": "$0.03",`,
    `  "poll_url": "/v1/jobs/job_8f2a9d3c"`,
    `}`,
  ].join("\n");

  const trustItems = [
    t("trust.async"), t("trust.wallet"), t("trust.s3"),
    t("trust.moderation"), t("trust.trial"),
  ];

  return (
    <>
      {/* ── Full-screen swallow overlay ─────────────────────── */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        style={{
          position:        "fixed",
          inset:           0,
          zIndex:          200,
          opacity:         0,
          pointerEvents:   "none",
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, #000407 0%, #020810 40%, #060E1A 100%)",
        }}
      />

      {/* ── Hero section ────────────────────────────────────── */}
      <div ref={heroRef}>
      <OceanBackground
        intensity="strong"
        caustics
        className="relative flex flex-col"
        style={{ minHeight: "calc(100vh - 240px)" }}
      >

        <BubbleField count={12} />
        <GlowOrbs />

        {/* ── Shark mouth logo layer ───────────────────────── */}
        <div
          ref={logoWrapRef}
          aria-hidden="true"
          style={{
            position:       "absolute",
            inset:          0,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            pointerEvents:  "none",
            zIndex:         2,
            opacity:        0.13,
            /* GPU compositing hints — avoids paint on every frame */
            willChange:     "opacity",
            filter: "drop-shadow(0 0 8px rgba(0,174,239,0.25))",
          }}
        >
          <SharkMouthLogo
            upperJawRef={upperJawRef}
            lowerJawRef={lowerJawRef}
            upperTeethRef={upperTeethRef}
            lowerTeethRef={lowerTeethRef}
            circuitRef={circuitRef}
            glowRef={glowRef}
            style={{
              width:      "min(84vw, 820px)",
              height:     "auto",
              flexShrink: 0,
              willChange: "transform",
            } as React.CSSProperties}
          />
        </div>

        {/* ── Page content (z-index above shark layer) ─────── */}
        <div className="relative z-10 flex-1 flex items-center pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* Headline + CTAs */}
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="info" dot>{t("badge")}</Badge>
                  <Badge variant="active" dot size="sm">{t("badgeLive")}</Badge>
                </div>

                {/* Small API tagline above main headline */}
                <p className="text-base text-ocean-300 font-mono tracking-wide">
                  {t("headline1")} {t("headline2")} {t("headline3")}
                </p>

                {/* Main headline — the ocean slogan */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                  <span className="text-ocean-50">{t("subtext")}</span>
                </h1>

                {/* Price — prominent */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl md:text-4xl font-black text-electric-400 glow-text">
                    $0.03
                  </span>
                  <span className="text-ocean-200 text-base leading-snug">
                    per image<br />
                    <span className="text-ocean-400 text-sm">charged only on success</span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <SharkCTAButton
                    href={`/register`}
                    variant="primary"
                    onSharkClick={handleSharkClick}
                  >
                    {t("ctaAccess")}
                  </SharkCTAButton>
                  <SharkCTAButton
                    href={`/docs`}
                    variant="secondary"
                    onSharkClick={handleSharkClick}
                  >
                    {t("ctaDocs")}
                  </SharkCTAButton>
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                  {trustItems.map((item) => (
                    <div key={item} className="flex items-center gap-1.5 text-sm text-ocean-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-electric-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mock API panel */}
              <div className="flex flex-col gap-3">
                <Card variant="bordered" padding="none" className="overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-ocean-500/30 bg-ocean-900/60">
                    <span className="w-3 h-3 rounded-full bg-coral-400/70" />
                    <span className="w-3 h-3 rounded-full bg-amber-400/70" />
                    <span className="w-3 h-3 rounded-full bg-aqua-400/70" />
                    <span className="ml-3 text-xs text-ocean-300 font-mono">POST /v1/generate</span>
                    <Badge variant="info" size="sm" className="ml-auto">Request</Badge>
                  </div>
                  <pre className="px-4 py-4 text-xs font-mono text-electric-300 overflow-x-auto leading-relaxed">
                    {curlCmd}
                  </pre>
                </Card>

                <Card variant="bordered" padding="none" className="overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-ocean-500/30 bg-ocean-900/60">
                    <Badge variant="active" dot size="sm">200 OK</Badge>
                    <span className="ml-auto text-xs text-ocean-300 font-mono">Response</span>
                  </div>
                  <pre className="px-4 py-4 text-xs font-mono text-aqua-300 overflow-x-auto leading-relaxed">
                    {responseJson}
                  </pre>
                </Card>

                <div className="flex items-center gap-3 px-1 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-ocean-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-aqua-400 animate-pulse" />
                    {tApi("pollLabel")}
                  </div>
                  <span className="text-ocean-500">·</span>
                  <div className="text-xs text-ocean-300">{tApi("chargeLabel")}</div>
                  <span className="text-ocean-500">·</span>
                  <div className="text-xs text-ocean-300">{tApi("storageLabel")}</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <WaveDivider variant="gentle" fillColor="#060E1A" />
      </OceanBackground>
      </div>
    </>
  );
}
