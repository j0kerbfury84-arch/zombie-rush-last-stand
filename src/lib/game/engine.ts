// Zombie Rush 2 — pre-determined outcome engine (frontend demo only).
// Math/RTP will be replaced by the RGS in production.

export type EventTier = {
  threshold: number;
  key: string;
  title: string;
  subtitle: string;
  intensity: "wave" | "tank" | "airstrike" | "night" | "mutation" | "final";
};

export const EVENT_TIERS: EventTier[] = [
  { threshold: 2,   key: "heavy",     title: "HEAVY WAVE",   subtitle: "Horde incoming",         intensity: "wave" },
  { threshold: 5,   key: "tank",      title: "TANK ZOMBIE",  subtitle: "Brute approaching",      intensity: "tank" },
  { threshold: 10,  key: "airstrike", title: "AIR STRIKE",   subtitle: "Danger close",           intensity: "airstrike" },
  { threshold: 25,  key: "night",     title: "NIGHT MODE",   subtitle: "Power grid down",        intensity: "night" },
  { threshold: 50,  key: "mutation",  title: "MUTATION",     subtitle: "They are evolving",      intensity: "mutation" },
  { threshold: 100, key: "final",     title: "FINAL STAND",  subtitle: "Hold the line",          intensity: "final" },
];

export type BossTier = {
  threshold: number;
  key: string;
  name: string;
};

export const BOSS_TIERS: BossTier[] = [
  { threshold: 10,  key: "brute",      name: "BRUTE" },
  { threshold: 25,  key: "abomination", name: "ABOMINATION" },
  { threshold: 50,  key: "necrotank",  name: "NECRO TANK" },
  { threshold: 100, key: "titan",      name: "TITAN MUTATION" },
  { threshold: 250, key: "horde",      name: "FINAL HORDE" },
];

// Weighted distribution roughly mimicking a high-volatility burst game.
// In production this is replaced by a CSV from the math team.
export function generateCrashPoint(): number {
  const r = Math.random();
  if (r < 0.50) return round(1 + Math.random() * 1.5);
  if (r < 0.80) return round(2.5 + Math.random() * 5);
  if (r < 0.93) return round(7.5 + Math.random() * 17.5);
  if (r < 0.985) return round(25 + Math.random() * 75);
  if (r < 0.998) return round(100 + Math.random() * 150);
  return round(250 + Math.random() * 750);
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

// 4% chance a round triggers Lucky Escape: appears to crash early, then continues.
export function rollLuckyEscape(crashPoint: number) {
  if (crashPoint < 5) return null; // only meaningful on bigger rounds
  if (Math.random() > 0.04) return null;
  const fakeCrashAt = round(1.2 + Math.random() * Math.min(crashPoint * 0.4, 8));
  return fakeCrashAt;
}

// Logarithmic time→multiplier curve: fast at low mults, slow at high mults.
// Tuned so 2x ≈ 1.6s, 10x ≈ 5.5s, 100x ≈ 12s.
const GROWTH = 0.36;
export function multiplierAt(seconds: number) {
  return Math.max(1, Math.exp(seconds * GROWTH));
}
export function timeForMultiplier(target: number) {
  return Math.log(target) / GROWTH;
}

export function bossForMultiplier(m: number): BossTier | null {
  let current: BossTier | null = null;
  for (const b of BOSS_TIERS) {
    if (m >= b.threshold) current = b;
  }
  return current;
}

export function eventForMultiplier(m: number): EventTier | null {
  let current: EventTier | null = null;
  for (const e of EVENT_TIERS) {
    if (m >= e.threshold) current = e;
  }
  return current;
}

// Fake global feed entries shown in the side ticker.
const FEED_NAMES = [
  "Player_88", "ToxicGrin", "BraveSurvivor", "NeonHunter", "GhostWalker",
  "0xRavager", "SilentBolt", "ZeroRecoil", "HazmatHero", "MidnightRun",
  "GoldRush", "LastEmber", "VaultBoy", "PixelPriest", "RustQueen",
];
export function randomFeedEntry(): { name: string; mult: number; kind: "survive" | "escape" | "infection" } {
  const name = FEED_NAMES[Math.floor(Math.random() * FEED_NAMES.length)];
  const r = Math.random();
  let mult: number;
  let kind: "survive" | "escape" | "infection";
  if (r < 0.7) {
    mult = round(1.2 + Math.random() * 25);
    kind = "survive";
  } else if (r < 0.92) {
    mult = round(20 + Math.random() * 200);
    kind = "escape";
  } else {
    mult = round(80 + Math.random() * 500);
    kind = "infection";
  }
  return { name, mult, kind };
}
