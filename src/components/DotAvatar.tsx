"use client";
import type { Player, JobType, AvatarCustomization } from "@/types/game";
import { AVATAR_COLORS } from "@/types/game";

// ============================================================
// CharacterDNA — プレイヤーIDから決定論的に生成
// ゲーム開始時に1度だけ決まり、85歳まで維持される
// ============================================================
export interface CharacterDNA {
  hairColor: string;      // 髪の基本色（人生を通して同じ）
  skinTone:  string;      // 肌色（人生を通して同じ）
  eyeColor:  string;      // 瞳の色（人生を通して同じ）
  hairStyle: 0 | 1 | 2;  // 髪型（0=ショート, 1=サイド, 2=センター分け）
}

const DNA_HAIR = ["#2a1808","#3d2010","#1a1a1a","#7B3A10","#c8a050","#2a1855","#5a3020"];
const DNA_EYES = ["#1a1212","#2a1008","#1a2418","#201830"];

// 肌色は固定（明るい・日本のアニメ調）
// 見た目のバリエーションは髪色・目の色・髪型で出す
const SKIN_COLOR = "#f5c98a";

export function generateDNA(playerId: string): CharacterDNA {
  let h = 5381;
  for (let i = 0; i < playerId.length; i++) {
    h = ((h << 5) + h) ^ playerId.charCodeAt(i);
    h >>>= 0;
  }
  return {
    hairColor: DNA_HAIR[h % DNA_HAIR.length],
    skinTone:  SKIN_COLOR,
    eyeColor:  DNA_EYES[(h >> 8) % DNA_EYES.length],
    hairStyle: ((h >> 12) % 3) as 0 | 1 | 2,
  };
}

// hex同士をブレンド（白髪化などに使用）
function blendHex(c1: string, c2: string, t: number): string {
  const safe = (s: string) => s.startsWith("#") ? s : "#888888";
  const n1 = parseInt(safe(c1).slice(1), 16);
  const n2 = parseInt(safe(c2).slice(1), 16);
  const r = Math.round(((n1 >> 16) & 255) * (1 - t) + ((n2 >> 16) & 255) * t);
  const g = Math.round((((n1 >>  8) & 255) * (1 - t) + ((n2 >>  8) & 255) * t));
  const b = Math.round(((n1 & 255) * (1 - t) + (n2 & 255) * t));
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

// 年齢に応じて髪を白髪化（DNAの色を維持しながら徐々にグレーへ）
function agingHair(base: string, stage: AgeStage): string {
  if (stage === "elder")     return blendHex(base, "#c0c0c8", 0.78);
  if (stage === "middleage") return blendHex(base, "#c0c0c8", 0.22);
  return base;
}

function darken(hex: string, amt = 50): string {
  if (!hex.startsWith("#")) return hex;
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (n >> 16) - amt);
  const g = Math.max(0, ((n >> 8) & 0xff) - amt);
  const b = Math.max(0, (n & 0xff) - amt);
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

const WHITE = "#f2f0ee";

// ============================================================
// 年齢ステージ（9段階）
// ============================================================
export type AgeStage =
  | "baby"        // 0〜2歳
  | "toddler"     // 3〜5歳
  | "child"       // 6〜12歳
  | "middle"      // 13〜15歳
  | "highschool"  // 16〜18歳
  | "young"       // 19〜29歳
  | "adult"       // 30〜49歳
  | "middleage"   // 50〜64歳
  | "elder";      // 65歳以上

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
  if (position <= 25)  return 6  + Math.round(((position - 15) / 10) * 6);
  if (position <= 39)  return 13 + Math.round(((position - 26) / 13) * 2);
  if (position <= 50)  return 16 + Math.round(((position - 40) / 10) * 2);
  if (position <= 58)  return 18 + Math.round(((position - 50) / 8)  * 5);
  if (position <= 69)  return 23 + Math.round(((position - 58) / 11) * 4);
  if (position <= 110) return 27 + Math.round(((position - 70) / 40) * 13);
  if (position <= 134) return 41 + Math.round(((position - 111) / 23) * 23);
  return               65 + Math.round(((position - 135) / 15) * 20);
}

// ============================================================
// 表情（5段階）— 幸福度 + 借金状態に連動
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

function Mouth({ cx, cy, expr }: { cx: number; cy: number; expr: Expression }) {
  const s = "#7a3020";
  const sw = 0.7;
  if (expr === "very_happy") return (
    <path d={`M ${cx-2.2} ${cy} Q ${cx} ${cy+2.4} ${cx+2.2} ${cy}`}
      fill="#f9a8a8" stroke={s} strokeWidth={sw} strokeLinecap="round"/>
  );
  if (expr === "happy") return (
    <path d={`M ${cx-1.8} ${cy} Q ${cx} ${cy+1.8} ${cx+1.8} ${cy}`}
      fill="none" stroke={s} strokeWidth={sw} strokeLinecap="round"/>
  );
  if (expr === "tired") return (
    <path d={`M ${cx-1.8} ${cy+1.0} Q ${cx} ${cy-0.2} ${cx+1.8} ${cy+1.0}`}
      fill="none" stroke={s} strokeWidth={sw} strokeLinecap="round"/>
  );
  if (expr === "sad") return (
    <path d={`M ${cx-2.0} ${cy+1.6} Q ${cx} ${cy-0.5} ${cx+2.0} ${cy+1.6}`}
      fill="none" stroke={s} strokeWidth={sw} strokeLinecap="round"/>
  );
  return <line x1={cx-1.5} y1={cy} x2={cx+1.5} y2={cy} stroke={s} strokeWidth={0.6}/>;
}

// ============================================================
// HeadLayer — DNA を使った顔描画（人生を通して同じ顔）
// ステージが変わっても: 髪色・肌色・目の色・髪型は保たれる
// 変わるもの: 髪の白髪化（middleage/elder）、しわ（middleage/elder）
// ============================================================
interface HeadProps {
  cx: number; cy: number; r: number;
  dna:   CharacterDNA;
  expr:  Expression;
  stage: AgeStage;
}

function HeadLayer({ cx, cy, r, dna, expr, stage }: HeadProps) {
  const isBaby  = stage === "baby" || stage === "toddler";
  const isOld   = stage === "middleage" || stage === "elder";
  const isElder = stage === "elder";

  const hairColor = agingHair(dna.hairColor, stage);
  const hairDark  = blendHex(hairColor, "#000000", 0.3);

  const eyeR = isBaby ? r * 0.22 : r * 0.19;
  const eyeX = r * 0.38;
  const eyeY = isBaby ? -(r * 0.02) : r * 0.06;

  const browY  = cy - eyeY - eyeR * 1.75;
  const mouthY = cy + r * 0.50;

  return (<>
    {/* ── 髪（頭の上・後ろ部分、頭の円に一部隠れる） ── */}
    {dna.hairStyle === 0 && (
      <ellipse cx={cx} cy={cy - r*0.30} rx={r*1.08} ry={r*0.82} fill={hairColor}/>
    )}
    {dna.hairStyle === 1 && (<>
      <ellipse cx={cx} cy={cy - r*0.30} rx={r*1.12} ry={r*0.82} fill={hairColor}/>
      {!isBaby && <rect x={cx - r*1.2} y={cy - r*0.15} width={r*0.42} height={r*1.05} rx={r*0.22} fill={hairColor}/>}
      {!isBaby && <rect x={cx + r*0.78} y={cy - r*0.15} width={r*0.42} height={r*1.05} rx={r*0.22} fill={hairColor}/>}
    </>)}
    {dna.hairStyle === 2 && (<>
      <ellipse cx={cx} cy={cy - r*0.30} rx={r*1.08} ry={r*0.82} fill={hairColor}/>
      <line x1={cx} y1={cy - r*0.95} x2={cx} y2={cy - r*0.20}
        stroke={hairDark} strokeWidth={r*0.09} strokeLinecap="round"/>
    </>)}

    {/* ── 顔（肌色の円 — 常に同じ DNA 肌色） ── */}
    <circle cx={cx} cy={cy} r={r} fill={dna.skinTone}/>

    {/* ── 赤ちゃん・幼児: ほっぺのチーク ── */}
    {isBaby && (<>
      <ellipse cx={cx - r*0.52} cy={cy + r*0.28} rx={r*0.28} ry={r*0.18} fill="#f9a8d4" opacity={0.65}/>
      <ellipse cx={cx + r*0.52} cy={cy + r*0.28} rx={r*0.28} ry={r*0.18} fill="#f9a8d4" opacity={0.65}/>
    </>)}

    {/* ── しわ（中年・老人 — 肌色を暗くした線、DNA 肌色と連動） ── */}
    {isOld && (<>
      <path d={`M ${cx-eyeX-r*0.22} ${cy-eyeY-eyeR*1.3} Q ${cx-eyeX+r*0.05} ${cy-eyeY-eyeR*0.95} ${cx-eyeX+r*0.22} ${cy-eyeY-eyeR*1.3}`}
        fill="none" stroke={blendHex(dna.skinTone,"#000000",0.20)} strokeWidth={0.28} opacity={isElder ? 0.8 : 0.42}/>
      <path d={`M ${cx+eyeX-r*0.22} ${cy-eyeY-eyeR*1.3} Q ${cx+eyeX-r*0.05} ${cy-eyeY-eyeR*0.95} ${cx+eyeX+r*0.22} ${cy-eyeY-eyeR*1.3}`}
        fill="none" stroke={blendHex(dna.skinTone,"#000000",0.20)} strokeWidth={0.28} opacity={isElder ? 0.8 : 0.42}/>
    </>)}
    {isElder && (
      <path d={`M ${cx-r*0.38} ${cy+r*0.28} Q ${cx} ${cy+r*0.38} ${cx+r*0.38} ${cy+r*0.28}`}
        fill="none" stroke={blendHex(dna.skinTone,"#000000",0.15)} strokeWidth={0.28} opacity={0.5}/>
    )}

    {/* ── 目（DNA eyeColor — 人生を通して同じ） ── */}
    <circle cx={cx-eyeX} cy={cy-eyeY} r={eyeR} fill={dna.eyeColor}/>
    <circle cx={cx+eyeX} cy={cy-eyeY} r={eyeR} fill={dna.eyeColor}/>
    <circle cx={cx-eyeX+eyeR*0.38} cy={cy-eyeY-eyeR*0.38} r={eyeR*0.3} fill="white" opacity={0.75}/>
    <circle cx={cx+eyeX+eyeR*0.38} cy={cy-eyeY-eyeR*0.38} r={eyeR*0.3} fill="white" opacity={0.75}/>

    {/* ── 眉毛（DNA 髪色と連動 — 白髪化と同期） ── */}
    {!isBaby && (<>
      <path d={`M ${cx-eyeX-r*0.24} ${browY} Q ${cx-eyeX} ${browY-r*0.12} ${cx-eyeX+r*0.24} ${browY}`}
        fill="none" stroke={hairColor} strokeWidth={r*0.13} strokeLinecap="round" opacity={0.85}/>
      <path d={`M ${cx+eyeX-r*0.24} ${browY} Q ${cx+eyeX} ${browY-r*0.12} ${cx+eyeX+r*0.24} ${browY}`}
        fill="none" stroke={hairColor} strokeWidth={r*0.13} strokeLinecap="round" opacity={0.85}/>
    </>)}

    {/* ── 口（幸福度連動） ── */}
    <Mouth cx={cx} cy={mouthY} expr={expr}/>
  </>);
}

// ============================================================
// 職業別服装テーマ（ボディ描画で使用）
// ============================================================
interface ClothingTheme { jacket: string; shirt: string; tie: string; pants: string }

function getClothingTheme(job: JobType, avatarColor: string): ClothingTheme {
  switch (job) {
    case "salaryman":
    case "civil_servant":
      return { jacket:"#2a3555", shirt:WHITE, tie:avatarColor, pants:"#1a2040" };
    case "lawyer":
      return { jacket:"#1a1a2e", shirt:WHITE, tie:"#8a0000", pants:"#0d0d1e" };
    case "entrepreneur":
    case "investor":
    case "shadow_ruler":
      return { jacket:"#101020", shirt:"#e8e0d0", tie:"#d4af37", pants:"#080810" };
    case "doctor":
      return { jacket:"#e8eef8", shirt:"#e8eef8", tie:"#3b82f6", pants:"#2a3555" };
    case "baseball":
      return { jacket:WHITE,         shirt:WHITE,         tie:avatarColor,         pants:WHITE };
    case "carpenter":
      return { jacket:"#8B6914",     shirt:"#d4a820",     tie:"",                  pants:"#5a4010" };
    case "astronaut":
      return { jacket:"#c0c8e0",     shirt:"#c0c8e0",     tie:"#6080e0",           pants:"#a0a8c0" };
    case "inventor":
      return { jacket:"#2a2a3a",     shirt:"#c8d0e0",     tie:avatarColor,         pants:"#1a1a28" };
    case "pro_gamer":
      return { jacket:avatarColor,   shirt:"#1a1a2a",     tie:"",                  pants:"#1a1a2a" };
    case "comedian":
      return { jacket:avatarColor,   shirt:WHITE,         tie:darken(avatarColor, 20), pants:darken(avatarColor, 30) };
    default:
      return { jacket:avatarColor,   shirt:WHITE,         tie:darken(avatarColor, 30), pants:darken(avatarColor, 60) };
  }
}

// ============================================================
// 職業バッジ（絵文字）
// ============================================================
function getJobBadge(job: JobType): string | null {
  const map: Partial<Record<JobType, string>> = {
    salaryman:"💼", civil_servant:"💼", engineer:"💻", artist:"🎨",
    entrepreneur:"🎩", doctor:"🩺", lawyer:"⚖️", youtuber:"📹",
    freelancer:"🖥️", part_time:"🏷️", comedian:"🎭", carpenter:"🔨",
    baseball:"⚾", inventor:"⚙️", investor:"💎", astronaut:"🚀",
    pro_gamer:"🎮", shadow_ruler:"👁️", legendary_neet:"🛋️",
  };
  return map[job] ?? null;
}

// ============================================================
// 年齢別ボディ描画
// 変わるもの: 体型・服装
// 変わらないもの: 顔（HeadLayer を呼ぶだけ）
// ============================================================
interface StageProps {
  dna:   CharacterDNA;
  color: string;       // アバターカラー
  expr:  Expression;
  job:   JobType;
}

function Baby({ dna, color, expr, job }: StageProps) {
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

function Toddler({ dna, color, expr, job }: StageProps) {
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

function Child({ dna, color, expr, job }: StageProps) {
  const dc = darken(color, 50);
  return (<>
    {/* ランドセル */}
    <rect x={12.0} y={9.8} width={3.5} height={4.5} rx={1.0} fill={dc}/>
    <rect x={13.0} y={9.0} width={1.5} height={1.2} rx={0.5} fill={dc}/>
    {/* 体（白シャツ） */}
    <rect x={3.5}  y={9.8}  width={9.0} height={7.0} rx={1.5} fill={WHITE}/>
    <polygon points="7,9.8 9,9.8 8,12.2" fill={color}/>
    <rect x={1.5}  y={10.2} width={2.8} height={4.2} rx={1.4} fill={WHITE}/>
    <rect x={11.7} y={10.2} width={2.8} height={4.2} rx={1.4} fill={WHITE}/>
    {/* 手 */}
    <circle cx={2.1} cy={13.8} r={1.1} fill={dna.skinTone}/>
    <circle cx={13.9} cy={13.8} r={1.1} fill={dna.skinTone}/>
    {/* ズボン */}
    <rect x={4.0} y={16.5} width={8.0} height={4.0} rx={1.0} fill={color}/>
    <rect x={4.0} y={20.0} width={3.0} height={5.5} rx={1.0} fill={dna.skinTone}/>
    <rect x={9.0} y={20.0} width={3.0} height={5.5} rx={1.0} fill={dna.skinTone}/>
    <rect x={4.0} y={23.5} width={3.0} height={2.0} rx={0.5} fill={WHITE}/>
    <rect x={9.0} y={23.5} width={3.0} height={2.0} rx={0.5} fill={WHITE}/>
    {/* 首 */}
    <rect x={6.8} y={8.8} width={2.4} height={1.5} fill={dna.skinTone}/>
    <HeadLayer cx={8} cy={5.0} r={3.8} dna={dna} expr={expr} stage="child"/>
  </>);
}

function Middle({ dna, color, expr, job }: StageProps) {
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

function HighSchool({ dna, color, expr, job }: StageProps) {
  const jacket = "#2a3a6a";
  const dc = darken(color, 40);
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
    {/* 鞄 */}
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

function Elder({ dna, color, expr, job }: StageProps) {
  return (<>
    <rect x={3.0}  y={9.0} width={10.0} height={8.0} rx={2.0} fill={color}/>
    <rect x={2.0}  y={9.5} width={2.5}  height={5.0} rx={1.2} fill={color}/>
    <rect x={11.5} y={9.5} width={2.5}  height={5.0} rx={1.2} fill={color}/>
    <circle cx={1.8} cy={14.0} r={1.1} fill={dna.skinTone}/>
    <circle cx={14.2} cy={14.0} r={1.1} fill={dna.skinTone}/>
    <rect x={3.5}  y={16.5} width={4.0} height={7.0} rx={1.5} fill={"#4a4a6a"}/>
    <rect x={8.5}  y={16.5} width={4.0} height={7.0} rx={1.5} fill={"#4a4a6a"}/>
    {/* 杖 */}
    <line x1={13} y1={11} x2={15} y2={24} stroke={"#8a6a40"} strokeWidth={1.5} strokeLinecap="round"/>
    <ellipse cx={13.5} cy={11.0} rx={1.5} ry={1.0} fill={"#8a6a40"}/>
    <rect x={6.8}  y={7.8} width={2.4} height={1.2}           fill={dna.skinTone}/>
    <HeadLayer cx={8} cy={4.5} r={3.5} dna={dna} expr={expr} stage="elder"/>
  </>);
}

// ============================================================
// メイン DotAvatar コンポーネント
// ============================================================
interface Props {
  player:        Player;
  size?:         number;
  shadow?:       boolean;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  customization?: AvatarCustomization;
}

export function DotAvatar({ player, size = 32, shadow = false }: Props) {
  const ci    = AVATAR_COLORS[player.avatar.color];
  const W     = size;
  const H     = Math.round(size * 1.6);
  const age   = posToAgeForAvatar(player.position);
  const stage = ageToStage(age);
  const isDebt = player.money < -500;
  const expr  = getExpression(player.happiness, isDebt);

  // プレイヤーIDからDNAを生成（決定論的 — 毎回同じ顔になる）
  const dna   = generateDNA(player.playerId);
  const sp: StageProps = { dna, color: ci.bg, expr, job: player.job };

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

  const jobBadge = (player.job !== "none" && player.job !== "part_time")
    ? getJobBadge(player.job) : null;
  const badgeFS = Math.max(8, Math.round(size * 0.28));

  return (
    <div style={{
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: W, height: H,
    }}>
      <svg
        width={W} height={H}
        viewBox="0 0 16 26"
        style={{
          overflow: "visible",
          filter: shadow ? "drop-shadow(0 2px 4px rgba(0,0,0,0.7))" : undefined,
        }}
      >
        {bodyMap[stage]}
      </svg>

      {/* 結婚指輪 */}
      {player.isMarried && (
        <span style={{ position:"absolute", top:-2, right:-4, fontSize:badgeFS, lineHeight:1,
          filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.6))", pointerEvents:"none" }}>💍</span>
      )}

      {/* 子供 */}
      {player.hasChildren && (
        <span style={{ position:"absolute", bottom:0, left:-4, fontSize:badgeFS, lineHeight:1,
          filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.6))", pointerEvents:"none" }}>👶</span>
      )}

      {/* 資産 1000万以上 → 高級時計 */}
      {player.money >= 1000 && !player.isMarried && (
        <span style={{ position:"absolute", top:-2, right:-4, fontSize:badgeFS, lineHeight:1,
          filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.6))", pointerEvents:"none" }}>⌚</span>
      )}

      {/* 職業バッジ */}
      {jobBadge && (
        <span style={{ position:"absolute", bottom:0, right:-4, fontSize:badgeFS, lineHeight:1,
          filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.6))", pointerEvents:"none" }}>{jobBadge}</span>
      )}

      {/* ペット */}
      {player.hasPet && (
        <span style={{ position:"absolute", bottom:Math.round(size*0.45), left:-4,
          fontSize:Math.max(7, Math.round(size*0.22)), lineHeight:1,
          filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.6))", pointerEvents:"none" }}>🐾</span>
      )}
    </div>
  );
}

// ============================================================
// マップ用トークン（小サイズ、円形クリップ）
// ============================================================
interface TokenProps {
  player:    Player;
  size?:     number;
  isActive?: boolean;
}

export function DotAvatarToken({ player, size = 20, isActive = false }: TokenProps) {
  const ci    = AVATAR_COLORS[player.avatar.color];
  const age   = posToAgeForAvatar(player.position);
  const stage = ageToStage(age);
  const isDebt = player.money < -500;
  const expr  = getExpression(player.happiness, isDebt);
  const dna   = generateDNA(player.playerId);
  const sp: StageProps = { dna, color: ci.bg, expr, job: player.job };

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

  return (
    <div style={{
      width: size, height: size,
      borderRadius: "50%",
      backgroundColor: ci.bg,
      border: isActive ? "2px solid #fff" : `2px solid ${darken(ci.bg, 40)}`,
      boxShadow: isActive
        ? `0 0 8px ${ci.bg}, 0 0 4px #fff, 0 2px 4px rgba(0,0,0,0.6)`
        : "0 2px 4px rgba(0,0,0,0.5)",
      overflow: "hidden",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
    }}>
      <svg
        width={size - 2}
        height={size - 1}
        viewBox="0 0 16 26"
        style={{ marginBottom: -2 }}
      >
        {bodyMap[stage]}
      </svg>
    </div>
  );
}
