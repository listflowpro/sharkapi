"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/users",        label: "Users",        icon: "👥" },
  { href: "/admin/jobs",         label: "Jobs",         icon: "⚙️" },
  { href: "/admin/transactions", label: "Transactions", icon: "💳" },
  { href: "/admin/models",       label: "Models",       icon: "🧠" },
  { href: "/admin/providers",    label: "Providers",    icon: "🔌" },
];

function NavItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname();
  const active = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
        active
          ? "bg-electric-400/15 text-electric-400 border border-electric-400/25"
          : "text-white/70 hover:text-white hover:bg-ocean-600/40 border border-transparent"
      )}
    >
      <span className="text-base leading-none">{icon}</span>
      {label}
    </Link>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#00AEEF" }}>
      {/* Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-56 shrink-0 fixed left-0 top-0 bottom-0 border-r border-ocean-500/25"
        style={{ backgroundColor: "rgb(6 14 26 / 0.99)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-ocean-700/40">
          <div className="relative w-7 h-7">
            <Image src="/logo.png" alt="SharkApi" fill sizes="28px" className="object-contain" />
          </div>
          <div>
            <span className="text-sm font-bold text-ocean-100">Shark</span>
            <span className="text-sm font-bold text-electric-400">Api</span>
            <span className="ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded bg-coral-400/20 text-coral-400 border border-coral-400/30">
              ADMIN
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* Back to dashboard */}
        <div className="px-3 pb-5 border-t border-ocean-700/40 pt-3 space-y-0.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-ocean-600/40 transition-all"
          >
            ← Dashboard
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/30 hover:text-white/70 hover:bg-ocean-600/40 transition-all"
          >
            ← Site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-56 min-w-0">
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 flex items-center gap-3 px-6 h-14 border-b border-ocean-700/60"
          style={{ backgroundColor: "rgb(6 14 26 / 0.99)" }}
        >
          {/* Mobile nav — simple */}
          <div className="flex gap-1 overflow-x-auto lg:hidden">
            {NAV.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
          <div className="hidden lg:block text-sm text-white/30 font-mono">
            Admin Panel
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
