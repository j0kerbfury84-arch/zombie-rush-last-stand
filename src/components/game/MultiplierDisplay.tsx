import { useEffect, useState } from "react";

export function MultiplierDisplay({
  value,
  state,
  pulseKey,
}: {
  value: number;
  state: "idle" | "running" | "crashed" | "escaped" | "won";
  pulseKey: number;
}) {
  const [pop, setPop] = useState(0);
  useEffect(() => {
    setPop((p) => p + 1);
  }, [pulseKey]);

  const color =
    state === "crashed" ? "var(--blood)" :
    state === "escaped" ? "var(--gold)" :
    state === "won" ? "var(--gold)" :
    value >= 50 ? "var(--gold)" :
    value >= 10 ? "var(--hazmat-glow)" :
    "var(--hazmat)";

  const glow =
    state === "crashed" ? "0 0 60px var(--blood-glow), 0 0 120px var(--blood-glow)" :
    state === "escaped" || state === "won" ? "0 0 60px var(--gold), 0 0 120px var(--gold)" :
    value >= 50 ? "0 0 50px var(--gold), 0 0 100px var(--gold)" :
    value >= 10 ? "0 0 40px var(--hazmat-glow), 0 0 80px var(--hazmat-glow)" :
    "0 0 30px var(--hazmat), 0 0 60px var(--hazmat)";

  const animClass = value >= 50 ? "mult-pop-gold" : "mult-pop";

  return (
    <div className="flex flex-col items-center">
      <div
        className="font-display tracking-tight leading-none text-stroke-dark"
        key={pop}
        style={{
          fontSize: "clamp(4rem, 14vw, 11rem)",
          color,
          textShadow: glow,
          animation: `${animClass} 0.45s ease-out`,
          fontWeight: 900,
        }}
      >
        {value.toFixed(2)}<span style={{ fontSize: "0.55em", opacity: 0.85 }}>x</span>
      </div>
      {state === "crashed" && (
        <div className="font-display text-2xl md:text-4xl tracking-[0.3em] mt-2"
             style={{ color: "var(--blood-glow)", textShadow: "0 0 20px var(--blood-glow)" }}>
          INFECTED · ROUND OVER
        </div>
      )}
      {state === "escaped" && (
        <div className="font-display text-2xl md:text-4xl tracking-[0.3em] mt-2 animate-pulse"
             style={{ color: "var(--gold)", textShadow: "0 0 25px var(--gold)" }}>
          ESCAPE SUCCESSFUL
        </div>
      )}
      {state === "won" && (
        <div className="font-display text-xl md:text-3xl tracking-[0.3em] mt-2"
             style={{ color: "var(--gold)", textShadow: "0 0 20px var(--gold)" }}>
          SURVIVED
        </div>
      )}
    </div>
  );
}
