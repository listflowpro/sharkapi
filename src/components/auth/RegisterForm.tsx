"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { deriveDisplayNameFromEmail } from "@/lib/auth/dashboard-user";
import { normalizeAuthError } from "@/lib/auth/normalize-auth-error";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const BENEFIT_KEYS = ["benefit1", "benefit2", "benefit3", "benefit4"] as const;

function PasswordStrength({ password }: { password: string }) {
  const len     = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasNum   = /[0-9]/.test(password);
  const hasSpec  = /[^a-zA-Z0-9]/.test(password);

  const score = [len >= 8, hasUpper, hasNum, hasSpec].filter(Boolean).length;

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-coral-400", "bg-amber-400", "bg-electric-400", "bg-aqua-400"];

  if (!password) return null;

  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i <= score ? colors[score] : "bg-ocean-600"
            )}
          />
        ))}
      </div>
      {score > 0 && (
        <p className={cn("text-[10px]", score <= 1 ? "text-coral-400" : score === 2 ? "text-amber-400" : score === 3 ? "text-electric-400" : "text-aqua-400")}>
          {labels[score]}
        </p>
      )}
    </div>
  );
}

export function RegisterForm() {
  const t      = useTranslations("auth.register");
  const router = useRouter();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [terms,    setTerms]    = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!terms) return;
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: deriveDisplayNameFromEmail(email),
        },
      },
    });

    if (authError) {
      setError(normalizeAuthError(authError.message));
      setLoading(false);
      return;
    }

    if (data.session) {
      router.replace(`/dashboard`);
      router.refresh();
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-ocean-50 mb-1">Check your email</h1>
          <p className="text-ocean-300 text-sm">
            We sent a confirmation link to <span className="text-electric-400">{email}</span>.
            Click it to activate your account.
          </p>
        </div>
        <div className="rounded-xl border border-aqua-400/20 bg-aqua-400/5 p-4 text-sm text-aqua-400">
          After confirming your email you can{" "}
          <Link href={`/login`} className="underline font-medium">sign in here</Link>.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ocean-50 mb-1">{t("title")}</h1>
        <p className="text-ocean-300 text-sm">{t("subtitle")}</p>
      </div>

      {/* Free benefits */}
      <div className="rounded-xl border border-electric-400/20 bg-electric-400/5 p-4">
        <p className="text-xs font-semibold text-electric-400 mb-2.5 uppercase tracking-wide">
          {t("freeBenefits")}
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {BENEFIT_KEYS.map((key) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-ocean-200">
              <span className="w-1.5 h-1.5 rounded-full bg-aqua-400 shrink-0" />
              {t(key)}
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
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

        {/* Password with strength */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ocean-100">{t("password")}</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              placeholder={t("passwordPlaceholder")}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                "w-full rounded-xl h-10 px-3 pr-10 text-sm",
                "bg-ocean-800/60 border border-ocean-500/40",
                "text-ocean-50 placeholder:text-ocean-300",
                "transition-all duration-200",
                "focus:outline-none focus:border-electric-400/60",
                "focus:shadow-[0_0_0_3px_rgba(0,174,239,0.12)]",
                "hover:border-ocean-400/60"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ocean-400 hover:text-ocean-200 transition-colors"
              tabIndex={-1}
            >
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
                {showPw
                  ? <><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z" /><circle cx="10" cy="10" r="2.5" /></>
                  : <><path d="M3 3l14 14M8.5 8.7A2.5 2.5 0 0 0 12 12M6 5.5C3.8 6.9 2 10 2 10s3 6 8 6c1.5 0 2.9-.4 4.1-1.1" /><path d="M14.7 14.4C16.5 12.9 18 10 18 10s-3-6-8-6c-.6 0-1.2.1-1.8.2" /></>
                }
              </svg>
            </button>
          </div>
          <PasswordStrength password={password} />
        </div>

        <Input
          label={t("confirmPassword")}
          type="password"
          placeholder={t("confirmPasswordPlaceholder")}
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {/* Terms checkbox */}
        <label className="flex items-start gap-2.5 cursor-pointer group mt-1">
          <div
            className={cn(
              "w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150 shrink-0 mt-0.5",
              terms
                ? "bg-electric-400 border-electric-400"
                : "border-ocean-500/60 group-hover:border-ocean-400"
            )}
            onClick={() => setTerms((v) => !v)}
          >
            {terms && (
              <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none" stroke="white" strokeWidth="2">
                <path d="M2 5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-sm text-ocean-300 select-none leading-relaxed" onClick={() => setTerms((v) => !v)}>
            {t("terms")}{" "}
            <Link href={`/terms`} className="text-electric-400 hover:underline" onClick={(e) => e.stopPropagation()}>
              {t("termsLink")}
            </Link>
            {" "}{t("and")}{" "}
            <Link href={`/privacy`} className="text-electric-400 hover:underline" onClick={(e) => e.stopPropagation()}>
              {t("privacyLink")}
            </Link>
          </span>
        </label>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={!terms}
          className="w-full"
        >
          {t("submit")}
        </Button>
      </form>

      {/* Login link */}
      <p className="text-center text-sm text-ocean-300">
        {t("hasAccount")}{" "}
        <Link href={`/login`} className="text-electric-400 hover:text-electric-300 font-medium transition-colors">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}
