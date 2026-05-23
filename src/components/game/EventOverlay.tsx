import { type EventTier } from "@/lib/game/engine";

export function EventOverlay({ event, keyId }: { event: EventTier; keyId: number }) {
  const color =
    event.intensity === "final" || event.intensity === "mutation" ? "var(--blood-glow)" :
    event.intensity === "night" ? "var(--gold)" :
    "var(--hazmat-glow)";

  return (
    <div
      key={keyId}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ animation: "event-slam 1.6s ease-out forwards" }}
    >
      <div className="text-center px-6">
        <div
          className="font-display text-stroke-dark"
          style={{
            fontSize: "clamp(2.5rem, 9vw, 7rem)",
            color,
            textShadow: `0 0 40px ${color}, 0 0 80px ${color}`,
            letterSpacing: "0.08em",
            fontWeight: 900,
          }}
        >
          {event.title}
        </div>
        <div
          className="font-mono uppercase mt-2 tracking-[0.4em]"
          style={{ color: "var(--bone)", fontSize: "clamp(0.75rem, 1.6vw, 1.1rem)", opacity: 0.85 }}
        >
          ▸ {event.subtitle} ◂
        </div>
      </div>
    </div>
  );
}
