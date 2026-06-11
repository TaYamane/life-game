"use client";
import type { Player, JobType, AvatarCustomization } from "@/types/game";
import { AVATAR_COLORS } from "@/types/game";

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
  baby:       "赤ちゃん",
  toddler:    "幼児",
  child:      "小学生",
  middle:     "中学生",
  highschool: "高校生",
  young:      "若者",
  adult:      "社会人",
  middleage:  "中年",
  elder:      "老人",
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

// 位置から年齢を計算（gameStore の posToAge と同一ロジック）
export function posToAgeForAvatar(position: number): number {
  if (position <= 14)  return Math.round((position / 14) * 5);
  if (position <= 25)  return 6  + Math.round(((position - 15) / 10) * 6);
  if (position <= 39)  return 13 + Math.round(((position - 26) / 13) * 2);
  if (position <= 50)  return 16 + Math.round(((position - 40) / 10) * 2); // 16〜18歳
  if (position <= 58)  return 18 + Math.round(((position - 50) / 8)  * 5); // 18〜23歳
  if (position <= 69)  return 23 + Math.round(((position - 58) / 11) * 4); // 23〜27歳
  if (position <= 110) return 27 + Math.round(((position - 70) / 40) * 13);// 27〜40歳
  if (position <= 134) return 41 + Math.round(((position - 111) / 23) * 23);// 41〜64歳
  return               65 + Math.round(((position - 135) / 15) * 20);       // 65〜85歳
}

// ============================================================
// 表情
// ============================================================
type Expression = "happy" | "neutral" | "tired";

function getExpression(happiness: number): Expression {
  if (happiness >= 70) return "happy";
  if (happiness >= 40) return "neutral";
  return "tired";
}

// ============================================================
// 職業バッジ
// ============================================================
function getJobBadge(job: JobType): string | null {
  const map: Partial<Record<JobType, string>> = {
    salaryman:      "💼",
    civil_servant:  "💼",
    engineer:       "💻",
    artist:         "🎨",
    entrepreneur:   "🎩",
    doctor:         "🩺",
    lawyer:         "⚖️",
    youtuber:       "📹",
    freelancer:     "🖥️",
    part_time:      "🏷️",
    comedian:       "🎭",
    carpenter:      "🔨",
    baseball:       "⚾",
    // 隠し職業
    inventor:       "⚙️",
    investor:       "💎",
    astronaut:      "🚀",
    pro_gamer:      "🎮",
    shadow_ruler:   "👁️",
    legendary_neet: "🛋️",
  };
  return map[job] ?? null;
}

// ============================================================
// 定数・ヘルパー
// ============================================================
const SKIN       = "#f4c08a";
const SKIN2      = "#e8a070";
const HAIR_DARK  = "#3a2010";
const HAIR_LIGHT = "#c8a060";
const WHITE      = "#f0f0f0";

function darken(hex: string, amt = 50): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (n >> 16) - amt);
  const g = Math.max(0, ((n >> 8) & 0xff) - amt);
  const b = Math.max(0, (n & 0xff) - amt);
  return `rgb(${r},${g},${b})`;
}

// ============================================================
// 表情パーツ（口）
// ============================================================
function Mouth({ cx, cy, expr }: { cx: number; cy: number; expr: Expression }) {
  if (expr === "happy") {
    return (
      <path
        d={`M ${cx - 1.8} ${cy} Q ${cx} ${cy + 1.8} ${cx + 1.8} ${cy}`}
        fill="none" stroke="#7a4020" strokeWidth={0.7} strokeLinecap="round"
      />
    );
  }
  if (expr === "tired") {
    return (
      <path
        d={`M ${cx - 1.8} ${cy + 1.2} Q ${cx} ${cy - 0.4} ${cx + 1.8} ${cy + 1.2}`}
        fill="none" stroke="#7a4020" strokeWidth={0.7} strokeLinecap="round"
      />
    );
  }
  return (
    <line x1={cx - 1.4} y1={cy} x2={cx + 1.4} y2={cy}
      stroke="#7a4020" strokeWidth={0.6} />
  );
}

// ============================================================
// 年齢別ボディ SVG パーツ
// ============================================================

function Baby({ c, dc, expr }: { c: string; dc: string; expr: Expression }) {
  return (<>
    <ellipse cx="8" cy="3.5" rx="4.5" ry="3" fill={dc} />
    <circle cx="8" cy="5.5" r="4.5" fill={SKIN} />
    <circle cx="6.2" cy="5.2" r="0.9" fill="#222" />
    <circle cx="9.8" cy="5.2" r="0.9" fill="#222" />
    <ellipse cx="5.3" cy="6.8" rx="1.2" ry="0.7" fill="#f9a8d4" opacity="0.6" />
    <ellipse cx="10.7" cy="6.8" rx="1.2" ry="0.7" fill="#f9a8d4" opacity="0.6" />
    <Mouth cx={8} cy={7.6} expr={expr} />
    <rect x="6.5" y="9.5" width="3" height="2" fill={SKIN} />
    <rect x="3.5" y="10.5" width="9" height="6" rx="2.5" fill={c} />
    <rect x="1" y="11" width="3" height="4" rx="1.5" fill={c} />
    <rect x="12" y="11" width="3" height="4" rx="1.5" fill={c} />
    <rect x="4" y="16" width="3.5" height="5" rx="1.8" fill={c} />
    <rect x="8.5" y="16" width="3.5" height="5" rx="1.8" fill={c} />
  </>);
}

function Toddler({ c, dc, expr }: { c: string; dc: string; expr: Expression }) {
  return (<>
    <ellipse cx="8" cy="3" rx="4" ry="2.8" fill={dc} />
    <circle cx="8" cy="5" r="4" fill={SKIN} />
    <circle cx="6.3" cy="4.6" r="0.85" fill="#222" />
    <circle cx="9.7" cy="4.6" r="0.85" fill="#222" />
    <ellipse cx="5.4" cy="6.2" rx="1.1" ry="0.65" fill="#f9a8d4" opacity="0.5" />
    <ellipse cx="10.6" cy="6.2" rx="1.1" ry="0.65" fill="#f9a8d4" opacity="0.5" />
    <Mouth cx={8} cy={7} expr={expr} />
    <rect x="6.5" y="8.5" width="3" height="2" fill={SKIN} />
    <rect x="4" y="9.8" width="8" height="5.5" rx="2" fill={c} />
    <rect x="1.5" y="10.5" width="2.8" height="3.5" rx="1.4" fill={c} />
    <rect x="11.7" y="10.5" width="2.8" height="3.5" rx="1.4" fill={c} />
    <rect x="4.2" y="15" width="3.2" height="5.5" rx="1.6" fill={c} />
    <rect x="8.6" y="15" width="3.2" height="5.5" rx="1.6" fill={c} />
  </>);
}

function Child({ c, dc, expr }: { c: string; dc: string; expr: Expression }) {
  return (<>
    <ellipse cx="8" cy="3" rx="4" ry="2.5" fill={HAIR_DARK} />
    <circle cx="8" cy="4.8" r="4" fill={SKIN} />
    <circle cx="6.3" cy="4.5" r="0.8" fill="#222" />
    <circle cx="9.7" cy="4.5" r="0.8" fill="#222" />
    <Mouth cx={8} cy={6.4} expr={expr} />
    <rect x="6.5" y="8.3" width="3" height="2" fill={SKIN} />
    <rect x="3.5" y="9.5" width="9" height="7" rx="1.5" fill={WHITE} />
    <polygon points="7,9.5 9,9.5 8,12" fill={dc} />
    <rect x="4" y="16" width="8" height="4" rx="1" fill={c} />
    <rect x="4" y="19.5" width="3" height="5" rx="1" fill={SKIN} />
    <rect x="9" y="19.5" width="3" height="5" rx="1" fill={SKIN} />
    <rect x="4" y="23" width="3" height="2" rx="0.5" fill={WHITE} />
    <rect x="9" y="23" width="3" height="2" rx="0.5" fill={WHITE} />
    <rect x="12.5" y="10" width="3" height="5" rx="1" fill={dc} />
  </>);
}

function Middle({ c, dc, expr }: { c: string; dc: string; expr: Expression }) {
  return (<>
    <ellipse cx="8" cy="2.5" rx="3.8" ry="2.5" fill={HAIR_DARK} />
    <circle cx="8" cy="4.3" r="3.8" fill={SKIN} />
    <circle cx="6.4" cy="4" r="0.8" fill="#222" />
    <circle cx="9.6" cy="4" r="0.8" fill="#222" />
    <Mouth cx={8} cy={6} expr={expr} />
    <rect x="6.5" y="7.5" width="3" height="2" fill={SKIN} />
    <rect x="3.5" y="8.8" width="9" height="8" rx="1" fill={c} />
    <rect x="6.5" y="8.8" width="3" height="3" fill={WHITE} />
    <rect x="4" y="16.5" width="8" height="5.5" rx="1" fill={dc} />
    <rect x="4" y="21" width="3" height="5" rx="1" fill={SKIN} />
    <rect x="9" y="21" width="3" height="5" rx="1" fill={SKIN} />
  </>);
}

function HighSchool({ c, dc, expr }: { c: string; dc: string; expr: Expression }) {
  const jacket = "#2a3a6a";
  return (<>
    <ellipse cx="8" cy="2" rx="3.5" ry="2.2" fill={HAIR_DARK} />
    <circle cx="8" cy="4" r="3.5" fill={SKIN} />
    <circle cx="6.5" cy="3.7" r="0.75" fill="#222" />
    <circle cx="9.5" cy="3.7" r="0.75" fill="#222" />
    <Mouth cx={8} cy={5.6} expr={expr} />
    <rect x="6.5" y="7" width="3" height="2" fill={SKIN} />
    <rect x="3" y="8.5" width="10" height="9" rx="1" fill={jacket} />
    <rect x="6" y="8.5" width="4" height="6" fill={WHITE} />
    <rect x="7.3" y="9" width="1.4" height="5" rx="0.5" fill={c} />
    <rect x="3.5" y="17" width="4" height="8" rx="1" fill={dc} />
    <rect x="8.5" y="17" width="4" height="8" rx="1" fill={dc} />
  </>);
}

function Young({ c, dc, expr }: { c: string; dc: string; expr: Expression }) {
  const jacket = "#1a2a50";
  return (<>
    <ellipse cx="8" cy="2" rx="3.5" ry="2.2" fill={HAIR_DARK} />
    <circle cx="8" cy="4" r="3.5" fill={SKIN} />
    <circle cx="6.5" cy="3.7" r="0.75" fill="#222" />
    <circle cx="9.5" cy="3.7" r="0.75" fill="#222" />
    <Mouth cx={8} cy={5.4} expr={expr} />
    <rect x="6.5" y="7" width="3" height="2" fill={SKIN} />
    <rect x="3" y="8.5" width="10" height="9" rx="1" fill={jacket} />
    <rect x="6" y="8.5" width="4" height="7" fill={WHITE} />
    <rect x="7.3" y="9" width="1.4" height="6" rx="0.5" fill={c} />
    <rect x="3.5" y="17" width="4" height="8" rx="1" fill="#1a2040" />
    <rect x="8.5" y="17" width="4" height="8" rx="1" fill="#1a2040" />
  </>);
}

function Adult({ c, dc, expr }: { c: string; dc: string; expr: Expression }) {
  return (<>
    <ellipse cx="8" cy="2" rx="3.2" ry="2" fill={HAIR_DARK} />
    <circle cx="8" cy="3.8" r="3.2" fill={SKIN} />
    <circle cx="6.7" cy="3.6" r="0.7" fill="#222" />
    <circle cx="9.3" cy="3.6" r="0.7" fill="#222" />
    <Mouth cx={8} cy={5.3} expr={expr} />
    <rect x="6.5" y="6.5" width="3" height="2" fill={SKIN} />
    <rect x="2.5" y="8" width="11" height="10" rx="1" fill="#2a3555" />
    <rect x="5.5" y="8" width="5" height="7" fill={WHITE} />
    <polygon points="7.5,8 8.5,8 9,14 8,15 7,14" fill={c} />
    <rect x="3" y="17.5" width="4" height="8" rx="1" fill="#1a2040" />
    <rect x="9" y="17.5" width="4" height="8" rx="1" fill="#1a2040" />
  </>);
}

function MiddleAge({ c, dc, expr }: { c: string; dc: string; expr: Expression }) {
  return (<>
    <ellipse cx="8" cy="2" rx="3.5" ry="2" fill={HAIR_LIGHT} />
    <circle cx="8" cy="4" r="3.5" fill={SKIN2} />
    <circle cx="6.6" cy="3.8" r="0.7" fill="#222" />
    <circle cx="9.4" cy="3.8" r="0.7" fill="#222" />
    <path d="M5.5 5.5 Q6 6 6.5 5.5" stroke={SKIN} strokeWidth={0.4} fill="none" />
    <path d="M9.5 5.5 Q10 6 10.5 5.5" stroke={SKIN} strokeWidth={0.4} fill="none" />
    <Mouth cx={8} cy={6.1} expr={expr} />
    <rect x="6.5" y="7" width="3" height="2" fill={SKIN2} />
    <rect x="2" y="8.5" width="12" height="10.5" rx="1" fill="#1a2540" />
    <rect x="5.5" y="8.5" width="5" height="7" fill={WHITE} />
    <polygon points="7.5,8.5 8.5,8.5 9,14.5 8,15.5 7,14.5" fill={c} />
    <rect x="12.5" y="13" width="4" height="5" rx="1" fill={dc} />
    <rect x="13.5" y="12" width="2" height="1.5" rx="0.5" fill={dc} />
    <rect x="2.5" y="18.5" width="4.5" height="7" rx="1" fill="#141c30" />
    <rect x="9" y="18.5" width="4.5" height="7" rx="1" fill="#141c30" />
  </>);
}

function Elder({ c, expr }: { c: string; expr: Expression }) {
  return (<>
    <ellipse cx="8" cy="2.5" rx="3.5" ry="2.5" fill="#d8d8d8" />
    <circle cx="8" cy="4.5" r="3.5" fill={SKIN2} />
    <circle cx="6.7" cy="4.3" r="0.6" fill="#333" />
    <circle cx="9.3" cy="4.3" r="0.6" fill="#333" />
    <path d="M5.5 5.5 Q6 6 6.5 5.5" stroke={SKIN} strokeWidth={0.4} fill="none" />
    <path d="M9.5 5.5 Q10 6 10.5 5.5" stroke={SKIN} strokeWidth={0.4} fill="none" />
    <Mouth cx={8} cy={6.5} expr={expr} />
    <rect x="6.5" y="7.5" width="3" height="2" fill={SKIN2} />
    <rect x="3" y="9" width="10" height="8" rx="2" fill={c} />
    <rect x="3.5" y="16.5" width="4" height="7" rx="1.5" fill="#4a4a6a" />
    <rect x="8.5" y="16.5" width="4" height="7" rx="1.5" fill="#4a4a6a" />
    <line x1="13" y1="11" x2="15" y2="24" stroke="#8a6a40" strokeWidth={1.5} strokeLinecap="round" />
    <ellipse cx="13.5" cy="11" rx="1.5" ry="1" fill="#8a6a40" />
  </>);
}

// ============================================================
// メイン DotAvatar コンポーネント
// ============================================================
interface Props {
  player: Player;
  size?: number;
  shadow?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  customization?: AvatarCustomization; // 将来のカスタマイズ用（現在未使用）
}

export function DotAvatar({ player, size = 32, shadow = false }: Props) {
  const c     = AVATAR_COLORS[player.avatar.color];
  const dc    = darken(c.bg, 50);
  const W     = size;
  const H     = Math.round(size * 1.6);

  const age   = posToAgeForAvatar(player.position);
  const stage = ageToStage(age);
  const expr  = getExpression(player.happiness);

  const bp = { c: c.bg, dc, expr };

  const bodyMap: Record<AgeStage, React.ReactNode> = {
    baby:       <Baby       {...bp} />,
    toddler:    <Toddler    {...bp} />,
    child:      <Child      {...bp} />,
    middle:     <Middle     {...bp} />,
    highschool: <HighSchool {...bp} />,
    young:      <Young      {...bp} />,
    adult:      <Adult      {...bp} />,
    middleage:  <MiddleAge  {...bp} />,
    elder:      <Elder      c={c.bg} expr={expr} />,
  };

  const jobBadge = (player.job !== "none" && player.job !== "part_time")
    ? getJobBadge(player.job)
    : null;

  const badgeFontSize = Math.max(8, Math.round(size * 0.28));

  return (
    <div style={{
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: W,
      height: H,
    }}>
      {/* メイン SVG */}
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

      {/* 結婚指輪バッジ */}
      {player.isMarried && (
        <span style={{
          position: "absolute",
          top: -2,
          right: -4,
          fontSize: badgeFontSize,
          lineHeight: 1,
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))",
          pointerEvents: "none",
        }}>💍</span>
      )}

      {/* 子供バッジ */}
      {player.hasChildren && (
        <span style={{
          position: "absolute",
          bottom: 0,
          left: -4,
          fontSize: badgeFontSize,
          lineHeight: 1,
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))",
          pointerEvents: "none",
        }}>👶</span>
      )}

      {/* 職業バッジ */}
      {jobBadge && (
        <span style={{
          position: "absolute",
          bottom: 0,
          right: -4,
          fontSize: badgeFontSize,
          lineHeight: 1,
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))",
          pointerEvents: "none",
        }}>{jobBadge}</span>
      )}
    </div>
  );
}

// ============================================================
// マップ用トークン（小サイズ・バッジなし）
// ============================================================
interface TokenProps {
  player:   Player;
  size?:    number;
  isActive?: boolean;
}

export function DotAvatarToken({ player, size = 20, isActive = false }: TokenProps) {
  const c     = AVATAR_COLORS[player.avatar.color];
  const dc    = darken(c.bg, 50);
  const expr  = getExpression(player.happiness);
  const age   = posToAgeForAvatar(player.position);
  const stage = ageToStage(age);
  const bp    = { c: c.bg, dc, expr };

  const bodyMap: Record<AgeStage, React.ReactNode> = {
    baby:       <Baby       {...bp} />,
    toddler:    <Toddler    {...bp} />,
    child:      <Child      {...bp} />,
    middle:     <Middle     {...bp} />,
    highschool: <HighSchool {...bp} />,
    young:      <Young      {...bp} />,
    adult:      <Adult      {...bp} />,
    middleage:  <MiddleAge  {...bp} />,
    elder:      <Elder      c={c.bg} expr={expr} />,
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: c.bg,
        border: isActive ? "2px solid #fff" : `2px solid ${darken(c.bg, 40)}`,
        boxShadow: isActive
          ? `0 0 8px ${c.bg}, 0 0 4px #fff, 0 2px 4px rgba(0,0,0,0.6)`
          : "0 2px 4px rgba(0,0,0,0.5)",
        overflow: "hidden",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
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
