"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { normalizeAuthError } from "@/lib/auth/normalize-auth-error";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3l14 14M8.5 8.7A2.5 2.5 0 0 0 12 12M6 5.5C3.8 6.9 2 10 2 10s3 6 8 6c1.5 0 2.9-.4 4.1-1.1" />
      <path d="M14.7 14.4C16.5 12.9 18 10 18 10s-3-6-8-6c-.6 0-1.2.1-1.8.2" />
    </svg>
  );
}

export function LoginForm() {
  const t      = useTranslations("auth.login");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const signOutMessage = searchParams.get("signed_out") === "1" ? "You have been signed out." : "";
  const callbackError =
    searchParams.get("error") === "auth_callback"
      ? "We couldn't finish that sign-in link. Please try signing in again."
      : "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(normalizeAuthError(authError.message));
      setLoading(false);
      return;
    }

    router.replace(`/dashboard`);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ocean-50 mb-1">{t("title")}</h1>
        <p className="text-ocean-300 text-sm">{t("subtitle")}</p>
      </div>

      {signOutMessage && (
        <div className="px-4 py-3 rounded-xl border border-aqua-400/30 bg-aqua-400/10 text-sm text-aqua-400">
          {signOutMessage}
        </div>
      )}

      {/* Error */}
      {(error || callbackError) && (
        <div className="px-4 py-3 rounded-xl border border-coral-400/40 bg-coral-400/10 text-sm text-coral-400">
          {error || callbackError}
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

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-ocean-100">{t("password")}</label>
            <Link
              href={`/forgot-password`}
              className="text-xs text-electric-400 hover:text-electric-300 transition-colors"
            >
              {t("forgotPassword")}
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              placeholder={t("passwordPlaceholder")}
              autoComplete="current-password"
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
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              <EyeIcon open={showPw} />
            </button>
          </div>
        </div>

        {/* Remember me */}
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <div
            className={cn(
              "w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150 shrink-0",
              remember
                ? "bg-electric-400 border-electric-400"
                : "border-ocean-500/60 group-hover:border-ocean-400"
            )}
            onClick={() => setRemember((r) => !r)}
          >
            {remember && (
              <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none" stroke="white" strokeWidth="2">
                <path d="M2 5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-sm text-ocean-300 select-none" onClick={() => setRemember((r) => !r)}>
            {t("remember")}
          </span>
        </label>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full mt-1"
        >
          {t("submit")}
        </Button>
      </form>

      {/* Sign up link */}
      <p className="text-center text-sm text-ocean-300">
        {t("noAccount")}{" "}
        <Link
          href={`/register`}
          className="text-electric-400 hover:text-electric-300 font-medium transition-colors"
        >
          {t("signUp")}
        </Link>
      </p>
    </div>
  );
}
