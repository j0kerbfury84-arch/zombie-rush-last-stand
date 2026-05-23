export function Survivor({ firing = false }: { firing?: boolean }) {
  return (
    <div className="relative" style={{ width: 120, height: 140 }}>
      <svg viewBox="0 0 120 140" width={120} height={140} aria-hidden="true">
        {/* shadow */}
        <ellipse cx="60" cy="130" rx="32" ry="5" fill="rgb(0 0 0 / 0.55)" />
        {/* sandbag pile */}
        <path d="M10 132 Q60 110 110 132 L110 140 L10 140 Z" fill="#3a2f1f" stroke="#1a1208" />
        <path d="M22 124 Q34 116 46 124" stroke="#1a1208" fill="none" />
        <path d="M50 120 Q62 112 74 120" stroke="#1a1208" fill="none" />
        <path d="M78 124 Q90 116 102 124" stroke="#1a1208" fill="none" />
        {/* legs */}
        <rect x="48" y="92" width="10" height="30" fill="#2a3a1a" stroke="#0a1004" />
        <rect x="62" y="92" width="10" height="30" fill="#2a3a1a" stroke="#0a1004" />
        {/* torso w/ vest */}
        <path d="M40 50 Q36 92 60 95 Q84 92 80 50 Z" fill="#2a3a1a" stroke="#0a1004" strokeWidth="1.5" />
        <rect x="46" y="60" width="28" height="18" fill="#1a2410" stroke="#000" />
        <rect x="49" y="64" width="6" height="4" fill="#7afc4a" opacity="0.8" />
        <rect x="58" y="64" width="6" height="4" fill="#ffd23f" opacity="0.8" />
        <rect x="67" y="64" width="3" height="4" fill="#ff3322" opacity="0.8" />
        {/* arms holding rifle */}
        <path d="M40 56 L20 70 L18 78 L26 76 L44 64 Z" fill="#2a3a1a" stroke="#0a1004" />
        <path d="M80 56 L100 70 L102 78 L94 76 L76 64 Z" fill="#2a3a1a" stroke="#0a1004" />
        {/* rifle */}
        <rect x="14" y="70" width="96" height="6" fill="#1a1a1a" stroke="#000" />
        <rect x="100" y="68" width="14" height="10" fill="#0a0a0a" stroke="#000" />
        <rect x="48" y="76" width="24" height="6" fill="#222" stroke="#000" />
        {/* helmet */}
        <path d="M40 38 Q36 22 60 20 Q84 22 80 38 L78 44 L42 44 Z" fill="#2a3a1a" stroke="#0a1004" strokeWidth="1.5" />
        {/* visor */}
        <rect x="44" y="36" width="32" height="8" fill="#0a1408" stroke="#000" />
        <rect x="46" y="38" width="6" height="3" fill="#7afc4a" opacity="0.9" />
        <rect x="68" y="38" width="6" height="3" fill="#7afc4a" opacity="0.9" />
        {/* helmet light */}
        <circle cx="60" cy="26" r="2" fill="#fff8c8" />
      </svg>
      {/* muzzle flash */}
      {firing && (
        <>
          <div
            className="absolute"
            style={{
              left: 108, top: 64, width: 30, height: 16,
              background: "radial-gradient(ellipse, #fff 0%, #ffd23f 40%, #ff6a22 70%, transparent 100%)",
              animation: "muzzle-flash 0.08s linear infinite",
              filter: "blur(1px)",
            }}
          />
          <div
            className="absolute"
            style={{
              left: 116, top: 68, width: 60, height: 8,
              background: "linear-gradient(90deg, rgba(255,210,63,0.8) 0%, transparent 100%)",
              filter: "blur(2px)",
            }}
          />
        </>
      )}
    </div>
  );
}
