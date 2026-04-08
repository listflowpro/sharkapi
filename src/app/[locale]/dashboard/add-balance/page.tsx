"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDashboardUser } from "@/components/dashboard/DashboardUserProvider";
import { cn } from "@/lib/utils";

const PRESETS = [10, 20, 50, 100];

export default function AddBalancePage() {
  const t = useTranslations("dashboard.addBalance");
  const user = useDashboardUser();
  const balance = user.walletBalance ?? 0;
  const [selected, setSelected] = useState<number | null>(20);
  const [custom, setCustom] = useState("");
  const [customError, setCustomError] = useState("");
  const [mode, setMode] = useState<"preset" | "custom">("preset");

  const effectiveAmount = mode === "preset" ? selected : (parseInt(custom) || null);

  const validateCustom = (val: string) => {
    const num = parseInt(val);
    if (!val) { setCustomError(""); return; }
    if (isNaN(num) || num < 10) { setCustomError("Minimum is $10"); return; }
    if (num % 10 !== 0) { setCustomError("Must be a multiple of $10 (e.g. 10, 20, 30, 50...)"); return; }
    setCustomError("");
  };

  const handleCustomChange = (val: string) => {
    setCustom(val);
    validateCustom(val);
  };

  const canProceed = effectiveAmount !== null && !customError && effectiveAmount >= 10 && effectiveAmount % 10 === 0;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-sm text-gray-700 mt-0.5">{t("subtitle")}</p>
      </div>

      {/* Current balance */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-ocean-800 border border-ocean-600/60">
        <div className="w-8 h-8 rounded-full bg-aqua-400/10 border border-aqua-400/30 flex items-center justify-center">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-aqua-400">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p className="text-sm text-white">Current balance</p>
          <p className="text-sm font-bold text-aqua-400">${balance.toFixed(2)}</p>
        </div>
        {effectiveAmount && canProceed && (
          <>
            <span className="text-white mx-1">→</span>
            <p className="text-sm font-bold text-electric-400">
              ${(balance + effectiveAmount).toFixed(2)}
            </p>
          </>
        )}
      </div>

      {/* Mode tabs */}
      <div className="flex rounded-xl bg-ocean-800 border border-ocean-600/60 p-1 gap-1">
        {(["preset", "custom"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150",
              mode === m
                ? "bg-electric-400/20 text-electric-400 border border-electric-400/30"
                : "text-white hover:text-white"
            )}
          >
            {m === "preset" ? t("preset") : t("custom")}
          </button>
        ))}
      </div>

      {mode === "preset" ? (
        /* Preset buttons */
        <div className="grid grid-cols-2 gap-3">
          {PRESETS.map((amt) => (
            <button
              key={amt}
              onClick={() => setSelected(amt)}
              className={cn(
                "relative py-5 rounded-2xl border-2 transition-all duration-150 group",
                selected === amt
                  ? "border-electric-400 bg-electric-400/10 shadow-[0_0_20px_rgba(0,174,239,0.15)]"
                  : "border-ocean-600/60 bg-ocean-800/40 hover:border-ocean-400/60 hover:bg-ocean-800/40"
              )}
            >
              {selected === amt && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-electric-400" />
              )}
              <p className={cn(
                "text-3xl font-black",
                selected === amt ? "text-electric-400" : "text-white group-hover:text-white"
              )}>
                ${amt}
              </p>
              <p className="text-sm text-white mt-1">
                {amt === 10  ? "~500 × 1K jobs" :
                 amt === 20  ? "~1000 × 1K jobs" :
                 amt === 50  ? "~2500 × 1K jobs" :
                               "~5000 × 1K jobs"}
              </p>
            </button>
          ))}
        </div>
      ) : (
        /* Custom input */
        <div className="space-y-2">
          <label className="text-sm text-white font-medium">{t("custom")}</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white font-bold">$</span>
            <input
              type="number"
              value={custom}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder={t("customPlaceholder")}
              min={10}
              step={10}
              className={cn(
                "w-full pl-8 pr-4 py-3 rounded-xl bg-ocean-800 border text-white placeholder-ocean-500",
                "focus:outline-none focus:ring-1 transition-all text-sm",
                customError
                  ? "border-coral-400/60 focus:ring-coral-400/40 focus:border-coral-400"
                  : "border-gray-300 focus:ring-electric-400/40 focus:border-electric-400/60"
              )}
            />
          </div>
          {customError && <p className="text-sm text-coral-400">{customError}</p>}
        </div>
      )}

      {/* Rules */}
      <div className="rounded-xl border border-ocean-600/60 bg-ocean-800/40 p-4 space-y-2">
        {[t("rules.min"), t("rules.multiple"), t("rules.stripe")].map((rule) => (
          <div key={rule} className="flex items-center gap-2">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-electric-400 shrink-0">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-white">{rule}</span>
          </div>
        ))}
      </div>

      {/* Accepted cards */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-xs text-white/40 mr-1">Accepted cards</span>
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded bg-white text-[11px] font-black tracking-tight text-blue-800 leading-none h-7">VISA</span>
        <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded bg-white h-7">
          <span className="w-4 h-4 rounded-full bg-red-500" />
          <span className="w-4 h-4 rounded-full bg-yellow-400 -ml-2" />
        </span>
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded bg-blue-600 text-[10px] font-black text-white tracking-tight leading-none h-7">AMEX</span>
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded bg-orange-500 text-[10px] font-black text-white tracking-tight leading-none h-7">DISCOVER</span>
      </div>

      {/* CTA */}
      <button
        disabled={!canProceed}
        className={cn(
          "w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200",
          canProceed
            ? "bg-electric-400 text-white hover:bg-electric-300 shadow-[0_0_24px_rgba(0,174,239,0.3)] cursor-pointer"
            : "bg-ocean-800/40 text-white cursor-not-allowed"
        )}
      >
        {canProceed
          ? `${t("proceed")} — $${effectiveAmount} USD`
          : t("proceed")}
      </button>

      {/* Security note */}
      <div className="rounded-xl border border-ocean-600/40 bg-ocean-800/30 p-4 flex items-start gap-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-electric-400 shrink-0 mt-0.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-white">Secure payment by Stripe</p>
          <p className="text-xs text-white/50 mt-0.5">
            Your payment is processed by Stripe, Inc. — a PCI DSS Level 1 certified provider.
            We never store your card details. All transactions are encrypted via TLS.
          </p>
        </div>
      </div>

      {canProceed && (
        <p className="text-center text-sm text-white">{t("stripeNote")}</p>
      )}
    </div>
  );
}
