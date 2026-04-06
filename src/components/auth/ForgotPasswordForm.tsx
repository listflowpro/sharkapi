"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { normalizeAuthError } from "@/lib/auth/normalize-auth-error";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const t      = useTranslations("auth.forgotPassword");

  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const redirectTo = new URL("/auth/confirm", window.location.origin);
    redirectTo.searchParams.set("next", "/dashboard/profile?reset=1");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo.toString(),
    });

    if (authError) {
      setError(normalizeAuthError(authError.message));
      setLoading(false);
      return;
    }

    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center gap-6">
        {/* Animated success icon */}
        <div className="relative w-20 h-20">
          <div
            className="absolute inset-0 rounded-full border-2 border-aqua-400/30"
            style={{ animation: "ripple 1.5s ease-out infinite" }}
          />
          <div className="w-20 h-20 rounded-full bg-aqua-400/10 border-2 border-aqua-400/50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9 text-aqua-400" stroke="currentColor" strokeWidth="2">
              <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8" strokeLinecap="round" />
              <rect x="3" y="6" width="18" height="13" rx="2" />
            </svg>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-ocean-50 mb-2">{t("successTitle")}</h2>
          <p className="text-ocean-300 text-sm mb-1">{t("successSubtitle")}</p>
          <p className="text-electric-400 font-medium text-sm">{email}</p>
        </div>

        <p className="text-xs text-ocean-400 max-w-xs">{t("successNote")}</p>

        <Link href={`/login`} className="text-sm text-electric-400 hover:text-electric-300 font-medium transition-colors">
          ← {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ocean-50 mb-1">{t("title")}</h1>
        <p className="text-ocean-300 text-sm">{t("subtitle")}</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl border border-coral-400/40 bg-coral-400/10 text-sm text-coral-400">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label={t("email")}
          type="email"
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          {t("submit")}
        </Button>
      </form>

      <Link
        href={`/login`}
        className="text-center text-sm text-ocean-400 hover:text-electric-400 transition-colors"
      >
        ← {t("backToLogin")}
      </Link>
    </div>
  );
}
