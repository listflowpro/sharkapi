import { cn } from "@/lib/utils";

type WaveVariant = "down" | "up" | "gentle" | "sharp";

interface WaveDividerProps {
  variant?: WaveVariant;
  fillColor?: string;
  topColor?: string;
  className?: string;
  animated?: boolean;
}

const wavePaths: Record<WaveVariant, string> = {
  down: "M0,0 C200,80 400,80 600,40 C800,0 1000,60 1200,40 C1400,20 1600,60 1920,20 L1920,120 L0,120 Z",
  up:   "M0,120 C200,40 400,40 600,80 C800,120 1000,60 1200,80 C1400,100 1600,40 1920,100 L1920,0 L0,0 Z",
  gentle: "M0,60 C320,100 640,20 960,60 C1280,100 1600,20 1920,60 L1920,120 L0,120 Z",
  sharp:  "M0,0 L960,80 L1920,0 L1920,120 L0,120 Z",
};

export function WaveDivider({
  variant = "gentle",
  fillColor = "#060E1A",
  className,
  animated = true,
}: WaveDividerProps) {
  return (
    <div
      className={cn("w-full overflow-hidden leading-none", className)}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1920 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-full h-16 md:h-24", animated && "animate-wave")}
      >
        {/* Subtle electric tint layer behind main wave */}
        <path
          d={wavePaths[variant]}
          fill="rgba(0,174,239,0.04)"
          transform="translate(0, -8)"
        />
        {/* Main wave */}
        <path d={wavePaths[variant]} fill={fillColor} />
      </svg>
    </div>
  );
}

/** Decorative horizontal glow line */
export function GlowLine({ className }: { className?: string }) {
  return (
    <div className={cn("w-full h-px relative my-2", className)} aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-electric-400/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-electric-400/20 to-transparent blur-sm" />
    </div>
  );
}
