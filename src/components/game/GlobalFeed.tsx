import { useEffect, useState } from "react";
import { randomFeedEntry } from "@/lib/game/engine";

type Entry = { id: number; name: string; mult: number; kind: "survive" | "escape" | "infection" };

export function GlobalFeed() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    let id = 0;
    const push = () => {
      const e = randomFeedEntry();
      setEntries((cur) => [{ id: ++id, ...e }, ...cur].slice(0, 6));
    };
    push(); push(); push();
    const iv = setInterval(push, 2200 + Math.random() * 1800);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 px-1">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
          Survival Feed · Live
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {entries.map((e) => (
          <FeedRow key={e.id} entry={e} />
        ))}
      </div>
    </div>
  );
}

function FeedRow({ entry }: { entry: Entry }) {
  const color =
    entry.kind === "escape" ? "var(--gold)" :
    entry.kind === "infection" ? "var(--blood-glow)" :
    "var(--hazmat)";
  const label =
    entry.kind === "escape" ? "ESCAPED" :
    entry.kind === "infection" ? "INFECTION RUN" :
    "SURVIVED";
  return (
    <div
      className="flex items-center justify-between gap-2 px-2 py-1 rounded-md font-mono text-[11px]"
      style={{
        background: "oklch(0.16 0.025 150 / 0.7)",
        border: "1px solid oklch(0.30 0.04 145 / 0.4)",
        animation: "feed-slide 0.3s ease-out",
      }}
    >
      <span className="truncate" style={{ color: "var(--bone)" }}>{entry.name}</span>
      <span className="flex items-center gap-1.5">
        <span className="text-[9px] opacity-70 uppercase tracking-wider" style={{ color }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{entry.mult.toFixed(2)}x</span>
      </span>
    </div>
  );
}
