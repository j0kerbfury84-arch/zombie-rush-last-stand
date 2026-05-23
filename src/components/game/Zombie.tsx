import { type CSSProperties } from "react";

type Variant = "runner" | "brute" | "mutant" | "tank" | "titan";

export function Zombie({
  variant = "runner",
  size = 64,
  delay = 0,
  className = "",
  style,
}: {
  variant?: Variant;
  size?: number;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const palette = paletteFor(variant);
  const duration = variant === "tank" || variant === "titan" ? 1.4 : 0.9;

  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      style={{
        width: size,
        height: size,
        animation: `shamble ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        filter: `drop-shadow(0 8px 6px rgb(0 0 0 / 0.6)) drop-shadow(0 0 12px ${palette.glow})`,
        ...style,
      }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
        {/* shadow puddle */}
        <ellipse cx="32" cy="60" rx="14" ry="2.5" fill="rgb(0 0 0 / 0.45)" />
        {/* torso */}
        <path
          d={
            variant === "titan" || variant === "tank"
              ? "M16 32 Q14 50 22 58 L42 58 Q50 50 48 32 Z"
              : "M20 30 Q18 50 24 58 L40 58 Q46 50 44 30 Z"
          }
          fill={palette.body}
          stroke={palette.stroke}
          strokeWidth="1.2"
        />
        {/* shirt tear */}
        <path d="M28 42 L30 50 L34 44 L36 52" stroke={palette.tear} strokeWidth="1" fill="none" />
        {/* arms reaching */}
        <path
          d="M20 32 Q10 36 8 26 L12 24 Q14 30 22 28 Z"
          fill={palette.body}
          stroke={palette.stroke}
          strokeWidth="1"
        />
        <path
          d="M44 32 Q54 36 56 26 L52 24 Q50 30 42 28 Z"
          fill={palette.body}
          stroke={palette.stroke}
          strokeWidth="1"
        />
        {/* head */}
        <circle cx="32" cy="20" r={variant === "titan" ? 14 : variant === "tank" ? 13 : 11} fill={palette.skin} stroke={palette.stroke} strokeWidth="1.2" />
        {/* jaw line */}
        <path d={`M${variant === "titan" ? 22 : 24} 24 Q32 30 ${variant === "titan" ? 42 : 40} 24`} stroke={palette.stroke} strokeWidth="0.8" fill="none" />
        {/* eyes — glowing */}
        <circle cx="28" cy="19" r="2" fill={palette.eye} />
        <circle cx="36" cy="19" r="2" fill={palette.eye} />
        <circle cx="28" cy="19" r="0.9" fill="#fff" opacity="0.9" />
        <circle cx="36" cy="19" r="0.9" fill="#fff" opacity="0.9" />
        {/* mouth */}
        <path d="M27 25 L30 26 L33 25 L36 26 L38 25" stroke={palette.stroke} strokeWidth="0.8" fill="none" />
        {/* blood drip */}
        <path d="M31 27 L31 30" stroke={palette.blood} strokeWidth="1" />
        <circle cx="31" cy="31" r="0.8" fill={palette.blood} />
        {/* hazmat tears for mutant/titan */}
        {(variant === "mutant" || variant === "titan") && (
          <>
            <circle cx="24" cy="38" r="2" fill={palette.glow} opacity="0.6" />
            <circle cx="40" cy="44" r="1.5" fill={palette.glow} opacity="0.6" />
          </>
        )}
      </svg>
    </div>
  );
}

function paletteFor(v: Variant) {
  switch (v) {
    case "brute":
      return { body: "#3a2a18", skin: "#6b8f4c", stroke: "#1a0f08", eye: "#ff3322", blood: "#9a1818", tear: "#5a3a1c", glow: "rgba(255,60,40,0.5)" };
    case "tank":
      return { body: "#2a3018", skin: "#4a6a3a", stroke: "#0a1004", eye: "#ff5a22", blood: "#9a1818", tear: "#4a5a28", glow: "rgba(255,90,40,0.5)" };
    case "mutant":
      return { body: "#1a2a1a", skin: "#7afc4a", stroke: "#0a1408", eye: "#ffea00", blood: "#9a1818", tear: "#3a5a2a", glow: "rgba(120,255,90,0.7)" };
    case "titan":
      return { body: "#181a14", skin: "#5a8f3a", stroke: "#000", eye: "#ff1a00", blood: "#b91818", tear: "#3a4a28", glow: "rgba(255,40,20,0.8)" };
    case "runner":
    default:
      return { body: "#2a1f14", skin: "#7ea65a", stroke: "#10080a", eye: "#ffcc00", blood: "#8a1414", tear: "#4a3a1a", glow: "rgba(140,200,80,0.5)" };
  }
}
