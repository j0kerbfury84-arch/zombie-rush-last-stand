import { createFileRoute } from "@tanstack/react-router";
import { ZombieRush2 } from "@/components/game/ZombieRush2";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zombie Rush 2 — Outbreak" },
      { name: "description", content: "Cinematic burst game. Pre-determined multipliers, event waves, boss tiers, lucky escapes." },
      { property: "og:title", content: "Zombie Rush 2 — Outbreak" },
      { property: "og:description", content: "Burst game with event multipliers, boss tiers and lucky escapes." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;700&display=swap" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-background">
      <ZombieRush2 />
    </main>
  );
}
