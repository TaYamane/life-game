"use client";
import type { Player, JobType, AvatarCustomization } from "@/types/game";
import { AVATAR_COLORS } from "@/types/game";

// ============================================================
// CharacterDNA — プレイヤーIDまたはカスタマイズから決定される外見情報
// ============================================================
export interface CharacterDNA {
  hairColor:    string;
  skinTone:     string;
  eyeColor:     string;
  hairStyle:    0 | 1 | 2;    // legacy / auto-gen fallback
  // --- カスタマイズ由来フィールド ---
  gender:       "male" | "female";
  eyeShape:     "normal" | "big" | "sharp" | "sleepy";
  faceShape:    "round" | "square" | "slim";
  noseStyle:    "normal" | "small" | "button";
  mouthBase:    "wide" | "normal" | "small";
  frontHair:    "bangs" | "side" | "center" | "none";
  backHair:     "short" | "medium" | "long" | "bob";
  clothesColor: string;
}

const DNA_HAIR  = ["#2a1808","#3d2010","#1a1a1a","#7B3A10","#c8a050","#2a1855","#5a3020","#cc4400"];
const DNA_EYES  = ["#1a1212","#2a1008","#1a2418","#201830"];
const SKIN_COLOR = "#f5c98a";

// 自動生成 DNA（カスタマイズなし時）
export function generateDNA(playerId: string): CharacterDNA {
  let h = 5381;
  for (let i = 0; i < playerId.length; i++) {
    h = ((h << 5) + h) ^ playerId.charCodeAt(i);
    h >>>= 0;
  }
  const eyeShapes: CharacterDNA["eyeShape"][]   = ["normal","big","sharp","sleepy"];
  const faceShapes: CharacterDNA["faceShape"][] = ["round","square","slim"];
  const noseStyles: CharacterDNA["noseStyle"][] = ["normal","small","button"];
  const mouthBases: CharacterDNA["mouthBase"][] = ["wide","normal","small"];
  const frontHairs: CharacterDNA["frontHair"][] = ["bangs","side","center","none"];
  const backHairs:  CharacterDNA["backHair"][]  = ["short","medium","long","bob"];
  const clothes = ["#3b82f6","#ef4444","#22c55e","#a855f7","#f59e0b","#ec4899","#06b6d4","#f97316"];

  return {
    hairColor:    DNA_HAIR[h % DNA_HAIR.length],
    skinTone:     SKIN_COLOR,
    eyeColor:     DNA_EYES[(h >> 8)  % DNA_EYES.length],
    hairStyle:    ((h >> 12) % 3) as 0|1|2,
    gender:       ((h >> 4)  % 2) === 0 ? "male" : "female",
    eyeShape:     eyeShapes[(h >> 6)  % 4],
    faceShape:    faceShapes[(h >> 10) % 3],
    noseStyle:    noseStyles[(h >> 14) % 3],
    mouthBase:    mouthBases[(h >> 16) % 3],
    frontHair:    frontHairs[(h >> 18) % 4],
    backHair:     backHairs[(h >> 20)  % 4],
    clothesColor: clothes[(h >> 22) % clothes.length],
  };
}

// カスタマイズ → CharacterDNA
export function customizationToDNA(c: AvatarCustomization): CharacterDNA {
  return {
    hairColor:    c.hairColor,
    skinTone:     c.skinColor,
    eyeColor:     "#1a1212",
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

// hex blend
function blendHex(c1: string, c2: string, t: number): string {
  const safe = (s: string) => s.startsWith("#") ? s : "#888888";
  const n1 = parseInt(safe(c1).slice(1), 16);
  const n2 = parseInt(safe(c2).slice(1), 16);
  const r = Math.round(((n1>>16)&255)*(1-t)+((n2>>16)&255)*t);
  const g = Math.round((((n1>>8)&255)*(1-t)+((n2>>8)&255)*t));
  const b = Math.round(((n1&255)*(1-t)+  (n2&255)*t));
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

function agingHair(base: string, stage: AgeStage): string {
  if (stage === "elder")     return blendHex(base, "#c0c0c8", 0.78);
  if (stage === "middleage") return blendHex(base, "#c0c0c8", 0.22);
  return base;
}

function darken(hex: string, amt = 50): string {
  if (!hex.startsWith("#")) return hex;
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (n>>16)-amt);
  const g = Math.max(0, ((n>>8)&0xff)-amt);
  const b = Math.max(0, (n&0xff)-amt);
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

const WHITE = "#f2f0ee";

// ============================================================
// 年齢ステージ
// ============================================================
export type AgeStage =
  | "baby" | "toddler" | "child" | "middle"
  | "highschool" | "young" | "adult" | "middleage" | "elder";

export const AGE_STAGE_LABELS: Record<AgeStage, string> = {
  baby:"赤ちゃん", toddler:"幼児", child:"小学生", middle:"中学生",
  highschool:"高校生", young:"若者", adult:"社会人", middleage:"中年", elder:"老人",
};

export function ageToStage(age: number): AgeStage {
  if (age <= 2)  return "baby";
  if (age <= 5)  return "toddler";
  if (age <= 12) return "child";
  if (age <= 15) return "middle";
  if (age <= 18) return "highschool";
  if (age <= 29) return "young";
  if (age <= 49) return "adult";
  if (age <= 64) return "middleage";
  return "elder";
}

export function posToAgeForAvatar(position: number): number {
  if (position <= 14)  return Math.round((position / 14) * 5);
  if (position <= 25)  return 6  + Math.round(((position-15)/10)*6);
  if (position <= 39)  return 13 + Math.round(((position-26)/13)*2);
  if (position <= 50)  return 16 + Math.round(((position-40)/10)*2);
  if (position <= 58)  return 18 + Math.round(((position-50)/8)*5);
  if (position <= 69)  return 23 + Math.round(((position-58)/11)*4);
  if (position <= 110) return 27 + Math.round(((position-70)/40)*13);
  if (position <= 134) return 41 + Math.round(((position-111)/23)*23);
  return               65 + Math.round(((position-135)/15)*20);
}

// ============================================================
// 表情
// ============================================================
type Expression = "very_happy"|"happy"|"neutral"|"tired"|"sad";

function getExpression(happiness: number, isDebt: boolean): Expression {
  if (isDebt && happiness < 30) return "sad";
  if (happiness >= 85) return "very_happy";
  if (happiness >= 60) return "happy";
  if (happiness >= 40) return "neutral";
  if (happiness >= 20) return "tired";
  return "sad";
}

// ============================================================
// パーツ描画
// ============================================================

/** 口 */
function Mouth({ cx, cy, expr, size }: { cx:number; cy:number; expr:Expression; size:"wide"|"normal"|"small" }) {
  const s = "#7a3020"; const sw = 0.7;
  const w = size==="wide" ? 2.4 : size==="small" ? 1.4 : 1.9;
  if (expr==="very_happy") return (
    <path d={`M ${cx-w} ${cy} Q ${cx} ${cy+w*0.9} ${cx+w} ${cy}`}
      fill="#f9a8a8" stroke={s} strokeWidth={sw} strokeLinecap="round"/>
  );
  if (expr==="happy") return (
    <path d={`M ${cx-w*0.9} ${cy} Q ${cx} ${cy+w*0.9} ${cx+w*0.9} ${cy}`}
      fill="none" stroke={s} strokeWidth={sw} strokeLinecap="round"/>
  );
  if (expr==="tired") return (
    <path d={`M ${cx-w*0.9} ${cy+w*0.5} Q ${cx} ${cy-0.2} ${cx+w*0.9} ${cy+w*0.5}`}
      fill="none" stroke={s} strokeWidth={sw} strokeLinecap="round"/>
  );
  if (expr==="sad") return (
    <path d={`M ${cx-w} ${cy+w*0.8} Q ${cx} ${cy-0.4} ${cx+w} ${cy+w*0.8}`}
      fill="none" stroke={s} strokeWidth={sw} strokeLinecap="round"/>
  );
  return <line x1={cx-w*0.8} y1={cy} x2={cx+w*0.8} y2={cy} stroke={s} strokeWidth={0.6}/>;
}

/** 鼻 */
function Nose({ cx, cy, style, skin }: { cx:number; cy:number; style:CharacterDNA["noseStyle"]; skin:string }) {
  const base = darken(skin, 30);
  if (style==="small")  return <circle cx={cx} cy={cy} r={0.22} fill={base} opacity={0.45}/>;
  if (style==="button") return <circle cx={cx} cy={cy} r={0.42} fill={base} opacity={0.5}/>;
  return (<>
    <circle cx={cx-0.4} cy={cy} r={0.18} fill={base} opacity={0.5}/>
    <circle cx={cx+0.4} cy={cy} r={0.18} fill={base} opacity={0.5}/>
  </>);
}

/** 後髪（頭の円より先に描画 → 後ろに来る） */
function BackHair({ cx, cy, r, color, style, isBaby }: {
  cx:number; cy:number; r:number; color:string; style:CharacterDNA["backHair"]; isBaby:boolean;
}) {
  if (isBaby) return <ellipse cx={cx} cy={cy-r*0.30} rx={r*1.08} ry={r*0.82} fill={color}/>;
  if (style==="short") {
    return <ellipse cx={cx} cy={cy-r*0.30} rx={r*1.08} ry={r*0.82} fill={color}/>;
  }
  if (style==="medium") return (<>
    <ellipse cx={cx} cy={cy-r*0.30} rx={r*1.10} ry={r*0.82} fill={color}/>
    <rect x={cx-r*1.08} y={cy-r*0.15} width={r*0.44} height={r*2.2} rx={r*0.22} fill={color}/>
    <rect x={cx+r*0.64} y={cy-r*0.15} width={r*0.44} height={r*2.2} rx={r*0.22} fill={color}/>
  </>);
  if (style==="long") return (<>
    <ellipse cx={cx} cy={cy-r*0.30} rx={r*1.10} ry={r*0.82} fill={color}/>
    <rect x={cx-r*1.08} y={cy-r*0.15} width={r*0.44} height={r*5.5} rx={r*0.22} fill={color}/>
    <rect x={cx+r*0.64} y={cy-r*0.15} width={r*0.44} height={r*5.5} rx={r*0.22} fill={color}/>
  </>);
  // bob
  return (<>
    <ellipse cx={cx} cy={cy-r*0.30} rx={r*1.12} ry={r*0.82} fill={color}/>
    <rect x={cx-r*1.08} y={cy-r*0.1} width={r*2.16} height={r*0.9} rx={r*0.28} fill={color}/>
  </>);
}

/** 前髪（顔の円より後に描画 → 手前に来る） */
function FrontHair({ cx, cy, r, color, style }: {
  cx:number; cy:number; r:number; color:string; style:CharacterDNA["frontHair"];
}) {
  if (style==="none") return null;
  const top = cy - r * 0.95;
  const mid = cy - r * 0.42;
  const w   = r * 0.90;
  if (style==="bangs") return (
    <rect x={cx-w} y={top} width={w*2} height={r*0.52} rx={r*0.1} fill={color}/>
  );
  if (style==="side") return (
    <polygon points={`
      ${cx-w},${top} ${cx+w*0.6},${top}
      ${cx+w*0.6},${mid} ${cx-w},${mid+r*0.18}
    `} fill={color}/>
  );
  // center parted
  return (<>
    <polygon points={`
      ${cx-w},${top} ${cx-r*0.08},${top}
      ${cx-r*0.08},${mid+r*0.08} ${cx-w},${mid+r*0.18}
    `} fill={color}/>
    <polygon points={`
      ${cx+r*0.08},${top} ${cx+w},${top}
      ${cx+w},${mid+r*0.18} ${cx+r*0.08},${mid+r*0.08}
    `} fill={color}/>
  </>);
}

/** HeadLayer — DNAを使った顔描画 */
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
  const hairDark  = blendHex(hairColor, "#000000", 0.3);
  const skin      = dna.skinTone;

  // 目のサイズ
  const baseEyeR = isBaby ? r*0.22 : r*0.19;
  const eyeR     = dna.eyeShape==="big" ? baseEyeR*1.28 : baseEyeR;
  const eyeX     = r*0.38;
  const eyeY     = isBaby ? -(r*0.02) : r*0.06;

  const browY   = cy - eyeY - eyeR*1.75;
  const noseY   = cy + r * 0.25;
  const mouthCY = cy + r*(dna.mouthBase==="wide"?0.55:dna.mouthBase==="small"?0.44:0.50);

  // --- 顔形状 ---
  let faceEl: React.ReactNode;
  if (dna.faceShape==="slim") {
    faceEl = <ellipse cx={cx} cy={cy} rx={r*0.88} ry={r*1.05} fill={skin}/>;
  } else if (dna.faceShape==="square") {
    faceEl = <rect x={cx-r*0.95} y={cy-r} width={r*1.9} height={r*2.0} rx={r*0.22} fill={skin}/>;
  } else {
    faceEl = <circle cx={cx} cy={cy} r={r} fill={skin}/>;
  }

  // --- 目描画 ---
  let eyesEl: React.ReactNode;
  if (dna.eyeShape==="sleepy") {
    eyesEl = (<>
      <circle cx={cx-eyeX} cy={cy-eyeY} r={eyeR} fill={dna.eyeColor}/>
      <rect x={cx-eyeX-eyeR} y={cy-eyeY-eyeR} width={eyeR*2} height={eyeR*0.55} fill={skin}/>
      <circle cx={cx+eyeX} cy={cy-eyeY} r={eyeR} fill={dna.eyeColor}/>
      <rect x={cx+eyeX-eyeR} y={cy-eyeY-eyeR} width={eyeR*2} height={eyeR*0.55} fill={skin}/>
      <circle cx={cx-eyeX+eyeR*0.38} cy={cy-eyeY-eyeR*0.05} r={eyeR*0.28} fill="white" opacity={0.7}/>
      <circle cx={cx+eyeX+eyeR*0.38} cy={cy-eyeY-eyeR*0.05} r={eyeR*0.28} fill="white" opacity={0.7}/>
    </>);
  } else if (dna.eyeShape==="sharp") {
    eyesEl = (<>
      <ellipse cx={cx-eyeX} cy={cy-eyeY} rx={eyeR*1.3} ry={eyeR*0.78}
        fill={dna.eyeColor} transform={`rotate(-8,${cx-eyeX},${cy-eyeY})`}/>
      <ellipse cx={cx+eyeX} cy={cy-eyeY} rx={eyeR*1.3} ry={eyeR*0.78}
        fill={dna.eyeColor} transform={`rotate(8,${cx+eyeX},${cy-eyeY})`}/>
      <circle cx={cx-eyeX+eyeR*0.4} cy={cy-eyeY-eyeR*0.3} r={eyeR*0.28} fill="white" opacity={0.7}/>
      <circle cx={cx+eyeX+eyeR*0.4} cy={cy-eyeY-eyeR*0.3} r={eyeR*0.28} fill="white" opacity={0.7}/>
    </>);
  } else {
    // normal / big — 丸目
    eyesEl = (<>
      <circle cx={cx-eyeX} cy={cy-eyeY} r={eyeR} fill={dna.eyeColor}/>
      <circle cx={cx+eyeX} cy={cy-eyeY} r={eyeR} fill={dna.eyeColor}/>
      <circle cx={cx-eyeX+eyeR*0.38} cy={cy-eyeY-eyeR*0.38} r={eyeR*0.3} fill="white" opacity={0.75}/>
      <circle cx={cx+eyeX+eyeR*0.38} cy={cy-eyeY-eyeR*0.38} r={eyeR*0.3} fill="white" opacity={0.75}/>
    </>);
  }

  return (<>
    {/* 1. 後髪 */}
    <BackHair cx={cx} cy={cy} r={r} color={hairColor} style={dna.backHair} isBaby={isBaby}/>

    {/* 2. 顔形状 */}
    {faceEl}

    {/* 3. 赤ちゃんほっぺ */}
    {isBaby && (<>
      <ellipse cx={cx-r*0.52} cy={cy+r*0.28} rx={r*0.28} ry={r*0.18} fill="#f9a8d4" opacity={0.65}/>
      <ellipse cx={cx+r*0.52} cy={cy+r*0.28} rx={r*0.28} ry={r*0.18} fill="#f9a8d4" opacity={0.65}/>
    </>)}

    {/* 4. しわ（老年） */}
    {isOld && (<>
      <path d={`M ${cx-eyeX-r*0.22} ${cy-eyeY-eyeR*1.3} Q ${cx-eyeX+r*0.05} ${cy-eyeY-eyeR*0.95} ${cx-eyeX+r*0.22} ${cy-eyeY-eyeR*1.3}`}
        fill="none" stroke={blendHex(skin,"#000000",0.20)} strokeWidth={0.28} opacity={isElder?0.8:0.42}/>
      <path d={`M ${cx+eyeX-r*0.22} ${cy-eyeY-eyeR*1.3} Q ${cx+eyeX-r*0.05} ${cy-eyeY-eyeR*0.95} ${cx+eyeX+r*0.22} ${cy-eyeY-eyeR*1.3}`}
        fill="none" stroke={blendHex(skin,"#000000",0.20)} strokeWidth={0.28} opacity={isElder?0.8:0.42}/>
    </>)}
    {isElder && (
      <path d={`M ${cx-r*0.38} ${cy+r*0.28} Q ${cx} ${cy+r*0.38} ${cx+r*0.38} ${cy+r*0.28}`}
        fill="none" stroke={blendHex(skin,"#000000",0.15)} strokeWidth={0.28} opacity={0.5}/>
    )}

    {/* 5. 目 */}
    {eyesEl}

    {/* 6. 眉毛 */}
    {!isBaby && (<>
      <path d={`M ${cx-eyeX-r*0.24} ${browY} Q ${cx-eyeX} ${browY-r*0.12} ${cx-eyeX+r*0.24} ${browY}`}
        fill="none" stroke={hairColor} strokeWidth={r*0.13} strokeLinecap="round" opacity={0.85}/>
      <path d={`M ${cx+eyeX-r*0.24} ${browY} Q ${cx+eyeX} ${browY-r*0.12} ${cx+eyeX+r*0.24} ${browY}`}
        fill="none" stroke={hairColor} strokeWidth={r*0.13} strokeLinecap="round" opacity={0.85}/>
    </>)}

    {/* 7. 鼻 */}
    {!isBaby && <Nose cx={cx} cy={noseY} style={dna.noseStyle||"normal"} skin={skin}/>}

    {/* 8. 口 */}
    <Mouth cx={cx} cy={mouthCY} expr={expr} size={dna.mouthBase||"normal"}/>

    {/* 9. 前髪（最前面） */}
    {!isBaby && (
      <FrontHair cx={cx} cy={cy} r={r} color={hairColor} style={dna.frontHair||"center"}/>
    )}

    {/* センター分けのライン（前髪がcentreのとき） */}
    {!isBaby && (dna.backHair==="short"||dna.backHair==="medium")
      && dna.frontHair==="center" && (
      <line x1={cx} y1={cy-r*0.95} x2={cx} y2={cy-r*0.20}
        stroke={hairDark} strokeWidth={r*0.09} strokeLinecap="round"/>
    )}
  </>);
}

// ============================================================
// 職業別服装
// ============================================================
interface ClothingTheme { jacket:string; shirt:string; tie:string; pants:string }

function getClothingTheme(job: JobType, avatarColor: string): ClothingTheme {
  switch (job) {
    case "salaryman": case "civil_servant":
      return { jacket:"#2a3555", shirt:WHITE, tie:avatarColor, pants:"#1a2040" };
    case "lawyer":
      return { jacket:"#1a1a2e", shirt:WHITE, tie:"#8a0000", pants:"#0d0d1e" };
    case "entrepreneur": case "investor": case "shadow_ruler":
      return { jacket:"#101020", shirt:"#e8e0d0", tie:"#d4af37", pants:"#080810" };
    case "doctor":
      return { jacket:"#e8eef8", shirt:"#e8eef8", tie:"#3b82f6", pants:"#2a3555" };
    case "baseball":
      return { jacket:WHITE, shirt:WHITE, tie:avatarColor, pants:WHITE };
    case "carpenter":
      return { jacket:"#8B6914", shirt:"#d4a820", tie:"", pants:"#5a4010" };
    case "astronaut":
      return { jacket:"#c0c8e0", shirt:"#c0c8e0", tie:"#6080e0", pants:"#a0a8c0" };
    case "inventor":
      return { jacket:"#2a2a3a", shirt:"#c8d0e0", tie:avatarColor, pants:"#1a1a28" };
    case "pro_gamer":
      return { jacket:avatarColor, shirt:"#1a1a2a", tie:"", pants:"#1a1a2a" };
    case "comedian":
      return { jacket:avatarColor, shirt:WHITE, tie:darken(avatarColor,20), pants:darken(avatarColor,30) };
    default:
      return { jacket:avatarColor, shirt:WHITE, tie:darken(avatarColor,30), pants:darken(avatarColor,60) };
  }
}

function getJobBadge(job: JobType): string|null {
  const map: Partial<Record<JobType,string>> = {
    salaryman:"💼", civil_servant:"💼", engineer:"💻", artist:"🎨",
    entrepreneur:"🎩", doctor:"🩺", lawyer:"⚖️", youtuber:"📹",
    freelancer:"🖥️", part_time:"🏷️", comedian:"🎭", carpenter:"🔨",
    baseball:"⚾", inventor:"⚙️", investor:"💎", astronaut:"🚀",
    pro_gamer:"🎮", shadow_ruler:"👁️", legendary_neet:"🛋️",
  };
  return map[job] ?? null;
}

// ============================================================
// ステージ別ボディ描画
// ============================================================
interface StageProps {
  dna:   CharacterDNA;
  color: string;     // 服の色（カスタム or アバターカラー）
  expr:  Expression;
  job:   JobType;
}

function Baby({ dna, color, expr }: StageProps) {
  const dc = darken(color, 40);
  return (<>
    <rect x={3.5} y={10.5} width={9}   height={6}   rx={3.0} fill={color}/>
    <rect x={1.0} y={11.0} width={3}   height={4.5} rx={1.8} fill={color}/>
    <rect x={12}  y={11.0} width={3}   height={4.5} rx={1.8} fill={color}/>
    <rect x={4.0} y={16.0} width={3.8} height={5.0} rx={2.5} fill={dc}/>
    <rect x={8.2} y={16.0} width={3.8} height={5.0} rx={2.5} fill={dc}/>
    <rect x={6.5} y={9.8}  width={3}   height={1.5}           fill={dna.skinTone}/>
    <HeadLayer cx={8} cy={6} r={4.5} dna={dna} expr={expr} stage="baby"/>
  </>);
}

function Toddler({ dna, color, expr }: StageProps) {
  const dc = darken(color, 40);
  return (<>
    <rect x={4.0} y={10.0} width={8.0} height={5.5} rx={2.5} fill={color}/>
    <rect x={1.5} y={10.5} width={2.8} height={3.8} rx={1.6} fill={color}/>
    <rect x={11.7} y={10.5} width={2.8} height={3.8} rx={1.6} fill={color}/>
    <rect x={4.2} y={15.0} width={3.2} height={5.5} rx={2.0} fill={dc}/>
    <rect x={8.6} y={15.0} width={3.2} height={5.5} rx={2.0} fill={dc}/>
    <rect x={6.5} y={9.0}  width={3.0} height={1.5}           fill={dna.skinTone}/>
    <HeadLayer cx={8} cy={5.5} r={4.0} dna={dna} expr={expr} stage="toddler"/>
  </>);
}

function Child({ dna, color, expr }: StageProps) {
  const dc = darken(color, 50);
  return (<>
    <rect x={12.0} y={9.8} width={3.5} height={4.5} rx={1.0} fill={dc}/>
    <rect x={13.0} y={9.0} width={1.5} height={1.2} rx={0.5} fill={dc}/>
    <rect x={3.5}  y={9.8}  width={9.0} height={7.0} rx={1.5} fill={WHITE}/>
    <polygon points="7,9.8 9,9.8 8,12.2" fill={color}/>
    <rect x={1.5}  y={10.2} width={2.8} height={4.2} rx={1.4} fill={WHITE}/>
    <rect x={11.7} y={10.2} width={2.8} height={4.2} rx={1.4} fill={WHITE}/>
    <circle cx={2.1} cy={13.8} r={1.1} fill={dna.skinTone}/>
    <circle cx={13.9} cy={13.8} r={1.1} fill={dna.skinTone}/>
    <rect x={4.0} y={16.5} width={8.0} height={4.0} rx={1.0} fill={color}/>
    <rect x={4.0} y={20.0} width={3.0} height={5.5} rx={1.0} fill={dna.skinTone}/>
    <rect x={9.0} y={20.0} width={3.0} height={5.5} rx={1.0} fill={dna.skinTone}/>
    <rect x={4.0} y={23.5} width={3.0} height={2.0} rx={0.5} fill={WHITE}/>
    <rect x={9.0} y={23.5} width={3.0} height={2.0} rx={0.5} fill={WHITE}/>
    <rect x={6.8} y={8.8} width={2.4} height={1.5} fill={dna.skinTone}/>
    <HeadLayer cx={8} cy={5.0} r={3.8} dna={dna} expr={expr} stage="child"/>
  </>);
}

function Middle({ dna, color, expr }: StageProps) {
  const dc = darken(color, 50);
  return (<>
    <rect x={3.5}  y={9.0} width={9.0} height={7.5} rx={1.0} fill={color}/>
    <rect x={6.5}  y={9.0} width={3.0} height={3.0}           fill={WHITE}/>
    <rect x={2.0}  y={9.5} width={2.5} height={4.8} rx={1.2} fill={color}/>
    <rect x={11.5} y={9.5} width={2.5} height={4.8} rx={1.2} fill={color}/>
    <circle cx={2.2} cy={13.8} r={1.0} fill={dna.skinTone}/>
    <circle cx={13.8} cy={13.8} r={1.0} fill={dna.skinTone}/>
    <rect x={4.0}  y={16.2} width={8.0} height={5.0} rx={1.0} fill={dc}/>
    <rect x={4.0}  y={20.5} width={3.5} height={5.0} rx={1.0} fill={dna.skinTone}/>
    <rect x={8.5}  y={20.5} width={3.5} height={5.0} rx={1.0} fill={dna.skinTone}/>
    <rect x={6.8}  y={8.0} width={2.4} height={1.5}           fill={dna.skinTone}/>
    <HeadLayer cx={8} cy={4.8} r={3.5} dna={dna} expr={expr} stage="middle"/>
  </>);
}

function HighSchool({ dna, color, expr }: StageProps) {
  const jacket = "#2a3a6a"; const dc = darken(color, 40);
  return (<>
    <rect x={3.0}  y={8.8} width={10.0} height={9.0} rx={1.0} fill={jacket}/>
    <rect x={6.0}  y={8.8} width={4.0}  height={6.5}           fill={WHITE}/>
    <rect x={7.3}  y={9.2} width={1.4}  height={5.5} rx={0.5} fill={color}/>
    <rect x={2.0}  y={9.2} width={2.5}  height={5.0} rx={1.2} fill={jacket}/>
    <rect x={11.5} y={9.2} width={2.5}  height={5.0} rx={1.2} fill={jacket}/>
    <circle cx={2.2} cy={13.8} r={1.0} fill={dna.skinTone}/>
    <circle cx={13.8} cy={13.8} r={1.0} fill={dna.skinTone}/>
    <rect x={3.5}  y={17.5} width={4.0} height={8.0} rx={1.0} fill={dc}/>
    <rect x={8.5}  y={17.5} width={4.0} height={8.0} rx={1.0} fill={dc}/>
    <rect x={6.8}  y={7.8} width={2.4} height={1.5}           fill={dna.skinTone}/>
    <HeadLayer cx={8} cy={4.5} r={3.5} dna={dna} expr={expr} stage="highschool"/>
  </>);
}

function Young({ dna, color, expr, job }: StageProps) {
  const t = getClothingTheme(job, color);
  return (<>
    <rect x={3.0}  y={8.8} width={10.0} height={9.0} rx={1.0} fill={t.jacket}/>
    <rect x={6.0}  y={8.8} width={4.0}  height={7.0}           fill={t.shirt}/>
    {t.tie && <rect x={7.3} y={9.2} width={1.4} height={6.0} rx={0.5} fill={t.tie}/>}
    <rect x={2.0}  y={9.2} width={2.5}  height={5.5} rx={1.2} fill={t.jacket}/>
    <rect x={11.5} y={9.2} width={2.5}  height={5.5} rx={1.2} fill={t.jacket}/>
    <circle cx={2.2} cy={14.2} r={1.1} fill={dna.skinTone}/>
    <circle cx={13.8} cy={14.2} r={1.1} fill={dna.skinTone}/>
    <rect x={3.5}  y={17.5} width={4.0} height={8.0} rx={1.0} fill={t.pants}/>
    <rect x={8.5}  y={17.5} width={4.0} height={8.0} rx={1.0} fill={t.pants}/>
    <rect x={6.8}  y={7.8} width={2.4} height={1.5}           fill={dna.skinTone}/>
    <HeadLayer cx={8} cy={4.5} r={3.3} dna={dna} expr={expr} stage="young"/>
  </>);
}

function Adult({ dna, color, expr, job }: StageProps) {
  const t = getClothingTheme(job, color);
  return (<>
    <rect x={2.5}  y={8.2} width={11.0} height={9.5} rx={1.0} fill={t.jacket}/>
    <rect x={5.5}  y={8.2} width={5.0}  height={7.5}           fill={t.shirt}/>
    {t.tie && <polygon points={`7.5,8.2 8.5,8.2 9.0,14.5 8.0,15.5 7.0,14.5`} fill={t.tie}/>}
    <rect x={1.5}  y={8.5} width={2.8}  height={5.5} rx={1.4} fill={t.jacket}/>
    <rect x={11.7} y={8.5} width={2.8}  height={5.5} rx={1.4} fill={t.jacket}/>
    <circle cx={2.0} cy={13.5} r={1.2} fill={dna.skinTone}/>
    <circle cx={14.0} cy={13.5} r={1.2} fill={dna.skinTone}/>
    <rect x={3.0}  y={17.5} width={4.0} height={8.0} rx={1.0} fill={t.pants}/>
    <rect x={9.0}  y={17.5} width={4.0} height={8.0} rx={1.0} fill={t.pants}/>
    <rect x={6.8}  y={7.5} width={2.4} height={1.2}           fill={dna.skinTone}/>
    <HeadLayer cx={8} cy={4.5} r={3.2} dna={dna} expr={expr} stage="adult"/>
  </>);
}

function MiddleAge({ dna, color, expr, job }: StageProps) {
  const t = getClothingTheme(job, color);
  const bag = blendHex(t.jacket, "#000000", 0.3);
  return (<>
    <rect x={2.0}  y={8.5} width={12.0} height={10.5} rx={1.0} fill={t.jacket}/>
    <rect x={5.5}  y={8.5} width={5.0}  height={7.5}            fill={t.shirt}/>
    {t.tie && <polygon points={`7.5,8.5 8.5,8.5 9.0,15.0 8.0,16.0 7.0,15.0`} fill={t.tie}/>}
    <rect x={12.5} y={13.0} width={3.8} height={5.0} rx={1.0} fill={bag}/>
    <rect x={13.5} y={12.0} width={1.8} height={1.5} rx={0.4} fill={bag}/>
    <rect x={1.0}  y={8.8} width={2.8}  height={5.5} rx={1.4} fill={t.jacket}/>
    <rect x={12.2} y={8.8} width={2.8}  height={5.5} rx={1.4} fill={t.jacket}/>
    <circle cx={1.5} cy={13.8} r={1.1} fill={dna.skinTone}/>
    <circle cx={14.5} cy={13.8} r={1.1} fill={dna.skinTone}/>
    <rect x={2.5}  y={18.5} width={4.5} height={7.0} rx={1.0} fill={t.pants}/>
    <rect x={9.0}  y={18.5} width={4.5} height={7.0} rx={1.0} fill={t.pants}/>
    <rect x={6.8}  y={7.8} width={2.4} height={1.2}            fill={dna.skinTone}/>
    <HeadLayer cx={8} cy={4.5} r={3.5} dna={dna} expr={expr} stage="middleage"/>
  </>);
}

function Elder({ dna, color, expr }: StageProps) {
  return (<>
    <rect x={3.0}  y={9.0} width={10.0} height={8.0} rx={2.0} fill={color}/>
    <rect x={2.0}  y={9.5} width={2.5}  height={5.0} rx={1.2} fill={color}/>
    <rect x={11.5} y={9.5} width={2.5}  height={5.0} rx={1.2} fill={color}/>
    <circle cx={1.8} cy={14.0} r={1.1} fill={dna.skinTone}/>
    <circle cx={14.2} cy={14.0} r={1.1} fill={dna.skinTone}/>
    <rect x={3.5}  y={16.5} width={4.0} height={7.0} rx={1.5} fill={"#4a4a6a"}/>
    <rect x={8.5}  y={16.5} width={4.0} height={7.0} rx={1.5} fill={"#4a4a6a"}/>
    <line x1={13} y1={11} x2={15} y2={24} stroke={"#8a6a40"} strokeWidth={1.5} strokeLinecap="round"/>
    <ellipse cx={13.5} cy={11.0} rx={1.5} ry={1.0} fill={"#8a6a40"}/>
    <rect x={6.8}  y={7.8} width={2.4} height={1.2}           fill={dna.skinTone}/>
    <HeadLayer cx={8} cy={4.5} r={3.5} dna={dna} expr={expr} stage="elder"/>
  </>);
}

// ============================================================
// PixelAvatarBody — SVG内に直接レンダリング（DotAvatar/AvatarBuilderで共用）
// ============================================================
export function PixelAvatarBody({
  dna, stage, happiness, job, isDebt = false,
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

  const bodyMap: Record<AgeStage, React.ReactNode> = {
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
  return <>{bodyMap[stage]}</>;
}

// ============================================================
// メイン DotAvatar
// ============================================================
interface Props {
  player:        Player;
  size?:         number;
  shadow?:       boolean;
  customization?: AvatarCustomization;
}

export function DotAvatar({ player, size = 32, shadow = false }: Props) {
  const ci    = AVATAR_COLORS[player.avatar.color];
  const W     = size;
  const H     = Math.round(size * 1.6);
  const age   = posToAgeForAvatar(player.position);
  const stage = ageToStage(age);
  const isDebt = player.money < -500;

  // カスタマイズ優先、なければDNA自動生成
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
          filter: shadow ? "drop-shadow(0 2px 4px rgba(0,0,0,0.7))" : undefined }}>
        <PixelAvatarBody dna={dna} stage={stage} happiness={player.happiness} job={player.job} isDebt={isDebt}/>
      </svg>

      {player.isMarried && (
        <span style={{ position:"absolute", top:-2, right:-4, fontSize:badgeFS, lineHeight:1,
          filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.6))", pointerEvents:"none" }}>💍</span>
      )}
      {player.hasChildren && (
        <span style={{ position:"absolute", bottom:0, left:-4, fontSize:badgeFS, lineHeight:1,
          filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.6))", pointerEvents:"none" }}>👶</span>
      )}
      {player.money >= 1000 && !player.isMarried && (
        <span style={{ position:"absolute", top:-2, right:-4, fontSize:badgeFS, lineHeight:1,
          filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.6))", pointerEvents:"none" }}>⌚</span>
      )}
      {jobBadge && (
        <span style={{ position:"absolute", bottom:0, right:-4, fontSize:badgeFS, lineHeight:1,
          filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.6))", pointerEvents:"none" }}>{jobBadge}</span>
      )}
      {player.hasPet && (
        <span style={{ position:"absolute", bottom:Math.round(size*0.45), left:-4,
          fontSize:Math.max(7,Math.round(size*0.22)), lineHeight:1,
          filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.6))", pointerEvents:"none" }}>🐾</span>
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
      backgroundColor: ci.bg,
      border: isActive ? "2px solid #fff" : `2px solid ${darken(ci.bg, 40)}`,
      boxShadow: isActive
        ? `0 0 8px ${ci.bg}, 0 0 4px #fff, 0 2px 4px rgba(0,0,0,0.6)`
        : "0 2px 4px rgba(0,0,0,0.5)",
      overflow:"hidden", display:"flex", alignItems:"flex-end", justifyContent:"center",
    }}>
      <svg width={size-2} height={size-1} viewBox="0 0 16 26" style={{ marginBottom:-2 }}>
        <PixelAvatarBody dna={dna} stage={stage} happiness={50} job={player.job} isDebt={isDebt}/>
      </svg>
    </div>
  );
}
