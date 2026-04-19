import { cn } from "@/lib/utils";

interface Bubble {
  id: number;
  size: number;     /* px */
  x: number;       /* % from left */
  bottom: number;  /* % from bottom */
  delay: number;   /* s */
  duration: number;/* s */
  opacity: number;
  blur: number;    /* px */
}

/* Pre-defined bubbles — static to avoid hydration mismatch */
const BUBBLES: Bubble[] = [
  { id: 1,  size: 6,   x: 8,   bottom: 5,   delay: 0,    duration: 7,  opacity: 0.45, blur: 0 },
  { id: 2,  size: 10,  x: 20,  bottom: 10,  delay: 1.5,  duration: 9,  opacity: 0.3,  blur: 0 },
  { id: 3,  size: 5,   x: 35,  bottom: 3,   delay: 0.8,  duration: 6,  opacity: 0.5,  blur: 0 },
  { id: 4,  size: 8,   x: 50,  bottom: 8,   delay: 2.0,  duration: 8,  opacity: 0.35, blur: 0 },
  { id: 5,  size: 5,   x: 65,  bottom: 2,   delay: 0.3,  duration: 7,  opacity: 0.45, blur: 0 },
  { id: 6,  size: 9,   x: 80,  bottom: 12,  delay: 1.8,  duration: 10, opacity: 0.3,  blur: 0 },
  { id: 7,  size: 6,   x: 92,  bottom: 5,   delay: 3.0,  duration: 8,  opacity: 0.4,  blur: 0 },
  { id: 8,  size: 4,   x: 12,  bottom: 18,  delay: 2.5,  duration: 7,  opacity: 0.35, blur: 0 },
];

interface BubbleFieldProps {
  className?: string;
  count?: number; /* use first N bubbles */
}

/**
 * Decorative rising bubble particles.
 * All CSS-driven — no JS randomness = no hydration issues.
 */
export function BubbleField({ className, count = BUBBLES.length }: BubbleFieldProps) {
  const bubbles = BUBBLES.slice(0, count);

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
      aria-hidden="true"
    >
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="absolute rounded-full border border-electric-400/20"
          style={{
            width:  `${b.size}px`,
            height: `${b.size}px`,
            left:   `${b.x}%`,
            bottom: `${b.bottom}%`,
            opacity: b.opacity,
            filter: undefined,
            background:
              "radial-gradient(circle at 30% 30%, rgba(0,174,239,0.3), rgba(0,120,180,0.1))",
            animation: `bubble-rise ${b.duration}s ease-in-out ${b.delay}s infinite`,
            boxShadow: "0 0 4px rgba(0,174,239,0.2)",
          }}
        />
      ))}
    </div>
  );
}

/** Large glowing orbs for background depth */
export function GlowOrbs({ className }: { className?: string }) {
  return (
    <div
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
      aria-hidden="true"
    >
      {/* Large deep orb — top left (no blur — use large radial-gradient instead) */}
      <div
        className="absolute rounded-full"
        style={{
          width: "700px",
          height: "700px",
          top: "-250px",
          left: "-150px",
          background:
            "radial-gradient(circle, rgba(0,174,239,0.06) 0%, rgba(0,174,239,0.02) 50%, transparent 70%)",
          animation: "glow-pulse 6s ease-in-out infinite",
          willChange: "opacity",
        }}
      />
      {/* Large deep orb — bottom right */}
      <div
        className="absolute rounded-full"
        style={{
          width: "900px",
          height: "900px",
          bottom: "-350px",
          right: "-250px",
          background:
            "radial-gradient(circle, rgba(26,110,192,0.07) 0%, rgba(26,110,192,0.02) 50%, transparent 70%)",
          animation: "glow-pulse 9s ease-in-out infinite reverse",
          willChange: "opacity",
        }}
      />
    </div>
  );
}
