import { Minus, Plus, Zap, Skull, Settings2, Volume2, VolumeX } from "lucide-react";

export type Phase = "idle" | "running" | "crashed" | "escaped" | "won";

export function HUD({
  balance,
  bet,
  setBet,
  phase,
  onBet,
  onReveal,
  overdrive,
  setOverdrive,
  rapidFire,
  setRapidFire,
  muted,
  setMuted,
  compact = false,
}: {
  balance: number;
  bet: number;
  setBet: (n: number) => void;
  phase: Phase;
  onBet: () => void;
  onReveal: () => void;
  overdrive: boolean;
  setOverdrive: (b: boolean) => void;
  rapidFire: boolean;
  setRapidFire: (b: boolean) => void;
  muted: boolean;
  setMuted: (b: boolean) => void;
  compact?: boolean;
}) {
  const STEPS = [0.1, 0.5, 1, 5, 10, 25, 50, 100];
  const step = STEPS.find((s) => bet < s * 2) ?? 100;
  const dec = () => setBet(Math.max(0.1, Math.round((bet - step) * 100) / 100));
  const inc = () => setBet(Math.min(balance, Math.round((bet + step) * 100) / 100));

  const isRunning = phase === "running";
  const isBettable = phase === "idle" || phase === "crashed" || phase === "won" || phase === "escaped";

  return (
    <div
      className={`flex flex-col ${compact ? "gap-2" : "gap-3"} p-3 rounded-xl backdrop-blur-md`}
      style={{
        background: "linear-gradient(180deg, oklch(0.14 0.02 150 / 0.92), oklch(0.10 0.02 145 / 0.95))",
        border: "1px solid oklch(0.30 0.04 145 / 0.45)",
        boxShadow: "var(--shadow-hud)",
      }}
    >
      {/* Balance + Bet readouts */}
      <div className={`grid ${compact ? "grid-cols-2 gap-2" : "grid-cols-1 gap-2"}`}>
        <Stat label="BALANCE" value={`$${balance.toFixed(2)}`} accent="hazmat" />
        <Stat label="PLAY AMOUNT" value={`$${bet.toFixed(2)}`} accent="gold" />
      </div>

      {/* +/- controls */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={dec}
          disabled={!isBettable}
          className="h-11 rounded-lg flex items-center justify-center font-display text-2xl active:scale-95 transition-transform disabled:opacity-40 disabled:active:scale-100"
          style={{
            background: "linear-gradient(180deg, oklch(0.22 0.03 150), oklch(0.16 0.02 145))",
            border: "1px solid oklch(0.30 0.04 145 / 0.6)",
            color: "var(--hazmat)",
            boxShadow: "0 2px 0 oklch(0 0 0 / 0.4), inset 0 1px 0 oklch(1 0 0 / 0.05)",
          }}
        >
          <Minus className="w-5 h-5" />
        </button>
        <button
          onClick={inc}
          disabled={!isBettable}
          className="h-11 rounded-lg flex items-center justify-center font-display text-2xl active:scale-95 transition-transform disabled:opacity-40 disabled:active:scale-100"
          style={{
            background: "var(--gradient-gold)",
            color: "oklch(0.12 0.02 150)",
            boxShadow: "0 2px 0 oklch(0 0 0 / 0.4), inset 0 1px 0 oklch(1 0 0 / 0.3)",
          }}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Primary action */}
      {isBettable ? (
        <button
          onClick={onBet}
          className="h-14 rounded-lg font-display tracking-[0.25em] text-2xl active:scale-[0.98] transition-transform relative overflow-hidden"
          style={{
            background: "var(--gradient-hazmat)",
            color: "oklch(0.10 0.02 145)",
            boxShadow: "0 4px 0 oklch(0 0 0 / 0.5), var(--shadow-glow-hazmat), inset 0 2px 0 oklch(1 0 0 / 0.25)",
            textShadow: "0 1px 0 oklch(1 0 0 / 0.3)",
          }}
        >
          DEPLOY · ${bet.toFixed(2)}
        </button>
      ) : (
        <button
          onClick={onReveal}
          className="h-14 rounded-lg font-display tracking-[0.25em] text-2xl active:scale-[0.98] transition-transform"
          style={{
            background: "var(--gradient-gold)",
            color: "oklch(0.10 0.02 145)",
            boxShadow: "0 4px 0 oklch(0 0 0 / 0.5), var(--shadow-glow-gold), inset 0 2px 0 oklch(1 0 0 / 0.25)",
            textShadow: "0 1px 0 oklch(1 0 0 / 0.3)",
          }}
        >
          REVEAL
        </button>
      )}

      {/* Secondary actions */}
      <div className="grid grid-cols-2 gap-2">
        <ToggleButton
          active={rapidFire}
          onClick={() => setRapidFire(!rapidFire)}
          icon={<Zap className="w-4 h-4" />}
          label="RAPID FIRE"
          color="blood"
        />
        <ToggleButton
          active={overdrive}
          onClick={() => setOverdrive(!overdrive)}
          icon={<Skull className="w-4 h-4" />}
          label="OVERDRIVE"
          color="gold"
        />
      </div>

      {/* Footer mini buttons */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-1.5">
          <MiniBtn onClick={() => setMuted(!muted)} aria-label="mute">
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </MiniBtn>
          <MiniBtn aria-label="settings"><Settings2 className="w-3.5 h-3.5" /></MiniBtn>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {isRunning ? "● ROUND LIVE" : phase === "crashed" ? "○ ROUND ENDED" : "◌ READY"}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: "hazmat" | "gold" }) {
  const color = accent === "hazmat" ? "var(--hazmat)" : "var(--gold)";
  return (
    <div
      className="rounded-lg px-3 py-2"
      style={{
        background: "oklch(0.08 0.02 145 / 0.7)",
        border: "1px solid oklch(0.30 0.04 145 / 0.4)",
      }}
    >
      <div className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground">{label}</div>
      <div className="font-display text-xl leading-tight" style={{ color, textShadow: `0 0 14px ${color}` }}>
        {value}
      </div>
    </div>
  );
}

function ToggleButton({
  active, onClick, icon, label, color,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; color: "blood" | "gold" }) {
  const accent = color === "blood" ? "var(--blood)" : "var(--gold)";
  const glow = color === "blood" ? "var(--shadow-glow-blood)" : "var(--shadow-glow-gold)";
  return (
    <button
      onClick={onClick}
      className="h-10 rounded-lg flex items-center justify-center gap-1.5 font-display tracking-[0.15em] text-[11px] active:scale-95 transition-all"
      style={{
        background: active
          ? (color === "blood" ? "var(--gradient-blood)" : "var(--gradient-gold)")
          : "linear-gradient(180deg, oklch(0.20 0.03 150), oklch(0.14 0.02 145))",
        color: active ? "oklch(0.10 0.02 145)" : accent,
        border: `1px solid ${active ? "transparent" : "oklch(0.30 0.04 145 / 0.5)"}`,
        boxShadow: active ? `0 2px 0 oklch(0 0 0 / 0.5), ${glow}` : "0 2px 0 oklch(0 0 0 / 0.3)",
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function MiniBtn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      style={{
        background: "oklch(0.18 0.02 150 / 0.7)",
        border: "1px solid oklch(0.30 0.04 145 / 0.4)",
      }}
    >
      {children}
    </button>
  );
}
