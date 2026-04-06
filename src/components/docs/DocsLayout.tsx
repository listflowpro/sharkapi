"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import type { ReactNode } from "react";

interface NavItem {
  labelKey: string;
  href: string;
}
interface NavSection {
  titleKey: string;
  items: NavItem[];
}

function buildNav(locale: string): NavSection[] {
  return [
    {
      titleKey: "gettingStarted",
      items: [
        { labelKey: "quickStart",     href: `/docs` },
        { labelKey: "authentication", href: `/docs/auth` },
      ],
    },
    {
      titleKey: "endpoints",
      items: [
        { labelKey: "generate",      href: `/docs/generate` },
        { labelKey: "jobStatus",     href: `/docs/job-status` },
        { labelKey: "walletBalance", href: `/docs/wallet` },
        { labelKey: "usageHistory",  href: `/docs/history` },
      ],
    },
    {
      titleKey: "reference",
      items: [
        { labelKey: "errorCodes",  href: `/docs/errors` },
        { labelKey: "moderation",  href: `/docs/moderation` },
      ],
    },
  ];
}

interface DocsLayoutProps {
  children: ReactNode;
  onThisPage?: { id: string; label: string }[];
}

export function DocsLayout({ children, onThisPage = [] }: DocsLayoutProps) {
  const t        = useTranslations("docs.sidebar");
  const locale   = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = buildNav(locale);

  const SidebarContent = () => (
    <nav className="flex flex-col gap-6">
      {nav.map((section) => (
        <div key={section.titleKey}>
          <p className="text-[11px] font-semibold text-ocean-300 uppercase tracking-wider mb-2 px-3">
            {t(section.titleKey)}
          </p>
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block px-3 py-1.5 rounded-lg text-sm transition-all duration-150",
                      active
                        ? "bg-electric-400/15 text-electric-400 border border-electric-400/25"
                        : "text-ocean-300 hover:text-ocean-100 hover:bg-ocean-600/40"
                    )}
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <Navbar />

      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-12 h-12 rounded-full bg-electric-400 text-ocean-900 shadow-[0_0_20px_rgba(0,174,239,0.5)] flex items-center justify-center"
          aria-label="Toggle docs navigation"
        >
          <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            {open
              ? <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
              : <><path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" /></>}
          </svg>
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex min-h-screen pt-16">
        {/* Left sidebar — desktop */}
        <aside className={cn(
          "hidden lg:flex flex-col w-64 xl:w-72 shrink-0",
          "sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto",
          "border-r border-ocean-500/20 bg-ocean-900/50"
        )}>
          <div className="p-5">
            <SidebarContent />
          </div>
        </aside>

        {/* Mobile sidebar */}
        <aside className={cn(
          "lg:hidden fixed left-0 top-16 bottom-0 z-30 w-72",
          "overflow-y-auto bg-ocean-900 border-r border-ocean-500/30",
          "transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-5 pt-6">
            <SidebarContent />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex">
          <main className="flex-1 px-6 md:px-10 py-10 max-w-3xl">
            {children}
          </main>

          {/* Right "On this page" */}
          {onThisPage.length > 0 && (
            <aside className="hidden xl:block w-56 shrink-0 py-10 pr-6">
              <div className="sticky top-24">
                <p className="text-[11px] font-semibold text-ocean-300 uppercase tracking-wider mb-3">
                  {t("onThisPage")}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {onThisPage.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="text-xs text-ocean-400 hover:text-electric-400 transition-colors duration-150"
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

      <Footer />
    </>
  );
}
