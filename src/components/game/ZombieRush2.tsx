import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameStage } from "./GameStage";
import { HUD, type Phase } from "./HUD";
import { MultiplierDisplay } from "./MultiplierDisplay";
import { EventOverlay } from "./EventOverlay";
import { GlobalFeed } from "./GlobalFeed";
import {
  EVENT_TIERS,
  bossForMultiplier,
  eventForMultiplier,
  generateCrashPoint,
  multiplierAt,
  rollLuckyEscape,
  timeForMultiplier,
} from "@/lib/game/engine";

export function ZombieRush2() {
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [multiplier, setMultiplier] = useState(1);
  const [overdrive, setOverdrive] = useState(false);
  const [rapidFire, setRapidFire] = useState(false);
  const [muted, setMuted] = useState(true);
  const [shakeKey, setShakeKey] = useState(0);
  const [crashFlash, setCrashFlash] = useState(0);
  const [escapeFlash, setEscapeFlash] = useState(0);
  const [activeEvent, setActiveEvent] = useState<{ tier: (typeof EVENT_TIERS)[number]; key: number } | null>(null);
  const [portrait, setPortrait] = useState(false);

  const roundRef = useRef<{
    startedAt: number;
    crashAt: number;
    fakeCrashAt: number | null;
    fakeCrashHandled: boolean;
    triggeredEvents: Set<string>;
    raf: number | null;
    revealed: boolean;
  } | null>(null);

  // Detect portrait viewport
  useEffect(() => {
    const check = () => setPortrait(window.innerWidth < 900 || window.innerHeight > window.innerWidth);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const endRound = useCallback((finalMult: number, outcome: "crashed" | "escaped" | "won") => {
    const r = roundRef.current;
    if (r?.raf) cancelAnimationFrame(r.raf);
    setMultiplier(finalMult);
    setPhase(outcome);
    if (outcome === "crashed") {
      setCrashFlash((k) => k + 1);
      setShakeKey((k) => k + 1);
    } else {
      // Pay out
      setBalance((b) => Math.round((b + bet * finalMult) * 100) / 100);
      setEscapeFlash((k) => k + 1);
      setShakeKey((k) => k + 1);
    }
  }, [bet]);

  const tick = useCallback(() => {
    const r = roundRef.current;
    if (!r) return;
    const elapsed = (performance.now() - r.startedAt) / 1000;
    const m = multiplierAt(elapsed);

    // Lucky escape — fake crash, pause, then continue
    if (r.fakeCrashAt && !r.fakeCrashHandled && m >= r.fakeCrashAt) {
      r.fakeCrashHandled = true;
      setMultiplier(r.fakeCrashAt);
      setPhase("crashed");
      setCrashFlash((k) => k + 1);
      setShakeKey((k) => k + 1);
      // After dramatic pause → escape reveal → resume
      setTimeout(() => {
        setEscapeFlash((k) => k + 1);
        setPhase("escaped");
        setTimeout(() => {
          // Resume from fakeCrashAt
          if (!roundRef.current) return;
          roundRef.current.startedAt = performance.now() - timeForMultiplier(r.fakeCrashAt!) * 1000;
          setPhase("running");
          roundRef.current.raf = requestAnimationFrame(tick);
        }, 1100);
      }, 1200);
      return;
    }

    // Reached the real crash
    if (m >= r.crashAt) {
      endRound(r.crashAt, "crashed");
      return;
    }

    setMultiplier(m);

    // Trigger event banners at thresholds (once per round, per tier)
    for (const t of EVENT_TIERS) {
      if (m >= t.threshold && !r.triggeredEvents.has(t.key)) {
        r.triggeredEvents.add(t.key);
        setActiveEvent({ tier: t, key: Date.now() });
        setShakeKey((k) => k + 1);
        setTimeout(() => setActiveEvent(null), 1600);
        break;
      }
    }

    r.raf = requestAnimationFrame(tick);
  }, [endRound]);

  const startRound = useCallback(() => {
    if (bet > balance) return;
    setBalance((b) => Math.round((b - bet) * 100) / 100);
    const crashAt = generateCrashPoint();
    const fakeCrashAt = rollLuckyEscape(crashAt);
    roundRef.current = {
      startedAt: performance.now(),
      crashAt,
      fakeCrashAt,
      fakeCrashHandled: false,
      triggeredEvents: new Set(),
      raf: null,
      revealed: false,
    };
    setActiveEvent(null);
    setMultiplier(1);
    setPhase("running");
    roundRef.current.raf = requestAnimationFrame(tick);
  }, [bet, balance, tick]);

  // Reveal = skip to outcome instantly
  const reveal = useCallback(() => {
    const r = roundRef.current;
    if (!r || phase !== "running") return;
    if (r.raf) cancelAnimationFrame(r.raf);
    r.revealed = true;
    if (r.fakeCrashAt && !r.fakeCrashHandled) {
      // skip through the fake crash flow too — show escape directly
      setEscapeFlash((k) => k + 1);
    }
    endRound(r.crashAt, "won");
  }, [endRound, phase]);

  useEffect(() => {
    return () => {
      if (roundRef.current?.raf) cancelAnimationFrame(roundRef.current.raf);
    };
  }, []);

  const event = useMemo(() => eventForMultiplier(multiplier), [multiplier]);
  const boss = useMemo(() => bossForMultiplier(multiplier), [multiplier]);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-3 lg:gap-4 p-2 sm:p-3 lg:p-4">
      {/* Stage */}
      <div className="flex-1 relative min-h-0">
        <GameStage
          multiplier={multiplier}
          phase={phase}
          event={event}
          boss={boss}
          rapidFire={rapidFire}
          overdrive={overdrive}
          shakeKey={shakeKey}
          flashCrash={crashFlash}
          flashEscape={escapeFlash}
          portrait={portrait}
        />

        {/* Multiplier — centered, dominant */}
        <div className="absolute inset-x-0 top-[18%] flex justify-center pointer-events-none z-30">
          <MultiplierDisplay value={multiplier} state={phase} pulseKey={Math.floor(multiplier * 4)} />
        </div>

        {/* Event banner overlay */}
        {activeEvent && (
          <EventOverlay event={activeEvent.tier} keyId={activeEvent.key} />
        )}

        {/* Top-left brand + feed (desktop only) */}
        <div className="absolute top-3 left-3 z-40 hidden lg:flex flex-col gap-3 w-[240px]">
          <Brand />
          <GlobalFeed />
        </div>

        {/* Top-right round info */}
        <div className="absolute top-3 right-3 z-40">
          <RoundInfo phase={phase} multiplier={multiplier} />
        </div>
      </div>

      {/* HUD: side rail on desktop, bottom panel on mobile */}
      <aside className="lg:w-[320px] shrink-0">
        {/* Mobile shows compact brand inline */}
        <div className="lg:hidden mb-2"><Brand compact /></div>
        <HUD
          balance={balance}
          bet={bet}
          setBet={setBet}
          phase={phase}
          onBet={startRound}
          onReveal={reveal}
          overdrive={overdrive}
          setOverdrive={setOverdrive}
          rapidFire={rapidFire}
          setRapidFire={setRapidFire}
          muted={muted}
          setMuted={setMuted}
          compact={portrait}
        />
        <div className="lg:hidden mt-2"><GlobalFeed /></div>
      </aside>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg backdrop-blur-md"
      style={{
        background: "oklch(0.10 0.02 145 / 0.7)",
        border: "1px solid oklch(0.30 0.04 145 / 0.4)",
      }}
    >
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center font-display text-lg"
        style={{
          background: "var(--gradient-hazmat)",
          color: "oklch(0.10 0.02 145)",
          boxShadow: "var(--shadow-glow-hazmat)",
        }}
      >
        2
      </div>
      <div className={`font-display tracking-[0.2em] leading-none ${compact ? "text-base" : "text-lg"}`}
           style={{ color: "var(--bone)" }}>
        ZOMBIE<span style={{ color: "var(--hazmat)" }}> RUSH</span>
      </div>
      <div className="ml-auto font-mono text-[9px] tracking-widest uppercase" style={{ color: "var(--gold)" }}>
        OUTBREAK
      </div>
    </div>
  );
}

function RoundInfo({ phase, multiplier }: { phase: Phase; multiplier: number }) {
  const label =
    phase === "running" ? "INCOMING" :
    phase === "crashed" ? "TERMINATED" :
    phase === "escaped" ? "EXTRACTED" :
    phase === "won" ? "SURVIVED" : "STANDBY";
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md font-mono text-[10px] tracking-[0.25em] uppercase"
      style={{
        background: "oklch(0.10 0.02 145 / 0.8)",
        border: "1px solid oklch(0.30 0.04 145 / 0.4)",
        color: "var(--bone)",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: phase === "running" ? "var(--hazmat)" : phase === "crashed" ? "var(--blood-glow)" : "var(--gold)",
          boxShadow: phase === "running" ? "0 0 8px var(--hazmat)" : "none",
          animation: phase === "running" ? "pulse 0.9s ease-in-out infinite" : undefined,
        }}
      />
      {label} · {multiplier.toFixed(2)}x
    </div>
  );
}
