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

      {/* Glow orb 1 — top center, electric blue */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-10%",
          left: "30%",
          width: "60%",
          height: "60%",
          background:
            "radial-gradient(ellipse, rgba(0,174,239,0.18) 0%, transparent 70%)",
          animation: "glow-pulse 4s ease-in-out infinite",
          filter: "blur(40px)",
        }}
      />

      {/* Glow orb 2 — bottom left, medium blue */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "0%",
          left: "-10%",
          width: "55%",
          height: "55%",
          background:
            "radial-gradient(ellipse, rgba(26,110,192,0.15) 0%, transparent 70%)",
          animation: "glow-pulse 6s ease-in-out infinite reverse",
          filter: "blur(50px)",
        }}
      />

      {/* Glow orb 3 — bottom right, subtle */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "10%",
          right: "-5%",
          width: "45%",
          height: "45%",
          background:
            "radial-gradient(ellipse, rgba(0,153,204,0.1) 0%, transparent 70%)",
          animation: "glow-pulse 8s ease-in-out infinite",
          filter: "blur(60px)",
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
              "radial-gradient(ellipse 50% 30% at 50% 10%, rgba(0,174,239,0.12) 0%, transparent 70%)",
            animation: "glow-pulse 5s ease-in-out infinite",
            filter: "blur(20px)",
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
