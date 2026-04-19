import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface OceanBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  intensity?: "subtle" | "medium" | "strong";
  caustics?: boolean;
}

/**
 * Deep-sea animated background.
 * Uses pure CSS animations — no hydration issues, no JS overhead.
 */
export function OceanBackground({
  intensity = "medium",
  caustics = false,
  children,
  className,
  ...props
}: OceanBackgroundProps) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      {/* Base gradient — deep ocean floor */}
      <div className="absolute inset-0 ocean-gradient" />

      {/* Glow orb 1 — top center (blur replaced with wider gradient) */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-15%",
          left: "20%",
          width: "70%",
          height: "70%",
          background:
            "radial-gradient(ellipse, rgba(0,174,239,0.12) 0%, rgba(0,174,239,0.04) 50%, transparent 70%)",
          animation: "glow-pulse 4s ease-in-out infinite",
          willChange: "opacity",
        }}
      />

      {/* Glow orb 2 — bottom left */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-5%",
          left: "-15%",
          width: "65%",
          height: "65%",
          background:
            "radial-gradient(ellipse, rgba(26,110,192,0.10) 0%, rgba(26,110,192,0.03) 50%, transparent 70%)",
          animation: "glow-pulse 6s ease-in-out infinite reverse",
          willChange: "opacity",
        }}
      />

      {/* Moving wave layer 1 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 40%, rgba(11,25,41,0.5) 100%)",
          animation: "wave 10s ease-in-out infinite",
        }}
      />

      {/* Moving wave layer 2 — offset */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, transparent 60%, rgba(0,174,239,0.04) 100%)",
          animation: "wave 16s ease-in-out infinite reverse",
        }}
      />

      {/* Caustics light effect — optional */}
      {caustics && (
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background: `
              radial-gradient(ellipse 40% 30% at 25% 40%, rgba(0,174,239,0.08) 0%, transparent 60%),
              radial-gradient(ellipse 30% 50% at 75% 60%, rgba(0,144,200,0.06) 0%, transparent 60%)
            `,
            animation: "caustic-flow 25s linear infinite",
          }}
        />
      )}

      {/* Strong intensity — extra glow layer */}
      {intensity === "strong" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 5%, rgba(0,174,239,0.09) 0%, rgba(0,174,239,0.02) 60%, transparent 70%)",
            animation: "glow-pulse 5s ease-in-out infinite",
            willChange: "opacity",
          }}
        />
      )}

      {/* Subtle vignette edge darkening */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(2,8,16,0.6) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
