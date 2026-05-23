import { useEffect, useMemo, useRef } from "react";
import { Survivor } from "./Survivor";
import { Zombie } from "./Zombie";
import { type EventTier, type BossTier } from "@/lib/game/engine";
import bgDesktop from "@/assets/outbreak-bg.jpg";
import bgPortrait from "@/assets/outbreak-bg-portrait.jpg";

type Phase = "idle" | "running" | "crashed" | "escaped" | "won";

export function GameStage({
  multiplier,
  phase,
  event,
  boss,
  rapidFire,
  overdrive,
  shakeKey,
  flashCrash,
  flashEscape,
  portrait,
}: {
  multiplier: number;
  phase: Phase;
  event: EventTier | null;
  boss: BossTier | null;
  rapidFire: boolean;
  overdrive: boolean;
  shakeKey: number;
  flashCrash: number;
  flashEscape: number;
  portrait: boolean;
}) {
  const stageRef = useRef<HTMLDivElement>(null);

  // Trigger shake when shakeKey changes
  useEffect(() => {
    if (!stageRef.current || shakeKey === 0) return;
    const cls = multiplier >= 25 ? "shake-heavy" : "shake";
    stageRef.current.classList.remove("shake", "shake-heavy");
    void stageRef.current.offsetWidth;
    stageRef.current.classList.add(cls);
  }, [shakeKey, multiplier]);

  // Zombie spawn count scales with multiplier; capped for mobile.
  const zombieCount = useMemo(() => {
    if (phase !== "running") return 0;
    if (multiplier >= 100) return portrait ? 14 : 22;
    if (multiplier >= 50)  return portrait ? 11 : 17;
    if (multiplier >= 25)  return portrait ? 9 : 13;
    if (multiplier >= 10)  return portrait ? 7 : 10;
    if (multiplier >= 5)   return portrait ? 5 : 7;
    if (multiplier >= 2)   return portrait ? 4 : 5;
    return portrait ? 2 : 3;
  }, [multiplier, phase, portrait]);

  const zombies = useMemo(() => {
    return Array.from({ length: zombieCount }, (_, i) => {
      const variant: "runner" | "brute" | "mutant" | "tank" | "titan" =
        multiplier >= 100 ? (i % 4 === 0 ? "titan" : i % 3 === 0 ? "mutant" : "tank") :
        multiplier >= 50  ? (i % 3 === 0 ? "mutant" : i % 2 === 0 ? "tank" : "brute") :
        multiplier >= 25  ? (i % 3 === 0 ? "tank" : i % 2 === 0 ? "brute" : "runner") :
        multiplier >= 10  ? (i % 4 === 0 ? "brute" : "runner") :
        "runner";
      // Distribute across stage width with depth (y)
      const lane = i % 3;
      const xPct = 15 + ((i * 37) % 70);
      const yPct = portrait ? 18 + lane * 12 + ((i * 13) % 8) : 22 + lane * 10 + ((i * 11) % 8);
      const size = (variant === "titan" ? 120 : variant === "tank" ? 96 : variant === "brute" ? 80 : 64)
        * (portrait ? 0.7 : 1);
      return { id: `${variant}-${i}-${zombieCount}`, variant, xPct, yPct, size, delay: (i % 5) * 0.13 };
    });
  }, [zombieCount, multiplier, portrait]);

  const bg = portrait ? bgPortrait : bgDesktop;
  const nightMode = multiplier >= 25 && phase === "running";
  const mutationMode = multiplier >= 50 && phase === "running";
  const finalStand = multiplier >= 100 && phase === "running";

  return (
    <div
      ref={stageRef}
      className={`relative w-full h-full overflow-hidden scanlines vignette ${finalStand ? "heartbeat" : ""} ${overdrive ? "overdrive" : ""}`}
      style={{
        background: `var(--gradient-stage)`,
        borderRadius: portrait ? "1rem" : "1.25rem",
        border: "1px solid oklch(0.30 0.04 145 / 0.4)",
        boxShadow: "0 30px 60px -20px rgb(0 0 0 / 0.8), 0 0 0 1px oklch(0.78 0.24 142 / 0.08) inset",
      }}
    >
      {/* Background painting */}
      <img
        src={bg}
        alt=""
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: nightMode ? 0.35 : 0.75,
          filter: `saturate(${mutationMode ? 1.4 : 1}) contrast(${nightMode ? 1.3 : 1.1}) brightness(${nightMode ? 0.6 : 0.85})`,
          transition: "opacity 0.6s, filter 0.6s",
        }}
      />

      {/* Toxic fog layer */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: "60%",
          background: "linear-gradient(180deg, transparent 0%, oklch(0.78 0.28 142 / 0.0) 40%, oklch(0.55 0.25 142 / 0.25) 100%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Emergency siren wash at high mult */}
      {(multiplier >= 50 || phase === "crashed") && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ animation: "siren-pulse 0.9s ease-in-out infinite" }}
        />
      )}
      {multiplier >= 10 && multiplier < 50 && phase === "running" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ animation: "hazmat-pulse 1.4s ease-in-out infinite" }}
        />
      )}

      {/* Crash flash */}
      {flashCrash > 0 && (
        <div
          key={`crash-${flashCrash}`}
          className="absolute inset-0 pointer-events-none"
          style={{ animation: "crash-flash 0.6s ease-out" }}
        />
      )}
      {/* Escape flash */}
      {flashEscape > 0 && (
        <div
          key={`escape-${flashEscape}`}
          className="absolute inset-0 pointer-events-none"
          style={{ animation: "escape-flash 0.8s ease-out" }}
        />
      )}

      {/* Zombies */}
      {zombies.map((z) => (
        <div
          key={z.id}
          className="absolute spawn-rise"
          style={{
            left: `${z.xPct}%`,
            top: `${z.yPct}%`,
            transform: "translate(-50%, -50%)",
            zIndex: 5 + Math.floor(z.yPct / 5),
          }}
        >
          <Zombie variant={z.variant} size={z.size} delay={z.delay} />
        </div>
      ))}

      {/* Damage numbers when rapid fire */}
      {rapidFire && phase === "running" && (
        <DamageNumbers count={overdrive ? 4 : 2} />
      )}

      {/* Survivor + barricade at bottom center */}
      <div
        className="absolute left-1/2 pointer-events-none"
        style={{
          bottom: portrait ? "8%" : "6%",
          transform: `translateX(-50%) scale(${portrait ? 0.85 : 1.1})`,
          zIndex: 30,
        }}
      >
        <Survivor firing={phase === "running"} />
      </div>

      {/* Boss banner */}
      {boss && phase === "running" && (
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          style={{ animation: "feed-slide 0.4s ease-out" }}
        >
          <div
            className="px-4 py-1.5 rounded-full font-display tracking-[0.3em] text-xs md:text-sm flex items-center gap-2"
            style={{
              background: "linear-gradient(90deg, oklch(0.62 0.28 25 / 0.9), oklch(0.40 0.24 18 / 0.9))",
              border: "1px solid oklch(0.85 0.20 88 / 0.4)",
              color: "var(--bone)",
              boxShadow: "0 4px 20px oklch(0.62 0.28 25 / 0.6)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            BOSS · {boss.name}
          </div>
        </div>
      )}

      {/* Event overlay slot rendered by parent */}
      {event && phase === "running" && (
        <div
          key={`event-${event.key}-${multiplier.toFixed(0)}`}
          className="absolute inset-0 pointer-events-none flex items-center justify-center z-50"
        />
      )}

      {/* Scanline sweep on high mult */}
      {finalStand && (
        <div
          className="absolute inset-x-0 h-px pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, var(--blood-glow), transparent)",
            boxShadow: "0 0 20px var(--blood-glow)",
            animation: "scanline 2s linear infinite",
          }}
        />
      )}
    </div>
  );
}

function DamageNumbers({ count }: { count: number }) {
  const nums = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: `${Date.now()}-${i}`,
        value: Math.floor(15 + Math.random() * 90),
        x: 20 + Math.random() * 60,
        y: 25 + Math.random() * 40,
        fx: (Math.random() - 0.5) * 30,
      })),
    [count],
  );
  return (
    <>
      {nums.map((n) => (
        <div
          key={n.id}
          className="absolute font-display text-stroke-dark pointer-events-none"
          style={{
            left: `${n.x}%`,
            top: `${n.y}%`,
            color: "var(--gold)",
            fontSize: "clamp(1rem, 2.5vw, 1.6rem)",
            textShadow: "0 0 12px var(--gold)",
            animation: "float-fade 1.2s ease-out forwards",
            ["--fx" as never]: `${n.fx}px`,
            zIndex: 25,
          }}
        >
          -{n.value}
        </div>
      ))}
    </>
  );
}
