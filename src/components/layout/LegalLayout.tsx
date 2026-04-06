import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WaveDivider } from "@/components/effects/WaveDivider";
import { GlowOrbs } from "@/components/effects/BubbleField";
import type { ReactNode } from "react";

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  toc?: { id: string; label: string }[];
  children: ReactNode;
}

export function LegalLayout({ title, subtitle, lastUpdated, toc = [], children }: LegalLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <div className="relative pt-28 pb-12 bg-ocean-900 border-b border-ocean-500/20 overflow-hidden">
          <GlowOrbs />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <p className="text-xs font-mono text-ocean-400 mb-2">Last updated: {lastUpdated}</p>
            <h1 className="text-4xl font-bold text-ocean-50 mb-3">{title}</h1>
            <p className="text-ocean-200">{subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-ocean-900 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={toc.length > 0 ? "grid lg:grid-cols-[1fr_220px] gap-12 items-start" : ""}>
              {/* Main content */}
              <article className="prose-legal">
                {children}
              </article>

              {/* Table of Contents */}
              {toc.length > 0 && (
                <aside className="hidden lg:block">
                  <div className="sticky top-24 rounded-xl border border-ocean-500/25 bg-ocean-800/40 p-5">
                    <p className="text-[11px] font-semibold text-ocean-300 uppercase tracking-wider mb-3">
                      Contents
                    </p>
                    <ul className="flex flex-col gap-2">
                      {toc.map((item) => (
                        <li key={item.id}>
                          <a
                            href={`#${item.id}`}
                            className="text-xs text-ocean-400 hover:text-electric-400 transition-colors leading-relaxed"
                          >
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ── Shared prose components ──────────────────────────── */
export function LSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mb-10 scroll-mt-28">
      <h2 className="text-lg font-semibold text-ocean-50 mb-3 pb-2 border-b border-ocean-500/20">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

export function LP({ children }: { children: ReactNode }) {
  return <p className="text-sm text-ocean-200 leading-relaxed">{children}</p>;
}

export function LList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2 pl-1">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-ocean-200">
          <span className="text-electric-400 shrink-0 mt-1">→</span>
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}
