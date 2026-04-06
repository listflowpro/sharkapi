import type { RefObject } from "react";

/*
 * SharkMouthLogo — SVG-only, zero SVG filters.
 *
 * SVG feGaussianBlur is software-rendered and the #1 cause of scroll
 * jank on this kind of component. All "glow" is now handled by:
 *   • CSS drop-shadow on the wrapper div (GPU-composited)
 *   • Higher-opacity strokes for jaw/teeth edges
 *   • A single low-cost radial gradient for the aura
 *
 * Teeth are in SEPARATE groups from their jaw bodies so they can be
 * z-ordered above both jaws while still moving in sync via GSAP.
 *
 * ViewBox: 0 0 480 260  ·  Centerline: y=130
 */

const UPPER_TEETH = [
  { x:  98, h: 16, w:  8 },
  { x: 135, h: 20, w:  9 },
  { x: 170, h: 24, w: 10 },
  { x: 205, h: 26, w: 10 },
  { x: 240, h: 29, w: 11 },
  { x: 275, h: 26, w: 10 },
  { x: 310, h: 24, w: 10 },
  { x: 345, h: 20, w:  9 },
  { x: 382, h: 16, w:  8 },
];

const LOWER_TEETH = [
  { x: 116, h: 18, w:  8 },
  { x: 153, h: 22, w:  9 },
  { x: 188, h: 25, w: 10 },
  { x: 222, h: 27, w: 10 },
  { x: 258, h: 27, w: 10 },
  { x: 292, h: 25, w: 10 },
  { x: 327, h: 22, w:  9 },
  { x: 364, h: 18, w:  8 },
];

/* Circuit spine + branches — plain solid lines, no dash animation */
const CIRCUIT_LINES: [number, number, number, number][] = [
  [82, 130, 398, 130],
  [140, 130, 140, 110], [110, 110, 175, 110],
  [125, 130, 125, 150], [125, 150, 155, 150],
  [110, 110, 110, 100],
  [240, 130, 240, 106],
  [214, 118, 266, 118],
  [214, 118, 214, 106],
  [266, 118, 266, 106],
  [340, 130, 340, 110], [305, 110, 370, 110],
  [355, 130, 355, 150], [325, 150, 355, 150],
  [370, 110, 370, 100],
];

const CIRCUIT_NODES: [number, number, number][] = [
  [140, 130, 2.5], [240, 130, 2.5], [340, 130, 2.5],
  [110, 110, 1.8], [175, 110, 1.8],
  [214, 118, 1.5], [266, 118, 1.5],
  [240, 106, 1.5],
  [305, 110, 1.8], [370, 110, 1.8],
  [125, 150, 1.5], [355, 150, 1.5],
];

export interface SharkMouthLogoProps {
  upperJawRef:   RefObject<SVGGElement | null>;
  lowerJawRef:   RefObject<SVGGElement | null>;
  upperTeethRef: RefObject<SVGGElement | null>;
  lowerTeethRef: RefObject<SVGGElement | null>;
  circuitRef:    RefObject<SVGGElement | null>;
  glowRef:       RefObject<SVGGElement | null>;
  className?: string;
  style?: React.CSSProperties;
}

export function SharkMouthLogo({
  upperJawRef,
  lowerJawRef,
  upperTeethRef,
  lowerTeethRef,
  circuitRef,
  glowRef,
  className,
  style,
}: SharkMouthLogoProps) {
  const CL = 130;

  return (
    <svg
      viewBox="0 0 480 260"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ overflow: "visible", ...style }}
    >
      <defs>
        {/* Jaw gradients — no filter, just color depth */}
        <linearGradient id="shk-upperJaw" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%"   stopColor="#010810" />
          <stop offset="70%"  stopColor="#061526" />
          <stop offset="100%" stopColor="#0D2644" />
        </linearGradient>
        <linearGradient id="shk-lowerJaw" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%"   stopColor="#010810" />
          <stop offset="70%"  stopColor="#061526" />
          <stop offset="100%" stopColor="#0D2644" />
        </linearGradient>

        {/* Mouth void */}
        <radialGradient id="shk-void" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#000305" />
          <stop offset="100%" stopColor="#010C18" />
        </radialGradient>

        {/* Outer aura — cheap radial gradient only */}
        <radialGradient id="shk-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#00AEEF" stopOpacity="0"    />
          <stop offset="60%"  stopColor="#00AEEF" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#00AEEF" stopOpacity="0"    />
        </radialGradient>

        {/* Teeth gradient — tip tinted blue */}
        <linearGradient id="shk-teethUp" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%"   stopColor="#CCE8FF" />
          <stop offset="100%" stopColor="#EEF6FF" />
        </linearGradient>
        <linearGradient id="shk-teethDn" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%"   stopColor="#CCE8FF" />
          <stop offset="100%" stopColor="#EEF6FF" />
        </linearGradient>
      </defs>

      {/* 1 · Mouth void */}
      <ellipse cx="240" cy={CL} rx="202" ry="56" fill="url(#shk-void)" />

      {/* 2 · Circuit core — opacity driven by GSAP, no filter */}
      <g
        ref={circuitRef}
        stroke="#00AEEF"
        strokeWidth="0.85"
        fill="none"
        opacity="0.22"
      >
        {CIRCUIT_LINES.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
        {CIRCUIT_NODES.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="#00AEEF" stroke="none" />
        ))}
      </g>

      {/* 3 · Lower jaw body */}
      <g ref={lowerJawRef}>
        <path
          d={`M 32,${CL} C 72,212 166,252 240,252 C 314,252 408,212 448,${CL} Z`}
          fill="url(#shk-lowerJaw)"
        />
        {/* Edge stroke — replaces the blur-filtered glow path */}
        <path
          d={`M 32,${CL} C 72,212 166,252 240,252 C 314,252 408,212 448,${CL}`}
          fill="none"
          stroke="#00AEEF"
          strokeWidth="1.4"
          strokeOpacity="0.55"
        />
      </g>

      {/* 4 · Upper jaw body */}
      <g ref={upperJawRef}>
        <path
          d={`M 32,${CL} C 72,48 166,8 240,8 C 314,8 408,48 448,${CL} Z`}
          fill="url(#shk-upperJaw)"
        />
        <path
          d={`M 32,${CL} C 72,48 166,8 240,8 C 314,8 408,48 448,${CL}`}
          fill="none"
          stroke="#00AEEF"
          strokeWidth="1.4"
          strokeOpacity="0.55"
        />
      </g>

      {/* 5 · Lower teeth — rendered ABOVE both jaw bodies */}
      <g ref={lowerTeethRef}>
        <g fill="url(#shk-teethDn)" opacity="0.92">
          {LOWER_TEETH.map((t, i) => (
            <polygon
              key={i}
              points={`${t.x - t.w},${CL} ${t.x + t.w},${CL} ${t.x},${CL - t.h}`}
            />
          ))}
        </g>
        {/* Thin highlight stroke — no blur needed */}
        <g fill="none" stroke="#AADCFF" strokeWidth="0.5" strokeOpacity="0.5">
          {LOWER_TEETH.map((t, i) => (
            <polygon
              key={i}
              points={`${t.x - t.w},${CL} ${t.x + t.w},${CL} ${t.x},${CL - t.h}`}
            />
          ))}
        </g>
      </g>

      {/* 6 · Upper teeth — rendered ABOVE both jaw bodies */}
      <g ref={upperTeethRef}>
        <g fill="url(#shk-teethUp)" opacity="0.92">
          {UPPER_TEETH.map((t, i) => (
            <polygon
              key={i}
              points={`${t.x - t.w},${CL} ${t.x + t.w},${CL} ${t.x},${CL + t.h}`}
            />
          ))}
        </g>
        <g fill="none" stroke="#AADCFF" strokeWidth="0.5" strokeOpacity="0.5">
          {UPPER_TEETH.map((t, i) => (
            <polygon
              key={i}
              points={`${t.x - t.w},${CL} ${t.x + t.w},${CL} ${t.x},${CL + t.h}`}
            />
          ))}
        </g>
      </g>

      {/* 7 · Outer glow aura — opacity animated by GSAP, no filter */}
      <g ref={glowRef} opacity="0.38">
        <ellipse
          cx="240" cy={CL}
          rx="230" ry="112"
          fill="url(#shk-aura)"
        />
        {/* Simple ring stroke — very cheap */}
        <ellipse
          cx="240" cy={CL}
          rx="210" ry="82"
          fill="none"
          stroke="#00AEEF"
          strokeWidth="0.7"
          strokeOpacity="0.3"
        />
      </g>
    </svg>
  );
}
