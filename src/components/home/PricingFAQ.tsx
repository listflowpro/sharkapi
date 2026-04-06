"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

export function PricingFAQ() {
  const t = useTranslations("pricingPage.faq");
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {FAQ_KEYS.map((key) => {
        const isOpen = open === key;
        return (
          <div
            key={key}
            className={cn(
              "rounded-xl border transition-all duration-200 overflow-hidden",
              isOpen
                ? "border-electric-400/40 bg-ocean-700/40"
                : "border-ocean-500/30 bg-ocean-800/30 hover:border-ocean-400/50"
            )}
          >
            <button
              onClick={() => setOpen(isOpen ? null : key)}
              className="w-full flex items-center justify-between px-5 py-4 text-left group"
              aria-expanded={isOpen}
            >
              <span className={cn(
                "text-sm font-medium transition-colors duration-150",
                isOpen ? "text-electric-400" : "text-ocean-100 group-hover:text-ocean-50"
              )}>
                {t(`items.${key}.q`)}
              </span>
              <span
                className={cn(
                  "ml-4 shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200",
                  isOpen
                    ? "border-electric-400/60 bg-electric-400/10 rotate-45"
                    : "border-ocean-500/60 text-ocean-400"
                )}
              >
                <svg viewBox="0 0 10 10" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="5" y1="1" x2="5" y2="9" />
                  <line x1="1" y1="5" x2="9" y2="5" />
                </svg>
              </span>
            </button>

            <div
              className={cn(
                "transition-all duration-200 overflow-hidden",
                isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <p className="px-5 pb-4 text-sm text-ocean-200 leading-relaxed">
                {t(`items.${key}.a`)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
