"use client";
import { useRef, useEffect } from "react";
import { BOARD_SQUARES, TOTAL_SQUARES, getSquareIdAtGrid, getZoneForRow } from "@/data/board";
import type { Player, ZoneType } from "@/types/game";
import { AVATAR_COLORS } from "@/types/game";
import { DotAvatarToken } from "./DotAvatar";

interface Props {
  players:            Player[];
  currentPlayerIndex: number;
  displayPositions:   number[];
  landingSquare:      number | null;
}

// ============================================================
// 強制停止マス（分岐マスの中でも特に重要なもの）
// ============================================================
const MANDATORY_STOP_IDS = new Set([35, 50, 58, 79, 90, 96, 118, 133, 142]);

// ============================================================
// ゾーン別ビジュアルテーマ
// ============================================================
const ZONE_THEME: Record<ZoneType, {
  sky: string; skyBottom: string; ground: string;
  road: string; roadEdge: string; stripe: string;
  label: string; labelBg: string; labelColor: string; emoji: string;
}> = {
  babyhood:   { sky:"#FFD6F0", skyBottom:"#FFAAD8", ground:"#A8E870", road:"#FF88BB", roadEdge:"#DD4488", stripe:"#fff",     label:"赤ちゃん期",   labelBg:"#FF4499", labelColor:"#fff", emoji:"👶" },
  schooldays: { sky:"#90D8FF", skyBottom:"#C8EEFF", ground:"#70C040", road:"#4488FF", roadEdge:"#1155DD", stripe:"#fff",     label:"学生時代",     labelBg:"#1166DD", labelColor:"#fff", emoji:"🏫" },
  youth:      { sky:"#FFE080", skyBottom:"#FFCC44", ground:"#88CC33", road:"#EE9900", roadEdge:"#BB6600", stripe:"#fff",     label:"青春時代",     labelBg:"#CC7700", labelColor:"#fff", emoji:"🎒" },
  adulting:   { sky:"#88AADD", skyBottom:"#BBCCEE", ground:"#445566", road:"#3355AA", roadEdge:"#112266", stripe:"#ffff44", label:"社会人・結婚", labelBg:"#223388", labelColor:"#fff", emoji:"💼" },
  midlife:    { sky:"#88EEBB", skyBottom:"#BBFFCC", ground:"#337744", road:"#228855", roadEdge:"#006633", stripe:"#fff",     label:"壮年期",       labelBg:"#116644", labelColor:"#fff", emoji:"🏢" },
  golden:     { sky:"#FFCC66", skyBottom:"#FF9944", ground:"#EEC860", road:"#DD8822", roadEdge:"#994400", stripe:"#fff",     label:"老後・引退",   labelBg:"#AA5500", labelColor:"#fff", emoji:"🌅" },
};

// ============================================================
// マスタイプ別スタイル（明るくビビッド）
// ============================================================
function getSquareColors(sq: typeof BOARD_SQUARES[0]): { bg: string; border: string; glow: string; text: string } {
  switch (sq.type) {
    case "start":       return { bg:"#FFD700", border:"#B8860B", glow:"#FFD700", text:"#4A3000" };
    case "goal":        return { bg:"#FFD700", border:"#B8860B", glow:"#FFD700", text:"#4A3000" };
    case "choice":      return { bg:"#1a0e00", border:"#FFD700", glow:"#FFD700", text:"#FFD700" };
    case "money_plus":  return { bg:"#22DD66", border:"#009933", glow:"#00FF66", text:"#fff" };
    case "money_minus": return { bg:"#4488FF", border:"#1144DD", glow:"#88AAFF", text:"#fff" };
    case "chance":      return { bg:"#CC44FF", border:"#7700BB", glow:"#EE88FF", text:"#fff" };
    case "roll_again":  return { bg:"#FF7722", border:"#CC3300", glow:"#FF9944", text:"#fff" };
    case "safe":        return { bg:"#00BBAA", border:"#007766", glow:"#00FFEE", text:"#fff" };
    case "event":
      switch (sq.preferredCategory) {
        case "love":   return { bg:"#FF3377", border:"#CC0044", glow:"#FF88AA", text:"#fff" };
        case "work":   return { bg:"#0099DD", border:"#005599", glow:"#44CCFF", text:"#fff" };
        case "money":  return { bg:"#EE9900", border:"#AA6600", glow:"#FFCC44", text:"#fff" };
        case "social": return { bg:"#EE3322", border:"#AA1100", glow:"#FF7766", text:"#fff" };
        case "life":   return { bg:"#7744CC", border:"#440099", glow:"#BB88FF", text:"#fff" };
        default:       return { bg:"#5566CC", border:"#2233AA", glow:"#8899EE", text:"#fff" };
      }
    default: return { bg:"#778899", border:"#445566", glow:"#99AABB", text:"#fff" };
  }
}

function getSquareIcon(sq: typeof BOARD_SQUARES[0]): string {
  if (sq.type === "start")       return "GO";
  if (sq.type === "goal")        return "🏆";
  if (sq.type === "choice")      return "⚡";
  if (sq.type === "money_plus")  return "★";
  if (sq.type === "money_minus") return "💧";
  if (sq.type === "chance")      return "?";
  if (sq.type === "roll_again")  return "🎲";
  if (sq.type === "safe")        return "💤";
  if (sq.type === "event") {
    switch (sq.preferredCategory) {
      case "love":   return "♥";
      case "work":   return "💼";
      case "money":  return "¥";
      case "social": return "!";
      case "life":   return "🏡";
      default:       return "?";
    }
  }
  return "—";
}

// ============================================================
// ランドマーク：人生の重要地点
// ============================================================
const LANDMARK_SQUARES: Record<number, { icon: string; label: string; color: string; bg: string }> = {
  0:   { icon:"👶", label:"誕生！",    color:"#fff",     bg:"#FF4499" },
  10:  { icon:"🌸", label:"幼稚園",    color:"#fff",     bg:"#FF66AA" },
  15:  { icon:"🏫", label:"小学校",    color:"#fff",     bg:"#1166DD" },
  26:  { icon:"📚", label:"中学校",    color:"#fff",     bg:"#009944" },
  36:  { icon:"🎒", label:"高　校",    color:"#fff",     bg:"#CC7700" },
  51:  { icon:"🎓", label:"新生活",    color:"#fff",     bg:"#7722BB" },
  60:  { icon:"💼", label:"社会人",    color:"#fff",     bg:"#223388" },
  79:  { icon:"💒", label:"結　婚",    color:"#fff",     bg:"#DD2266" },
  90:  { icon:"👶", label:"出　産",    color:"#fff",     bg:"#FF6644" },
  96:  { icon:"🚀", label:"起　業",    color:"#fff",     bg:"#442299" },
  100: { icon:"🏡", label:"マイホーム",color:"#fff",     bg:"#226633" },
  134: { icon:"🎊", label:"定　年",    color:"#fff",     bg:"#885500" },
  150: { icon:"🏆", label:"GOAL！",   color:"#4A3000",  bg:"#FFD700" },
};

// ============================================================
// ゾーン背景パネル
// ============================================================
function ZonePanel({ zone, isFirst }: { zone: ZoneType; isFirst?: boolean }) {
  const t = ZONE_THEME[zone];
  return (
    <div style={{ position:"relative", width:"100%", overflow:"hidden" }}>
      {/* 空グラデ — CSS変数で高さをレスポンシブ化（320px→48px / 430px+→88px） */}
      <div style={{
        height: "var(--zone-sky-h)",
        background: `linear-gradient(180deg, ${t.sky} 0%, ${t.skyBottom} 100%)`,
        position:"relative",
      }}>
        {/* ゾーンラベルバナー */}
        <div style={{
          position:"absolute", top:6, left:"50%", transform:"translateX(-50%)",
          background: t.labelBg,
          color: t.labelColor,
          padding:"3px 14px",
          borderRadius:20,
          fontSize:"var(--fs-sm)",
          fontWeight:"bold",
          fontFamily:"'DotGothic16',monospace",
          letterSpacing:1,
          boxShadow:`0 3px 10px rgba(0,0,0,0.35), 0 0 12px ${t.labelBg}88`,
          whiteSpace:"nowrap",
          border:`2px solid rgba(255,255,255,0.6)`,
          zIndex:3,
          display:"flex",
          alignItems:"center",
          gap:5,
        }}>
          <span>{t.emoji}</span>
          <span>{t.label}</span>
        </div>
        {/* ゾーン別イラスト */}
        <ZoneIllustration zone={zone} />
      </div>
      {/* 地面 */}
      <div style={{ height:6, background: t.ground }} />
    </div>
  );
}

// ============================================================
// ゾーン別イラスト（内蔵SVG）
// ============================================================
function ZoneIllustration({ zone }: { zone: ZoneType }) {
  switch (zone) {
    case "babyhood": return (
      <svg style={{ position:"absolute", bottom:0, left:0, right:0, width:"100%", height:72 }} viewBox="0 0 360 72" preserveAspectRatio="xMidYMax meet">
        {/* 虹 */}
        <path d="M0 72 Q180 10 360 72" fill="none" stroke="#FF88CC" strokeWidth={5} opacity={0.4}/>
        <path d="M0 72 Q180 22 360 72" fill="none" stroke="#FFAA44" strokeWidth={4} opacity={0.4}/>
        <path d="M0 72 Q180 34 360 72" fill="none" stroke="#88FF88" strokeWidth={4} opacity={0.4}/>
        {/* 幼稚園 */}
        <rect x={130} y={18} width={100} height={52} fill="#FFFFC0" rx={3}/>
        <rect x={130} y={18} width={100} height={10} fill="#FF4499" rx={3}/>
        <rect x={170} y={52} width={20} height={18} fill="#FF8866" rx={2}/>
        <rect x={140} y={30} width={15} height={12} rx={2} fill="#88CCFF"/>
        <rect x={162} y={30} width={15} height={12} rx={2} fill="#88CCFF"/>
        <rect x={205} y={30} width={15} height={12} rx={2} fill="#88CCFF"/>
        <text x={180} y={14} textAnchor="middle" fontSize={8} fill="#fff" fontFamily="sans-serif" fontWeight="bold">幼稚園</text>
        {/* 家 */}
        <polygon points="20,56 48,36 76,56" fill="#FF6644"/>
        <rect x={20} y={56} width={56} height={16} fill="#FFF0A0"/>
        <rect x={40} y={60} width={12} height={12} fill="#FF8866" rx={1}/>
        <polygon points="280,58 308,38 336,58" fill="#8844CC"/>
        <rect x={280} y={58} width={56} height={14} fill="#E8D0FF"/>
        <rect x={300} y={62} width={12} height={10} fill="#6622AA" rx={1}/>
        {/* 木 */}
        <rect x={94} y={50} width={6} height={22} fill="#884422"/>
        <circle cx={97} cy={44} r={14} fill="#44CC44"/>
        <rect x={246} y={52} width={5} height={20} fill="#884422"/>
        <circle cx={248} cy={46} r={12} fill="#55DD55"/>
        {/* 花 */}
        {[14,28,42,112,120,320,335,350].map((fx,i)=>(
          <circle key={i} cx={fx} cy={68} r={4} fill={["#FF88BB","#FFAA44","#FF44CC","#44FFAA","#FF8844","#88FF44","#FF44AA","#44AAFF"][i]}/>
        ))}
      </svg>
    );

    case "schooldays": return (
      <svg style={{ position:"absolute", bottom:0, left:0, right:0, width:"100%", height:72 }} viewBox="0 0 360 72" preserveAspectRatio="xMidYMax meet">
        {/* 雲 */}
        <ellipse cx={60} cy={18} rx={35} ry={13} fill="rgba(255,255,255,0.85)"/>
        <ellipse cx={300} cy={22} rx={28} ry={11} fill="rgba(255,255,255,0.85)"/>
        {/* 小学校 */}
        <rect x={0} y={2} width={8} height={40} fill="#CCAA66"/>
        <rect x={352} y={2} width={8} height={40} fill="#CCAA66"/>
        <rect x={100} y={18} width={160} height={52} fill="#E8D8A0"/>
        <rect x={100} y={18} width={160} height={10} fill="#6644AA"/>
        {[0,1,2,3].map(i=><rect key={i} x={108+i*38} y={30} width={24} height={16} rx={2} fill="#88CCFF"/>)}
        {[0,1,2,3].map(i=><rect key={i} x={108+i*38} y={52} width={24} height={14} rx={2} fill="#88CCFF"/>)}
        <rect x={168} y={56} width={24} height={16} fill="#885533" rx={2}/>
        {/* 時計塔 */}
        <rect x={172} y={0} width={16} height={24} fill="#7755AA"/>
        <circle cx={180} cy={10} r={7} fill="#fff" stroke="#6644AA" strokeWidth={1.5}/>
        <text x={180} y={14} textAnchor="middle" fontSize={9} fill="#fff" fontFamily="sans-serif" fontWeight="bold" stroke="#5533AA" strokeWidth={0.5}>小学校</text>
        {/* 桜 */}
        <rect x={55} y={40} width={8} height={32} fill="#AA7755"/>
        <circle cx={59} cy={34} r={18} fill="#FFB8CC" opacity={0.9}/>
        <circle cx={47} cy={42} r={11} fill="#FFC8D8" opacity={0.8}/>
        <circle cx={71} cy={42} r={11} fill="#FFAABF" opacity={0.8}/>
        {/* すべり台 */}
        <line x1={290} y1={36} x2={320} y2={68} stroke="#E88820" strokeWidth={7} strokeLinecap="round"/>
        <rect x={316} y={62} width={20} height={8} rx={3} fill="#E88820"/>
        <rect x={282} y={28} width={22} height={16} rx={3} fill="#E88820"/>
        {/* 木 */}
        <rect x={335} y={46} width={6} height={26} fill="#884422"/>
        <circle cx={338} cy={40} r={14} fill="#44BB33"/>
      </svg>
    );

    case "midlife": return (
      <svg style={{ position:"absolute", bottom:0, left:0, right:0, width:"100%", height:72 }} viewBox="0 0 360 72" preserveAspectRatio="xMidYMax meet">
        {/* 雲 */}
        <ellipse cx={40} cy={16} rx={30} ry={11} fill="rgba(255,255,255,0.8)"/>
        <ellipse cx={310} cy={20} rx={25} ry={10} fill="rgba(255,255,255,0.8)"/>
        {/* 中学校 */}
        <rect x={70} y={12} width={160} height={58} fill="#D8E8B0"/>
        <rect x={70} y={12} width={160} height={10} fill="#337755"/>
        {[0,1,2,3].map(i=><rect key={i} x={80+i*38} y={26} width={24} height={14} rx={2} fill="#88DDCC"/>)}
        {[0,1,2,3].map(i=><rect key={i} x={80+i*38} y={46} width={24} height={14} rx={2} fill="#88DDCC"/>)}
        <rect x={140} y={60} width={22} height={12} fill="#886633" rx={2}/>
        <text x={150} y={8} textAnchor="middle" fontSize={9} fill="#fff" fontFamily="sans-serif" fontWeight="bold" stroke="#226644" strokeWidth={0.5}>中学校</text>
        {/* 体育館 */}
        <rect x={245} y={28} width={70} height={44} fill="#C0C8A0"/>
        <ellipse cx={280} cy={28} rx={35} ry={10} fill="#9AAA88"/>
        <text x={280} y={60} textAnchor="middle" fontSize={8} fill="#445533" fontFamily="sans-serif">体育館</text>
        {/* グラウンド */}
        <rect x={0} y={50} width={60} height={22} fill="#B8A870" opacity={0.7}/>
        <ellipse cx={30} cy={61} rx={20} ry={9} fill="none" stroke="#D8C890" strokeWidth={1.5}/>
        {/* 木 */}
        <rect x={338} y={44} width={6} height={28} fill="#774422"/>
        <circle cx={341} cy={38} r={16} fill="#44BB44"/>
      </svg>
    );

    case "youth": return (
      <svg style={{ position:"absolute", bottom:0, left:0, right:0, width:"100%", height:72 }} viewBox="0 0 360 72" preserveAspectRatio="xMidYMax meet">
        {/* 太陽 */}
        <circle cx={320} cy={20} r={18} fill="#FFD040" opacity={0.9}/>
        {/* 高校 */}
        <rect x={60} y={14} width={150} height={58} fill="#F0F0D8"/>
        <rect x={60} y={14} width={150} height={10} fill="#CC6622"/>
        {[0,1,2].map(i=><rect key={i} x={72+i*48} y={28} width={30} height={16} rx={2} fill="#88AAEE"/>)}
        {[0,1,2].map(i=><rect key={i} x={72+i*48} y={50} width={30} height={14} rx={2} fill="#88AAEE"/>)}
        <rect x={125} y={62} width={20} height={12} fill="#885533" rx={2}/>
        <text x={135} y={10} textAnchor="middle" fontSize={9} fill="#fff" fontFamily="sans-serif" fontWeight="bold" stroke="#AA4411" strokeWidth={0.5}>高校</text>
        {/* コンビニ */}
        <rect x={228} y={28} width={65} height={44} fill="#F8F8FF"/>
        <rect x={228} y={28} width={65} height={13} fill="#0055CC"/>
        <text x={260} y={39} textAnchor="middle" fontSize={7} fill="#fff" fontFamily="sans-serif" fontWeight="bold">CONVENIENCE</text>
        <rect x={238} y={44} width={16} height={20} fill="#E0ECFF" stroke="#AACCFF" strokeWidth={1}/>
        <rect x={264} y={44} width={16} height={20} fill="#E0ECFF" stroke="#AACCFF" strokeWidth={1}/>
        {/* 桜 */}
        <rect x={8} y={30} width={8} height={42} fill="#AA7755"/>
        <circle cx={12} cy={24} r={20} fill="#FFAABB" opacity={0.9}/>
        {/* 自転車 */}
        <circle cx={195} cy={62} r={9} fill="none" stroke="#668888" strokeWidth={2.5}/>
        <circle cx={213} cy={62} r={9} fill="none" stroke="#668888" strokeWidth={2.5}/>
        <line x1={195} y1={62} x2={213} y2={62} stroke="#668888" strokeWidth={2}/>
        <line x1={204} y1={53} x2={204} y2={62} stroke="#668888" strokeWidth={2}/>
      </svg>
    );

    case "adulting": return (
      <svg style={{ position:"absolute", bottom:0, left:0, right:0, width:"100%", height:72 }} viewBox="0 0 360 72" preserveAspectRatio="xMidYMax meet">
        {/* 夕焼け */}
        <ellipse cx={180} cy={72} rx={200} ry={40} fill="#CC66AA" opacity={0.3}/>
        {/* 大学門 */}
        <rect x={100} y={28} width={10} height={44} fill="#C8B878"/>
        <rect x={250} y={28} width={10} height={44} fill="#C8B878"/>
        <rect x={95} y={22} width={170} height={12} fill="#C8B878"/>
        <text x={180} y={32} textAnchor="middle" fontSize={8} fill="#806020" fontFamily="sans-serif" fontWeight="bold">大　　学</text>
        {/* 大学本館 */}
        <rect x={118} y={8} width={124} height={50} fill="#E8E0C0"/>
        <rect x={118} y={8} width={124} height={10} fill="#7766AA"/>
        {[0,1,2,3].map(i=><rect key={i} x={126+i*30} y={22} width={18} height={14} rx={2} fill="#88AAEE"/>)}
        {[0,1,2,3].map(i=><rect key={i} x={126+i*30} y={40} width={18} height={12} rx={2} fill="#88AAEE"/>)}
        <rect x={161} y={52} width={18} height={10} fill="#775533" rx={2}/>
        {/* マンション */}
        <rect x={10} y={16} width={36} height={56} fill="#9090B8"/>
        {[0,1,2,3].map(r=>[0,1].map(c=><rect key={`${r}${c}`} x={15+c*16} y={18+r*13} width={12} height={9} rx={1} fill="#B8D0F0"/>))}
        <rect x={280} y={10} width={38} height={62} fill="#8090A8"/>
        {[0,1,2,3,4].map(r=>[0,1].map(c=><rect key={`${r}${c}`} x={285+c*16} y={12+r*11} width={12} height={8} rx={1} fill="#A8C8E8"/>))}
        {/* 街灯 */}
        <line x1={60} y1={32} x2={60} y2={72} stroke="#888" strokeWidth={3}/>
        <ellipse cx={60} cy={30} rx={10} ry={5} fill="#FFEE80" opacity={0.9}/>
        <line x1={310} y1={32} x2={310} y2={72} stroke="#888" strokeWidth={3}/>
        <ellipse cx={310} cy={30} rx={10} ry={5} fill="#FFEE80" opacity={0.9}/>
      </svg>
    );

    case "adulting": return (
      <svg style={{ position:"absolute", bottom:0, left:0, right:0, width:"100%", height:72 }} viewBox="0 0 360 72" preserveAspectRatio="xMidYMax meet">
        {/* ビル群 */}
        <rect x={0}   y={4}  width={44} height={68} fill="#6878A0"/>
        {[0,1,2,3,4].map(r=>[0,1,2].map(c=><rect key={`${r}${c}`} x={4+c*14} y={6+r*13} width={10} height={9} rx={1} fill={["#A8C8E8","#C0D8F8","#88A8D0"][c]}/>))}
        <rect x={52}  y={16} width={38} height={56} fill="#5870A8"/>
        {[0,1,2,3].map(r=>[0,1,2].map(c=><rect key={`${r}${c}`} x={56+c*12} y={18+r*12} width={9} height={8} rx={1} fill="#9AC0E8"/>))}
        <rect x={98}  y={8}  width={50} height={64} fill="#4868A0"/>
        {[0,1,2,3,4].map(r=>[0,1,2].map(c=><rect key={`${r}${c}`} x={102+c*16} y={10+r*12} width={12} height={8} rx={1} fill="#90B8E0"/>))}
        <rect x={240} y={0}  width={58} height={72} fill="#607090"/>
        {[0,1,2,3,4,5].map(r=>[0,1,2].map(c=><rect key={`${r}${c}`} x={244+c*18} y={2+r*12} width={14} height={8} rx={1} fill="#A0C0E0"/>))}
        <rect x={306} y={12} width={44} height={60} fill="#5870A8"/>
        {[0,1,2,3,4].map(r=>[0,1,2].map(c=><rect key={`${r}${c}`} x={310+c*13} y={14+r*12} width={10} height={8} rx={1} fill="#98B8E8"/>))}
        {/* 住宅 */}
        <polygon points="162,44 189,28 216,44" fill="#DD4433"/>
        <rect x={162} y={44} width={54} height={28} fill="#FFF0C0"/>
        <rect x={180} y={56} width={14} height={16} fill="#885533" rx={1}/>
        <rect x={167} y={48} width={13} height={10} rx={1} fill="#88CCFF"/>
        <rect x={199} y={48} width={13} height={10} rx={1} fill="#88CCFF"/>
        {/* 道路・車 */}
        <rect x={0} y={60} width={360} height={12} fill="#606878" opacity={0.8}/>
        <rect x={30} y={61} width={36} height={12} rx={3} fill="#DD3322"/>
        <rect x={36} y={57} width={24} height={10} rx={2} fill="#EE5544"/>
        <circle cx={38} cy={73} r={4} fill="#222"/><circle cx={58} cy={73} r={4} fill="#222"/>
      </svg>
    );

    case "golden": return (
      <svg style={{ position:"absolute", bottom:0, left:0, right:0, width:"100%", height:72 }} viewBox="0 0 360 72" preserveAspectRatio="xMidYMax meet">
        {/* 夕日 */}
        <circle cx={50} cy={32} r={26} fill="#FFD040" opacity={0.85}/>
        <circle cx={50} cy={32} r={20} fill="#FFE870"/>
        {[-30,-15,0,15,30].map((dx,i)=>(
          <line key={i} x1={50+dx*0.5} y1={32} x2={50+dx} y2={32-38} stroke="#FFD040" strokeWidth={2.5} opacity={0.45}/>
        ))}
        {/* 海 */}
        <rect x={0} y={48} width={160} height={24} fill="#2060B8"/>
        <path d="M0 54 Q20 48 40 54 Q60 60 80 54 Q100 48 120 54 Q140 60 160 54 L160 72 L0 72 Z" fill="#3378CC" opacity={0.6}/>
        {/* 砂浜 */}
        <rect x={140} y={52} width={220} height={20} fill="#E8C878"/>
        {/* 木 */}
        <rect x={218} y={24} width={8} height={48} fill="#AA7744"/>
        <circle cx={222} cy={18} r={22} fill="#44AA33"/>
        <rect x={288} y={28} width={7} height={44} fill="#AA7744"/>
        <circle cx={291} cy={22} r={18} fill="#55BB44"/>
        {/* ベンチ */}
        <rect x={246} y={56} width={28} height={5} rx={2} fill="#996633"/>
        <rect x={249} y={59} width={4} height={8} fill="#996633"/>
        <rect x={269} y={59} width={4} height={8} fill="#996633"/>
        {/* 平屋 */}
        <polygon points="308,46 336,30 360,46" fill="#DD7733"/>
        <rect x={308} y={46} width={52} height={26} fill="#FFF8E8"/>
        <rect x={326} y={58} width={14} height={14} fill="#885533" rx={1}/>
        <rect x={312} y={50} width={12} height={10} rx={1} fill="#88CCFF"/>
        <rect x={340} y={50} width={12} height={10} rx={1} fill="#88CCFF"/>
        {/* 波 */}
        <path d="M0 62 Q20 56 40 62 Q60 68 80 62 Q100 56 120 62 Q140 68 150 64" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5}/>
      </svg>
    );

    default: return null;
  }
}

// ============================================================
// プレイヤーコマ（大きめ・見やすい）
// ============================================================
function PlayerPiece({ player, isActive, isLanding }: { player: Player; isActive: boolean; isLanding: boolean }) {
  const c    = AVATAR_COLORS[player.avatar.color];
  const size = isActive ? 24 : 16;
  return (
    <div
      className={isLanding ? "anim-piece-land" : isActive ? "anim-piece-hop" : ""}
      style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
      title={player.name}
    >
      {/* アクティブプレイヤーの発光リング */}
      {isActive && (
        <div
          className="anim-square-pulse"
          style={{
            position: "absolute",
            width: size + 8,
            height: size + 8,
            borderRadius: "50%",
            border: `2px solid ${c.bg}`,
            opacity: 0.7,
            pointerEvents: "none",
          }}
        />
      )}
      <DotAvatarToken player={player} size={size} isActive={isActive} />
    </div>
  );
}

// ============================================================
// マス（円形タイル）
// ============================================================
function SquareTile({
  squareId, isHighlight, isLanding,
  players, displayPositions, currentIdx,
}: {
  squareId: number; isHighlight: boolean; isLanding: boolean;
  players: Player[]; displayPositions: number[]; currentIdx: number;
}) {
  const sq = BOARD_SQUARES[squareId];
  if (!sq) return null;

  const isLandmark   = squareId in LANDMARK_SQUARES;
  const lm           = LANDMARK_SQUARES[squareId];
  const col          = getSquareColors(sq);
  const icon         = isLandmark ? lm.icon : getSquareIcon(sq);
  const here         = players.filter((_, i) => displayPositions[i] === squareId);
  const showAmt      = (sq.type === "money_plus" || sq.type === "money_minus") && sq.amount != null;
  const isSpecial    = sq.type === "start" || sq.type === "goal";
  const isChoice     = sq.type === "choice";
  const isStopSquare = MANDATORY_STOP_IDS.has(squareId);

  // choiceマス は特別サイズ
  const sizeVar    = isSpecial ? "var(--sq-special)" : (isLandmark || isChoice) ? "var(--sq-lm)" : "var(--sq-normal)";
  const iconFsVar  = isSpecial ? "var(--fs-md)"      : (isLandmark || isChoice) ? "var(--fs-md)" : "var(--fs-xs)";
  const amtFsVar   = "var(--fs-2xs)";
  const labelFsVar = "var(--fs-2xs)";

  return (
    <div style={{
      width: "20%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      padding: "2px 0",
    }}>
      {/* ランドマークラベル（上） */}
      {isLandmark && lm.label && (
        <div style={{
          fontSize: labelFsVar,
          fontWeight: "bold",
          color: lm.bg,
          fontFamily: "'DotGothic16',monospace",
          marginBottom: 1,
          whiteSpace: "nowrap",
          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
        }}>
          {lm.label}
        </div>
      )}

      {/* メインサークル */}
      <div
        className={isHighlight ? "anim-square-pulse" : ""}
        style={{
          width:  sizeVar,
          height: sizeVar,
          borderRadius: "50%",
          backgroundColor: isLandmark ? lm.bg : col.bg,
          border: isHighlight
            ? `3px solid #FFD700`
            : isLanding
            ? `3px solid #FFD700`
            : isChoice
            ? `2.5px solid #FFD700`
            : isLandmark
            ? `2px solid rgba(255,255,255,0.8)`
            : `2px solid ${col.border}`,
          boxShadow: isHighlight
            ? `0 0 18px #FFD700, 0 0 8px #FFD700, 0 2px 6px rgba(0,0,0,0.7)`
            : isLanding
            ? `0 0 16px #FFD700, 0 0 6px #FFD700, 0 2px 6px rgba(0,0,0,0.6)`
            : isChoice
            ? `0 0 12px #FFD700aa, 0 0 5px #FFD70066, 0 2px 5px rgba(0,0,0,0.5)`
            : `0 2px 5px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          flexShrink: 0,
          transform: isHighlight || isLanding ? "scale(1.2)" : isChoice ? "scale(1.08)" : "scale(1)",
          transition: "transform 0.2s, box-shadow 0.2s",
          zIndex: 2,
        }}
      >
        {/* 光沢 */}
        <div style={{
          position:"absolute", top:2, left:4, right:4, height:"36%",
          borderRadius:"50% 50% 0 0",
          background:"linear-gradient(180deg,rgba(255,255,255,0.45) 0%,transparent 100%)",
          pointerEvents:"none",
        }}/>

        {/* アイコン */}
        <div style={{
          fontSize: iconFsVar,
          lineHeight:1,
          color: isLandmark ? lm.color : col.text,
          textShadow: "0 1px 2px rgba(0,0,0,0.4)",
          fontWeight: "bold",
          fontFamily: "'DotGothic16',monospace",
          position: "relative",
          zIndex:1,
        }}>
          {icon}
        </div>

        {/* 金額 */}
        {showAmt && (
          <div style={{
            fontSize: amtFsVar,
            fontWeight: "bold",
            color: "rgba(255,255,255,0.95)",
            textShadow: "0 1px 1px rgba(0,0,0,0.5)",
            lineHeight: 1,
            marginTop: 1,
            fontFamily: "'DotGothic16',monospace",
          }}>
            {sq.amount! > 0 ? "+" : ""}{sq.amount}万
          </div>
        )}

        {/* マス番号（極小） */}
        <div style={{
          position:"absolute", bottom:2, right:3,
          fontSize:"var(--fs-2xs)", color:"rgba(255,255,255,0.4)", lineHeight:1,
        }}>
          {squareId}
        </div>

        {/* STOPバッジ（強制停止マスのみ） */}
        {isStopSquare && (
          <div style={{
            position: "absolute",
            top: -7,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#FFD700",
            color: "#1a0e00",
            fontSize: 6,
            fontWeight: "bold",
            fontFamily: "'DotGothic16',monospace",
            padding: "1px 4px",
            borderRadius: 2,
            letterSpacing: 1,
            whiteSpace: "nowrap",
            boxShadow: "0 0 6px #FFD700",
            zIndex: 4,
          }}>
            STOP
          </div>
        )}
      </div>

      {/* 分岐ラベル（choiceマス下） */}
      {isChoice && !isLandmark && (
        <div style={{
          fontSize: "var(--fs-2xs)",
          fontWeight: "bold",
          color: "#FFD700",
          fontFamily: "'DotGothic16',monospace",
          marginTop: 2,
          whiteSpace: "nowrap",
          textShadow: "0 0 4px #FFD700",
          lineHeight: 1,
        }}>
          分岐
        </div>
      )}

      {/* コマ表示 */}
      {here.length > 0 && (
        <div style={{
          position: "absolute",
          bottom: -4,
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "center",
          zIndex: 10,
        }}>
          {here.map(p => {
            const idx = players.findIndex(pl => pl.id === p.id);
            return (
              <PlayerPiece
                key={p.id} player={p}
                isActive={idx === currentIdx}
                isLanding={isLanding && idx === currentIdx}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 道路セクション（マス行）
// ============================================================
function RoadRow({
  squareIds, zone, isEvenRow, isLastRow,
  players, displayPositions, currentIdx, landingSquare, currentDisplayPos,
}: {
  squareIds: number[]; zone: ZoneType; isEvenRow: boolean; isLastRow: boolean;
  players: Player[]; displayPositions: number[]; currentIdx: number;
  landingSquare: number | null; currentDisplayPos: number;
}) {
  const t = ZONE_THEME[zone];

  return (
    <div style={{ position: "relative" }}>
      {/* 道路ベース */}
      <div style={{
        position: "relative",
        background: t.road,
        borderTop:    `3px solid ${t.roadEdge}`,
        borderBottom: `3px solid rgba(0,0,0,0.2)`,
        paddingTop: "var(--sp-2)",
        paddingBottom: "var(--sp-3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: "var(--sp-1)",
        paddingRight: "var(--sp-1)",
        overflow: "visible",
      }}>
        {/* センターライン（破線） */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: 0, right: 0,
          height: 2,
          borderTop: `2px dashed ${t.stripe}`,
          opacity: 0.35,
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}/>

        {/* 路面テクスチャ */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `repeating-linear-gradient(90deg,transparent,transparent 28px,rgba(0,0,0,0.04) 28px,rgba(0,0,0,0.04) 29px)`,
          pointerEvents: "none",
        }}/>

        {/* マスを配置 */}
        {squareIds.map(id => (
          <SquareTile
            key={id}
            squareId={id}
            isHighlight={id === currentDisplayPos}
            isLanding={id === landingSquare}
            players={players}
            displayPositions={displayPositions}
            currentIdx={currentIdx}
          />
        ))}
      </div>

      {/* Uターン・進行方向表示 */}
      {!isLastRow && (
        <div style={{
          height: 20,
          background: `linear-gradient(90deg, ${t.ground}bb, ${t.ground}ff)`,
          display: "flex",
          alignItems: "center",
          justifyContent: isEvenRow ? "flex-end" : "flex-start",
          paddingLeft: isEvenRow ? 0 : 8,
          paddingRight: isEvenRow ? 8 : 0,
          borderBottom: `2px solid rgba(0,0,0,0.2)`,
          gap: 4,
        }}>
          {/* 進行方向テキスト */}
          <span style={{
            color: t.roadEdge,
            fontSize: 9,
            fontWeight: "bold",
            fontFamily: "'DotGothic16',monospace",
            opacity: 0.9,
            order: isEvenRow ? 1 : 2,
          }}>
            {isEvenRow ? "▼" : "▼"}
          </span>
          {/* カーブ矢印SVG */}
          <svg width={48} height={20} viewBox="0 0 48 20"
            style={{
              transform: isEvenRow ? undefined : "scaleX(-1)",
              order: isEvenRow ? 2 : 1,
            }}>
            <path
              d={`M 6 4 Q 42 4 42 10 Q 42 16 6 16`}
              fill="none" stroke={t.roadEdge} strokeWidth={3.5} strokeLinecap="round"
            />
            {/* 矢印頭 */}
            <polygon points="0,16 10,10 10,22" fill={t.roadEdge}/>
          </svg>
        </div>
      )}
    </div>
  );
}

// ============================================================
// メインマップ
// ============================================================
export function BoardMap({ players, currentPlayerIndex, displayPositions, landingSquare }: Props) {
  const curDisplayPos = displayPositions[currentPlayerIndex] ?? 0;
  const curRow        = Math.floor(curDisplayPos / 5);
  const totalRows     = Math.ceil((TOTAL_SQUARES + 1) / 5);
  const rowRefs       = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    rowRefs.current[curRow]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [curRow]);

  // ゾーン切り替え点を計算
  let prevZone: ZoneType | null = null;

  return (
    <div style={{
      backgroundColor: "#3a4050",
      userSelect: "none",
    }}>
      {Array.from({ length: totalRows }, (_, row) => {
        const ids = Array.from({ length: 5 }, (__, col) => {
          const id = getSquareIdAtGrid(row, col);
          return id <= TOTAL_SQUARES ? id : -1;
        }).filter(id => id >= 0);

        const zone     = getZoneForRow(row);
        const showZone = zone !== prevZone;
        prevZone = zone;

        return (
          <div key={row} ref={el => { rowRefs.current[row] = el; }}>
            {/* ゾーン切り替えパネル */}
            {showZone && <ZonePanel zone={zone} isFirst={row === 0} />}

            {/* 道路行 */}
            <RoadRow
              squareIds={ids}
              zone={zone}
              isEvenRow={row % 2 === 0}
              isLastRow={row === totalRows - 1}
              players={players}
              displayPositions={displayPositions}
              currentIdx={currentPlayerIndex}
              landingSquare={landingSquare}
              currentDisplayPos={curDisplayPos}
            />
          </div>
        );
      })}
    </div>
  );
}
