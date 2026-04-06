"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const t = useTranslations("nav");

  const NAV_LINKS = [
    { label: t("product"), href: `/#features` },
    { label: t("pricing"), href: `/pricing`   },
    { label: t("docs"),    href: `/docs`      },
    { label: t("trial"),   href: `/trial`     },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "glass-dark border-b border-ocean-500/30 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group shrink-0"
            aria-label="SharkApi.dev Home"
          >
            <div className="transition-transform duration-300 group-hover:scale-105 relative w-9 h-9">
              <Image
                src="/logo.png"
                alt="SharkApi.dev"
                fill
                sizes="36px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-lg font-bold tracking-tight select-none">
              <span className="text-ocean-100">Shark</span>
              <span className="text-electric-400">Api.dev</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "px-3.5 py-1.5 text-sm font-medium rounded-lg",
                  "text-ocean-200 hover:text-ocean-50",
                  "hover:bg-ocean-600/40",
                  "transition-all duration-200"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">{t("login")}</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">{t("startBuilding")}</Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={cn(
              "md:hidden flex flex-col gap-1.5 p-2 rounded-lg",
              "text-ocean-200 hover:text-ocean-50 hover:bg-ocean-600/40",
              "transition-all duration-200"
            )}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span className={cn("block h-0.5 w-5 bg-current transition-all duration-300 origin-center", menuOpen && "translate-y-2 rotate-45")} />
            <span className={cn("block h-0.5 w-5 bg-current transition-all duration-300",               menuOpen && "opacity-0 scale-x-0")} />
            <span className={cn("block h-0.5 w-5 bg-current transition-all duration-300 origin-center", menuOpen && "-translate-y-2 -rotate-45")} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden transition-all duration-300 overflow-hidden",
          menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="glass-dark border-t border-ocean-500/30 px-4 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "px-3 py-2.5 text-sm font-medium rounded-lg",
                "text-ocean-200 hover:text-ocean-50 hover:bg-ocean-600/40",
                "transition-all duration-200"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-ocean-500/30 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" size="md" className="w-full">{t("login")}</Button>
            </Link>
            <Link href="/register" onClick={() => setMenuOpen(false)}>
              <Button variant="primary" size="md" className="w-full">{t("startBuilding")}</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
