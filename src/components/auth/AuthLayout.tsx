import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { BubbleField, GlowOrbs } from "@/components/effects/BubbleField";
import { Badge } from "@/components/ui/Badge";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

const BENEFIT_KEYS = ["async", "wallet", "tokens", "trial"] as const;

function AuthPanel() {
  const t = useTranslations("auth.panel");

  return (
    <div className="hidden lg:flex flex-col relative overflow-hidden bg-ocean-900 border-r border-ocean-500/20">
      {/* Ocean animated background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #020810 0%, #060E1A 40%, #0B1929 70%, #0F2238 100%)",
        }}
      />
      <GlowOrbs />
      <BubbleField count={10} />

      {/* Caustic overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 30% 60%, rgba(0,174,239,0.08) 0%, transparent 60%)",
          animation: "caustic-flow 20s linear infinite",
        }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col h-full px-10 py-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group w-fit">
          <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-105">
            <Image src="/logo.png" alt="SharkApi.dev" fill sizes="40px" className="object-contain" />
          </div>
          <span className="text-xl font-bold">
            <span className="text-ocean-100">Shark</span>
            <span className="text-electric-400">Api.dev</span>
          </span>
        </Link>

        {/* Center content */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Large glow orb behind tagline */}
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              height: "400px",
              top: "50%",
              transform: "translateY(-50%)",
              background:
                "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,174,239,0.1) 0%, transparent 70%)",
              filter: "blur(20px)",
              animation: "glow-pulse 5s ease-in-out infinite",
            }}
            aria-hidden="true"
          />

          <div className="relative">
            <Badge variant="info" dot className="mb-6">SharkApi.dev</Badge>

            <h2 className="text-4xl font-bold text-ocean-50 leading-tight mb-4">
              {t("tagline")}
            </h2>

            <div className="w-16 h-0.5 bg-gradient-to-r from-electric-400 to-transparent mb-8" />

            <ul className="space-y-4">
              {BENEFIT_KEYS.map((key) => (
                <li key={key} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-electric-400/15 border border-electric-400/30 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 10 10" className="w-3 h-3 text-electric-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-sm text-ocean-200">{t(`benefits.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="relative">
          <p className="text-xs text-ocean-400">
            © {new Date().getFullYear()} SharkApi.dev
          </p>
        </div>
      </div>
    </div>
  );
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1fr] xl:grid-cols-[55%_45%]">
      <AuthPanel />
      <div className="flex items-center justify-center px-6 py-12 bg-ocean-900 relative overflow-hidden">
        {/* Subtle background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,174,239,0.04) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="w-full max-w-[420px] relative">
          {children}
        </div>
      </div>
    </div>
  );
}
