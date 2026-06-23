"use client";
import type { Player, JobType, AvatarCustomization } from "@/types/game";
import { AVATAR_COLORS } from "@/types/game";

// ============================================================
// ユーティリティ
// ============================================================
function blendHex(c1: string, c2: string, t: number): string {
  const safe = (s: string) => (s.startsWith("#") ? s : "#888");
  const n1 = parseInt(safe(c1).slice(1), 16);
  const n2 = parseInt(safe(c2).slice(1), 16);
  const r = Math.round(((n1 >> 16) & 255) * (1 - t) + ((n2 >> 16) & 255) * t);
  const g = Math.round((((n1 >> 8) & 255) * (1 - t) + ((n2 >> 8) & 255) * t));
  const b = Math.round(((n1 & 255) * (1 - t) + (n2 & 255) * t));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
function darken(hex: string, amt = 40): string {
  if (!hex.startsWith("#")) return hex;
  const n = parseInt(hex.slice(1), 16);
  return `#${Math.max(0, (n >> 16) - amt).toString(16).padStart(2, "0")}${Math.max(0, ((n >> 8) & 0xff) - amt).toString(16).padStart(2, "0")}${Math.max(0, (n & 0xff) - amt).toString(16).padStart(2, "0")}`;
}
function lighten(hex: string, amt = 40): string {
  if (!hex.startsWith("#")) return hex;
  const n = parseInt(hex.slice(1), 16);
  return `#${Math.min(255, (n >> 16) + amt).toString(16).padStart(2, "0")}${Math.min(255, ((n >> 8) & 0xff) + amt).toString(16).padStart(2, "0")}${Math.min(255, (n & 0xff) + amt).toString(16).padStart(2, "0")}`;
}
function agingHair(base: string, stage: AgeStage): string {
  if (stage === "elder")     return blendHex(base, "#c8c8d0", 0.85);
  if (stage === "middleage") return blendHex(base, "#c8c8d0", 0.28);
  return base;
}

// ============================================================
// CharacterDNA
// ============================================================
export interface CharacterDNA {
  hairColor: string; skinTone: string; eyeColor: string; hairStyle: 0 | 1 | 2;
  gender: "male" | "female";
  eyeShape: "normal" | "big" | "sharp" | "sleepy";
  faceShape: "round" | "square" | "slim";
  noseStyle: "normal" | "small" | "button";
  mouthBase: "wide" | "normal" | "small";
  frontHair: "bangs" | "side" | "center" | "none";
  backHair: "short" | "medium" | "long" | "bob";
  clothesColor: string;
}

const DNA_HAIR = ["#1a0808", "#3d2010", "#1a1a1a", "#6B2A08", "#c8a050", "#221844", "#4a2010", "#b83000"];
const DNA_EYES = ["#1a4830", "#1a2848", "#3a1808", "#302020"];

export function generateDNA(playerId: string): CharacterDNA {
  let h = 5381;
  for (let i = 0; i < playerId.length; i++) { h = ((h << 5) + h) ^ playerId.charCodeAt(i); h >>>= 0; }
  const es: CharacterDNA["eyeShape"][]  = ["normal", "big", "sharp", "sleepy"];
  const fs: CharacterDNA["faceShape"][] = ["round", "square", "slim"];
  const ns: CharacterDNA["noseStyle"][] = ["normal", "small", "button"];
  const ms: CharacterDNA["mouthBase"][] = ["wide", "normal", "small"];
  const fh: CharacterDNA["frontHair"][] = ["bangs", "side", "center", "none"];
  const bh: CharacterDNA["backHair"][]  = ["short", "medium", "long", "bob"];
  const cl = ["#2563eb","#dc2626","#16a34a","#7c3aed","#d97706","#db2777","#0891b2","#c2410c"];
  return {
    hairColor: DNA_HAIR[h % DNA_HAIR.length], skinTone: "#f5c98a",
    eyeColor: DNA_EYES[(h >> 8) % DNA_EYES.length], hairStyle: ((h >> 12) % 3) as 0 | 1 | 2,
    gender: ((h >> 4) % 2) === 0 ? "male" : "female",
    eyeShape: es[(h >> 6) % 4], faceShape: fs[(h >> 10) % 3],
    noseStyle: ns[(h >> 14) % 3], mouthBase: ms[(h >> 16) % 3],
    frontHair: fh[(h >> 18) % 4], backHair: bh[(h >> 20) % 4],
    clothesColor: cl[(h >> 22) % cl.length],
  };
}

export function customizationToDNA(c: AvatarCustomization): CharacterDNA {
  return {
    hairColor: c.hairColor, skinTone: c.skinColor, eyeColor: "#1a4830",
    hairStyle: 0, gender: c.gender, eyeShape: c.eyes, faceShape: c.outline,
    noseStyle: c.nose, mouthBase: c.mouth,
    frontHair: c.frontHair, backHair: c.backHair, clothesColor: c.clothesColor,
  };
}

// ============================================================
// 年齢ステージ
// ============================================================
export type AgeStage = "baby"|"toddler"|"child"|"middle"|"highschool"|"young"|"adult"|"middleage"|"elder";
export const AGE_STAGE_LABELS: Record<AgeStage, string> = {
  baby:"赤ちゃん",toddler:"幼児",child:"小学生",middle:"中学生",
  highschool:"高校生",young:"若者",adult:"社会人",middleage:"中年",elder:"老人",
};
export function ageToStage(age: number): AgeStage {
  if (age <= 2)  return "baby";   if (age <= 5)  return "toddler";
  if (age <= 12) return "child";  if (age <= 15) return "middle";
  if (age <= 18) return "highschool"; if (age <= 29) return "young";
  if (age <= 49) return "adult";  if (age <= 64) return "middleage";
  return "elder";
}
export function posToAgeForAvatar(position: number): number {
  if (position <= 14)  return Math.round((position / 14) * 5);
  if (position <= 25)  return 6  + Math.round(((position - 15) / 10) * 6);
  if (position <= 39)  return 13 + Math.round(((position - 26) / 13) * 2);
  if (position <= 50)  return 16 + Math.round(((position - 40) / 10) * 2);
  if (position <= 58)  return 18 + Math.round(((position - 50) / 8) * 5);
  if (position <= 69)  return 23 + Math.round(((position - 58) / 11) * 4);
  if (position <= 110) return 27 + Math.round(((position - 70) / 40) * 13);
  if (position <= 134) return 41 + Math.round(((position - 111) / 23) * 23);
  return 65 + Math.round(((position - 135) / 15) * 20);
}

// ============================================================
// 表情
// ============================================================
type Expression = "very_happy" | "happy" | "neutral" | "tired" | "sad";
function getExpression(happiness: number, isDebt: boolean): Expression {
  if (isDebt && happiness < 30) return "sad";
  if (happiness >= 85) return "very_happy";
  if (happiness >= 60) return "happy";
  if (happiness >= 40) return "neutral";
  if (happiness >= 20) return "tired";
  return "sad";
}

// ============================================================
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  顔パーツ描画 — 「別人に見えるレベル」の差
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// viewBox 0 0 16 26  |  顔中心 cx=8, cy=4.2, r=4.0
// ============================================================

// ── 顔形状（輪郭） ─────────────────────────────────────────
// round  → 完全な円
// square → 正方形に近い幅広の四角顔（左右に張り出す）
// slim   → 幅が極端に狭い細長い顔
function FaceShape({ cx, cy, r, shape, fill }: {
  cx:number; cy:number; r:number; shape:CharacterDNA["faceShape"]; fill:string;
}) {
  if (shape === "square") {
    // 幅を円より20%広く・高さを同じ → 明らかに角張った印象
    const hw = r * 1.18; const hh = r * 0.98;
    return (
      <rect x={cx - hw} y={cy - hh} width={hw * 2} height={hh * 2}
        rx={r * 0.18} fill={fill}/>
    );
  }
  if (shape === "slim") {
    // 幅を円より35%狭く・高さを20%高く → 明らかに細長い
    return <ellipse cx={cx} cy={cy + r * 0.06} rx={r * 0.65} ry={r * 1.20} fill={fill}/>;
  }
  return <circle cx={cx} cy={cy} r={r} fill={fill}/>;
}

// ── 目（eye shape ごとに完全に形が異なる） ──────────────────
// アニメ目：白目(sclera) + 虹彩 + 瞳孔 + ハイライト
function Eyes({ cx, cy, r, dna, isBaby }: {
  cx:number; cy:number; r:number; dna:CharacterDNA; isBaby:boolean;
}) {
  const eyeX = r * 0.41;
  const eyeY = isBaby ? r * 0.04 : -r * 0.01;   // 顔中心からのY offset
  const lx = cx - eyeX; const rx2 = cx + eyeX;
  const ey = cy + eyeY;
  const iris  = dna.eyeColor;
  const pupil = blendHex(iris, "#000", 0.7);

  // ────────── big：白目が巨大、瞳が大きくキラキラ ──────────
  if (dna.eyeShape === "big") {
    const sr = r * 0.30; const ir = sr * 0.68; const pr = sr * 0.38;
    return (<>
      {/* 上まつげ（幅広） */}
      {[lx, rx2].map((ex, i) => (
        <path key={i}
          d={`M ${ex-sr*1.1} ${ey-sr*0.55} Q ${ex} ${ey-sr*1.35} ${ex+sr*1.1} ${ey-sr*0.55}`}
          fill={darken(dna.hairColor, 5)} opacity={0.92}/>
      ))}
      {/* 白目（楕円気味でより大きく） */}
      {[lx, rx2].map((ex, i) => (
        <ellipse key={i} cx={ex} cy={ey+sr*0.05} rx={sr*1.08} ry={sr} fill="white"/>
      ))}
      {/* 虹彩（大きく） */}
      {[lx, rx2].map((ex, i) => (
        <circle key={i} cx={ex} cy={ey+sr*0.10} r={ir} fill={iris}/>
      ))}
      {/* 虹彩上部ハイライト */}
      {[lx, rx2].map((ex, i) => (
        <circle key={i} cx={ex} cy={ey-sr*0.02} r={ir*0.58} fill={lighten(iris,50)} opacity={0.42}/>
      ))}
      {/* 瞳孔 */}
      {[lx, rx2].map((ex, i) => (
        <circle key={i} cx={ex} cy={ey+sr*0.12} r={pr} fill={pupil}/>
      ))}
      {/* 白ハイライト2点 */}
      {[lx, rx2].map((ex, i) => (
        <g key={i}>
          <circle cx={ex+sr*0.42} cy={ey-sr*0.38} r={sr*0.26} fill="white"/>
          <circle cx={ex-sr*0.28} cy={ey+sr*0.38} r={sr*0.12} fill="white" opacity={0.7}/>
        </g>
      ))}
    </>);
  }

  // ────────── sharp：極細の切れ長、傾き強め ──────────────────
  if (dna.eyeShape === "sharp") {
    const hw = r * 0.36; const hh = r * 0.12;   // 細いスリット
    const slant = 0.18;  // 目尻が上がる量
    // 白目は細い横スリット
    return (<>
      {/* 白目スリット */}
      {[lx, rx2].map((ex, i) => {
        const sign = i === 0 ? 1 : -1; // 外側が上がる
        return (
          <path key={i}
            d={`M ${ex-hw} ${ey+sign*slant} L ${ex+hw} ${ey-sign*slant}
               C ${ex+hw*0.8} ${ey-sign*slant+hh} ${ex-hw*0.8} ${ey+sign*slant+hh} ${ex-hw} ${ey+sign*slant}`}
            fill="white"/>
        );
      })}
      {/* 虹彩（狭い楕円） */}
      {[lx, rx2].map((ex, i) => {
        const sign = i === 0 ? 1 : -1;
        return (
          <ellipse key={i} cx={ex} cy={ey+sign*0.04+hh*0.4}
            rx={hw*0.52} ry={hh*0.72} fill={iris}
            transform={`rotate(${sign*(-15)},${ex},${ey})`}/>
        );
      })}
      {/* 瞳孔 */}
      {[lx, rx2].map((ex, i) => (
        <circle key={i} cx={ex} cy={ey+hh*0.45} r={hh*0.48} fill={pupil}/>
      ))}
      {/* ハイライト */}
      {[lx, rx2].map((ex, i) => (
        <ellipse key={i} cx={ex+hw*0.3} cy={ey} rx={hw*0.22} ry={hh*0.28} fill="white"/>
      ))}
      {/* 上まぶたの強いライン */}
      {[lx, rx2].map((ex, i) => {
        const sign = i === 0 ? 1 : -1;
        return (
          <path key={i}
            d={`M ${ex-hw*1.1} ${ey+sign*slant*1.1-hh*0.1} L ${ex+hw*1.1} ${ey-sign*slant*1.1-hh*0.1}`}
            stroke={darken(dna.hairColor, 0)} strokeWidth={r*0.11}
            strokeLinecap="round" fill="none" opacity={0.9}/>
        );
      })}
      {/* 下まぶたの細いライン */}
      {[lx, rx2].map((ex, i) => {
        const sign = i === 0 ? 1 : -1;
        return (
          <path key={i}
            d={`M ${ex-hw*0.7} ${ey+sign*slant*0.5+hh*1.0} L ${ex+hw*0.7} ${ey-sign*slant*0.5+hh*1.0}`}
            stroke={darken(dna.hairColor, 10)} strokeWidth={r*0.055}
            strokeLinecap="round" fill="none" opacity={0.55}/>
        );
      })}
    </>);
  }

  // ────────── sleepy：半眼、重いまぶた、眠そうな垂れ目 ────────
  if (dna.eyeShape === "sleepy") {
    const sr = r * 0.22; const ir = sr * 0.68; const pr = sr * 0.36;
    const lidH = sr * 0.58;  // まぶたが下りる量（大きく）
    return (<>
      {/* 白目 */}
      {[lx, rx2].map((ex, i) => (
        <circle key={i} cx={ex} cy={ey + sr * 0.22} r={sr} fill="white"/>
      ))}
      {/* 重いまぶた（上から大きく覆う） */}
      {[lx, rx2].map((ex, i) => (
        <rect key={i} x={ex - sr * 1.2} y={ey - sr * 0.85} width={sr * 2.4} height={lidH * 1.6}
          rx={sr * 0.3} fill={dna.skinTone}/>
      ))}
      {/* 虹彩 */}
      {[lx, rx2].map((ex, i) => (
        <circle key={i} cx={ex} cy={ey + sr * 0.22 + ir * 0.1} r={ir} fill={iris}/>
      ))}
      {/* 瞳孔 */}
      {[lx, rx2].map((ex, i) => (
        <circle key={i} cx={ex} cy={ey + sr * 0.22} r={pr} fill={pupil}/>
      ))}
      {/* ハイライト */}
      {[lx, rx2].map((ex, i) => (
        <circle key={i} cx={ex + sr * 0.32} cy={ey + sr * 0.05} r={sr * 0.19} fill="white"/>
      ))}
      {/* 垂れ目の重まつげ（目尻が下がる） */}
      {[lx, rx2].map((ex, i) => {
        const sign = i === 0 ? -1 : 1; // 外側が下がる
        return (
          <path key={i}
            d={`M ${ex-sr*1.05} ${ey-sr*0.35} Q ${ex} ${ey-sr*0.75} ${ex+sr*1.05} ${ey-sr*0.35+sign*sr*0.30}`}
            fill={darken(dna.hairColor, 5)} opacity={0.88}/>
        );
      })}
    </>);
  }

  // ────────── normal（デフォルト）：丸い標準アニメ目 ──────────
  const sr = isBaby ? r * 0.27 : r * 0.22;
  const ir = sr * 0.70; const pr = sr * 0.38;
  return (<>
    {/* 白目 */}
    {[lx, rx2].map((ex, i) => (
      <circle key={i} cx={ex} cy={ey} r={sr} fill="white"/>
    ))}
    {/* 虹彩 */}
    {[lx, rx2].map((ex, i) => (
      <circle key={i} cx={ex} cy={ey + ir * 0.07} r={ir} fill={iris}/>
    ))}
    {/* 上部ハイライト */}
    {[lx, rx2].map((ex, i) => (
      <circle key={i} cx={ex} cy={ey - ir * 0.04} r={ir * 0.52} fill={lighten(iris, 40)} opacity={0.38}/>
    ))}
    {/* 瞳孔 */}
    {[lx, rx2].map((ex, i) => (
      <circle key={i} cx={ex} cy={ey + pr * 0.12} r={pr} fill={pupil}/>
    ))}
    {/* 白ハイライト */}
    {[lx, rx2].map((ex, i) => (
      <circle key={i} cx={ex + sr * 0.36} cy={ey - sr * 0.28} r={sr * 0.22} fill="white"/>
    ))}
    {/* まつげ */}
    {[lx, rx2].map((ex, i) => (
      <path key={i}
        d={`M ${ex-sr*0.92} ${ey-sr*0.62} Q ${ex} ${ey-sr*1.12} ${ex+sr*0.92} ${ey-sr*0.62}`}
        fill={darken(dna.hairColor, 5)} opacity={0.85}/>
    ))}
  </>);
}

// ── 眉毛（目の形に連動して形状を変える） ──────────────────────
function Eyebrows({ cx, cy, r, dna, expr }: {
  cx:number; cy:number; r:number; dna:CharacterDNA; expr:Expression;
}) {
  const eyeX = r * 0.41;
  const eyeY = -r * 0.01;
  const eyeTopY = cy + eyeY - (dna.eyeShape === "big" ? r * 0.30 : r * 0.22) - r * 0.07;
  const browY = eyeTopY - r * 0.12;
  const bw = r * 0.35;
  const sad = expr === "tired" || expr === "sad";
  const hair = agingHair(dna.hairColor, "young"); // 眉は白髪化しないように

  // sharp目 → 凛々しい直線的な眉
  if (dna.eyeShape === "sharp") {
    return (<>
      <line x1={cx-eyeX-bw} y1={browY+(sad?r*0.07:0)} x2={cx-eyeX+bw} y2={browY-(sad?0:r*0.04)}
        stroke={hair} strokeWidth={r*0.16} strokeLinecap="round"/>
      <line x1={cx+eyeX-bw} y1={browY-(sad?0:r*0.04)} x2={cx+eyeX+bw} y2={browY+(sad?r*0.07:0)}
        stroke={hair} strokeWidth={r*0.16} strokeLinecap="round"/>
    </>);
  }
  // big目 → 丸くアーチ状の眉
  if (dna.eyeShape === "big") {
    return (<>
      {[cx-eyeX, cx+eyeX].map((ex, i) => (
        <path key={i}
          d={sad
            ? `M ${ex-bw} ${browY+r*0.05} Q ${ex} ${browY+r*0.01} ${ex+bw} ${browY+r*0.05}`
            : `M ${ex-bw} ${browY+r*0.03} Q ${ex} ${browY-r*0.15} ${ex+bw} ${browY+r*0.03}`}
          fill="none" stroke={hair} strokeWidth={r*0.15} strokeLinecap="round"/>
      ))}
    </>);
  }
  // sleepy目 → 外側が垂れた眉
  if (dna.eyeShape === "sleepy") {
    return (<>
      <path d={`M ${cx-eyeX-bw} ${browY-(sad?r*0.04:r*0.02)} Q ${cx-eyeX} ${browY-r*0.06} ${cx-eyeX+bw} ${browY+(sad?r*0.04:r*0.10)}`}
        fill="none" stroke={hair} strokeWidth={r*0.14} strokeLinecap="round"/>
      <path d={`M ${cx+eyeX-bw} ${browY+(sad?r*0.04:r*0.10)} Q ${cx+eyeX} ${browY-r*0.06} ${cx+eyeX+bw} ${browY-(sad?r*0.04:r*0.02)}`}
        fill="none" stroke={hair} strokeWidth={r*0.14} strokeLinecap="round"/>
    </>);
  }
  // normal → 標準アーチ眉
  return (<>
    {[cx-eyeX, cx+eyeX].map((ex, i) => (
      <path key={i}
        d={sad
          ? `M ${ex-bw*0.9} ${browY+r*0.08} Q ${ex} ${browY+r*0.02} ${ex+bw*0.9} ${browY+r*0.08}`
          : `M ${ex-bw*0.9} ${browY+r*0.02} Q ${ex} ${browY-r*0.12} ${ex+bw*0.9} ${browY+r*0.02}`}
        fill="none" stroke={hair} strokeWidth={r*0.14} strokeLinecap="round"/>
    ))}
  </>);
}

// ── 口 ──────────────────────────────────────────────────────
function Mouth({ cx, cy, r, expr, size }: {
  cx:number; cy:number; r:number; expr:Expression; size:"wide"|"normal"|"small";
}) {
  const mw = size==="wide" ? r*0.58 : size==="small" ? r*0.26 : r*0.42;
  const s = "#6a2010"; const sw = r * 0.09;
  if (expr==="very_happy") return (<>
    <path d={`M ${cx-mw} ${cy} Q ${cx} ${cy+mw*1.1} ${cx+mw} ${cy}`}
      fill="#f08080" stroke={s} strokeWidth={sw} strokeLinecap="round"/>
    <rect x={cx-mw*0.62} y={cy} width={mw*1.24} height={mw*0.42} rx={mw*0.1} fill="white"/>
  </>);
  if (expr==="happy") return (
    <path d={`M ${cx-mw*0.9} ${cy} Q ${cx} ${cy+mw*0.95} ${cx+mw*0.9} ${cy}`}
      fill="none" stroke={s} strokeWidth={sw} strokeLinecap="round"/>
  );
  if (expr==="tired") return (<>
    <path d={`M ${cx-mw*0.9} ${cy+mw*0.42} Q ${cx} ${cy-mw*0.18} ${cx+mw*0.9} ${cy+mw*0.42}`}
      fill="none" stroke={s} strokeWidth={sw} strokeLinecap="round"/>
    <circle cx={cx-mw*1.4} cy={cy-mw*0.3} r={mw*0.13} fill={s} opacity={0.45}/>
  </>);
  if (expr==="sad") return (<>
    <path d={`M ${cx-mw} ${cy+mw*0.9} Q ${cx} ${cy-mw*0.3} ${cx+mw} ${cy+mw*0.9}`}
      fill="none" stroke={s} strokeWidth={sw} strokeLinecap="round"/>
    <ellipse cx={cx-r*0.48} cy={cy+r*0.58} rx={mw*0.18} ry={mw*0.28} fill="#88ccff" opacity={0.8}/>
  </>);
  return <line x1={cx-mw*0.8} y1={cy} x2={cx+mw*0.8} y2={cy}
    stroke={s} strokeWidth={sw} strokeLinecap="round"/>;
}

// ── 鼻 ──────────────────────────────────────────────────────
function Nose({ cx, cy, r, style, skin }: {
  cx:number; cy:number; r:number; style:CharacterDNA["noseStyle"]; skin:string;
}) {
  const c = darken(skin, 38);
  if (style==="small")  return <circle cx={cx} cy={cy} r={r*0.048} fill={c} opacity={0.50}/>;
  if (style==="button") return (<>
    <circle cx={cx-r*0.13} cy={cy} r={r*0.072} fill={c} opacity={0.52}/>
    <circle cx={cx+r*0.13} cy={cy} r={r*0.072} fill={c} opacity={0.52}/>
    <path d={`M ${cx-r*0.13} ${cy} Q ${cx} ${cy+r*0.14} ${cx+r*0.13} ${cy}`}
      fill="none" stroke={c} strokeWidth={r*0.055} opacity={0.38}/>
  </>);
  return (<>
    <circle cx={cx-r*0.17} cy={cy} r={r*0.058} fill={c} opacity={0.46}/>
    <circle cx={cx+r*0.17} cy={cy} r={r*0.058} fill={c} opacity={0.46}/>
  </>);
}

// ============================================================
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  髪描画 — 「別人に見えるレベル」の差
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ============================================================

// ── 後髪 ──────────────────────────────────────────────────────
function BackHair({ cx, cy, r, color, style, isBaby }: {
  cx:number; cy:number; r:number; color:string; style:CharacterDNA["backHair"]; isBaby:boolean;
}) {
  const dark = darken(color, 30);
  if (isBaby) return <ellipse cx={cx} cy={cy-r*0.18} rx={r*1.10} ry={r*0.88} fill={color}/>;

  if (style === "short") {
    // ショート：頭の上に小さなキャップのみ、首にはみ出さない
    return (<>
      <ellipse cx={cx} cy={cy-r*0.22} rx={r*1.10} ry={r*0.88} fill={color}/>
      {/* 後頭部のテクスチャ */}
      <path d={`M ${cx-r*0.4} ${cy-r*1.0} Q ${cx} ${cy-r*1.18} ${cx+r*0.4} ${cy-r*1.0}`}
        fill={dark} opacity={0.35}/>
    </>);
  }

  if (style === "medium") {
    // ミディアム：肩あたりまで流れる、横に広がる
    return (<>
      <ellipse cx={cx} cy={cy-r*0.22} rx={r*1.12} ry={r*0.88} fill={color}/>
      {/* 左右に垂れ下がる */}
      <rect x={cx-r*1.10} y={cy-r*0.12} width={r*0.55} height={r*2.8} rx={r*0.28} fill={color}/>
      <rect x={cx+r*0.55} y={cy-r*0.12} width={r*0.55} height={r*2.8} rx={r*0.28} fill={color}/>
      {/* 毛束テクスチャ */}
      <path d={`M ${cx-r*0.82} ${cy+r*2.5} Q ${cx-r*0.90} ${cy+r*2.8} ${cx-r*0.72} ${cy+r*2.6}`}
        stroke={dark} strokeWidth={r*0.12} fill="none" opacity={0.5}/>
      <path d={`M ${cx+r*0.82} ${cy+r*2.5} Q ${cx+r*0.90} ${cy+r*2.8} ${cx+r*0.72} ${cy+r*2.6}`}
        stroke={dark} strokeWidth={r*0.12} fill="none" opacity={0.5}/>
    </>);
  }

  if (style === "long") {
    // ロング：腰まで届く長い髪（silhouetteが大きく異なる）
    return (<>
      <ellipse cx={cx} cy={cy-r*0.22} rx={r*1.12} ry={r*0.88} fill={color}/>
      <rect x={cx-r*1.10} y={cy-r*0.10} width={r*0.55} height={r*6.5} rx={r*0.28} fill={color}/>
      <rect x={cx+r*0.55} y={cy-r*0.10} width={r*0.55} height={r*6.5} rx={r*0.28} fill={color}/>
      {/* 先端のカーブ */}
      <ellipse cx={cx-r*0.82} cy={cy+r*6.2} rx={r*0.30} ry={r*0.20} fill={dark}/>
      <ellipse cx={cx+r*0.82} cy={cy+r*6.2} rx={r*0.30} ry={r*0.20} fill={dark}/>
      {/* 流れのライン */}
      <path d={`M ${cx-r*0.95} ${cy+r*1.0} Q ${cx-r*1.05} ${cy+r*3.5} ${cx-r*0.90} ${cy+r*5.5}`}
        stroke={lighten(color, 30)} strokeWidth={r*0.10} fill="none" opacity={0.3}/>
      <path d={`M ${cx+r*0.95} ${cy+r*1.0} Q ${cx+r*1.05} ${cy+r*3.5} ${cx+r*0.90} ${cy+r*5.5}`}
        stroke={lighten(color, 30)} strokeWidth={r*0.10} fill="none" opacity={0.3}/>
    </>);
  }

  // bob：頭を丸ごと包む丸みのあるヘルメット型（silhouetteが最も独特）
  return (<>
    <ellipse cx={cx} cy={cy-r*0.22} rx={r*1.14} ry={r*0.90} fill={color}/>
    {/* 横に広がる丸いボブ */}
    <rect x={cx-r*1.12} y={cy-r*0.08} width={r*2.24} height={r*1.20} rx={r*0.35} fill={color}/>
    {/* 毛先のカーブ（内側に巻く） */}
    <path d={`M ${cx-r*1.08} ${cy+r*1.05} Q ${cx-r*0.80} ${cy+r*1.42} ${cx-r*0.38} ${cy+r*1.25}`}
      fill={dark} opacity={0.4}/>
    <path d={`M ${cx+r*1.08} ${cy+r*1.05} Q ${cx+r*0.80} ${cy+r*1.42} ${cx+r*0.38} ${cy+r*1.25}`}
      fill={dark} opacity={0.4}/>
  </>);
}

// ── 前髪（輪郭シルエットが各スタイルで完全に異なる） ────────────
function FrontHair({ cx, cy, r, color, style }: {
  cx:number; cy:number; r:number; color:string; style:CharacterDNA["frontHair"];
}) {
  const dark = darken(color, 28);
  const lite = lighten(color, 35);
  const top  = cy - r * 0.94;
  const brow = cy - r * 0.30;   // 眉の高さ（前髪がかかる深さ）
  const mid  = cy - r * 0.52;

  if (style === "none") {
    // なし：おでこが完全に見える（対比のため敢えて何も描かない）
    return null;
  }

  if (style === "bangs") {
    // 全前髪：おでこ全体を覆う厚い前髪（目の直上まで）
    return (<>
      {/* メイン前髪ブロック */}
      <rect x={cx-r*0.94} y={top} width={r*1.88} height={brow-top} rx={r*0.06} fill={color}/>
      {/* 前髪の束感（縦の暗い線） */}
      <line x1={cx-r*0.55} y1={top+r*0.06} x2={cx-r*0.40} y2={brow-r*0.04}
        stroke={dark} strokeWidth={r*0.09} strokeLinecap="round" opacity={0.52}/>
      <line x1={cx+r*0.10} y1={top+r*0.05} x2={cx+r*0.02} y2={brow-r*0.04}
        stroke={dark} strokeWidth={r*0.09} strokeLinecap="round" opacity={0.52}/>
      <line x1={cx+r*0.55} y1={top+r*0.06} x2={cx+r*0.62} y2={brow-r*0.08}
        stroke={dark} strokeWidth={r*0.09} strokeLinecap="round" opacity={0.52}/>
      {/* ハイライト（上部） */}
      <rect x={cx-r*0.80} y={top+r*0.04} width={r*0.60} height={r*0.18} rx={r*0.08} fill={lite} opacity={0.30}/>
    </>);
  }

  if (style === "side") {
    // サイドスウェプト：右に大きく流れる非対称前髪（silhouetteで一目で分かる）
    return (<>
      {/* 大きく右に流れるメイン前髪 */}
      <polygon points={`
        ${cx-r*0.90},${top}
        ${cx+r*0.92},${top}
        ${cx+r*0.92},${brow+r*0.08}
        ${cx+r*0.20},${mid+r*0.04}
        ${cx-r*0.20},${brow+r*0.08}
        ${cx-r*0.90},${brow+r*0.02}
      `} fill={color}/>
      {/* 流れる方向の束感 */}
      <path d={`M ${cx-r*0.30} ${top+r*0.06} Q ${cx+r*0.58} ${mid} ${cx+r*0.85} ${brow+r*0.06}`}
        stroke={dark} strokeWidth={r*0.10} strokeLinecap="round" fill="none" opacity={0.45}/>
      <path d={`M ${cx+r*0.10} ${top+r*0.05} Q ${cx+r*0.75} ${mid+r*0.10} ${cx+r*0.90} ${brow+r*0.06}`}
        stroke={dark} strokeWidth={r*0.08} strokeLinecap="round" fill="none" opacity={0.35}/>
      {/* 飛び出す毛先 */}
      <path d={`M ${cx+r*0.80} ${top} Q ${cx+r*1.05} ${top-r*0.18} ${cx+r*0.92} ${top+r*0.22}`}
        fill={dark} opacity={0.45}/>
    </>);
  }

  // center：センター分けで両側に垂れる（顔横まで覆う）
  // none以外でもっとも長く垂れる → silhouetteが大きく変わる
  return (<>
    {/* 左の前髪（耳の前まで垂れる） */}
    <polygon points={`
      ${cx-r*0.06},${top+r*0.10}
      ${cx-r*0.94},${top}
      ${cx-r*0.94},${brow+r*0.15}
      ${cx-r*0.48},${mid+r*0.05}
    `} fill={color}/>
    {/* 右の前髪 */}
    <polygon points={`
      ${cx+r*0.06},${top+r*0.10}
      ${cx+r*0.94},${top}
      ${cx+r*0.94},${brow+r*0.15}
      ${cx+r*0.48},${mid+r*0.05}
    `} fill={color}/>
    {/* センター分け目（白いハイライトライン） */}
    <line x1={cx} y1={top-r*0.04} x2={cx} y2={cy-r*0.72}
      stroke={lite} strokeWidth={r*0.07} strokeLinecap="round" opacity={0.65}/>
    {/* 束感 */}
    <path d={`M ${cx-r*0.55} ${top+r*0.08} L ${cx-r*0.42} ${brow+r*0.14}`}
      stroke={dark} strokeWidth={r*0.09} strokeLinecap="round" opacity={0.42}/>
    <path d={`M ${cx+r*0.55} ${top+r*0.08} L ${cx+r*0.42} ${brow+r*0.14}`}
      stroke={dark} strokeWidth={r*0.09} strokeLinecap="round" opacity={0.42}/>
  </>);
}

// ============================================================
// HeadLayer
// 顔中心: cx, cy=4.2, r=4.0
// ============================================================
interface HeadProps {
  cx:number; cy:number; r:number;
  dna: CharacterDNA; expr: Expression; stage: AgeStage;
}

function HeadLayer({ cx, cy, r, dna, expr, stage }: HeadProps) {
  const isBaby  = stage === "baby" || stage === "toddler";
  const isOld   = stage === "middleage" || stage === "elder";
  const isElder = stage === "elder";

  const hairColor = agingHair(dna.hairColor, stage);
  const skin = dna.skinTone;
  const noseY  = cy + r * 0.21;
  const mouthY = cy + r * 0.52;

  return (<>
    {/* 1. 後髪 */}
    <BackHair cx={cx} cy={cy} r={r} color={hairColor} style={dna.backHair || "short"} isBaby={isBaby}/>

    {/* 2. 顔の輪郭 */}
    <FaceShape cx={cx} cy={cy} r={r} shape={dna.faceShape || "round"} fill={skin}/>

    {/* 3. 赤ちゃんのほっぺ */}
    {isBaby && (<>
      <ellipse cx={cx-r*0.56} cy={cy+r*0.24} rx={r*0.30} ry={r*0.20} fill="#ffaacc" opacity={0.65}/>
      <ellipse cx={cx+r*0.56} cy={cy+r*0.24} rx={r*0.30} ry={r*0.20} fill="#ffaacc" opacity={0.65}/>
    </>)}

    {/* 普通のほっぺブラッシュ */}
    {!isBaby && expr !== "sad" && expr !== "tired" && (<>
      <ellipse cx={cx-r*0.60} cy={cy+r*0.16} rx={r*0.23} ry={r*0.14} fill="#ffaacc" opacity={0.28}/>
      <ellipse cx={cx+r*0.60} cy={cy+r*0.16} rx={r*0.23} ry={r*0.14} fill="#ffaacc" opacity={0.28}/>
    </>)}

    {/* しわ（老年） */}
    {isOld && (<>
      <path d={`M ${cx-r*0.56} ${cy-r*0.14} Q ${cx-r*0.36} ${cy-r*0.02} ${cx-r*0.16} ${cy-r*0.14}`}
        fill="none" stroke={darken(skin,18)} strokeWidth={r*0.055} opacity={isElder?0.70:0.36}/>
      <path d={`M ${cx+r*0.16} ${cy-r*0.14} Q ${cx+r*0.36} ${cy-r*0.02} ${cx+r*0.56} ${cy-r*0.14}`}
        fill="none" stroke={darken(skin,18)} strokeWidth={r*0.055} opacity={isElder?0.70:0.36}/>
    </>)}
    {isElder && (
      <path d={`M ${cx-r*0.36} ${cy+r*0.32} Q ${cx} ${cy+r*0.44} ${cx+r*0.36} ${cy+r*0.32}`}
        fill="none" stroke={darken(skin,15)} strokeWidth={r*0.05} opacity={0.45}/>
    )}

    {/* 4. 目 */}
    <Eyes cx={cx} cy={cy} r={r} dna={dna} isBaby={isBaby}/>

    {/* 5. 眉毛（目に連動） */}
    {!isBaby && <Eyebrows cx={cx} cy={cy} r={r} dna={dna} expr={expr}/>}

    {/* 6. 鼻 */}
    {!isBaby && <Nose cx={cx} cy={noseY} r={r} style={dna.noseStyle || "normal"} skin={skin}/>}

    {/* 7. 口 */}
    <Mouth cx={cx} cy={mouthY} r={r} expr={expr} size={dna.mouthBase || "normal"}/>

    {/* 8. 前髪（最前面） */}
    {!isBaby && (
      <FrontHair cx={cx} cy={cy} r={r} color={hairColor} style={dna.frontHair || "bangs"}/>
    )}
  </>);
}

// ============================================================
// 服装テーマ
// ============================================================
interface ClothingTheme { jacket:string; shirt:string; tie:string; pants:string; }
function getClothingTheme(job: JobType, c: string): ClothingTheme {
  switch (job) {
    case "salaryman": case "civil_servant":
      return { jacket:"#1e3050", shirt:"#f0ece4", tie:c, pants:"#0f1a30" };
    case "lawyer":
      return { jacket:"#14142a", shirt:"#e8e4d8", tie:"#800000", pants:"#0a0a18" };
    case "entrepreneur": case "investor": case "shadow_ruler":
      return { jacket:"#0c0c1c", shirt:"#e4dece", tie:"#c8a000", pants:"#060610" };
    case "doctor":
      return { jacket:"#dce8f2", shirt:"#dce8f2", tie:"#2a5fa8", pants:"#1e3050" };
    case "baseball":
      return { jacket:"#f0ece4", shirt:"#f0ece4", tie:c, pants:"#f0ece4" };
    case "carpenter":
      return { jacket:"#7a5510", shirt:"#c89020", tie:"", pants:"#4a3008" };
    case "astronaut":
      return { jacket:"#c0cce0", shirt:"#c0cce0", tie:"#4060c0", pants:"#9098b8" };
    default:
      return { jacket:c, shirt:"#f0ece4", tie:darken(c,30), pants:darken(c,55) };
  }
}
function getJobBadge(job: JobType): string|null {
  const m: Partial<Record<JobType,string>> = {
    salaryman:"💼",civil_servant:"💼",engineer:"💻",artist:"🎨",
    entrepreneur:"🎩",doctor:"🩺",lawyer:"⚖️",youtuber:"📹",
    freelancer:"🖥️",part_time:"🏷️",comedian:"🎭",carpenter:"🔨",
    baseball:"⚾",inventor:"⚙️",investor:"💎",astronaut:"🚀",
    pro_gamer:"🎮",shadow_ruler:"👁️",legendary_neet:"🛋️",
  };
  return m[job] ?? null;
}

// ============================================================
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ボディ描画 — 2〜2.5頭身SD比率
//  viewBox 0 0 16 26
//  頭: cx=8, cy=4.2, r=4.0 (y=0.2〜8.2 = 8px = 31%)
//  体: y=8.8〜17.0 (8.2px = 32%)
//  足: y=17.0〜25.5 (8.5px = 33%)
//  くつ: y=24〜26
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ============================================================
interface StageProps { dna:CharacterDNA; color:string; expr:Expression; job:JobType; }

// ─── 赤ちゃん ────────────────────────────────────────────────
function Baby({ dna, color, expr }: StageProps) {
  return (<>
    <ellipse cx={8} cy={17.2} rx={5.0} ry={4.2} fill={color}/>
    <ellipse cx={8} cy={15.5} rx={3.6} ry={3.0} fill={lighten(color, 32)}/>
    <circle cx={3.0} cy={16.8} r={1.4} fill={dna.skinTone}/>
    <circle cx={13.0} cy={16.8} r={1.4} fill={dna.skinTone}/>
    <rect x={6.8} y={8.2} width={2.4} height={1.5} fill={dna.skinTone}/>
    <HeadLayer cx={8} cy={4.2} r={4.4} dna={dna} expr={expr} stage="baby"/>
  </>);
}

// ─── 幼児 ────────────────────────────────────────────────────
function Toddler({ dna, color, expr }: StageProps) {
  const dc = darken(color, 42);
  return (<>
    <ellipse cx={8} cy={14.2} rx={4.4} ry={3.6} fill={color}/>
    <ellipse cx={2.8} cy={13.8} rx={1.7} ry={1.0} fill={color} transform="rotate(-18,2.8,13.8)"/>
    <ellipse cx={13.2} cy={13.8} rx={1.7} ry={1.0} fill={color} transform="rotate(18,13.2,13.8)"/>
    <circle cx={1.5} cy={14.8} r={1.2} fill={dna.skinTone}/>
    <circle cx={14.5} cy={14.8} r={1.2} fill={dna.skinTone}/>
    <rect x={4.6} y={17.2} width={3.0} height={5.5} rx={1.5} fill={dc}/>
    <rect x={8.4} y={17.2} width={3.0} height={5.5} rx={1.5} fill={dc}/>
    <ellipse cx={6.1} cy={22.3} rx={2.0} ry={1.0} fill={darken(dc, 25)}/>
    <ellipse cx={9.9} cy={22.3} rx={2.0} ry={1.0} fill={darken(dc, 25)}/>
    <rect x={6.8} y={7.8} width={2.4} height={1.5} fill={dna.skinTone}/>
    <HeadLayer cx={8} cy={4.0} r={4.2} dna={dna} expr={expr} stage="toddler"/>
  </>);
}

// ─── 小学生 ──────────────────────────────────────────────────
function Child({ dna, color, expr }: StageProps) {
  const skin = dna.skinTone; const dc = darken(color, 44); const W = "#f0ece4";
  return (<>
    {/* ランドセル */}
    <rect x={10.8} y={9.6} width={4.0} height={5.5} rx={1.2} fill={dc}/>
    <rect x={11.6} y={8.7} width={2.4} height={1.4} rx={0.6} fill={darken(dc,18)}/>
    <circle cx={12.8} cy={12.4} r={0.65} fill={lighten(dc,28)}/>
    {/* 体 */}
    <rect x={3.8} y={9.2} width={8.2} height={8.0} rx={1.8} fill={W}/>
    <polygon points="6.8,9.2 9.2,9.2 8,12.2" fill={color}/>
    {/* 腕 */}
    <rect x={1.5} y={9.5} width={2.8} height={5.0} rx={1.4} fill={W}/>
    <rect x={11.7} y={9.5} width={2.8} height={5.0} rx={1.4} fill={W}/>
    <circle cx={2.0} cy={14.0} r={1.25} fill={skin}/>
    <circle cx={14.0} cy={14.0} r={1.25} fill={skin}/>
    {/* スカート/ズボン */}
    <rect x={4.5} y={17.0} width={7.0} height={4.8} rx={1.2} fill={color}/>
    {/* 足 */}
    <rect x={4.8} y={20.6} width={2.8} height={4.5} rx={1.4} fill={skin}/>
    <rect x={8.4} y={20.6} width={2.8} height={4.5} rx={1.4} fill={skin}/>
    <ellipse cx={6.2} cy={24.6} rx={2.2} ry={1.0} fill="#302010"/>
    <ellipse cx={9.8} cy={24.6} rx={2.2} ry={1.0} fill="#302010"/>
    <rect x={6.8} y={8.2} width={2.4} height={1.5} fill={skin}/>
    <HeadLayer cx={8} cy={4.0} r={4.0} dna={dna} expr={expr} stage="child"/>
  </>);
}

// ─── 中学生 ──────────────────────────────────────────────────
function Middle({ dna, color, expr }: StageProps) {
  const skin = dna.skinTone; const dc = darken(color, 48);
  return (<>
    <rect x={3.5} y={9.0} width={9.0} height={8.2} rx={1.5} fill={color}/>
    <rect x={6.0} y={9.0} width={4.0} height={3.8} fill="#f0ece4"/>
    <rect x={2.0} y={9.4} width={2.8} height={5.0} rx={1.4} fill={color}/>
    <rect x={11.2} y={9.4} width={2.8} height={5.0} rx={1.4} fill={color}/>
    <circle cx={1.7} cy={13.9} r={1.25} fill={skin}/>
    <circle cx={14.3} cy={13.9} r={1.25} fill={skin}/>
    <rect x={4.2} y={17.0} width={7.6} height={4.5} rx={1.2} fill={dc}/>
    <rect x={4.5} y={20.5} width={2.8} height={4.8} rx={1.4} fill={dc}/>
    <rect x={8.7} y={20.5} width={2.8} height={4.8} rx={1.4} fill={dc}/>
    <ellipse cx={5.9} cy={24.8} rx={2.2} ry={1.0} fill="#1a1a1a"/>
    <ellipse cx={10.1} cy={24.8} rx={2.2} ry={1.0} fill="#1a1a1a"/>
    <rect x={6.8} y={8.0} width={2.4} height={1.5} fill={skin}/>
    <HeadLayer cx={8} cy={4.0} r={4.0} dna={dna} expr={expr} stage="middle"/>
  </>);
}

// ─── 高校生 ──────────────────────────────────────────────────
function HighSchool({ dna, color, expr }: StageProps) {
  const skin = dna.skinTone; const jk="#1e3464"; const dc=darken(color,40);
  return (<>
    <rect x={3.0} y={8.8} width={10.0} height={8.5} rx={1.5} fill={jk}/>
    <rect x={5.5} y={8.8} width={5.0} height={7.0} fill="#f0ece4"/>
    <rect x={7.2} y={9.1} width={1.6} height={6.0} rx={0.7} fill={color}/>
    <rect x={1.4} y={9.2} width={2.8} height={5.2} rx={1.4} fill={jk}/>
    <rect x={11.8} y={9.2} width={2.8} height={5.2} rx={1.4} fill={jk}/>
    <circle cx={1.6} cy={13.9} r={1.25} fill={skin}/>
    <circle cx={14.4} cy={13.9} r={1.25} fill={skin}/>
    <rect x={4.0} y={17.1} width={3.5} height={8.0} rx={1.6} fill={dc}/>
    <rect x={8.5} y={17.1} width={3.5} height={8.0} rx={1.6} fill={dc}/>
    <ellipse cx={5.75} cy={24.6} rx={2.2} ry={1.0} fill="#1a1a2a"/>
    <ellipse cx={10.25} cy={24.6} rx={2.2} ry={1.0} fill="#1a1a2a"/>
    <rect x={6.8} y={7.8} width={2.4} height={1.5} fill={skin}/>
    <HeadLayer cx={8} cy={4.0} r={4.0} dna={dna} expr={expr} stage="highschool"/>
  </>);
}

// ─── 若者〜中年（共通ボディ） ────────────────────────────────
function AdultBody({ dna, color, expr, job, stage }: StageProps & {stage:AgeStage}) {
  const skin = dna.skinTone;
  const t = getClothingTheme(job, color);
  const isMid = stage === "middleage";
  const bw = isMid ? 11.2 : 10.2;  // 肩幅
  const bx = 8 - bw / 2;

  return (<>
    {/* ジャケット */}
    <rect x={bx} y={8.8} width={bw} height={isMid?8.8:8.4} rx={1.6} fill={t.jacket}/>
    {/* シャツ */}
    <rect x={5.6} y={8.8} width={4.8} height={isMid?7.2:6.8} fill={t.shirt}/>
    {/* ネクタイ */}
    {t.tie && (
      <polygon points={`7.2,8.8 8.8,8.8 9.3,${8.8+5.2} 8.0,${8.8+6.0} 6.7,${8.8+5.2}`} fill={t.tie}/>
    )}
    {/* ポケットチーフ */}
    {(job==="entrepreneur"||job==="investor"||job==="shadow_ruler") && (
      <rect x={bx+0.5} y={9.6} width={1.5} height={1.1} rx={0.3} fill="#e8d080"/>
    )}
    {/* 腕 */}
    <rect x={bx-2.8} y={9.2} width={2.8} height={5.2} rx={1.4} fill={t.jacket}/>
    <rect x={bx+bw-0.0} y={9.2} width={2.8} height={5.2} rx={1.4} fill={t.jacket}/>
    <circle cx={bx-1.6} cy={13.8} r={1.35} fill={skin}/>
    <circle cx={bx+bw+1.6} cy={13.8} r={1.35} fill={skin}/>
    {/* ズボン */}
    <rect x={4.2} y={17.4} width={3.6} height={7.5} rx={1.7} fill={t.pants}/>
    <rect x={8.2} y={17.4} width={3.6} height={7.5} rx={1.7} fill={t.pants}/>
    {/* くつ */}
    <ellipse cx={6.0} cy={24.4} rx={2.5} ry={1.1} fill={darken(t.pants,28)}/>
    <ellipse cx={10.0} cy={24.4} rx={2.5} ry={1.1} fill={darken(t.pants,28)}/>
    {/* 首 */}
    <rect x={6.8} y={7.8} width={2.4} height={1.5} fill={skin}/>
    <HeadLayer cx={8} cy={4.0} r={isMid?4.2:4.0} dna={dna} expr={expr} stage={stage}/>
  </>);
}

function Young(p: StageProps)     { return <AdultBody {...p} stage="young"/>; }
function Adult(p: StageProps)     { return <AdultBody {...p} stage="adult"/>; }
function MiddleAge(p: StageProps) { return <AdultBody {...p} stage="middleage"/>; }

// ─── 老人 ────────────────────────────────────────────────────
function Elder({ dna, color, expr }: StageProps) {
  const skin = dna.skinTone;
  return (<>
    <rect x={3.5} y={9.2} width={9.0} height={7.8} rx={2.4} fill={color}/>
    <rect x={2.0} y={9.6} width={2.5} height={4.8} rx={1.3} fill={color}/>
    <rect x={11.5} y={9.6} width={2.5} height={4.8} rx={1.3} fill={color}/>
    <circle cx={1.8} cy={13.9} r={1.2} fill={skin}/>
    <circle cx={14.2} cy={13.9} r={1.2} fill={skin}/>
    <rect x={4.2} y={16.8} width={3.3} height={7.2} rx={1.6} fill={"#3a3a58"}/>
    <rect x={8.5} y={16.8} width={3.3} height={7.2} rx={1.6} fill={"#3a3a58"}/>
    <ellipse cx={5.85} cy={23.6} rx={2.3} ry={1.0} fill="#222230"/>
    <ellipse cx={10.15} cy={23.6} rx={2.3} ry={1.0} fill="#222230"/>
    <line x1={13.5} y1={12.0} x2={15.2} y2={24.0}
      stroke={"#8a6a40"} strokeWidth={1.7} strokeLinecap="round"/>
    <ellipse cx={14.0} cy={12.0} rx={1.7} ry={1.0} fill={"#8a6a40"}/>
    <rect x={6.8} y={8.2} width={2.4} height={1.5} fill={skin}/>
    <HeadLayer cx={8} cy={4.2} r={4.2} dna={dna} expr={expr} stage="elder"/>
  </>);
}

// ============================================================
// PixelAvatarBody — export
// ============================================================
export function PixelAvatarBody({
  dna, stage, happiness, job, isDebt = false,
}: {
  dna: CharacterDNA; stage: AgeStage; happiness: number; job: JobType; isDebt?: boolean;
}) {
  const expr  = getExpression(happiness, isDebt);
  const color = dna.clothesColor;
  const sp: StageProps = { dna, color, expr, job };
  const map: Record<AgeStage, React.ReactNode> = {
    baby: <Baby {...sp}/>, toddler: <Toddler {...sp}/>, child: <Child {...sp}/>,
    middle: <Middle {...sp}/>, highschool: <HighSchool {...sp}/>,
    young: <Young {...sp}/>, adult: <Adult {...sp}/>, middleage: <MiddleAge {...sp}/>,
    elder: <Elder {...sp}/>,
  };
  return <>{map[stage]}</>;
}

// ============================================================
// DotAvatar
// ============================================================
interface Props { player:Player; size?:number; shadow?:boolean; customization?:AvatarCustomization; }

export function DotAvatar({ player, size = 32, shadow = false }: Props) {
  const ci    = AVATAR_COLORS[player.avatar.color];
  const W     = size; const H = Math.round(size * 1.65);
  const age   = posToAgeForAvatar(player.position);
  const stage = ageToStage(age);
  const isDebt = player.money < -500;

  const dna = player.customization
    ? customizationToDNA(player.customization)
    : { ...generateDNA(player.playerId), clothesColor: ci.bg };

  const jobBadge = (player.job !== "none" && player.job !== "part_time")
    ? getJobBadge(player.job) : null;
  const badgeFS = Math.max(8, Math.round(size * 0.28));

  return (
    <div style={{ position:"relative", display:"inline-flex",
      alignItems:"center", justifyContent:"center", width:W, height:H }}>
      <svg width={W} height={H} viewBox="0 0 16 26"
        style={{ overflow:"visible",
          filter: shadow ? "drop-shadow(0 2px 6px rgba(0,0,0,0.8))" : undefined }}>
        <PixelAvatarBody dna={dna} stage={stage} happiness={player.happiness}
          job={player.job} isDebt={isDebt}/>
      </svg>
      {player.isMarried && (
        <span style={{ position:"absolute",top:-2,right:-4,fontSize:badgeFS,lineHeight:1,
          filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.6))",pointerEvents:"none" }}>💍</span>
      )}
      {player.hasChildren && (
        <span style={{ position:"absolute",bottom:0,left:-4,fontSize:badgeFS,lineHeight:1,
          filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.6))",pointerEvents:"none" }}>👶</span>
      )}
      {player.money >= 1000 && !player.isMarried && (
        <span style={{ position:"absolute",top:-2,right:-4,fontSize:badgeFS,lineHeight:1,
          filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.6))",pointerEvents:"none" }}>⌚</span>
      )}
      {jobBadge && (
        <span style={{ position:"absolute",bottom:0,right:-4,fontSize:badgeFS,lineHeight:1,
          filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.6))",pointerEvents:"none" }}>{jobBadge}</span>
      )}
      {player.hasPet && (
        <span style={{ position:"absolute",bottom:Math.round(size*0.45),left:-4,
          fontSize:Math.max(7,Math.round(size*0.22)),lineHeight:1,
          filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.6))",pointerEvents:"none" }}>🐾</span>
      )}
    </div>
  );
}

// ============================================================
// マップ用トークン
// ============================================================
interface TokenProps { player:Player; size?:number; isActive?:boolean; }

export function DotAvatarToken({ player, size = 20, isActive = false }: TokenProps) {
  const ci    = AVATAR_COLORS[player.avatar.color];
  const age   = posToAgeForAvatar(player.position);
  const stage = ageToStage(age);
  const isDebt = player.money < -500;
  const dna = player.customization
    ? customizationToDNA(player.customization)
    : { ...generateDNA(player.playerId), clothesColor: ci.bg };

  return (
    <div style={{
      width:size, height:size, borderRadius:"50%",
      backgroundColor:ci.bg,
      border: isActive ? "2px solid #fff" : `2px solid ${darken(ci.bg,40)}`,
      boxShadow: isActive
        ? `0 0 8px ${ci.bg},0 0 4px #fff,0 2px 4px rgba(0,0,0,0.6)`
        : "0 2px 4px rgba(0,0,0,0.5)",
      overflow:"hidden", display:"flex", alignItems:"flex-end", justifyContent:"center",
    }}>
      <svg width={size-2} height={size-1} viewBox="0 0 16 26" style={{ marginBottom:-2 }}>
        <PixelAvatarBody dna={dna} stage={stage} happiness={50} job={player.job} isDebt={isDebt}/>
      </svg>
    </div>
  );
}
