"use client";
import type { Player, JobType, AvatarCustomization } from "@/types/game";
import { AVATAR_COLORS } from "@/types/game";

// ============================================================
// ユーティリティ
// ============================================================
function blendHex(c1: string, c2: string, t: number): string {
  const safe = (s: string) => s.startsWith("#") ? s : "#888";
  const n1 = parseInt(safe(c1).slice(1), 16);
  const n2 = parseInt(safe(c2).slice(1), 16);
  const r = Math.round(((n1>>16)&255)*(1-t)+((n2>>16)&255)*t);
  const g = Math.round((((n1>>8)&255)*(1-t)+((n2>>8)&255)*t));
  const b = Math.round(((n1&255)*(1-t)+(n2&255)*t));
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}
function darken(hex: string, amt = 40): string {
  if (!hex.startsWith("#")) return hex;
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0,(n>>16)-amt);
  const g = Math.max(0,((n>>8)&0xff)-amt);
  const b = Math.max(0,(n&0xff)-amt);
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}
function lighten(hex: string, amt = 40): string {
  if (!hex.startsWith("#")) return hex;
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255,(n>>16)+amt);
  const g = Math.min(255,((n>>8)&0xff)+amt);
  const b = Math.min(255,(n&0xff)+amt);
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}
function agingHair(base: string, stage: AgeStage): string {
  if (stage==="elder")     return blendHex(base,"#c8c8d0",0.82);
  if (stage==="middleage") return blendHex(base,"#c8c8d0",0.25);
  return base;
}

// ============================================================
// CharacterDNA
// ============================================================
export interface CharacterDNA {
  hairColor:    string;
  skinTone:     string;
  eyeColor:     string;
  hairStyle:    0|1|2;
  gender:       "male"|"female";
  eyeShape:     "normal"|"big"|"sharp"|"sleepy";
  faceShape:    "round"|"square"|"slim";
  noseStyle:    "normal"|"small"|"button";
  mouthBase:    "wide"|"normal"|"small";
  frontHair:    "bangs"|"side"|"center"|"none";
  backHair:     "short"|"medium"|"long"|"bob";
  clothesColor: string;
}

const DNA_HAIR  = ["#1a0808","#3d2010","#1a1a1a","#6B2A08","#c8a050","#221844","#4a2010","#b83000"];
const DNA_EYES  = ["#1a4830","#1a2848","#3a1808","#302020"];

export function generateDNA(playerId: string): CharacterDNA {
  let h = 5381;
  for (let i=0;i<playerId.length;i++){h=((h<<5)+h)^playerId.charCodeAt(i);h>>>=0;}
  const eyeShapes: CharacterDNA["eyeShape"][]   = ["normal","big","sharp","sleepy"];
  const faceShapes: CharacterDNA["faceShape"][] = ["round","square","slim"];
  const noseStyles: CharacterDNA["noseStyle"][] = ["normal","small","button"];
  const mouthBases: CharacterDNA["mouthBase"][] = ["wide","normal","small"];
  const frontHairs: CharacterDNA["frontHair"][] = ["bangs","side","center","none"];
  const backHairs:  CharacterDNA["backHair"][]  = ["short","medium","long","bob"];
  const clothes = ["#2563eb","#dc2626","#16a34a","#7c3aed","#d97706","#db2777","#0891b2","#c2410c"];
  return {
    hairColor:    DNA_HAIR[h%DNA_HAIR.length],
    skinTone:     "#f5c98a",
    eyeColor:     DNA_EYES[(h>>8)%DNA_EYES.length],
    hairStyle:    ((h>>12)%3) as 0|1|2,
    gender:       ((h>>4)%2)===0?"male":"female",
    eyeShape:     eyeShapes[(h>>6)%4],
    faceShape:    faceShapes[(h>>10)%3],
    noseStyle:    noseStyles[(h>>14)%3],
    mouthBase:    mouthBases[(h>>16)%3],
    frontHair:    frontHairs[(h>>18)%4],
    backHair:     backHairs[(h>>20)%4],
    clothesColor: clothes[(h>>22)%clothes.length],
  };
}

export function customizationToDNA(c: AvatarCustomization): CharacterDNA {
  return {
    hairColor:    c.hairColor,
    skinTone:     c.skinColor,
    eyeColor:     "#1a4830",
    hairStyle:    0,
    gender:       c.gender,
    eyeShape:     c.eyes,
    faceShape:    c.outline,
    noseStyle:    c.nose,
    mouthBase:    c.mouth,
    frontHair:    c.frontHair,
    backHair:     c.backHair,
    clothesColor: c.clothesColor,
  };
}

// ============================================================
// 年齢ステージ
// ============================================================
export type AgeStage =
  |"baby"|"toddler"|"child"|"middle"|"highschool"|"young"|"adult"|"middleage"|"elder";

export const AGE_STAGE_LABELS: Record<AgeStage,string> = {
  baby:"赤ちゃん",toddler:"幼児",child:"小学生",middle:"中学生",
  highschool:"高校生",young:"若者",adult:"社会人",middleage:"中年",elder:"老人",
};

export function ageToStage(age: number): AgeStage {
  if (age<=2)  return "baby";
  if (age<=5)  return "toddler";
  if (age<=12) return "child";
  if (age<=15) return "middle";
  if (age<=18) return "highschool";
  if (age<=29) return "young";
  if (age<=49) return "adult";
  if (age<=64) return "middleage";
  return "elder";
}

export function posToAgeForAvatar(position: number): number {
  if (position<=14)  return Math.round((position/14)*5);
  if (position<=25)  return 6+Math.round(((position-15)/10)*6);
  if (position<=39)  return 13+Math.round(((position-26)/13)*2);
  if (position<=50)  return 16+Math.round(((position-40)/10)*2);
  if (position<=58)  return 18+Math.round(((position-50)/8)*5);
  if (position<=69)  return 23+Math.round(((position-58)/11)*4);
  if (position<=110) return 27+Math.round(((position-70)/40)*13);
  if (position<=134) return 41+Math.round(((position-111)/23)*23);
  return 65+Math.round(((position-135)/15)*20);
}

// ============================================================
// 表情
// ============================================================
type Expression = "very_happy"|"happy"|"neutral"|"tired"|"sad";
function getExpression(happiness: number, isDebt: boolean): Expression {
  if (isDebt&&happiness<30) return "sad";
  if (happiness>=85) return "very_happy";
  if (happiness>=60) return "happy";
  if (happiness>=40) return "neutral";
  if (happiness>=20) return "tired";
  return "sad";
}

// ============================================================
// ─────────────── 顔パーツ描画 ───────────────
// ============================================================

/** 目（アニメ風・大きな白目 + カラーアイリス） */
function Eyes({
  cx, cy, r, dna, isBaby, stage
}: {
  cx:number; cy:number; r:number;
  dna: CharacterDNA; isBaby:boolean; stage:AgeStage;
}) {
  // 目の位置
  const eyeX  = r * 0.40;
  const eyeY  = isBaby ? r*0.05 : r*0.02;
  const lx = cx - eyeX;
  const rx = cx + eyeX;
  const ey = cy - eyeY;

  const iris   = dna.eyeColor;
  const pupil  = blendHex(iris,"#000000",0.7);

  // 目の大きさ（形状別）
  if (dna.eyeShape==="big") {
    const sr=isBaby?r*0.30:r*0.26;   // 白目
    const ir=sr*0.72;                  // 虹彩
    const pr=sr*0.40;                  // 瞳孔
    return (<>
      {/* 上まつげ */}
      <path d={`M ${lx-sr} ${ey-sr*0.3} Q ${lx} ${ey-sr*1.1} ${lx+sr} ${ey-sr*0.3}`}
        fill={darken(dna.hairColor,10)} strokeWidth={0} opacity={0.9}/>
      <path d={`M ${rx-sr} ${ey-sr*0.3} Q ${rx} ${ey-sr*1.1} ${rx+sr} ${ey-sr*0.3}`}
        fill={darken(dna.hairColor,10)} strokeWidth={0} opacity={0.9}/>
      {/* 白目 */}
      <circle cx={lx} cy={ey} r={sr} fill="white"/>
      <circle cx={rx} cy={ey} r={sr} fill="white"/>
      {/* 虹彩グラデ風 */}
      <circle cx={lx} cy={ey+ir*0.08} r={ir} fill={iris}/>
      <circle cx={rx} cy={ey+ir*0.08} r={ir} fill={iris}/>
      {/* 虹彩上部ハイライト */}
      <circle cx={lx} cy={ey-ir*0.1} r={ir*0.62} fill={lighten(iris,40)} opacity={0.45}/>
      <circle cx={rx} cy={ey-ir*0.1} r={ir*0.62} fill={lighten(iris,40)} opacity={0.45}/>
      {/* 瞳孔 */}
      <circle cx={lx} cy={ey+pr*0.1} r={pr} fill={pupil}/>
      <circle cx={rx} cy={ey+pr*0.1} r={pr} fill={pupil}/>
      {/* ハイライト2点 */}
      <circle cx={lx+sr*0.38} cy={ey-sr*0.32} r={sr*0.24} fill="white"/>
      <circle cx={rx+sr*0.38} cy={ey-sr*0.32} r={sr*0.24} fill="white"/>
      <circle cx={lx-sr*0.28} cy={ey+sr*0.32} r={sr*0.10} fill="white" opacity={0.7}/>
      <circle cx={rx-sr*0.28} cy={ey+sr*0.32} r={sr*0.10} fill="white" opacity={0.7}/>
    </>);
  }

  if (dna.eyeShape==="sharp") {
    const sr=r*0.22; const ir=sr*0.68; const pr=sr*0.38;
    return (<>
      {/* 切れ長の目 — 傾いた楕円 */}
      <ellipse cx={lx} cy={ey} rx={sr*1.5} ry={sr*0.7} fill="white" transform={`rotate(-12,${lx},${ey})`}/>
      <ellipse cx={rx} cy={ey} rx={sr*1.5} ry={sr*0.7} fill="white" transform={`rotate(12,${rx},${ey})`}/>
      <ellipse cx={lx} cy={ey+sr*0.05} rx={ir*1.4} ry={ir*0.65} fill={iris} transform={`rotate(-12,${lx},${ey})`}/>
      <ellipse cx={rx} cy={ey+sr*0.05} rx={ir*1.4} ry={ir*0.65} fill={iris} transform={`rotate(12,${rx},${ey})`}/>
      <circle cx={lx} cy={ey} r={pr} fill={pupil}/>
      <circle cx={rx} cy={ey} r={pr} fill={pupil}/>
      {/* 鋭いハイライト */}
      <ellipse cx={lx+sr*0.5} cy={ey-sr*0.3} rx={sr*0.25} ry={sr*0.15} fill="white"/>
      <ellipse cx={rx+sr*0.5} cy={ey-sr*0.3} rx={sr*0.25} ry={sr*0.15} fill="white"/>
      {/* 上まぶたライン */}
      <path d={`M ${lx-sr*1.4} ${ey-sr*0.6} L ${lx+sr*1.4} ${ey-sr*0.2}`}
        stroke={darken(dna.hairColor,10)} strokeWidth={sr*0.35} strokeLinecap="round" fill="none"/>
      <path d={`M ${rx-sr*1.4} ${ey-sr*0.2} L ${rx+sr*1.4} ${ey-sr*0.6}`}
        stroke={darken(dna.hairColor,10)} strokeWidth={sr*0.35} strokeLinecap="round" fill="none"/>
    </>);
  }

  if (dna.eyeShape==="sleepy") {
    const sr=r*0.22; const ir=sr*0.70; const pr=sr*0.38;
    return (<>
      {/* 半眼 — 下半円 */}
      <circle cx={lx} cy={ey+sr*0.3} r={sr} fill="white"/>
      <circle cx={rx} cy={ey+sr*0.3} r={sr} fill="white"/>
      {/* まぶたで上を隠す */}
      <rect x={lx-sr*1.1} y={ey-sr*0.5} width={sr*2.2} height={sr} fill={dna.skinTone} rx={sr*0.2}/>
      <rect x={rx-sr*1.1} y={ey-sr*0.5} width={sr*2.2} height={sr} fill={dna.skinTone} rx={sr*0.2}/>
      {/* 虹彩 */}
      <circle cx={lx} cy={ey+sr*0.3+ir*0.1} r={ir} fill={iris}/>
      <circle cx={rx} cy={ey+sr*0.3+ir*0.1} r={ir} fill={iris}/>
      <circle cx={lx} cy={ey+sr*0.3} r={pr} fill={pupil}/>
      <circle cx={rx} cy={ey+sr*0.3} r={pr} fill={pupil}/>
      <circle cx={lx+sr*0.35} cy={ey+sr*0.1} r={sr*0.18} fill="white"/>
      <circle cx={rx+sr*0.35} cy={ey+sr*0.1} r={sr*0.18} fill="white"/>
      {/* 重たいまつげ */}
      <path d={`M ${lx-sr} ${ey-sr*0.1} Q ${lx} ${ey-sr*0.55} ${lx+sr} ${ey-sr*0.1}`}
        fill={darken(dna.hairColor,10)} opacity={0.9}/>
      <path d={`M ${rx-sr} ${ey-sr*0.1} Q ${rx} ${ey-sr*0.55} ${rx+sr} ${ey-sr*0.1}`}
        fill={darken(dna.hairColor,10)} opacity={0.9}/>
    </>);
  }

  // normal（デフォルト）
  const sr=isBaby?r*0.26:r*0.23;
  const ir=sr*0.70;
  const pr=sr*0.38;
  return (<>
    {/* 白目 */}
    <circle cx={lx} cy={ey} r={sr} fill="white"/>
    <circle cx={rx} cy={ey} r={sr} fill="white"/>
    {/* 虹彩 */}
    <circle cx={lx} cy={ey+ir*0.06} r={ir} fill={iris}/>
    <circle cx={rx} cy={ey+ir*0.06} r={ir} fill={iris}/>
    {/* 上部ハイライト */}
    <circle cx={lx} cy={ey-ir*0.05} r={ir*0.55} fill={lighten(iris,35)} opacity={0.4}/>
    <circle cx={rx} cy={ey-ir*0.05} r={ir*0.55} fill={lighten(iris,35)} opacity={0.4}/>
    {/* 瞳孔 */}
    <circle cx={lx} cy={ey+pr*0.1} r={pr} fill={pupil}/>
    <circle cx={rx} cy={ey+pr*0.1} r={pr} fill={pupil}/>
    {/* 白ハイライト */}
    <circle cx={lx+sr*0.35} cy={ey-sr*0.28} r={sr*0.22} fill="white"/>
    <circle cx={rx+sr*0.35} cy={ey-sr*0.28} r={sr*0.22} fill="white"/>
    {/* まつげライン */}
    <path d={`M ${lx-sr*0.9} ${ey-sr*0.6} Q ${lx} ${ey-sr*1.1} ${lx+sr*0.9} ${ey-sr*0.6}`}
      fill={darken(dna.hairColor,10)} opacity={0.85}/>
    <path d={`M ${rx-sr*0.9} ${ey-sr*0.6} Q ${rx} ${ey-sr*1.1} ${rx+sr*0.9} ${ey-sr*0.6}`}
      fill={darken(dna.hairColor,10)} opacity={0.85}/>
  </>);
}

/** 口 */
function Mouth({ cx, cy, r, expr, size }: {
  cx:number; cy:number; r:number; expr:Expression; size:"wide"|"normal"|"small";
}) {
  const mw = size==="wide"?r*0.55:size==="small"?r*0.28:r*0.42;
  const s="#6a2010"; const sw=r*0.09;
  if (expr==="very_happy") return (<>
    <path d={`M ${cx-mw} ${cy} Q ${cx} ${cy+mw*1.1} ${cx+mw} ${cy}`}
      fill="#f08080" stroke={s} strokeWidth={sw} strokeLinecap="round"/>
    {/* 歯 */}
    <rect x={cx-mw*0.6} y={cy} width={mw*1.2} height={mw*0.4} rx={mw*0.1} fill="white"/>
  </>);
  if (expr==="happy") return (
    <path d={`M ${cx-mw*0.9} ${cy} Q ${cx} ${cy+mw*0.9} ${cx+mw*0.9} ${cy}`}
      fill="none" stroke={s} strokeWidth={sw} strokeLinecap="round"/>
  );
  if (expr==="tired") return (<>
    <path d={`M ${cx-mw*0.85} ${cy+mw*0.4} Q ${cx} ${cy-mw*0.2} ${cx+mw*0.85} ${cy+mw*0.4}`}
      fill="none" stroke={s} strokeWidth={sw} strokeLinecap="round"/>
    {/* ため息の点 */}
    <circle cx={cx-mw*1.3} cy={cy-mw*0.3} r={mw*0.12} fill={s} opacity={0.5}/>
  </>);
  if (expr==="sad") return (<>
    <path d={`M ${cx-mw} ${cy+mw*0.8} Q ${cx} ${cy-mw*0.3} ${cx+mw} ${cy+mw*0.8}`}
      fill="none" stroke={s} strokeWidth={sw} strokeLinecap="round"/>
    {/* 涙 */}
    <ellipse cx={cx-r*0.44} cy={cy+r*0.55} rx={mw*0.18} ry={mw*0.26}
      fill="#88ccff" opacity={0.8}/>
  </>);
  return <line x1={cx-mw*0.75} y1={cy} x2={cx+mw*0.75} y2={cy}
    stroke={s} strokeWidth={sw} strokeLinecap="round"/>;
}

/** 鼻 */
function Nose({ cx, cy, r, style, skin }: {
  cx:number; cy:number; r:number; style:CharacterDNA["noseStyle"]; skin:string;
}) {
  const c = darken(skin,35);
  if (style==="small")  return <circle cx={cx} cy={cy} r={r*0.045} fill={c} opacity={0.5}/>;
  if (style==="button") return (<>
    <circle cx={cx-r*0.12} cy={cy} r={r*0.07} fill={c} opacity={0.5}/>
    <circle cx={cx+r*0.12} cy={cy} r={r*0.07} fill={c} opacity={0.5}/>
    <path d={`M ${cx-r*0.12} ${cy} Q ${cx} ${cy+r*0.12} ${cx+r*0.12} ${cy}`}
      fill="none" stroke={c} strokeWidth={r*0.05} opacity={0.4}/>
  </>);
  // normal
  return (<>
    <circle cx={cx-r*0.16} cy={cy} r={r*0.055} fill={c} opacity={0.45}/>
    <circle cx={cx+r*0.16} cy={cy} r={r*0.055} fill={c} opacity={0.45}/>
  </>);
}

// ============================================================
// 髪描画
// ============================================================
function BackHair({ cx, cy, r, color, style, isBaby }: {
  cx:number; cy:number; r:number; color:string; style:CharacterDNA["backHair"]; isBaby:boolean;
}) {
  const dark = darken(color,30);
  if (isBaby) return (
    <ellipse cx={cx} cy={cy-r*0.2} rx={r*1.12} ry={r*0.88} fill={color}/>
  );
  // ベースの後頭部キャップ
  const cap = <ellipse cx={cx} cy={cy-r*0.22} rx={r*1.12} ry={r*0.90} fill={color}/>;
  if (style==="short") return cap;
  if (style==="medium") return (<>
    {cap}
    <rect x={cx-r*1.08} y={cy-r*0.1} width={r*0.52} height={r*2.6} rx={r*0.26} fill={color}/>
    <rect x={cx+r*0.56} y={cy-r*0.1} width={r*0.52} height={r*2.6} rx={r*0.26} fill={color}/>
    {/* 毛先のカーブ */}
    <ellipse cx={cx-r*0.82} cy={cy+r*2.5} rx={r*0.28} ry={r*0.18} fill={dark}/>
    <ellipse cx={cx+r*0.82} cy={cy+r*2.5} rx={r*0.28} ry={r*0.18} fill={dark}/>
  </>);
  if (style==="long") return (<>
    {cap}
    <rect x={cx-r*1.08} y={cy-r*0.1} width={r*0.52} height={r*6.0} rx={r*0.26} fill={color}/>
    <rect x={cx+r*0.56} y={cy-r*0.1} width={r*0.52} height={r*6.0} rx={r*0.26} fill={color}/>
    <ellipse cx={cx-r*0.82} cy={cy+r*5.8} rx={r*0.28} ry={r*0.22} fill={dark}/>
    <ellipse cx={cx+r*0.82} cy={cy+r*5.8} rx={r*0.28} ry={r*0.22} fill={dark}/>
  </>);
  // bob
  return (<>
    {cap}
    <rect x={cx-r*1.1} y={cy-r*0.05} width={r*2.2} height={r*1.1} rx={r*0.35} fill={color}/>
    <path d={`M ${cx-r*1.05} ${cy+r*0.9} Q ${cx} ${cy+r*1.4} ${cx+r*1.05} ${cy+r*0.9}`}
      fill={dark} opacity={0.4}/>
  </>);
}

function FrontHair({ cx, cy, r, color, style }: {
  cx:number; cy:number; r:number; color:string; style:CharacterDNA["frontHair"];
}) {
  const dark = darken(color,25);
  const top  = cy - r*0.92;
  const botB = cy - r*0.30;    // 前髪の下端
  const botS = cy - r*0.18;    // サイドの下端

  if (style==="none") return null;

  if (style==="bangs") return (<>
    {/* メイン前髪 */}
    <rect x={cx-r*0.92} y={top} width={r*1.84} height={r*0.68} rx={r*0.08} fill={color}/>
    {/* 前髪のテクスチャライン */}
    <line x1={cx-r*0.55} y1={top+r*0.05} x2={cx-r*0.35} y2={top+r*0.60}
      stroke={dark} strokeWidth={r*0.06} strokeLinecap="round" opacity={0.5}/>
    <line x1={cx+r*0.15} y1={top+r*0.04} x2={cx+r*0.05} y2={top+r*0.62}
      stroke={dark} strokeWidth={r*0.06} strokeLinecap="round" opacity={0.5}/>
    <line x1={cx+r*0.55} y1={top+r*0.05} x2={cx+r*0.62} y2={top+r*0.58}
      stroke={dark} strokeWidth={r*0.06} strokeLinecap="round" opacity={0.5}/>
  </>);

  if (style==="side") return (<>
    {/* 右サイドに流れる前髪 */}
    <polygon points={`
      ${cx-r*0.90},${top}
      ${cx+r*0.80},${top}
      ${cx+r*0.92},${botS}
      ${cx-r*0.20},${botB}
    `} fill={color}/>
    <line x1={cx-r*0.4} y1={top+r*0.08} x2={cx+r*0.3} y2={botB-r*0.1}
      stroke={dark} strokeWidth={r*0.07} strokeLinecap="round" opacity={0.45}/>
  </>);

  // center parted
  return (<>
    <polygon points={`
      ${cx-r*0.90},${top}
      ${cx-r*0.06},${top+r*0.22}
      ${cx-r*0.06},${botB}
      ${cx-r*0.90},${botS}
    `} fill={color}/>
    <polygon points={`
      ${cx+r*0.06},${top+r*0.22}
      ${cx+r*0.90},${top}
      ${cx+r*0.90},${botS}
      ${cx+r*0.06},${botB}
    `} fill={color}/>
    {/* 分け目ハイライト */}
    <line x1={cx} y1={top-r*0.05} x2={cx} y2={cy-r*0.55}
      stroke={lighten(color,50)} strokeWidth={r*0.06} strokeLinecap="round" opacity={0.6}/>
  </>);
}

// ============================================================
// HeadLayer — 2-3頭身SDスタイル
// 顔 r=4.8〜5.0 で大きく描画
// ============================================================
interface HeadProps {
  cx:number; cy:number; r:number;
  dna:   CharacterDNA;
  expr:  Expression;
  stage: AgeStage;
}

function HeadLayer({ cx, cy, r, dna, expr, stage }: HeadProps) {
  const isBaby  = stage==="baby"||stage==="toddler";
  const isOld   = stage==="middleage"||stage==="elder";
  const isElder = stage==="elder";

  const hairColor = agingHair(dna.hairColor, stage);
  const skin      = dna.skinTone;

  // 顔の形（outline）
  let faceEl: React.ReactNode;
  if (dna.faceShape==="slim") {
    faceEl = <ellipse cx={cx} cy={cy+r*0.05} rx={r*0.86} ry={r*1.04} fill={skin}/>;
  } else if (dna.faceShape==="square") {
    faceEl = <rect x={cx-r*0.92} y={cy-r*0.92} width={r*1.84} height={r*1.84}
      rx={r*0.28} fill={skin}/>;
  } else {
    faceEl = <circle cx={cx} cy={cy} r={r} fill={skin}/>;
  }

  // 輪郭のシャドウライン
  const faceShade = darken(skin,15);

  const noseY  = cy + r*0.20;
  const mouthY = cy + r*0.52;
  const mwSize = dna.mouthBase||"normal";

  return (<>
    {/* 1. 後髪 */}
    <BackHair cx={cx} cy={cy} r={r} color={hairColor} style={dna.backHair||"short"} isBaby={isBaby}/>

    {/* 2. 頭（輪郭シャドウ） */}
    {dna.faceShape==="round" && (
      <circle cx={cx} cy={cy+r*0.05} r={r*1.01} fill={faceShade} opacity={0.25}/>
    )}
    {faceEl}

    {/* 3. 赤ちゃんほっぺ */}
    {isBaby && (<>
      <ellipse cx={cx-r*0.56} cy={cy+r*0.22} rx={r*0.30} ry={r*0.20} fill="#ffaacc" opacity={0.65}/>
      <ellipse cx={cx+r*0.56} cy={cy+r*0.22} rx={r*0.30} ry={r*0.20} fill="#ffaacc" opacity={0.65}/>
    </>)}

    {/* ほっぺのブラッシュ（可愛さ UP） */}
    {!isBaby && expr!=="sad" && expr!=="tired" && (<>
      <ellipse cx={cx-r*0.58} cy={cy+r*0.14} rx={r*0.22} ry={r*0.13} fill="#ffaacc" opacity={0.30}/>
      <ellipse cx={cx+r*0.58} cy={cy+r*0.14} rx={r*0.22} ry={r*0.13} fill="#ffaacc" opacity={0.30}/>
    </>)}

    {/* しわ（老年） */}
    {isOld && (<>
      <path d={`M ${cx-r*0.58} ${cy-r*0.15} Q ${cx-r*0.38} ${cy-r*0.02} ${cx-r*0.18} ${cy-r*0.15}`}
        fill="none" stroke={faceShade} strokeWidth={r*0.055} opacity={isElder?0.7:0.35}/>
      <path d={`M ${cx+r*0.18} ${cy-r*0.15} Q ${cx+r*0.38} ${cy-r*0.02} ${cx+r*0.58} ${cy-r*0.15}`}
        fill="none" stroke={faceShade} strokeWidth={r*0.055} opacity={isElder?0.7:0.35}/>
    </>)}
    {isElder && (
      <path d={`M ${cx-r*0.35} ${cy+r*0.30} Q ${cx} ${cy+r*0.42} ${cx+r*0.35} ${cy+r*0.30}`}
        fill="none" stroke={faceShade} strokeWidth={r*0.05} opacity={0.45}/>
    )}

    {/* 4. 目（大きなアニメ目） */}
    <Eyes cx={cx} cy={cy} r={r} dna={dna} isBaby={isBaby} stage={stage}/>

    {/* 5. 眉毛 */}
    {!isBaby && (<>
      {(() => {
        const ex=r*0.40; const ey=r*0.02;
        const browY = cy-ey - (dna.eyeShape==="big"?r*0.32:r*0.26) - r*0.10;
        const bw=r*0.30;
        const tired = expr==="tired"||expr==="sad";
        return (<>
          <path d={tired
              ? `M ${cx-ex-bw} ${browY+r*0.08} Q ${cx-ex} ${browY} ${cx-ex+bw} ${browY+r*0.08}`
              : `M ${cx-ex-bw} ${browY} Q ${cx-ex} ${browY-r*0.10} ${cx-ex+bw} ${browY}`}
            fill="none" stroke={hairColor} strokeWidth={r*0.12} strokeLinecap="round" opacity={0.9}/>
          <path d={tired
              ? `M ${cx+ex-bw} ${browY+r*0.08} Q ${cx+ex} ${browY} ${cx+ex+bw} ${browY+r*0.08}`
              : `M ${cx+ex-bw} ${browY} Q ${cx+ex} ${browY-r*0.10} ${cx+ex+bw} ${browY}`}
            fill="none" stroke={hairColor} strokeWidth={r*0.12} strokeLinecap="round" opacity={0.9}/>
        </>);
      })()}
    </>)}

    {/* 6. 鼻 */}
    {!isBaby && <Nose cx={cx} cy={noseY} r={r} style={dna.noseStyle||"normal"} skin={skin}/>}

    {/* 7. 口 */}
    <Mouth cx={cx} cy={mouthY} r={r} expr={expr} size={mwSize}/>

    {/* 8. 前髪（最前面） */}
    {!isBaby && (
      <FrontHair cx={cx} cy={cy} r={r} color={hairColor} style={dna.frontHair||"bangs"}/>
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
  return m[job]??null;
}

// ============================================================
// ─────── ステージ別ボディ（2-3頭身SDスタイル） ───────
// viewBox 0 0 16 26
// ヘッドセンター: cx=8, cy≈5, r≈5
// ボディ: y≈10〜17（コンパクト）
// 足: y≈17〜25（短め）
// ============================================================
interface StageProps { dna:CharacterDNA; color:string; expr:Expression; job:JobType; }

// ── 赤ちゃん（純粋なブロブ） ──
function Baby({ dna, color, expr }: StageProps) {
  const skin = dna.skinTone;
  return (<>
    {/* おくるみ */}
    <ellipse cx={8} cy={17} rx={5.2} ry={4.5} fill={color}/>
    <ellipse cx={8} cy={15.5} rx={3.8} ry={3.2} fill={lighten(color,30)}/>
    {/* 小さな手 */}
    <circle cx={3.2} cy={16.5} r={1.3} fill={skin}/>
    <circle cx={12.8} cy={16.5} r={1.3} fill={skin}/>
    {/* 首 */}
    <rect x={6.8} y={10.2} width={2.4} height={1.5} fill={skin}/>
    {/* 頭（大きく） */}
    <HeadLayer cx={8} cy={5.8} r={5.0} dna={dna} expr={expr} stage="baby"/>
  </>);
}

// ── 幼児 ──
function Toddler({ dna, color, expr }: StageProps) {
  const skin = dna.skinTone; const dc = darken(color,40);
  return (<>
    {/* 丸っこいボディ */}
    <ellipse cx={8} cy={14.5} rx={4.5} ry={3.8} fill={color}/>
    {/* 短い腕 */}
    <ellipse cx={3.0} cy={14.0} rx={1.6} ry={1.0} fill={color} transform="rotate(-20,3,14)"/>
    <ellipse cx={13.0} cy={14.0} rx={1.6} ry={1.0} fill={color} transform="rotate(20,13,14)"/>
    <circle cx={1.8} cy={15.0} r={1.1} fill={skin}/>
    <circle cx={14.2} cy={15.0} r={1.1} fill={skin}/>
    {/* 短い足 */}
    <rect x={4.5} y={17.5} width={3.0} height={5.0} rx={1.5} fill={dc}/>
    <rect x={8.5} y={17.5} width={3.0} height={5.0} rx={1.5} fill={dc}/>
    {/* くつ */}
    <ellipse cx={6.0} cy={22.0} rx={2.0} ry={1.0} fill={darken(dc,30)}/>
    <ellipse cx={10.0} cy={22.0} rx={2.0} ry={1.0} fill={darken(dc,30)}/>
    <rect x={6.8} y={9.8} width={2.4} height={1.5} fill={skin}/>
    <HeadLayer cx={8} cy={5.5} r={4.8} dna={dna} expr={expr} stage="toddler"/>
  </>);
}

// ── 小学生 ──
function Child({ dna, color, expr }: StageProps) {
  const skin = dna.skinTone; const dc = darken(color,45);
  const W="#f0ece4";
  return (<>
    {/* ランドセル */}
    <rect x={11.0} y={10.5} width={3.8} height={5.0} rx={1.2} fill={dc}/>
    <rect x={11.8} y={9.6} width={2.2} height={1.4} rx={0.6} fill={darken(dc,20)}/>
    <circle cx={12.9} cy={13.0} r={0.6} fill={lighten(dc,30)}/>
    {/* 体（白シャツ） */}
    <rect x={3.8} y={10.2} width={8.5} height={7.2} rx={1.8} fill={W}/>
    {/* えり */}
    <polygon points="7.0,10.2 9.0,10.2 8.0,12.8" fill={color}/>
    {/* 腕 */}
    <rect x={1.5} y={10.5} width={2.8} height={4.5} rx={1.4} fill={W}/>
    <rect x={11.7} y={10.5} width={2.8} height={4.5} rx={1.4} fill={W}/>
    <circle cx={2.0} cy={14.5} r={1.2} fill={skin}/>
    <circle cx={14.0} cy={14.5} r={1.2} fill={skin}/>
    {/* スカートorズボン */}
    <rect x={4.5} y={17.0} width={7.0} height={4.5} rx={1.2} fill={color}/>
    {/* 足 */}
    <rect x={4.8} y={20.5} width={2.8} height={4.2} rx={1.4} fill={skin}/>
    <rect x={8.4} y={20.5} width={2.8} height={4.2} rx={1.4} fill={skin}/>
    {/* くつ */}
    <ellipse cx={6.2} cy={24.0} rx={2.2} ry={1.0} fill="#302010"/>
    <ellipse cx={9.8} cy={24.0} rx={2.2} ry={1.0} fill="#302010"/>
    <rect x={6.8} y={9.2} width={2.4} height={1.5} fill={skin}/>
    <HeadLayer cx={8} cy={5.0} r={4.5} dna={dna} expr={expr} stage="child"/>
  </>);
}

// ── 中学生 ──
function Middle({ dna, color, expr }: StageProps) {
  const skin = dna.skinTone; const dc = darken(color,50);
  return (<>
    <rect x={3.5} y={9.8} width={9.0} height={7.5} rx={1.5} fill={color}/>
    <rect x={6.2} y={9.8} width={3.6} height={3.5} fill="#f0ece4"/>
    <rect x={2.0} y={10.2} width={2.8} height={4.8} rx={1.4} fill={color}/>
    <rect x={11.2} y={10.2} width={2.8} height={4.8} rx={1.4} fill={color}/>
    <circle cx={1.8} cy={14.5} r={1.2} fill={skin}/>
    <circle cx={14.2} cy={14.5} r={1.2} fill={skin}/>
    <rect x={4.2} y={17.0} width={7.6} height={4.5} rx={1.2} fill={dc}/>
    <rect x={4.5} y={20.5} width={2.8} height={4.2} rx={1.4} fill={dc}/>
    <rect x={8.7} y={20.5} width={2.8} height={4.2} rx={1.4} fill={dc}/>
    <ellipse cx={5.9} cy={24.0} rx={2.2} ry={1.0} fill="#1a1a1a"/>
    <ellipse cx={10.1} cy={24.0} rx={2.2} ry={1.0} fill="#1a1a1a"/>
    <rect x={6.8} y={8.8} width={2.4} height={1.5} fill={skin}/>
    <HeadLayer cx={8} cy={5.0} r={4.5} dna={dna} expr={expr} stage="middle"/>
  </>);
}

// ── 高校生 ──
function HighSchool({ dna, color, expr }: StageProps) {
  const skin = dna.skinTone;
  const jk="#1e3464"; const dc=darken(color,40);
  return (<>
    <rect x={3.0} y={9.5} width={10.0} height={8.0} rx={1.5} fill={jk}/>
    <rect x={5.8} y={9.5} width={4.4} height={6.5} fill="#f0ece4"/>
    <rect x={7.3} y={9.8} width={1.4} height={5.5} rx={0.6} fill={color}/>
    <rect x={1.5} y={9.8} width={2.8} height={5.0} rx={1.4} fill={jk}/>
    <rect x={11.7} y={9.8} width={2.8} height={5.0} rx={1.4} fill={jk}/>
    <circle cx={1.8} cy={14.4} r={1.2} fill={skin}/>
    <circle cx={14.2} cy={14.4} r={1.2} fill={skin}/>
    <rect x={4.0} y={17.2} width={3.5} height={7.5} rx={1.5} fill={dc}/>
    <rect x={8.5} y={17.2} width={3.5} height={7.5} rx={1.5} fill={dc}/>
    <ellipse cx={5.75} cy={24.0} rx={2.1} ry={1.0} fill="#1a1a2a"/>
    <ellipse cx={10.25} cy={24.0} rx={2.1} ry={1.0} fill="#1a1a2a"/>
    <rect x={6.8} y={8.5} width={2.4} height={1.5} fill={skin}/>
    <HeadLayer cx={8} cy={5.0} r={4.5} dna={dna} expr={expr} stage="highschool"/>
  </>);
}

// ── 若者〜成人 共通 ──
function AdultBody({ dna, color, expr, job, stage }: StageProps & { stage:AgeStage }) {
  const skin = dna.skinTone;
  const t = getClothingTheme(job, color);
  const isMiddle = stage==="middleage";
  const w = isMiddle ? 10.5 : 10.0;
  return (<>
    {/* ジャケット */}
    <rect x={8-w/2} y={9.2} width={w} height={isMiddle?8.5:8.0} rx={1.5} fill={t.jacket}/>
    {/* シャツ */}
    <rect x={5.8} y={9.2} width={4.4} height={isMiddle?7.0:6.5} fill={t.shirt}/>
    {/* ネクタイ */}
    {t.tie && (
      <polygon points={`7.3,9.2 8.7,9.2 9.1,${9.2+4.8} 8.0,${9.2+5.5} 6.9,${9.2+4.8}`}
        fill={t.tie}/>
    )}
    {/* ポケットチーフ */}
    {job==="entrepreneur"||job==="investor"||job==="shadow_ruler" ? (
      <rect x={8-w/2+0.5} y={10.0} width={1.4} height={1.0} rx={0.3} fill="#e8d080"/>
    ) : null}
    {/* 腕 */}
    <rect x={8-w/2-2.5} y={9.5} width={2.6} height={5.0} rx={1.3} fill={t.jacket}/>
    <rect x={8+w/2-0.1} y={9.5} width={2.6} height={5.0} rx={1.3} fill={t.jacket}/>
    <circle cx={8-w/2-1.8} cy={14.0} r={1.3} fill={skin}/>
    <circle cx={8+w/2+1.8} cy={14.0} r={1.3} fill={skin}/>
    {/* ズボン */}
    <rect x={4.2} y={17.0} width={3.5} height={7.2} rx={1.6} fill={t.pants}/>
    <rect x={8.3} y={17.0} width={3.5} height={7.2} rx={1.6} fill={t.pants}/>
    {/* くつ */}
    <ellipse cx={5.9} cy={23.8} rx={2.4} ry={1.1} fill={darken(t.pants,30)}/>
    <ellipse cx={10.1} cy={23.8} rx={2.4} ry={1.1} fill={darken(t.pants,30)}/>
    {/* 首 */}
    <rect x={6.8} y={8.2} width={2.4} height={1.5} fill={skin}/>
    <HeadLayer cx={8} cy={4.8} r={isMiddle?4.8:4.6}
      dna={dna} expr={expr} stage={stage}/>
  </>);
}

function Young(p: StageProps)      { return <AdultBody {...p} stage="young"/>; }
function Adult(p: StageProps)      { return <AdultBody {...p} stage="adult"/>; }
function MiddleAge(p: StageProps)  { return <AdultBody {...p} stage="middleage"/>; }

// ── 老人 ──
function Elder({ dna, color, expr }: StageProps) {
  const skin = dna.skinTone;
  return (<>
    {/* 丸みのある老人服 */}
    <rect x={3.5} y={9.8} width={9.0} height={7.5} rx={2.5} fill={color}/>
    <rect x={2.0} y={10.2} width={2.5} height={4.5} rx={1.3} fill={color}/>
    <rect x={11.5} y={10.2} width={2.5} height={4.5} rx={1.3} fill={color}/>
    <circle cx={1.8} cy={14.2} r={1.2} fill={skin}/>
    <circle cx={14.2} cy={14.2} r={1.2} fill={skin}/>
    <rect x={4.2} y={17.0} width={3.2} height={6.5} rx={1.6} fill={"#3a3a58"}/>
    <rect x={8.6} y={17.0} width={3.2} height={6.5} rx={1.6} fill={"#3a3a58"}/>
    <ellipse cx={5.8} cy={23.2} rx={2.2} ry={1.0} fill="#222230"/>
    <ellipse cx={10.2} cy={23.2} rx={2.2} ry={1.0} fill="#222230"/>
    {/* 杖 */}
    <line x1={13.5} y1={12.5} x2={15.0} y2={23.5}
      stroke={"#8a6a40"} strokeWidth={1.6} strokeLinecap="round"/>
    <ellipse cx={14.0} cy={12.4} rx={1.6} ry={1.0} fill={"#8a6a40"}/>
    <rect x={6.8} y={8.8} width={2.4} height={1.5} fill={skin}/>
    <HeadLayer cx={8} cy={4.8} r={4.8} dna={dna} expr={expr} stage="elder"/>
  </>);
}

// ============================================================
// PixelAvatarBody — export（DotAvatar & AvatarBuilderで共用）
// ============================================================
export function PixelAvatarBody({
  dna, stage, happiness, job, isDebt=false,
}: {
  dna:        CharacterDNA;
  stage:      AgeStage;
  happiness:  number;
  job:        JobType;
  isDebt?:    boolean;
}) {
  const expr  = getExpression(happiness, isDebt);
  const color = dna.clothesColor;
  const sp: StageProps = { dna, color, expr, job };

  const map: Record<AgeStage, React.ReactNode> = {
    baby:       <Baby       {...sp}/>,
    toddler:    <Toddler    {...sp}/>,
    child:      <Child      {...sp}/>,
    middle:     <Middle     {...sp}/>,
    highschool: <HighSchool {...sp}/>,
    young:      <Young      {...sp}/>,
    adult:      <Adult      {...sp}/>,
    middleage:  <MiddleAge  {...sp}/>,
    elder:      <Elder      {...sp}/>,
  };
  return <>{map[stage]}</>;
}

// ============================================================
// DotAvatar — メインコンポーネント
// ============================================================
interface Props { player:Player; size?:number; shadow?:boolean; customization?:AvatarCustomization; }

export function DotAvatar({ player, size=32, shadow=false }: Props) {
  const ci    = AVATAR_COLORS[player.avatar.color];
  const W     = size;
  const H     = Math.round(size * 1.65);
  const age   = posToAgeForAvatar(player.position);
  const stage = ageToStage(age);
  const isDebt = player.money < -500;

  const dna = player.customization
    ? customizationToDNA(player.customization)
    : { ...generateDNA(player.playerId), clothesColor: ci.bg };

  const jobBadge = (player.job!=="none"&&player.job!=="part_time")
    ? getJobBadge(player.job) : null;
  const badgeFS = Math.max(8, Math.round(size*0.28));

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
      {player.money>=1000&&!player.isMarried && (
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

export function DotAvatarToken({ player, size=20, isActive=false }: TokenProps) {
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
      border: isActive?"2px solid #fff":`2px solid ${darken(ci.bg,40)}`,
      boxShadow: isActive
        ?`0 0 8px ${ci.bg},0 0 4px #fff,0 2px 4px rgba(0,0,0,0.6)`
        :"0 2px 4px rgba(0,0,0,0.5)",
      overflow:"hidden", display:"flex", alignItems:"flex-end", justifyContent:"center",
    }}>
      <svg width={size-2} height={size-1} viewBox="0 0 16 26" style={{ marginBottom:-2 }}>
        <PixelAvatarBody dna={dna} stage={stage} happiness={50} job={player.job} isDebt={isDebt}/>
      </svg>
    </div>
  );
}
