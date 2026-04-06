"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useDashboardUser } from "@/components/dashboard/DashboardUserProvider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/* ── Icons ────────────────────────────────────────────────────────── */
function Icon({ name, className }: { name: string; className?: string }) {
  const icons: Record<string, ReactNode> = {
    overview: (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M2 4a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm10 0a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V4zM2 14a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4zm10 0a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4z" />
      </svg>
    ),
    generate: (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" />
      </svg>
    ),
    wallet: (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
      </svg>
    ),
    key: (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
      </svg>
    ),
    history: (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
    chart: (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
    user: (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    ),
    logout: (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
      </svg>
    ),
    menu: (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
    x: (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    ),
    back: (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
    ),
  };
  return icons[name] ?? null;
}



/* ── Nav link ─────────────────────────────────────────────────────── */
function NavLink({
  href, icon, label, onClick,
}: {
  href: string; icon: string; label: string; onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group",
        isActive
          ? "bg-electric-400/15 text-electric-400 border border-electric-400/25"
          : "text-white hover:text-white hover:bg-ocean-600/40 border border-transparent"
      )}
    >
      <Icon
        name={icon}
        className={cn(
          "w-4 h-4 shrink-0 transition-colors",
          isActive ? "text-electric-400" : "text-ocean-200 group-hover:text-white"
        )}
      />
      {label}
    </Link>
  );
}

/* ── Nav section ─────────────────────────────────────────────────── */
function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="px-3 pt-4 pb-1 text-xs font-bold uppercase tracking-widest text-white/60">
        {label}
      </p>
      {children}
    </div>
  );
}

/* ── Sidebar ─────────────────────────────────────────────────────── */
function Sidebar({ onClose }: { onClose?: () => void }) {
  const t = useTranslations("dashboard.nav");
  const router = useRouter();
  const user = useDashboardUser();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  const prefix = `/dashboard`;
  const safeUser = user ?? {
    avatarInitials: "U",
    email: "user@example.com",
    name: "User",
  };

  const handleSignOut = async () => {
    if (signingOut) {
      return;
    }

    setSignOutError("");
    setSigningOut(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
      setSignOutError(error.message);
      setSigningOut(false);
      return;
    }

    router.replace(`/login?signed_out=1`);
    router.refresh();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 shrink-0">
        <div className="relative w-8 h-8">
          <Image src="/logo.png" alt="SharkApi.dev" fill sizes="32px" className="object-contain" />
        </div>
        <span className="text-base font-bold tracking-tight">
          <span className="text-ocean-100">Shark</span>
          <span className="text-electric-400">Api.dev</span>
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-1 rounded text-ocean-400 hover:text-ocean-200 hover:bg-ocean-600/40 transition-colors"
          >
            <Icon name="x" className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 overflow-y-auto py-1">
        {/* Top items */}
        <div className="space-y-0.5 mb-1">
          <NavLink href={`/dashboard`} icon="overview" label={t("overview")} onClick={onClose} />
          <NavLink href={`${prefix}/generate`}   icon="generate" label={t("generate")} onClick={onClose} />
        </div>

        <NavSection label={t("billing")}>
          <NavLink href={`${prefix}/wallet`}  icon="wallet"  label={t("wallet")}  onClick={onClose} />
        </NavSection>

        <NavSection label={t("api")}>
          <NavLink href={`${prefix}/tokens`}  icon="key"     label={t("tokens")}  onClick={onClose} />
          <NavLink href={`${prefix}/history`} icon="history" label={t("history")} onClick={onClose} />
        </NavSection>

        <NavSection label={t("analytics")}>
          <NavLink href={`${prefix}/usage`}   icon="chart"   label={t("usage")}   onClick={onClose} />
        </NavSection>

        <NavSection label={t("account")}>
          <NavLink href={`${prefix}/profile`} icon="user"    label={t("profile")} onClick={onClose} />
          {user?.role === "admin" && (
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-coral-400 hover:text-coral-300 hover:bg-coral-400/10 border border-coral-400/20 transition-all duration-150"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Admin Panel
            </Link>
          )}
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-ocean-200 hover:text-white hover:bg-ocean-600/40 border border-transparent transition-all duration-150"
          >
            <Icon name="back" className="w-4 h-4 text-ocean-400" />
            {t("backToSite")}
          </Link>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-coral-400 hover:text-coral-300 hover:bg-coral-400/10 border border-transparent transition-all duration-150 w-full"
          >
            <Icon name="logout" className="w-4 h-4" />
            {t("signOut")}
          </button>
          {signOutError && (
            <p className="px-3 pt-1 text-xs text-coral-300">
              {signOutError}
            </p>
          )}
        </NavSection>
      </nav>

      {/* User strip */}
      <div className="px-3 pb-4 shrink-0">
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-ocean-600/30 border border-ocean-500/25">
          <div className="w-7 h-7 rounded-full bg-electric-400/20 border border-electric-400/40 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-electric-400">{safeUser.avatarInitials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{safeUser.name}</p>
            <p className="text-xs text-white/60 truncate">{safeUser.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── DashboardLayout ─────────────────────────────────────────────── */
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const t = useTranslations("dashboard");
  const router = useRouter();
  const user = useDashboardUser();
  const balance = user?.walletBalance ?? 0;
  const avatarInitials = user?.avatarInitials ?? "U";

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#00AEEF" }}>
      {/* Desktop sidebar — darker for visual hierarchy */}
      <aside
        className="hidden lg:flex flex-col w-60 shrink-0 border-r border-ocean-500/25 fixed left-0 top-0 bottom-0 z-30"
        style={{ backgroundColor: "rgb(6 14 26 / 0.99)" }}
      >
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-ocean-950/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50 border-r border-ocean-500/25 transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backgroundColor: "rgb(6 14 26 / 0.99)" }}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-60 min-w-0">
        {/* Header */}
        <header
          className="sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-6 h-14 border-b border-ocean-700/60"
          style={{ backgroundColor: "rgb(6 14 26 / 0.99)", backdropFilter: "blur(12px)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-white hover:text-white hover:bg-ocean-700/50 transition-colors"
          >
            <Icon name="menu" className="w-5 h-5" />
          </button>

          {/* Center nav links */}
          <div className="flex-1 hidden sm:flex items-center justify-center gap-1">
            <Link href="/pricing" className="px-3 py-1.5 text-sm font-medium text-white hover:text-white hover:bg-ocean-700/50 rounded-lg transition-all">Pricing</Link>
            <Link href="/docs" className="px-3 py-1.5 text-sm font-medium text-white hover:text-white hover:bg-ocean-700/50 rounded-lg transition-all">Docs</Link>
            <Link href="mailto:support@shakrapi.dev" className="px-3 py-1.5 text-sm font-medium text-white hover:text-white hover:bg-ocean-700/50 rounded-lg transition-all">Support</Link>
          </div>

          {/* Balance — links to wallet */}
          <Link
            href={`/dashboard/wallet`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ocean-700/60 border border-ocean-600/50 hover:border-aqua-400/50 hover:bg-ocean-700 transition-all"
          >
            <span className="text-sm text-white hidden sm:block">{t("header.balance")}</span>
            <span className="text-base font-bold text-aqua-400">${balance.toFixed(2)}</span>
          </Link>

          <button
            onClick={() => router.push(`/dashboard/profile`)}
            className="w-8 h-8 rounded-full bg-electric-400/20 border border-electric-400/40 flex items-center justify-center hover:border-electric-400/70 transition-colors"
          >
            <span className="text-[11px] font-bold text-electric-400">{avatarInitials}</span>
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
