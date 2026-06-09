"use client";
import type { LifeStage } from "@/types/game";

// ============================================================
// SVGドット絵キャラクター — ライフステージ別
// ============================================================

const SKIN  = "#f4c08a";
const SKIN2 = "#e8a070";
const HAIR_DARK  = "#3a2010";
const HAIR_LIGHT = "#c8a060";
const WHITE = "#f0f0f0";

interface Props {
  lifeStage: LifeStage;
  color: string;       // プレイヤーのアバターカラー
  darkColor?: string;
  size?: number;       // 表示幅px（高さは1.6倍）
  shadow?: boolean;
}

// lighten/darken helper
function lighten(hex: string, amt = 40): string {
  const n = parseInt(hex.replace("#",""), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return `rgb(${r},${g},${b})`;
}
function darken(hex: string, amt = 40): string {
  return lighten(hex, -amt);
}

// ── Baby ────────────────────────────────────
function Baby({ c, dc }: { c: string; dc: string }) {
  return (
    <>
      {/* hair */}
      <ellipse cx="8" cy="3.5" rx="4.5" ry="3" fill={dc} />
      {/* head */}
      <circle cx="8" cy="5.5" r="4.5" fill={SKIN} />
      {/* eyes */}
      <circle cx="6.2" cy="5.2" r="0.9" fill="#222" />
      <circle cx="9.8" cy="5.2" r="0.9" fill="#222" />
      {/* blush */}
      <ellipse cx="5.3" cy="6.8" rx="1.2" ry="0.7" fill="#f9a8d4" opacity="0.5" />
      <ellipse cx="10.7" cy="6.8" rx="1.2" ry="0.7" fill="#f9a8d4" opacity="0.5" />
      {/* neck */}
      <rect x="6.5" y="9.5" width="3" height="2" fill={SKIN} />
      {/* body */}
      <rect x="3.5" y="10.5" width="9" height="6" rx="2.5" fill={c} />
      {/* arms */}
      <rect x="1"   y="11" width="3" height="4" rx="1.5" fill={c} />
      <rect x="12"  y="11" width="3" height="4" rx="1.5" fill={c} />
      {/* legs */}
      <rect x="4"   y="16" width="3.5" height="5" rx="1.8" fill={c} />
      <rect x="8.5" y="16" width="3.5" height="5" rx="1.8" fill={c} />
    </>
  );
}

// ── Child (elementary) ───────────────────────
function Child({ c, dc }: { c: string; dc: string }) {
  return (
    <>
      {/* hair */}
      <ellipse cx="8" cy="3" rx="4" ry="2.5" fill={HAIR_DARK} />
      {/* head */}
      <circle cx="8" cy="4.8" r="4" fill={SKIN} />
      {/* eyes */}
      <circle cx="6.3" cy="4.5" r="0.8" fill="#222" />
      <circle cx="9.7" cy="4.5" r="0.8" fill="#222" />
      {/* neck */}
      <rect x="6.5" y="8.3" width="3" height="2" fill={SKIN} />
      {/* shirt */}
      <rect x="3.5" y="9.5" width="9" height="7" rx="1.5" fill={WHITE} />
      {/* collar */}
      <polygon points="7,9.5 9,9.5 8,12" fill={dc} />
      {/* shorts/skirt */}
      <rect x="4" y="16" width="8" height="4" rx="1" fill={c} />
      {/* legs */}
      <rect x="4"   y="19.5" width="3" height="5" rx="1" fill={SKIN} />
      <rect x="9"   y="19.5" width="3" height="5" rx="1" fill={SKIN} />
      {/* socks */}
      <rect x="4"   y="23" width="3" height="2" rx="0.5" fill={WHITE} />
      <rect x="9"   y="23" width="3" height="2" rx="0.5" fill={WHITE} />
      {/* backpack hint */}
      <rect x="12.5" y="10" width="3" height="5" rx="1" fill={dc} />
    </>
  );
}

// ── Teen (middle school) ────────────────────
function Teen({ c, dc }: { c: string; dc: string }) {
  return (
    <>
      {/* hair */}
      <ellipse cx="8" cy="2.5" rx="3.8" ry="2.5" fill={HAIR_DARK} />
      {/* head */}
      <circle cx="8" cy="4.3" r="3.8" fill={SKIN} />
      {/* eyes */}
      <circle cx="6.4" cy="4" r="0.8" fill="#222" />
      <circle cx="9.6" cy="4" r="0.8" fill="#222" />
      {/* neck */}
      <rect x="6.5" y="7.5" width="3" height="2" fill={SKIN} />
      {/* uniform top */}
      <rect x="3.5" y="8.8" width="9" height="8" rx="1" fill={c} />
      {/* collar white */}
      <rect x="6.5" y="8.8" width="3" height="3" fill={WHITE} />
      {/* uniform bottom */}
      <rect x="4" y="16.5" width="8" height="5.5" rx="1" fill={dc} />
      {/* legs */}
      <rect x="4"   y="21" width="3" height="5" rx="1" fill={SKIN} />
      <rect x="9"   y="21" width="3" height="5" rx="1" fill={SKIN} />
    </>
  );
}

// ── Youth (high school) ─────────────────────
function Youth({ c, dc }: { c: string; dc: string }) {
  const jacket = "#2a3a6a";
  return (
    <>
      {/* hair */}
      <ellipse cx="8" cy="2" rx="3.5" ry="2.2" fill={HAIR_DARK} />
      {/* head */}
      <circle cx="8" cy="4" r="3.5" fill={SKIN} />
      {/* eyes */}
      <circle cx="6.5" cy="3.7" r="0.75" fill="#222" />
      <circle cx="9.5" cy="3.7" r="0.75" fill="#222" />
      {/* neck */}
      <rect x="6.5" y="7" width="3" height="2" fill={SKIN} />
      {/* blazer */}
      <rect x="3" y="8.5" width="10" height="9" rx="1" fill={jacket} />
      {/* shirt */}
      <rect x="6" y="8.5" width="4" height="6" fill={WHITE} />
      {/* tie */}
      <rect x="7.3" y="9" width="1.4" height="5" rx="0.5" fill={c} />
      {/* pants */}
      <rect x="3.5" y="17" width="4" height="8" rx="1" fill={dc} />
      <rect x="8.5" y="17" width="4" height="8" rx="1" fill={dc} />
    </>
  );
}

// ── Adult (college/early career) ────────────
function Adult({ c, dc }: { c: string; dc: string }) {
  return (
    <>
      {/* hair */}
      <ellipse cx="8" cy="2" rx="3.2" ry="2" fill={HAIR_DARK} />
      {/* head */}
      <circle cx="8" cy="3.8" r="3.2" fill={SKIN} />
      {/* eyes */}
      <circle cx="6.7" cy="3.6" r="0.7" fill="#222" />
      <circle cx="9.3" cy="3.6" r="0.7" fill="#222" />
      {/* neck */}
      <rect x="6.5" y="6.5" width="3" height="2" fill={SKIN} />
      {/* suit jacket */}
      <rect x="2.5" y="8" width="11" height="10" rx="1" fill="#2a3555" />
      {/* shirt */}
      <rect x="5.5" y="8" width="5" height="7" fill={WHITE} />
      {/* tie */}
      <polygon points="7.5,8 8.5,8 9,14 8,15 7,14" fill={c} />
      {/* pants */}
      <rect x="3" y="17.5" width="4" height="8" rx="1" fill="#1a2040" />
      <rect x="9" y="17.5" width="4" height="8" rx="1" fill="#1a2040" />
    </>
  );
}

// ── Middleage (experienced worker) ──────────
function Middleage({ c, dc }: { c: string; dc: string }) {
  return (
    <>
      {/* hair (graying) */}
      <ellipse cx="8" cy="2" rx="3.5" ry="2" fill={HAIR_LIGHT} />
      {/* head */}
      <circle cx="8" cy="4" r="3.5" fill={SKIN2} />
      {/* eyes */}
      <circle cx="6.6" cy="3.8" r="0.7" fill="#222" />
      <circle cx="9.4" cy="3.8" r="0.7" fill="#222" />
      {/* neck */}
      <rect x="6.5" y="7" width="3" height="2" fill={SKIN2} />
      {/* suit (darker) */}
      <rect x="2" y="8.5" width="12" height="10.5" rx="1" fill="#1a2540" />
      {/* shirt */}
      <rect x="5.5" y="8.5" width="5" height="7" fill={WHITE} />
      {/* tie */}
      <polygon points="7.5,8.5 8.5,8.5 9,14.5 8,15.5 7,14.5" fill={c} />
      {/* briefcase */}
      <rect x="12.5" y="13" width="4" height="5" rx="1" fill={dc} />
      <rect x="13.5" y="12" width="2" height="1.5" rx="0.5" fill={dc} />
      {/* pants */}
      <rect x="2.5" y="18.5" width="4.5" height="7" rx="1" fill="#141c30" />
      <rect x="9"   y="18.5" width="4.5" height="7" rx="1" fill="#141c30" />
    </>
  );
}

// ── Senior (retired) ────────────────────────
function Senior({ c }: { c: string }) {
  return (
    <>
      {/* white hair */}
      <ellipse cx="8" cy="2.5" rx="3.5" ry="2.5" fill="#d8d8d8" />
      {/* head */}
      <circle cx="8" cy="4.5" r="3.5" fill={SKIN2} />
      {/* eyes (smaller) */}
      <circle cx="6.7" cy="4.3" r="0.6" fill="#333" />
      <circle cx="9.3" cy="4.3" r="0.6" fill="#333" />
      {/* wrinkles */}
      <path d="M5.5 5.5 Q6 6 6.5 5.5" stroke={SKIN} strokeWidth="0.4" fill="none" />
      <path d="M9.5 5.5 Q10 6 10.5 5.5" stroke={SKIN} strokeWidth="0.4" fill="none" />
      {/* neck */}
      <rect x="6.5" y="7.5" width="3" height="2" fill={SKIN2} />
      {/* casual top */}
      <rect x="3" y="9" width="10" height="8" rx="2" fill={c} />
      {/* pants */}
      <rect x="3.5" y="16.5" width="4" height="7" rx="1.5" fill="#4a4a6a" />
      <rect x="8.5" y="16.5" width="4" height="7" rx="1.5" fill="#4a4a6a" />
      {/* cane */}
      <line x1="13" y1="11" x2="15" y2="24" stroke="#8a6a40" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="13.5" cy="11" rx="1.5" ry="1" fill="#8a6a40" />
    </>
  );
}

// ============================================================
// メインコンポーネント
// ============================================================
export function PixelCharacter({ lifeStage, color, darkColor, size = 32, shadow = false }: Props) {
  const dc = darkColor ?? darken(color, 50);
  const W = size;
  const H = Math.round(size * 1.5);

  const body: Record<LifeStage, JSX.Element> = {
    baby:      <Baby      c={color} dc={dc} />,
    child:     <Child     c={color} dc={dc} />,
    teen:      <Teen      c={color} dc={dc} />,
    youth:     <Youth     c={color} dc={dc} />,
    adult:     <Adult     c={color} dc={dc} />,
    middleage: <Middleage c={color} dc={dc} />,
    senior:    <Senior    c={color}         />,
  };

  return (
    <svg
      width={W} height={H}
      viewBox="0 0 16 26"
      style={{ overflow: "visible", filter: shadow ? "drop-shadow(0 2px 4px rgba(0,0,0,0.7))" : undefined }}
    >
      {body[lifeStage]}
    </svg>
  );
}

/** 小さなキャラアイコン（ボード上のコマ用） */
export function CharacterToken({
  lifeStage,
  color,
  size = 20,
  isActive = false,
}: {
  lifeStage: LifeStage;
  color: string;
  size?: number;
  isActive?: boolean;
}) {
  return (
    <div
      style={{
        width: size, height: size,
        borderRadius: "50%",
        backgroundColor: color,
        border: isActive ? "2px solid #fff" : `2px solid ${darken(color, 40)}`,
        boxShadow: isActive ? `0 0 6px ${color}, 0 2px 4px rgba(0,0,0,0.6)` : "0 2px 4px rgba(0,0,0,0.5)",
        overflow: "hidden",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <svg
        width={size - 4} height={size - 2}
        viewBox="0 0 16 26"
        style={{ marginBottom: -2 }}
      >
        <PixelCharacter lifeStage={lifeStage} color={color} size={size - 4} />
      </svg>
    </div>
  );
}
