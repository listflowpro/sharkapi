"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useDashboardUser } from "@/components/dashboard/DashboardUserProvider";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-white">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full px-3.5 py-2.5 rounded-xl bg-ocean-800 border text-white placeholder-ocean-500 text-sm",
          "focus:outline-none focus:ring-1 transition-all",
          disabled
            ? "border-ocean-600/60 text-white cursor-not-allowed"
            : "border-gray-300 focus:ring-electric-400/40 focus:border-electric-400/60"
        )}
      />
    </div>
  );
}

export default function ProfilePage() {
  const t = useTranslations("dashboard.profile");
  const searchParams = useSearchParams();
  const user = useDashboardUser();
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const resetFlow = searchParams.get("reset") === "1";
  const activeTokens = 0;
  const safeUser = user ?? {
    avatarInitials: "U",
    email: "user@example.com",
    
    
    memberSince: "Unknown",
    name: "User",
  };

  const handlePasswordUpdate = async () => {
    if (newPwd.length < 8) {
      setPwdError("New password must be at least 8 characters");
      return;
    }

    if (newPwd !== confirmPwd) {
      setPwdError("Passwords do not match");
      return;
    }

    setPwdLoading(true);
    setPwdError("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPwd });

    if (error) {
      setPwdError(error.message);
      setPwdLoading(false);
      return;
    }

    setPwdSuccess(true);
    setPwdLoading(false);
    setNewPwd("");
    setConfirmPwd("");
    setTimeout(() => setPwdSuccess(false), 4000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-sm text-gray-700 mt-0.5">{t("subtitle")}</p>
      </div>

      {resetFlow && (
        <div className="rounded-2xl border border-electric-400/30 bg-electric-400/10 p-4 text-sm text-electric-400">
          Your reset link is confirmed. Choose a new password below to finish signing back in.
        </div>
      )}

      <div className="rounded-2xl border border-ocean-600/60 bg-ocean-800 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-electric-400/15 border-2 border-electric-400/40 flex items-center justify-center">
            <span className="text-2xl font-black text-electric-400">{safeUser.avatarInitials}</span>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{safeUser.name}</p>
            <p className="text-sm text-white">{safeUser.email}</p>
            <p className="text-sm text-gray-700 mt-0.5">Member since {safeUser.memberSince}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label={t("email")} value={safeUser.email} disabled />
          <InputField label={t("memberSince")} value={safeUser.memberSince} disabled />
        </div>
      </div>

      <div className="rounded-2xl border border-ocean-600/60 bg-ocean-800 p-6">
        <h2 className="text-sm font-semibold text-white mb-4">{t("accountStats")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: t("totalRequests"), value: '0', color: "text-electric-400" },
            { label: t("totalSpend"), value: '$0.00', color: "text-aqua-400" },
            { label: "Active tokens", value: String(activeTokens), color: "text-white" },
            {
              label: "Free trials",
              value: `${0}/${3}`,
              color: "text-amber-400",
            },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-ocean-700 border border-ocean-600/50 p-4 text-center">
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
              <p className="text-sm text-gray-700 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-ocean-600/60 bg-ocean-800 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">{t("changePassword")}</h2>

        {pwdSuccess && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-aqua-400/10 border border-aqua-400/30">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-aqua-400 shrink-0">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-aqua-400">{t("passwordUpdated")}</p>
          </div>
        )}

        <InputField
          label={t("newPassword")}
          type="password"
          value={newPwd}
          onChange={setNewPwd}
          placeholder="Min. 8 characters"
        />
        <InputField
          label={t("confirmPassword")}
          type="password"
          value={confirmPwd}
          onChange={setConfirmPwd}
          placeholder="Repeat new password"
        />

        {pwdError && <p className="text-sm text-coral-400">{pwdError}</p>}

        <button
          onClick={handlePasswordUpdate}
          disabled={pwdLoading}
          className="w-full py-2.5 rounded-xl bg-electric-400/15 border border-electric-400/30 text-sm font-semibold text-electric-400 hover:bg-electric-400/25 transition-colors disabled:opacity-60"
        >
          {pwdLoading ? "Updating..." : t("savePassword")}
        </button>
      </div>

      <div className="rounded-2xl border border-coral-400/30 bg-coral-400/5 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-coral-400">{t("dangerZone")}</h2>
        <p className="text-sm text-white">{t("deleteWarning")}</p>

        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
            className="px-4 py-2 rounded-xl border border-coral-400/40 text-sm text-coral-400 hover:bg-coral-400/10 transition-colors"
          >
            {t("deleteAccount")}
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <p className="text-sm text-coral-300 self-center">Are you absolutely sure?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-ocean-600/60 text-sm text-white hover:bg-ocean-800/40 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 rounded-xl bg-coral-500/80 text-sm font-semibold text-white hover:bg-coral-500 transition-colors">
                Yes, delete my account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
