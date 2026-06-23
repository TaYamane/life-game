"use client";

// ============================================================
// AvatarSVG — レイヤー構造SVGキャラクター
// viewBox: 0 0 64 96  (表示サイズは親が制御)
//
// レイヤー順（下→上）:
//   1. HairBack   : 後髪
//   2. Body       : 体（肌色の見える部分・腕先・足）
//   3. Clothes    : 服
//   4. Face       : 顔ベース（肌色楕円・耳）
//   5. Eyes       : 目
//   6. Brows      : 眉
//   7. Nose       : 鼻
//   8. Mouth      : 口
//   9. HairFront  : 前髪（顔の上）
//  10. Accessory  : アクセサリー
//
// PNG素材が揃い次第、各レイヤー関数内の <image href="..."/> を
// アンコメントするだけで差し替え可能な構造にしている。
// ============================================================

import type { AvatarConfig, AgeStage } from "@/types/avatar";
import { SKIN_TONES, HAIR_COLORS } from "@/data/avatarParts";

// ─── カラーユーティリティ ────────────────────────────────────
function hex(toneId: number): string {
  return SKIN_TONES[toneId]?.hex ?? "#f5c98a";
}
function hairHex(colorId: number): string {
  return HAIR_COLORS[colorId]?.hex ?? "#3d2010";
}
function dk(h: string, amt = 35): string {
  if (!h.startsWith("#")) return h;
  const n = parseInt(h.slice(1), 16);
  const r = Math.max(0, (n >> 16) - amt);
  const g = Math.max(0, ((n >> 8) & 0xff) - amt);
  const b = Math.max(0, (n & 0xff) - amt);
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}
function lk(h: string, amt = 35): string {
  if (!h.startsWith("#")) return h;
  const n = parseInt(h.slice(1), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

// ─── 座標定数 ────────────────────────────────────────────────
const CX = 32;          // キャンバス中心X
const HCY = 19;         // 頭中心Y
const HR = 14;          // 頭の半径
const EYE_LX = CX - 7; // 左目X
const EYE_RX = CX + 7; // 右目X
const EYE_Y  = HCY - 1; // 目のY

// ============================================================
// 1. HairBack — 後髪
// ============================================================
function HairBack({ style, colorId, gender, ageStage }: {
  style: number; colorId: number; gender: "male"|"female"; ageStage: AgeStage;
}) {
  const c  = hairHex(colorId);
  const cd = dk(c, 30);
  if (ageStage === 0) return <ellipse cx={CX} cy={HCY-4} rx={13} ry={10} fill={c} opacity={0.5}/>;

  // 女性ロング系（スタイル1, 5, 7, 8はロング）
  const femaleLong = gender === "female" && [1, 5, 7, 8, 9].includes(style);
  // 女性ポニーテール
  const femalePony = gender === "female" && [2, 10].includes(style);
  // 女性ツインテール
  const femaleTwin = gender === "female" && [3].includes(style);
  // 女性ボブ
  const femaleBob  = gender === "female" && [4, 6].includes(style);

  if (femaleLong) return (<>
    <ellipse cx={CX} cy={HCY-5} rx={16} ry={13} fill={c}/>
    <rect x={CX-14} y={HCY+2} width={6} height={36} rx={3} fill={c}/>
    <rect x={CX+8}  y={HCY+2} width={6} height={36} rx={3} fill={c}/>
    <ellipse cx={CX-11} cy={HCY+37} rx={4} ry={2.5} fill={cd}/>
    <ellipse cx={CX+11} cy={HCY+37} rx={4} ry={2.5} fill={cd}/>
    <path d={`M${CX-12},${HCY+15} Q${CX-14},${HCY+25} ${CX-12},${HCY+32}`}
      stroke={lk(c,25)} strokeWidth={1.2} fill="none" opacity={0.4}/>
  </>);

  if (femalePony) return (<>
    <ellipse cx={CX} cy={HCY-5} rx={15} ry={12} fill={c}/>
    <ellipse cx={CX+3} cy={HCY+24} rx={4} ry={12} fill={c} transform={`rotate(10,${CX+3},${HCY+12})`}/>
    <circle cx={CX+5} cy={HCY+12} r={4} fill={cd}/>
  </>);

  if (femaleTwin) return (<>
    <ellipse cx={CX} cy={HCY-5} rx={15} ry={12} fill={c}/>
    <rect x={CX-18} y={HCY+2}  width={5} height={20} rx={2.5} fill={c} transform={`rotate(-8,${CX-15},${HCY+2})`}/>
    <rect x={CX+13} y={HCY+2}  width={5} height={20} rx={2.5} fill={c} transform={`rotate(8,${CX+15},${HCY+2})`}/>
    <circle cx={CX-17} cy={HCY+7}  r={3.5} fill={cd}/>
    <circle cx={CX+17} cy={HCY+7}  r={3.5} fill={cd}/>
  </>);

  if (femaleBob) return (<>
    <ellipse cx={CX} cy={HCY-4} rx={16} ry={13} fill={c}/>
    <rect x={CX-14} y={HCY+2} width={28} height={10} rx={5} fill={c}/>
    <path d={`M${CX-13},${HCY+11} Q${CX},${HCY+16} ${CX+13},${HCY+11}`}
      fill={cd} opacity={0.45}/>
  </>);

  // 男性系（or女性デフォルト）
  const isLongMale = gender === "male" && style === 7;
  if (isLongMale) return (<>
    <ellipse cx={CX} cy={HCY-5} rx={16} ry={13} fill={c}/>
    <rect x={CX-13} y={HCY+2} width={5} height={24} rx={2.5} fill={c}/>
    <rect x={CX+8}  y={HCY+2} width={5} height={24} rx={2.5} fill={c}/>
  </>);

  // Short / standard back
  return <ellipse cx={CX} cy={HCY-5} rx={15} ry={11.5} fill={c}/>;
}

// ============================================================
// 2. Body — 体の肌が見える部分
// ============================================================
function Body({ skin, ageStage }: { skin: string; ageStage: AgeStage }) {
  if (ageStage === 0) {
    // 赤ちゃん — おくるみ
    return (<>
      <ellipse cx={CX} cy={68} rx={14} ry={17} fill="#fde68a"/>
      <ellipse cx={CX} cy={60} rx={10} ry={7}  fill={lk("#fde68a",15)}/>
      <circle cx={CX-12} cy={65} r={5.5} fill={skin}/>
      <circle cx={CX+12} cy={65} r={5.5} fill={skin}/>
      <rect x={CX-3} y={33} width={6} height={4} fill={skin}/>
    </>);
  }
  if (ageStage === 6) {
    return (<>
      <rect x={CX-3} y={32} width={6} height={4} fill={skin}/>
      <ellipse cx={CX-18} cy={55} rx={4.5} ry={4} fill={skin}/>
      <ellipse cx={CX+18} cy={55} rx={4.5} ry={4} fill={skin}/>
    </>);
  }
  // General adult body skin (hands/neck only – clothes cover the rest)
  return (<>
    <rect x={CX-3} y={32} width={6} height={5} fill={skin}/>
    <ellipse cx={CX-20} cy={57} rx={5} ry={4.5} fill={skin}/>
    <ellipse cx={CX+20} cy={57} rx={5} ry={4.5} fill={skin}/>
  </>);
}

// ============================================================
// 3. Clothes — 服
// ============================================================
function Clothes({ type, color, skin, ageStage }: {
  type: number; color: string; skin: string; ageStage: AgeStage;
}) {
  const cd = dk(color, 40);

  if (ageStage === 0) return null; // 赤ちゃんは Body レイヤーでおくるみを描画済み

  // 子供（6歳）— ランドセル＋制服系を自動適用
  if (ageStage === 6) {
    const WHITE = "#f0ece4";
    return (<>
      {/* ランドセル */}
      <rect x={CX+9} y={36} width={10} height={14} rx={2} fill={cd}/>
      <rect x={CX+10} y={34} width={8} height={3}  rx={1} fill={dk(cd,20)}/>
      <circle cx={CX+14} cy={43} r={2} fill={lk(cd,30)}/>
      {/* 体 */}
      <rect x={CX-14} y={36} width={24} height={18} rx={3} fill={WHITE}/>
      <polygon points={`${CX-4},36 ${CX+4},36 ${CX},42`} fill={color}/>
      {/* 腕 */}
      <rect x={CX-19} y={37} width={6} height={14} rx={3} fill={WHITE}/>
      <rect x={CX+13} y={37} width={6} height={14} rx={3} fill={WHITE}/>
      {/* ズボン */}
      <rect x={CX-12} y={53} width={22} height={8}  rx={2} fill={color}/>
      <rect x={CX-11} y={60} width={9}  height={18} rx={4} fill={skin}/>
      <rect x={CX+2}  y={60} width={9}  height={18} rx={4} fill={skin}/>
      {/* 靴 */}
      <ellipse cx={CX-6.5} cy={78} rx={7}  ry={3}   fill="#222"/>
      <ellipse cx={CX+6.5} cy={78} rx={7}  ry={3}   fill="#222"/>
    </>);
  }

  // type 1: パーカー
  if (type === 1) {
    return (<>
      <path d={`M${CX-20},37 L${CX+20},37 L${CX+19},68 L${CX-19},68Z`} fill={color}/>
      <rect x={CX-8} y={37} width={16} height={31} fill="#f0ece4"/>
      <polygon points={`${CX-8},37 ${CX},37 ${CX-8},45`}  fill="#f0ece4"/>
      <polygon points={`${CX+8},37 ${CX},37 ${CX+8},45`}  fill="#f0ece4"/>
      <rect x={CX-9}  y={55} width={8} height={6} rx={1.5} fill={cd}/>
      <rect x={CX+1}  y={55} width={8} height={6} rx={1.5} fill={cd}/>
      <rect x={CX-24} y={38} width={7} height={22} rx={3.5} fill={color}/>
      <rect x={CX+17} y={38} width={7} height={22} rx={3.5} fill={color}/>
      <rect x={CX-12} y={68} width={10} height={22} rx={4.5} fill={dk("#1e3050",10)}/>
      <rect x={CX+2}  y={68} width={10} height={22} rx={4.5} fill={dk("#1e3050",10)}/>
      <ellipse cx={CX-7}  cy={90} rx={7.5} ry={3} fill="#111"/>
      <ellipse cx={CX+7}  cy={90} rx={7.5} ry={3} fill="#111"/>
    </>);
  }

  // type 2: スーツ
  if (type === 2) {
    const SUIT = dk(color, 20);
    return (<>
      <path d={`M${CX-21},37 L${CX+21},37 L${CX+20},68 L${CX-20},68Z`} fill={SUIT}/>
      <rect x={CX-8} y={37} width={16} height={31} fill="#f0ece4"/>
      <polygon points={`${CX-8},37 ${CX-1},37 ${CX-8},46`} fill="#f0ece4"/>
      <polygon points={`${CX+8},37 ${CX+1},37 ${CX+8},46`} fill="#f0ece4"/>
      <polygon points={`${CX-1.5},37 ${CX+1.5},37 ${CX+2.5},60 ${CX},62 ${CX-2.5},60`} fill={color}/>
      <rect x={CX-24} y={38} width={7} height={24} rx={3.5} fill={SUIT}/>
      <rect x={CX+17} y={38} width={7} height={24} rx={3.5} fill={SUIT}/>
      <rect x={CX-12} y={68} width={10} height={24} rx={4.5} fill={dk(SUIT,15)}/>
      <rect x={CX+2}  y={68} width={10} height={24} rx={4.5} fill={dk(SUIT,15)}/>
      <ellipse cx={CX-7}  cy={92} rx={7.5} ry={3} fill={dk(SUIT,25)}/>
      <ellipse cx={CX+7}  cy={92} rx={7.5} ry={3} fill={dk(SUIT,25)}/>
    </>);
  }

  // type 3: 学生服（男）/ type 6: セーラー服
  if (type === 3 || type === 6) {
    const NAVY = "#1e3464";
    const isS = type === 6; // セーラー服
    return (<>
      <path d={`M${CX-20},37 L${CX+20},37 L${CX+19},68 L${CX-19},68Z`} fill={NAVY}/>
      <rect x={CX-8} y={37} width={16} height={30} fill="#f0ece4"/>
      {isS ? (
        <path d={`M${CX-9},37 L${CX},44 L${CX+9},37`} fill={color} opacity={0.9}/>
      ) : (
        <>
          <rect x={CX-3} y={37} width={6} height={28} rx={1.5} fill={color}/>
          <polygon points={`${CX-8},37 ${CX},37 ${CX-8},46`} fill="#f0ece4"/>
          <polygon points={`${CX+8},37 ${CX},37 ${CX+8},46`} fill="#f0ece4"/>
        </>
      )}
      <rect x={CX-24} y={38} width={7} height={22} rx={3.5} fill={NAVY}/>
      <rect x={CX+17} y={38} width={7} height={22} rx={3.5} fill={NAVY}/>
      <rect x={CX-12} y={68} width={10} height={24} rx={4.5} fill={dk(NAVY,10)}/>
      <rect x={CX+2}  y={68} width={10} height={24} rx={4.5} fill={dk(NAVY,10)}/>
      <ellipse cx={CX-7}  cy={92} rx={7.5} ry={3} fill="#111"/>
      <ellipse cx={CX+7}  cy={92} rx={7.5} ry={3} fill="#111"/>
    </>);
  }

  // type 4: ジャケット / casual
  if (type === 4) {
    return (<>
      <path d={`M${CX-21},37 L${CX+21},37 L${CX+20},68 L${CX-20},68Z`} fill={color}/>
      <rect x={CX-8} y={37} width={16} height={31} fill="#f0ece4"/>
      <polygon points={`${CX-8},37 ${CX},44 ${CX+8},37`} fill={dk(color,15)}/>
      <rect x={CX-24} y={38} width={7} height={22} rx={3.5} fill={color}/>
      <rect x={CX+17} y={38} width={7} height={22} rx={3.5} fill={color}/>
      <rect x={CX-12} y={68} width={10} height={22} rx={4.5} fill="#1e3050"/>
      <rect x={CX+2}  y={68} width={10} height={22} rx={4.5} fill="#1e3050"/>
      <ellipse cx={CX-7}  cy={90} rx={7.5} ry={3} fill="#111"/>
      <ellipse cx={CX+7}  cy={90} rx={7.5} ry={3} fill="#111"/>
    </>);
  }

  // type 5: Tシャツ
  if (type === 5) {
    return (<>
      <rect x={CX-18} y={37} width={36} height={28} rx={2} fill={color}/>
      <rect x={CX-22} y={38} width={6}  height={18} rx={3} fill={color}/>
      <rect x={CX+16} y={38} width={6}  height={18} rx={3} fill={color}/>
      <rect x={CX-12} y={65} width={10} height={25} rx={4.5} fill="#1e3050"/>
      <rect x={CX+2}  y={65} width={10} height={25} rx={4.5} fill="#1e3050"/>
      <ellipse cx={CX-7}  cy={90} rx={7.5} ry={3} fill="#111"/>
      <ellipse cx={CX+7}  cy={90} rx={7.5} ry={3} fill="#111"/>
    </>);
  }

  // type 7: 白衣
  if (type === 7) {
    const WH = "#e8eef8";
    return (<>
      <path d={`M${CX-21},37 L${CX+21},37 L${CX+20},72 L${CX-20},72Z`} fill={WH}/>
      <rect x={CX-8} y={37} width={16} height={35} fill={dk(color,60)}/>
      <polygon points={`${CX-8},37 ${CX},37 ${CX-8},46`} fill={WH}/>
      <polygon points={`${CX+8},37 ${CX},37 ${CX+8},46`} fill={WH}/>
      <rect x={CX-24} y={38} width={7} height={26} rx={3.5} fill={WH}/>
      <rect x={CX+17} y={38} width={7} height={26} rx={3.5} fill={WH}/>
      <rect x={CX-12} y={72} width={10} height={20} rx={4.5} fill="#1e3050"/>
      <rect x={CX+2}  y={72} width={10} height={20} rx={4.5} fill="#1e3050"/>
      <ellipse cx={CX-7}  cy={92} rx={7.5} ry={3} fill="#111"/>
      <ellipse cx={CX+7}  cy={92} rx={7.5} ry={3} fill="#111"/>
    </>);
  }

  // type 8: スポーツ / type 10: ジャージ
  if (type === 8 || type === 10) {
    return (<>
      <rect x={CX-19} y={37} width={38} height={28} rx={3} fill={color}/>
      <rect x={CX-7}  y={37} width={14} height={28} fill={lk(color,30)}/>
      <rect x={CX-22} y={38} width={5} height={20} rx={2.5} fill={color}/>
      <rect x={CX+17} y={38} width={5} height={20} rx={2.5} fill={color}/>
      <rect x={CX-12} y={65} width={10} height={24} rx={4.5} fill={dk(color,25)}/>
      <rect x={CX+2}  y={65} width={10} height={24} rx={4.5} fill={dk(color,25)}/>
      <ellipse cx={CX-7}  cy={89} rx={7.5} ry={3} fill="#111"/>
      <ellipse cx={CX+7}  cy={89} rx={7.5} ry={3} fill="#111"/>
    </>);
  }

  // type 9: 作業着 (default fallback for 9)
  return (<>
    <path d={`M${CX-20},37 L${CX+20},37 L${CX+19},68 L${CX-19},68Z`} fill={color}/>
    <rect x={CX-8} y={37} width={16} height={31} fill="#e8c060"/>
    <rect x={CX-23} y={38} width={6} height={22} rx={3} fill={color}/>
    <rect x={CX+17} y={38} width={6} height={22} rx={3} fill={color}/>
    <rect x={CX-12} y={68} width={10} height={22} rx={4.5} fill={dk(color,20)}/>
    <rect x={CX+2}  y={68} width={10} height={22} rx={4.5} fill={dk(color,20)}/>
    <ellipse cx={CX-7}  cy={90} rx={7.5} ry={3} fill="#111"/>
    <ellipse cx={CX+7}  cy={90} rx={7.5} ry={3} fill="#111"/>
  </>);
}

// ============================================================
// 4. Face — 顔ベース（肌色）
// ============================================================
function Face({ skin, shape }: { skin: string; shape: "round"|"square"|"slim" }) {
  if (shape === "square")
    return <>
      <ellipse cx={CX-HR+2} cy={HCY} rx={2.5} ry={3.5} fill={skin}/>
      <ellipse cx={CX+HR-2} cy={HCY} rx={2.5} ry={3.5} fill={skin}/>
      <rect x={CX-HR} y={HCY-HR} width={HR*2} height={HR*2} rx={HR*0.22} fill={skin}/>
    </>;
  if (shape === "slim")
    return <>
      <ellipse cx={CX-HR+3} cy={HCY} rx={2} ry={3.5} fill={skin}/>
      <ellipse cx={CX+HR-3} cy={HCY} rx={2} ry={3.5} fill={skin}/>
      <ellipse cx={CX} cy={HCY+1} rx={HR*0.65} ry={HR*1.08} fill={skin}/>
    </>;
  return <>
    <ellipse cx={CX-HR+1} cy={HCY} rx={2.5} ry={3.5} fill={skin}/>
    <ellipse cx={CX+HR-1} cy={HCY} rx={2.5} ry={3.5} fill={skin}/>
    <ellipse cx={CX} cy={HCY} rx={HR} ry={HR+1} fill={skin}/>
  </>;
}

// ============================================================
// 5. Eyes — 目（10種）
// ============================================================
type EyePos = { lx: number; rx: number; ey: number };
const EP: EyePos = { lx: EYE_LX, rx: EYE_RX, ey: EYE_Y };

function drawEye(x: number, y: number, variant: number, _skin: string) {
  const iris = "#1a4830"; const pupil = "#0a1008";
  // v1: 標準
  if (variant === 1) return (<g key={x}>
    <ellipse cx={x} cy={y}     rx={4}   ry={3.5} fill="white"/>
    <circle  cx={x} cy={y+.4}  r={2.6}  fill={iris}/>
    <circle  cx={x} cy={y+.4}  r={1.4}  fill={pupil}/>
    <circle  cx={x+1.5} cy={y-1.2} r={1.1}  fill="white"/>
    <circle  cx={x-.8}  cy={y+1.1} r={0.5}  fill="white" opacity={0.7}/>
    <path d={`M${x-4},${y-1.6} Q${x},${y-3.4} ${x+4},${y-1.6}`} fill="#1a0808" opacity={0.9}/>
  </g>);
  // v2: 大きい
  if (variant === 2) return (<g key={x}>
    <path d={`M${x-5},${y-1.2} Q${x},${y-4.5} ${x+5},${y-1.2}`} fill="#1a0808" opacity={0.9}/>
    <ellipse cx={x} cy={y+.2}   rx={5}   ry={4.5} fill="white"/>
    <circle  cx={x} cy={y+.6}   r={3.2}  fill={iris}/>
    <circle  cx={x} cy={y+.6}   r={1.8}  fill={pupil}/>
    <circle  cx={x+2}  cy={y-1.5} r={1.4} fill="white"/>
    <circle  cx={x-.8} cy={y+1.5} r={0.6} fill="white" opacity={0.7}/>
  </g>);
  // v3: たれ目（外側が下がる）
  if (variant === 3) return (<g key={x}>
    <ellipse cx={x} cy={y}     rx={4}   ry={3.5} fill="white"/>
    <circle  cx={x} cy={y+.4}  r={2.5}  fill={iris}/>
    <circle  cx={x} cy={y+.4}  r={1.3}  fill={pupil}/>
    <circle  cx={x+1.5} cy={y-.8} r={1.0} fill="white"/>
    <path d={`M${x-4},${y-1.5} Q${x},${y-3} ${x+4},${y-.5}`}
      fill="#1a0808" opacity={0.88}/>
    <path d={`M${x-3.5},${y+2} Q${x+1},${y+3.5} ${x+4},${y+2}`}
      fill="none" stroke="#1a0808" strokeWidth={0.6} opacity={0.5}/>
  </g>);
  // v4: つり目（外側が上がる）
  if (variant === 4) return (<g key={x}>
    <ellipse cx={x} cy={y}     rx={4}   ry={3.2} fill="white" transform={`rotate(${x<CX?-5:5},${x},${y})`}/>
    <circle  cx={x} cy={y+.2}  r={2.4}  fill={iris}/>
    <circle  cx={x} cy={y+.2}  r={1.3}  fill={pupil}/>
    <circle  cx={x+1.4} cy={y-1} r={1.0} fill="white"/>
    <path d={`M${x-4},${y-.8} Q${x},${y-3.2} ${x+4},${y-2}`}
      fill="#1a0808" opacity={0.9} transform={`rotate(${x<CX?-5:5},${x},${y})`}/>
  </g>);
  // v5: 切れ長（横長スリット）
  if (variant === 5) return (<g key={x}>
    <ellipse cx={x} cy={y} rx={5.5} ry={1.8} fill="white"/>
    <ellipse cx={x} cy={y} rx={3.5} ry={1.3} fill={iris}/>
    <ellipse cx={x} cy={y} rx={1.8} ry={0.8} fill={pupil}/>
    <ellipse cx={x+2} cy={y-.5} rx={1.5} ry={0.6} fill="white"/>
    <line x1={x-5.5} y1={y-1.8} x2={x+5.5} y2={y-1.8}
      stroke="#1a0808" strokeWidth={1.1} strokeLinecap="round"/>
  </g>);
  // v6: 丸い
  if (variant === 6) return (<g key={x}>
    <circle cx={x} cy={y}    r={4.5}  fill="white"/>
    <circle cx={x} cy={y+.4} r={3.2}  fill={iris}/>
    <circle cx={x} cy={y+.4} r={1.8}  fill={pupil}/>
    <circle cx={x+1.8} cy={y-1.5} r={1.3} fill="white"/>
    <circle cx={x-.8}  cy={y+1.5} r={0.6} fill="white" opacity={0.7}/>
  </g>);
  // v7: 眠そう
  if (variant === 7) return (<g key={x}>
    <ellipse cx={x} cy={y+.5}  rx={4}  ry={3.5} fill="white"/>
    <rect    x={x-4.5} y={y-3.2} width={9} height={3.5} fill={_skin} rx={0.8}/>
    <circle  cx={x} cy={y+.5}  r={2.5}  fill={iris}/>
    <circle  cx={x} cy={y+.5}  r={1.3}  fill={pupil}/>
    <circle  cx={x+1.2} cy={y-.2} r={0.9} fill="white"/>
    <path d={`M${x-4},${y-.5} Q${x},${y-2.5} ${x+4},${y-.5}`}
      fill="#1a0808" opacity={0.88}/>
  </g>);
  // v8: キラキラ（多ハイライト）
  if (variant === 8) return (<g key={x}>
    <path d={`M${x-5},${y-1.5} Q${x},${y-4.8} ${x+5},${y-1.5}`} fill="#1a0808" opacity={0.9}/>
    <ellipse cx={x} cy={y+.2}   rx={5}   ry={4.5} fill="white"/>
    <circle  cx={x} cy={y+.6}   r={3.2}  fill={iris}/>
    <circle  cx={x} cy={y+.6}   r={1.8}  fill={pupil}/>
    <circle  cx={x+2}   cy={y-1.8} r={1.5} fill="white"/>
    <circle  cx={x-.8}  cy={y+1.5} r={0.8} fill="white" opacity={0.8}/>
    <circle  cx={x+3.5} cy={y+1.0} r={0.6} fill="white" opacity={0.6}/>
    <circle  cx={x-2.5} cy={y-0.5} r={0.5} fill="white" opacity={0.5}/>
  </g>);
  // v9: 細い（横幅広・縦幅狭）
  if (variant === 9) return (<g key={x}>
    <ellipse cx={x} cy={y} rx={5}   ry={1.5} fill="white"/>
    <ellipse cx={x} cy={y} rx={3.2} ry={1.1} fill={iris}/>
    <ellipse cx={x} cy={y} rx={1.5} ry={0.7} fill={pupil}/>
    <ellipse cx={x+2} cy={y-.4} rx={1.2} ry={0.5} fill="white"/>
    <line x1={x-5} y1={y-1.5} x2={x+5} y2={y-1.5}
      stroke="#1a0808" strokeWidth={1.2} strokeLinecap="round"/>
    <path d={`M${x-4.5},${y+1.5} Q${x},${y+2} ${x+4.5},${y+1.5}`}
      fill="none" stroke="#1a0808" strokeWidth={0.5} opacity={0.5}/>
  </g>);
  // v10: にこにこ（目を閉じている）
  return (<g key={x}>
    <path d={`M${x-4},${y} Q${x},${y-3} ${x+4},${y}`}
      fill="#1a1808" opacity={0.88}/>
    <path d={`M${x-3.5},${y} Q${x},${y+1.5} ${x+3.5},${y}`}
      fill="none" stroke="#1a1808" strokeWidth={0.5} opacity={0.4}/>
    <ellipse cx={x-3}  cy={y+1.5} rx={2.5} ry={1.5} fill="#ff9999" opacity={0.35}/>
    <ellipse cx={x+3}  cy={y+1.5} rx={2.5} ry={1.5} fill="#ff9999" opacity={0.35}/>
  </g>);
}

function Eyes({ type, ageStage, skin }: { type: number; ageStage: AgeStage; skin: string }) {
  if (ageStage === 0) {
    return (<>
      <ellipse cx={CX-6} cy={HCY+1} rx={4.5} ry={4}   fill="white"/>
      <circle  cx={CX-6} cy={HCY+1.5} r={3}  fill="#1a4830"/>
      <circle  cx={CX-6} cy={HCY+1.5} r={1.6} fill="#0a1008"/>
      <circle  cx={CX-4.5} cy={HCY-.2} r={1.2} fill="white"/>
      <ellipse cx={CX+6} cy={HCY+1} rx={4.5} ry={4}   fill="white"/>
      <circle  cx={CX+6} cy={HCY+1.5} r={3}  fill="#1a4830"/>
      <circle  cx={CX+6} cy={HCY+1.5} r={1.6} fill="#0a1008"/>
      <circle  cx={CX+7.5} cy={HCY-.2} r={1.2} fill="white"/>
    </>);
  }
  const t = Math.max(1, Math.min(10, type));
  return (<>
    {drawEye(EP.lx, EP.ey, t, skin)}
    {drawEye(EP.rx, EP.ey, t, skin)}
  </>);
}

// ============================================================
// 6. Brows — 眉（6種）
// ============================================================
function Brows({ type, hairColorId, ageStage }: {
  type: number; hairColorId: number; ageStage: AgeStage;
}) {
  if (ageStage === 0) return null;
  const c   = hairHex(hairColorId);
  const lx  = EP.lx, rx  = EP.rx;
  const by  = EP.ey - 4.5;
  const bw  = 3.5;
  const sw  = type === 3 ? 2.0 : type === 4 ? 1.0 : 1.4;

  // v1: 標準アーチ
  if (type === 1) return (<>
    <path d={`M${lx-bw},${by+.5} Q${lx},${by-1.5} ${lx+bw},${by+.5}`}
      fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round"/>
    <path d={`M${rx-bw},${by+.5} Q${rx},${by-1.5} ${rx+bw},${by+.5}`}
      fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round"/>
  </>);
  // v2: 高めアーチ
  if (type === 2) return (<>
    <path d={`M${lx-bw},${by+1} Q${lx},${by-2.5} ${lx+bw},${by+1}`}
      fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round"/>
    <path d={`M${rx-bw},${by+1} Q${rx},${by-2.5} ${rx+bw},${by+1}`}
      fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round"/>
  </>);
  // v3: 太い直線
  if (type === 3) return (<>
    <line x1={lx-bw} y1={by} x2={lx+bw} y2={by}
      stroke={c} strokeWidth={sw} strokeLinecap="round"/>
    <line x1={rx-bw} y1={by} x2={rx+bw} y2={by}
      stroke={c} strokeWidth={sw} strokeLinecap="round"/>
  </>);
  // v4: 細い
  if (type === 4) return (<>
    <path d={`M${lx-bw},${by+.2} Q${lx},${by-1} ${lx+bw},${by+.2}`}
      fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round"/>
    <path d={`M${rx-bw},${by+.2} Q${rx},${by-1} ${rx+bw},${by+.2}`}
      fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round"/>
  </>);
  // v5: 困り眉（内側が上がる）
  if (type === 5) return (<>
    <path d={`M${lx-bw},${by-.5} Q${lx},${by+1.5} ${lx+bw},${by-.5}`}
      fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round"/>
    <path d={`M${rx-bw},${by-.5} Q${rx},${by+1.5} ${rx+bw},${by-.5}`}
      fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round"/>
  </>);
  // v6: 凛々しい（まっすぐで外側が低い）
  return (<>
    <line x1={lx-bw} y1={by+.5} x2={lx+bw} y2={by-.5}
      stroke={c} strokeWidth={sw+.2} strokeLinecap="round"/>
    <line x1={rx-bw} y1={by-.5} x2={rx+bw} y2={by+.5}
      stroke={c} strokeWidth={sw+.2} strokeLinecap="round"/>
  </>);
}

// ============================================================
// 7. Nose — 鼻（シンプル）
// ============================================================
function Nose({ skin, ageStage }: { skin: string; ageStage: AgeStage }) {
  if (ageStage === 0) return null;
  const c = dk(skin, 32);
  return (<>
    <circle cx={CX-1.6} cy={HCY+4} r={0.9} fill={c} opacity={0.48}/>
    <circle cx={CX+1.6} cy={HCY+4} r={0.9} fill={c} opacity={0.48}/>
  </>);
}

// ============================================================
// 8. Mouth — 口（6種）
// ============================================================
function Mouth({ type, ageStage }: { type: number; ageStage: AgeStage }) {
  const my = HCY + 8;
  const s  = "#a05030";
  const sw = 1.2;
  const mw = 3.5;

  if (ageStage === 0) {
    return (
      <path d={`M${CX-3.5},${my+2} Q${CX},${my+6} ${CX+3.5},${my+2}`}
        fill="#f08080" stroke={s} strokeWidth={sw} strokeLinecap="round"/>
    );
  }
  // v1: スマイル
  if (type === 1) return (
    <path d={`M${CX-mw},${my} Q${CX},${my+mw*.95} ${CX+mw},${my}`}
      fill="none" stroke={s} strokeWidth={sw} strokeLinecap="round"/>
  );
  // v2: 普通（閉じた口）
  if (type === 2) return (
    <line x1={CX-mw*.8} y1={my} x2={CX+mw*.8} y2={my}
      stroke={s} strokeWidth={sw} strokeLinecap="round"/>
  );
  // v3: にっこり（歯が見える）
  if (type === 3) return (<>
    <path d={`M${CX-mw*1.1},${my} Q${CX},${my+mw*1.2} ${CX+mw*1.1},${my}`}
      fill="#f08080" stroke={s} strokeWidth={sw} strokeLinecap="round"/>
    <rect x={CX-mw*.9} y={my} width={mw*1.8} height={mw*.55} rx={.5} fill="white"/>
  </>);
  // v4: ぽかん（丸い口）
  if (type === 4) return (
    <ellipse cx={CX} cy={my+1.5} rx={mw*.8} ry={mw*.9} fill="#c06060" stroke={s} strokeWidth={.8}/>
  );
  // v5: ちょっぴり（小さい笑み）
  if (type === 5) return (
    <path d={`M${CX-mw*.55},${my+.5} Q${CX},${my+mw*.7} ${CX+mw*.55},${my+.5}`}
      fill="none" stroke={s} strokeWidth={sw} strokeLinecap="round"/>
  );
  // v6: いたずら（片方上がり）
  return (
    <path d={`M${CX-mw*.8},${my+1} Q${CX+mw*.5},${my} ${CX+mw},${my-1}`}
      fill="none" stroke={s} strokeWidth={sw} strokeLinecap="round"/>
  );
}

// ============================================================
// 9. HairFront — 前髪
// ============================================================
function HairFront({ style, colorId, gender, ageStage }: {
  style: number; colorId: number; gender: "male"|"female"; ageStage: AgeStage;
}) {
  const c  = hairHex(colorId);
  const cd = dk(c, 25);
  const cl = lk(c, 30);
  if (ageStage === 0) return null;

  const top = HCY - HR + 1;
  const mid = HCY - HR * 0.32;

  // 女性スタイル 2（ポニーテール）— 前髪なし
  if (gender === "female" && style === 2) return (
    <ellipse cx={CX} cy={top+3} rx={HR*.85} ry={3} fill={c} opacity={0.6}/>
  );

  // 女性スタイル 4（ボブ）
  if (gender === "female" && style === 4) return (<>
    <rect x={CX-HR+1} y={top} width={(HR-1)*2} height={5} rx={1} fill={c}/>
    <line x1={CX-5}  y1={top+1} x2={CX-4}  y2={top+4} stroke={cd} strokeWidth={1} strokeLinecap="round" opacity={.5}/>
    <line x1={CX+5}  y1={top+1} x2={CX+4}  y2={top+4} stroke={cd} strokeWidth={1} strokeLinecap="round" opacity={.5}/>
  </>);

  // 女性スタイル 1, 5, 7, 8, 9（ロング）— 長い前髪
  if (gender === "female" && [1, 5, 7, 8, 9].includes(style)) return (<>
    <rect x={CX-HR+1} y={top} width={(HR-1)*2} height={mid-top+2} rx={.8} fill={c}/>
    <line x1={CX-5} y1={top+1} x2={CX-3} y2={mid+1} stroke={cd} strokeWidth={1.1} strokeLinecap="round" opacity={.5}/>
    <line x1={CX+3} y1={top+1} x2={CX+5} y2={mid+1} stroke={cd} strokeWidth={1.1} strokeLinecap="round" opacity={.5}/>
    <line x1={CX}   y1={top}   x2={CX}   y2={mid+1} stroke={cl}  strokeWidth={.8}  strokeLinecap="round" opacity={.4}/>
  </>);

  // 男性スタイル 4（オールバック）— 前髪なし
  if (gender === "male" && style === 4) return null;

  // 男性スタイル 1（サイドスウェプト）— 右流し
  if (gender === "male" && style === 1) return (
    <polygon
      points={`${CX-HR+1},${top} ${CX+HR-1},${top} ${CX+HR-1},${mid+1} ${CX-2},${mid} ${CX-HR+1},${mid+2}`}
      fill={c}/>
  );

  // 男性スタイル 2（ショート）— 薄い前髪
  if (gender === "male" && style === 2) return (
    <rect x={CX-HR+2} y={top} width={(HR-2)*2} height={3.5} rx={.8} fill={c}/>
  );

  // 男性スタイル 3（センター分け）
  if (gender === "male" && style === 3) return (<>
    <polygon
      points={`${CX-HR+1},${top} ${CX-1},${top+3} ${CX-1},${mid+1} ${CX-HR+1},${mid+2}`}
      fill={c}/>
    <polygon
      points={`${CX+1},${top+3} ${CX+HR-1},${top} ${CX+HR-1},${mid+2} ${CX+1},${mid+1}`}
      fill={c}/>
    <line x1={CX} y1={top} x2={CX} y2={mid} stroke={cl} strokeWidth={.8} opacity={.5}/>
  </>);

  // 男性スタイル 5（ウェーブ）
  if (gender === "male" && style === 5) return (<>
    <rect x={CX-HR+1} y={top} width={(HR-1)*2} height={mid-top+2} rx={1} fill={c}/>
    <path d={`M${CX-8},${mid+2} Q${CX-4},${mid+5} ${CX},${mid+2} Q${CX+4},${mid+5} ${CX+8},${mid+2}`}
      fill={c}/>
  </>);

  // default: 全前髪（スタイル 6,7,8,9,10）
  return (<>
    <rect x={CX-HR+1} y={top} width={(HR-1)*2} height={mid-top+2} rx={1} fill={c}/>
    <line x1={CX-5} y1={top+1} x2={CX-4} y2={mid+1} stroke={cd} strokeWidth={1.1} strokeLinecap="round" opacity={.45}/>
    <line x1={CX+2} y1={top+1} x2={CX+3} y2={mid+1} stroke={cd} strokeWidth={1.1} strokeLinecap="round" opacity={.45}/>
    <line x1={CX+5} y1={top+1} x2={CX+6} y2={mid}   stroke={cd} strokeWidth={.9}  strokeLinecap="round" opacity={.35}/>
  </>);
}

// ============================================================
// 10. Accessory — アクセサリー（8種）
// ============================================================
function Accessory({ id }: { id: number | null }) {
  if (!id || id === 8) return null;
  const gy = HCY - HR*.05; // 目の高さ近辺
  // 1: 丸眼鏡
  if (id === 1) return (<>
    <circle cx={EP.lx} cy={gy} r={5} fill="none" stroke="#8a6a30" strokeWidth={1.4}/>
    <circle cx={EP.rx} cy={gy} r={5} fill="none" stroke="#8a6a30" strokeWidth={1.4}/>
    <line x1={EP.lx+5} y1={gy} x2={EP.rx-5} y2={gy} stroke="#8a6a30" strokeWidth={1.2}/>
    <line x1={EP.lx-5} y1={gy} x2={EP.lx-8} y2={gy-1} stroke="#8a6a30" strokeWidth={1.2}/>
    <line x1={EP.rx+5} y1={gy} x2={EP.rx+8} y2={gy-1} stroke="#8a6a30" strokeWidth={1.2}/>
  </>);
  // 2: サングラス
  if (id === 2) return (<>
    <ellipse cx={EP.lx} cy={gy} rx={5.5} ry={3.5} fill="#1a1a1a" stroke="#555" strokeWidth={1}/>
    <ellipse cx={EP.rx} cy={gy} rx={5.5} ry={3.5} fill="#1a1a1a" stroke="#555" strokeWidth={1}/>
    <line x1={EP.lx+5.5} y1={gy} x2={EP.rx-5.5} y2={gy} stroke="#555" strokeWidth={1.2}/>
    <line x1={EP.lx-5.5} y1={gy} x2={EP.lx-8}   y2={gy-1} stroke="#555" strokeWidth={1.2}/>
    <line x1={EP.rx+5.5} y1={gy} x2={EP.rx+8}   y2={gy-1} stroke="#555" strokeWidth={1.2}/>
  </>);
  // 3: ハット
  if (id === 3) return (<>
    <rect x={CX-18} y={HCY-HR-9} width={36} height={10} rx={2} fill="#1a1008"/>
    <rect x={CX-14} y={HCY-HR-14} width={28} height={6}  rx={2} fill="#2a1a12"/>
    <rect x={CX-13} y={HCY-HR-19} width={26} height={6}  rx={1} fill="#2a1a12"/>
    <ellipse cx={CX+6} cy={HCY-HR-16} rx={3} ry={2} fill="#8a6a30"/>
  </>);
  // 4: キャップ
  if (id === 4) return (<>
    <ellipse cx={CX} cy={HCY-HR-2} rx={15} ry={8} fill="#222"/>
    <rect x={CX-14} y={HCY-HR-10} width={28} height={9} rx={3} fill="#333"/>
    <ellipse cx={CX+15} cy={HCY-HR-2} rx={4} ry={2.5} fill="#222"/>
  </>);
  // 5: ヘッドフォン
  if (id === 5) return (<>
    <path d={`M${CX-HR},${HCY} A${HR},${HR} 0 0,1 ${CX+HR},${HCY}`}
      fill="none" stroke="#222" strokeWidth={3}/>
    <rect x={CX-HR-3} y={HCY-3} width={6} height={10} rx={3} fill="#444"/>
    <rect x={CX+HR-3} y={HCY-3} width={6} height={10} rx={3} fill="#444"/>
  </>);
  // 6: マスク
  if (id === 6) return (
    <rect x={CX-10} y={HCY+2} width={20} height={14} rx={4} fill="white" stroke="#ddd" strokeWidth={.8}/>
  );
  // 7: ネックレス
  if (id === 7) return (<>
    <path d={`M${CX-10},${HCY+HR+3} Q${CX},${HCY+HR+8} ${CX+10},${HCY+HR+3}`}
      fill="none" stroke="#c8a000" strokeWidth={1.5}/>
    <circle cx={CX} cy={HCY+HR+8} r={2.5} fill="#c8a000"/>
  </>);
  return null;
}

// ============================================================
// チーク（ほっぺのブラッシュ）
// ============================================================
function Blush({ ageStage }: { ageStage: AgeStage }) {
  const op = ageStage <= 6 ? 0.55 : 0.22;
  return (<>
    <ellipse cx={CX-10} cy={HCY+4} rx={4.5} ry={2.5} fill="#ff9999" opacity={op}/>
    <ellipse cx={CX+10} cy={HCY+4} rx={4.5} ry={2.5} fill="#ff9999" opacity={op}/>
  </>);
}

// ============================================================
// 年齢による白髪化・シワ
// ============================================================
function AgingOverlay({ ageStage, skin, hairColorId }: {
  ageStage: AgeStage; skin: string; hairColorId: number;
}) {
  if (ageStage < 45) return null;
  const isElder = ageStage >= 65;
  const ws = dk(skin, 15);
  return (<>
    {/* 目元のシワ */}
    <path d={`M${EP.lx+4},${EP.ey+2} Q${EP.lx+7},${EP.ey+4} ${EP.lx+4},${EP.ey+6}`}
      fill="none" stroke={ws} strokeWidth={.55} opacity={isElder?.75:.4}/>
    <path d={`M${EP.rx-4},${EP.ey+2} Q${EP.rx-7},${EP.ey+4} ${EP.rx-4},${EP.ey+6}`}
      fill="none" stroke={ws} strokeWidth={.55} opacity={isElder?.75:.4}/>
    {/* 口元のシワ（老年のみ） */}
    {isElder && (<>
      <path d={`M${CX-5},${HCY+9} Q${CX-8},${HCY+12} ${CX-5},${HCY+14}`}
        fill="none" stroke={ws} strokeWidth={.5} opacity={0.5}/>
      <path d={`M${CX+5},${HCY+9} Q${CX+8},${HCY+12} ${CX+5},${HCY+14}`}
        fill="none" stroke={ws} strokeWidth={.5} opacity={0.5}/>
    </>)}
    {/* 老人の杖 */}
    {isElder && (
      <line x1={CX+22} y1={HCY+18} x2={CX+26} y2={96}
        stroke="#8a6a40" strokeWidth={2.2} strokeLinecap="round"/>
    )}
  </>);
}

// ============================================================
// メイン AvatarSVG コンポーネント
// ============================================================
interface AvatarSVGProps {
  config: AvatarConfig;
  width?: number;
  height?: number;
  /** サムネイル用：特定パーツだけ強調表示 */
  highlightLayer?: "hair"|"eyes"|"brows"|"mouth"|"clothes"|"accessory";
}

export function AvatarSVG({
  config, width = 128, height = 192, highlightLayer,
}: AvatarSVGProps) {
  const {
    gender, skinTone, hairStyle, hairColor,
    eyeType, browType, mouthType,
    clothesType, clothesColor, accessory, ageStage,
  } = config;

  const skin = hex(skinTone);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 64 96"
      style={{ overflow: "visible", imageRendering: "pixelated" }}
    >
      {/* ─── レイヤー1: 後髪 ─── */}
      <HairBack style={hairStyle} colorId={hairColor} gender={gender} ageStage={ageStage}/>

      {/* ─── レイヤー2: ボディ（肌） ─── */}
      <Body skin={skin} ageStage={ageStage}/>

      {/* ─── レイヤー3: 服 ─── */}
      {ageStage !== 0 && (
        <Clothes type={clothesType} color={clothesColor} skin={skin} ageStage={ageStage}/>
      )}

      {/* ─── レイヤー4: 顔ベース ─── */}
      <Face skin={skin} shape="round"/>

      {/* ─── 年齢オーバーレイ（シワ） ─── */}
      <AgingOverlay ageStage={ageStage} skin={skin} hairColorId={hairColor}/>

      {/* ─── チーク ─── */}
      <Blush ageStage={ageStage}/>

      {/* ─── レイヤー5: 目 ─── */}
      <Eyes type={eyeType} ageStage={ageStage} skin={skin}/>

      {/* ─── レイヤー6: 眉 ─── */}
      <Brows type={browType} hairColorId={hairColor} ageStage={ageStage}/>

      {/* ─── レイヤー7: 鼻 ─── */}
      <Nose skin={skin} ageStage={ageStage}/>

      {/* ─── レイヤー8: 口 ─── */}
      <Mouth type={mouthType} ageStage={ageStage}/>

      {/* ─── レイヤー9: 前髪 ─── */}
      <HairFront style={hairStyle} colorId={hairColor} gender={gender} ageStage={ageStage}/>

      {/* ─── レイヤー10: アクセサリー ─── */}
      <Accessory id={accessory}/>
    </svg>
  );
}

// ============================================================
// ミニサムネイル（パーツ選択UI用 56×56表示）
// ============================================================
export function AvatarMiniThumb({ config }: { config: AvatarConfig }) {
  return (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      <AvatarSVG config={config} width={56} height={84}/>
    </div>
  );
}
