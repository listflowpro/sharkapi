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
  { id: 1,  size: 6,   x: 8,   bottom: 5,   delay: 0,    duration: 7,  opacity: 0.5, blur: 0  },
  { id: 2,  size: 10,  x: 15,  bottom: 10,  delay: 1.5,  duration: 9,  opacity: 0.4, blur: 1  },
  { id: 3,  size: 4,   x: 22,  bottom: 3,   delay: 0.8,  duration: 6,  opacity: 0.6, blur: 0  },
  { id: 4,  size: 16,  x: 30,  bottom: 8,   delay: 2.5,  duration: 11, opacity: 0.25,blur: 2  },
  { id: 5,  size: 5,   x: 38,  bottom: 2,   delay: 0.3,  duration: 7.5,opacity: 0.5, blur: 0  },
  { id: 6,  size: 8,   x: 45,  bottom: 12,  delay: 1.8,  duration: 8,  opacity: 0.4, blur: 1  },
  { id: 7,  size: 20,  x: 52,  bottom: 5,   delay: 3,    duration: 13, opacity: 0.2, blur: 3  },
  { id: 8,  size: 6,   x: 60,  bottom: 8,   delay: 0.6,  duration: 7,  opacity: 0.5, blur: 0  },
  { id: 9,  size: 12,  x: 68,  bottom: 3,   delay: 2,    duration: 10, opacity: 0.35,blur: 1  },
  { id: 10, size: 4,   x: 75,  bottom: 15,  delay: 1.2,  duration: 6.5,opacity: 0.6, blur: 0  },
  { id: 11, size: 9,   x: 82,  bottom: 6,   delay: 0.9,  duration: 8.5,opacity: 0.4, blur: 1  },
  { id: 12, size: 14,  x: 90,  bottom: 2,   delay: 2.2,  duration: 12, opacity: 0.25,blur: 2  },
  { id: 13, size: 5,   x: 5,   bottom: 20,  delay: 3.5,  duration: 7,  opacity: 0.4, blur: 0  },
  { id: 14, size: 7,   x: 95,  bottom: 10,  delay: 1,    duration: 8,  opacity: 0.5, blur: 0  },
  { id: 15, size: 24,  x: 35,  bottom: 0,   delay: 4,    duration: 15, opacity: 0.15,blur: 4  },
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
            filter: b.blur > 0 ? `blur(${b.blur}px)` : undefined,
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
      {/* Large deep orb — top left */}
      <div
        className="absolute rounded-full"
        style={{
          width: "600px",
          height: "600px",
          top: "-200px",
          left: "-100px",
          background:
            "radial-gradient(circle, rgba(0,174,239,0.07) 0%, transparent 70%)",
          animation: "glow-pulse 6s ease-in-out infinite",
          filter: "blur(30px)",
        }}
      />
      {/* Large deep orb — bottom right */}
      <div
        className="absolute rounded-full"
        style={{
          width: "800px",
          height: "800px",
          bottom: "-300px",
          right: "-200px",
          background:
            "radial-gradient(circle, rgba(26,110,192,0.08) 0%, transparent 70%)",
          animation: "glow-pulse 9s ease-in-out infinite reverse",
          filter: "blur(40px)",
        }}
      />
    </div>
  );
}
