import { useEffect, useMemo, useRef } from "react";
import { Survivor } from "./Survivor";
import { Zombie } from "./Zombie";
import { type EventTier, type BossTier } from "@/lib/game/engine";
import bgDesktop from "@/assets/outbreak-bg.jpg";
import bgPortrait from "@/assets/outbreak-bg-portrait.jpg";

type Phase = "idle" | "running" | "crashed" | "escaped" | "won";

type ZombieSpec = {
  id: string;
  variant: "runner" | "brute" | "mutant" | "tank" | "titan";
  laneX: number;       // -1 .. 1 (relative to center)
  size: number;
  duration: number;    // seconds for one approach cycle
  delay: number;
  sway: number;        // sway px amplitude
};

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

  useEffect(() => {
    if (!stageRef.current || shakeKey === 0) return;
    const cls = multiplier >= 25 ? "shake-heavy" : "shake";
    stageRef.current.classList.remove("shake", "shake-heavy");
    void stageRef.current.offsetWidth;
    stageRef.current.classList.add(cls);
  }, [shakeKey, multiplier]);

  // Spawn count + intensity scales with multiplier; capped for mobile perf.
  const zombieCount = useMemo(() => {
    if (phase !== "running") return 0;
    if (multiplier >= 100) return portrait ? 10 : 16;
    if (multiplier >= 50)  return portrait ? 8  : 13;
    if (multiplier >= 25)  return portrait ? 7  : 11;
    if (multiplier >= 10)  return portrait ? 6  : 9;
    if (multiplier >= 5)   return portrait ? 5  : 7;
    if (multiplier >= 2)   return portrait ? 4  : 5;
    return portrait ? 3 : 4;
  }, [multiplier, phase, portrait]);

  // Approach speed scales with multiplier (faster horde at high mult)
  const baseSpeed = useMemo(() => {
    if (multiplier >= 100) return 3.2;
    if (multiplier >= 50)  return 3.8;
    if (multiplier >= 25)  return 4.6;
    if (multiplier >= 10)  return 5.4;
    if (multiplier >= 5)   return 6.2;
    return 7.0;
  }, [multiplier]);

  const zombies = useMemo<ZombieSpec[]>(() => {
    return Array.from({ length: zombieCount }, (_, i) => {
      const variant: ZombieSpec["variant"] =
        multiplier >= 100 ? (i % 4 === 0 ? "titan" : i % 3 === 0 ? "mutant" : "tank") :
        multiplier >= 50  ? (i % 3 === 0 ? "mutant" : i % 2 === 0 ? "tank" : "brute") :
        multiplier >= 25  ? (i % 3 === 0 ? "tank" : i % 2 === 0 ? "brute" : "runner") :
        multiplier >= 10  ? (i % 4 === 0 ? "brute" : "runner") :
        "runner";
      // distribute lanes across X; deterministic-ish
      const laneX = ((i * 0.37) % 1) * 2 - 1; // -1 .. 1
      const baseSize = (variant === "titan" ? 110 : variant === "tank" ? 92 : variant === "brute" ? 78 : 62)
        * (portrait ? 0.8 : 1);
      // Vary individual speed
      const duration = baseSpeed * (0.85 + ((i * 13) % 7) / 20);
      const delay = -(i * (baseSpeed / Math.max(zombieCount, 1))) - (i % 3) * 0.4;
      const sway = 24 + (i % 5) * 6;
      return {
        id: `${variant}-${i}-${zombieCount}`,
        variant,
        laneX,
        size: baseSize,
        duration,
        delay,
        sway,
      };
    });
  }, [zombieCount, multiplier, portrait, baseSpeed]);

  const bg = portrait ? bgPortrait : bgDesktop;
  const nightMode = multiplier >= 25 && phase === "running";
  const mutationMode = multiplier >= 50 && phase === "running";
  const finalStand = multiplier >= 100 && phase === "running";
  const running = phase === "running";

  // Parallax pan speed accelerates with multiplier
  const panSpeed = Math.max(8, 24 - multiplier * 0.12);
  const groundSpeed = Math.max(0.6, 2.4 - multiplier * 0.012);

  return (
    <div
      ref={stageRef}
      className={`relative w-full h-full overflow-hidden scanlines vignette ${finalStand ? "heartbeat" : ""} ${overdrive ? "overdrive" : ""}`}
      style={{
        background: `var(--gradient-stage)`,
        borderRadius: portrait ? "1rem" : "1.25rem",
        border: "1px solid oklch(0.30 0.04 145 / 0.4)",
        boxShadow: "0 30px 60px -20px rgb(0 0 0 / 0.8), 0 0 0 1px oklch(0.78 0.24 142 / 0.08) inset",
        perspective: "1100px",
        perspectiveOrigin: "50% 38%",
      }}
    >
      {/* Sky/painted background */}
      <img
        src={bg}
        alt=""
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: nightMode ? 0.32 : 0.7,
          filter: `saturate(${mutationMode ? 1.4 : 1}) contrast(${nightMode ? 1.35 : 1.1}) brightness(${nightMode ? 0.55 : 0.85})`,
          transition: "opacity 0.6s, filter 0.6s",
        }}
      />

      {/* Far parallax silhouette band (skyline ruins) */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "-50%", right: "-50%", top: "32%",
          height: "22%",
          background: `repeating-linear-gradient(90deg,
            transparent 0 60px,
            oklch(0.06 0.02 145 / 0.7) 60px 78px,
            transparent 78px 110px,
            oklch(0.08 0.02 145 / 0.6) 110px 142px,
            transparent 142px 200px,
            oklch(0.05 0.02 145 / 0.8) 200px 232px)`,
          maskImage: "linear-gradient(180deg, transparent, black 30%, black 70%, transparent)",
          WebkitMaskImage: "linear-gradient(180deg, transparent, black 30%, black 70%, transparent)",
          animation: running ? `parallax-pan ${panSpeed * 3}s linear infinite` : undefined,
          willChange: "transform",
        }}
      />

      {/* Mid parallax silhouette band (closer trees / wrecks) */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "-50%", right: "-50%", top: "48%",
          height: "18%",
          background: `repeating-linear-gradient(90deg,
            transparent 0 30px,
            oklch(0.04 0.02 145 / 0.85) 30px 44px,
            transparent 44px 70px,
            oklch(0.06 0.02 145 / 0.75) 70px 92px,
            transparent 92px 130px)`,
          maskImage: "linear-gradient(180deg, transparent, black 40%, black 80%, transparent)",
          WebkitMaskImage: "linear-gradient(180deg, transparent, black 40%, black 80%, transparent)",
          animation: running ? `parallax-pan ${panSpeed * 1.6}s linear infinite` : undefined,
          willChange: "transform",
        }}
      />

      {/* Drifting fog layers */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: "55%", height: "30%",
          background: "radial-gradient(ellipse 40% 60% at 30% 50%, oklch(0.78 0.28 142 / 0.35), transparent 60%), radial-gradient(ellipse 35% 55% at 70% 50%, oklch(0.55 0.25 142 / 0.30), transparent 60%)",
          mixBlendMode: "screen",
          animation: running ? `fog-drift ${panSpeed * 0.9}s ease-in-out infinite` : undefined,
          willChange: "transform, opacity",
        }}
      />
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: "62%", height: "30%",
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.55 0.20 130 / 0.4), transparent 70%)",
          mixBlendMode: "screen",
          animation: running ? `fog-drift ${panSpeed * 1.4}s ease-in-out infinite reverse` : undefined,
          willChange: "transform, opacity",
        }}
      />

      {/* Ground plane — perspective floor with scrolling stripes */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: portrait ? "52%" : "48%",
          transformOrigin: "50% 0%",
          transform: "rotateX(62deg) translateZ(0)",
          background: `
            repeating-linear-gradient(0deg,
              oklch(0.10 0.03 145 / 0.55) 0 18px,
              oklch(0.05 0.02 140 / 0.55) 18px 36px),
            repeating-linear-gradient(90deg,
              transparent 0 90px,
              oklch(0.20 0.06 142 / 0.18) 90px 92px)`,
          backgroundSize: "100% 36px, 120px 100%",
          maskImage: "linear-gradient(180deg, transparent, black 18%, black 70%, transparent)",
          WebkitMaskImage: "linear-gradient(180deg, transparent, black 18%, black 70%, transparent)",
          animation: running ? `ground-scroll ${groundSpeed}s linear infinite` : undefined,
          willChange: "background-position",
        }}
      />

      {/* Toxic fog bottom wash */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: "55%",
          background: "linear-gradient(180deg, transparent 0%, oklch(0.55 0.25 142 / 0.0) 40%, oklch(0.55 0.25 142 / 0.30) 100%)",
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
      {multiplier >= 10 && multiplier < 50 && running && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ animation: "hazmat-pulse 1.4s ease-in-out infinite" }}
        />
      )}

      {/* Crash / Escape flashes */}
      {flashCrash > 0 && (
        <div key={`crash-${flashCrash}`} className="absolute inset-0 pointer-events-none"
          style={{ animation: "crash-flash 0.6s ease-out" }} />
      )}
      {flashEscape > 0 && (
        <div key={`escape-${flashEscape}`} className="absolute inset-0 pointer-events-none"
          style={{ animation: "escape-flash 0.8s ease-out" }} />
      )}

      {/* Approaching zombie horde — fake-3D depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {zombies.map((z) => {
          // Horizon X position (near center, slight spread) → final X (spread wider)
          const sx = z.laneX * 60;     // px from center at horizon
          const ex = z.laneX * 320;    // px from center at camera
          const horizonTop = portrait ? "44%" : "46%";
          return (
            <div
              key={z.id}
              className="absolute"
              style={{
                left: "50%",
                top: horizonTop,
                width: 0,
                height: 0,
                animation: running ? `approach ${z.duration}s linear infinite` : undefined,
                animationDelay: `${z.delay}s`,
                ["--sx" as never]: `${sx}px`,
                ["--ex" as never]: `${ex}px`,
                willChange: "transform, opacity, filter",
                zIndex: 10,
              }}
            >
              {/* Inner wrapper: lurch sway */}
              <div
                style={{
                  position: "absolute",
                  transform: "translate(-50%, -50%)",
                  animation: running ? `lurch-sway ${0.7 + (z.sway % 4) * 0.1}s ease-in-out infinite` : undefined,
                  transformOrigin: "50% 100%",
                }}
              >
                <Zombie variant={z.variant} size={z.size} delay={0} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Damage numbers when rapid fire */}
      {rapidFire && running && (
        <DamageNumbers count={overdrive ? 4 : 2} />
      )}

      {/* Survivor + barricade at bottom center */}
      <div
        className="absolute left-1/2 pointer-events-none"
        style={{
          bottom: portrait ? "6%" : "4%",
          transform: `translateX(-50%) scale(${portrait ? 0.9 : 1.15})`,
          zIndex: 30,
        }}
      >
        <Survivor firing={running} />
      </div>

      {/* Boss banner */}
      {boss && running && (
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

      {/* Event overlay anchor (parent renders content) */}
      {event && running && (
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
