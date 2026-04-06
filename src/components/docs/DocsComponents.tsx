"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/* ── Headings ─────────────────────────────────────────── */
export function H1({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h1 id={id} className="text-3xl md:text-4xl font-bold text-ocean-50 mb-4 leading-tight">
      {children}
    </h1>
  );
}
export function H2({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="text-xl font-semibold text-ocean-50 mt-10 mb-4 pt-4 border-t border-ocean-500/20 scroll-mt-24">
      {children}
    </h2>
  );
}
export function H3({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h3 id={id} className="text-base font-semibold text-ocean-100 mt-6 mb-3 scroll-mt-24">
      {children}
    </h3>
  );
}
export function P({ children }: { children: ReactNode }) {
  return <p className="text-ocean-200 text-sm leading-relaxed mb-4">{children}</p>;
}
export function Lead({ children }: { children: ReactNode }) {
  return <p className="text-ocean-200 text-base leading-relaxed mb-6">{children}</p>;
}

/* ── Inline code ──────────────────────────────────────── */
export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="bg-ocean-700/60 text-electric-300 text-[12px] font-mono px-1.5 py-0.5 rounded border border-ocean-500/30">
      {children}
    </code>
  );
}

/* ── Code block with copy ─────────────────────────────── */
interface CodeBlockProps {
  code: string;
  lang?: string;
  title?: string;
  color?: string;
}
export function CodeBlock({ code, lang = "bash", title, color = "text-electric-300" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-xl border border-ocean-500/30 overflow-hidden mb-6">
      <div className="flex items-center justify-between px-4 py-2.5 bg-ocean-800/80 border-b border-ocean-500/20">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-coral-400/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-aqua-400/60" />
          {title && <span className="ml-2 text-xs text-ocean-400 font-mono">{title}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-ocean-500 uppercase tracking-wide">{lang}</span>
          <button
            onClick={handle}
            className={cn(
              "text-[10px] px-2 py-0.5 rounded border transition-all duration-150",
              copied
                ? "border-aqua-400/40 text-aqua-400"
                : "border-ocean-500/40 text-ocean-400 hover:text-ocean-200"
            )}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
      <pre className={cn("px-5 py-4 text-xs font-mono overflow-x-auto leading-relaxed bg-ocean-900/60", color)}>
        {code}
      </pre>
    </div>
  );
}

/* ── Callout boxes ────────────────────────────────────── */
type CalloutType = "info" | "warning" | "danger" | "success";
const calloutStyles: Record<CalloutType, { wrap: string; icon: string }> = {
  info:    { wrap: "border-electric-400/30 bg-electric-400/5  text-electric-300", icon: "ℹ" },
  warning: { wrap: "border-amber-400/30   bg-amber-400/5    text-amber-300",    icon: "⚠" },
  danger:  { wrap: "border-coral-400/30   bg-coral-400/5    text-coral-300",    icon: "⛔" },
  success: { wrap: "border-aqua-400/30    bg-aqua-400/5     text-aqua-300",     icon: "✓" },
};
export function Callout({ type = "info", children }: { type?: CalloutType; children: ReactNode }) {
  const s = calloutStyles[type];
  return (
    <div className={cn("rounded-xl border px-4 py-3 flex gap-3 mb-6 text-sm leading-relaxed", s.wrap)}>
      <span className="shrink-0 font-bold mt-0.5">{s.icon}</span>
      <div>{children}</div>
    </div>
  );
}

/* ── Endpoint badge ───────────────────────────────────── */
const methodColors: Record<string, string> = {
  POST:   "bg-electric-400/20 text-electric-400 border-electric-400/40",
  GET:    "bg-aqua-400/20    text-aqua-400    border-aqua-400/40",
  DELETE: "bg-coral-400/20   text-coral-400   border-coral-400/40",
  PUT:    "bg-amber-400/20   text-amber-400   border-amber-400/40",
};
export function Endpoint({ method, path }: { method: string; path: string }) {
  return (
    <div className="flex items-center gap-3 mb-6 p-3 rounded-xl border border-ocean-500/30 bg-ocean-800/40 font-mono flex-wrap">
      <span className={cn("text-xs font-bold px-2 py-0.5 rounded border", methodColors[method] ?? methodColors.GET)}>
        {method}
      </span>
      <span className="text-sm text-ocean-100">{path}</span>
    </div>
  );
}

/* ── Parameter table ──────────────────────────────────── */
interface ParamRow {
  name: string;
  type: string;
  required?: boolean;
  desc: string;
}
export function ParamTable({ rows }: { rows: ParamRow[] }) {
  return (
    <div className="rounded-xl border border-ocean-500/30 overflow-hidden mb-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-ocean-800/60 border-b border-ocean-500/20">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-ocean-300 uppercase tracking-wide">Parameter</th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-ocean-300 uppercase tracking-wide">Type</th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-ocean-300 uppercase tracking-wide">Required</th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-ocean-300 uppercase tracking-wide">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.name} className={cn("border-b border-ocean-500/10 last:border-0", i % 2 === 1 && "bg-ocean-800/20")}>
              <td className="px-4 py-3 font-mono text-xs text-electric-300">{row.name}</td>
              <td className="px-4 py-3 font-mono text-xs text-amber-300">{row.type}</td>
              <td className="px-4 py-3 text-xs">
                {row.required
                  ? <span className="text-coral-400 font-medium">Required</span>
                  : <span className="text-ocean-400">Optional</span>}
              </td>
              <td className="px-4 py-3 text-xs text-ocean-200 leading-relaxed">{row.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Error table ──────────────────────────────────────── */
interface ErrorRow { code: string; status: number; desc: string }
export function ErrorTable({ rows }: { rows: ErrorRow[] }) {
  return (
    <div className="rounded-xl border border-ocean-500/30 overflow-hidden mb-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-ocean-800/60 border-b border-ocean-500/20">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-ocean-300 uppercase tracking-wide">Error Code</th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-ocean-300 uppercase tracking-wide">HTTP Status</th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-ocean-300 uppercase tracking-wide">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.code} className={cn("border-b border-ocean-500/10 last:border-0", i % 2 === 1 && "bg-ocean-800/20")}>
              <td className="px-4 py-3 font-mono text-xs text-coral-400">{row.code}</td>
              <td className="px-4 py-3 font-mono text-xs text-amber-300">{row.status}</td>
              <td className="px-4 py-3 text-xs text-ocean-200">{row.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Divider ──────────────────────────────────────────── */
export function DocsDivider() {
  return <div className="my-8 border-t border-ocean-500/15" />;
}
