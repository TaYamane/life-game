"use client";
import { useState } from "react";
import type { AvatarCustomization } from "@/types/game";
import { PixelAvatarBody, customizationToDNA } from "./DotAvatar";

// ============================================================
// デフォルト / プリセット
// ============================================================
export const DEFAULT_CUSTOMIZATION: AvatarCustomization = {
  gender:       "male",
  outline:      "round",
  eyes:         "normal",
  nose:         "normal",
  mouth:        "normal",
  frontHair:    "bangs",
  backHair:     "short",
  hairColor:    "#2a1808",
  skinColor:    "#f5c98a",
  clothesColor: "#3b82f6",
};

// 色パレット
const HAIR_COLORS = [
  { hex:"#1a1010", label:"黒" },
  { hex:"#2a1808", label:"暗褐" },
  { hex:"#3d2010", label:"茶" },
  { hex:"#7B3A10", label:"赤茶" },
  { hex:"#c8a050", label:"金茶" },
  { hex:"#e8d080", label:"金" },
  { hex:"#cc4400", label:"赤" },
  { hex:"#5a2060", label:"紫" },
  { hex:"#909098", label:"銀" },
  { hex:"#e0e0e8", label:"白" },
];

const SKIN_COLORS = [
  { hex:"#fde8c8", label:"白い" },
  { hex:"#f5c98a", label:"標準" },
  { hex:"#d4956a", label:"小麦" },
  { hex:"#a06040", label:"褐色" },
  { hex:"#7a4a30", label:"黒い" },
  { hex:"#f8ded8", label:"ピンク" },
];

const CLOTHES_COLORS = [
  { hex:"#3b82f6", label:"青" },
  { hex:"#ef4444", label:"赤" },
  { hex:"#22c55e", label:"緑" },
  { hex:"#a855f7", label:"紫" },
  { hex:"#f59e0b", label:"黄" },
  { hex:"#ec4899", label:"ピンク" },
  { hex:"#06b6d4", label:"水色" },
  { hex:"#1a1a2e", label:"黒" },
  { hex:"#f97316", label:"橙" },
  { hex:"#f2f0ee", label:"白" },
];

// ============================================================
// 小型SVGプレビュー（選択肢ボタン内）
// ============================================================

// 顔アイコン（りんかく）
function FaceIcon({ shape }: { shape: "round"|"square"|"slim" }) {
  return (
    <svg width={28} height={28} viewBox="0 0 20 20">
      {shape==="round" && <circle cx={10} cy={11} r={7} fill="#f5c98a" stroke="none"/>}
      {shape==="square" && <rect x={3} y={4} width={14} height={14} rx={3} fill="#f5c98a"/>}
      {shape==="slim"   && <ellipse cx={10} cy={11} rx={5.5} ry={8} fill="#f5c98a"/>}
      <circle cx={7.5} cy={10} r={1.2} fill="#2a1808"/>
      <circle cx={12.5} cy={10} r={1.2} fill="#2a1808"/>
    </svg>
  );
}

// 目アイコン
function EyeIcon({ shape }: { shape: "normal"|"big"|"sharp"|"sleepy" }) {
  return (
    <svg width={36} height={16} viewBox="0 0 36 16">
      {shape==="normal" && (<>
        <circle cx={9} cy={8} r={3.5} fill="#2a1808"/>
        <circle cx={27} cy={8} r={3.5} fill="#2a1808"/>
        <circle cx={10.5} cy={6.5} r={1.1} fill="white" opacity={0.8}/>
        <circle cx={28.5} cy={6.5} r={1.1} fill="white" opacity={0.8}/>
      </>)}
      {shape==="big" && (<>
        <circle cx={9} cy={8} r={5} fill="#2a1808"/>
        <circle cx={27} cy={8} r={5} fill="#2a1808"/>
        <circle cx={11} cy={5.5} r={1.6} fill="white" opacity={0.8}/>
        <circle cx={29} cy={5.5} r={1.6} fill="white" opacity={0.8}/>
      </>)}
      {shape==="sharp" && (<>
        <ellipse cx={9} cy={8} rx={5} ry={3} fill="#2a1808" transform="rotate(-8,9,8)"/>
        <ellipse cx={27} cy={8} rx={5} ry={3} fill="#2a1808" transform="rotate(8,27,8)"/>
        <circle cx={11} cy={6} r={1.1} fill="white" opacity={0.7}/>
        <circle cx={29} cy={6} r={1.1} fill="white" opacity={0.7}/>
      </>)}
      {shape==="sleepy" && (<>
        <circle cx={9}  cy={9} r={3.5} fill="#2a1808"/>
        <circle cx={27} cy={9} r={3.5} fill="#2a1808"/>
        <rect x={5.5} y={4} width={7} height={4} fill="#0e0e1a"/>
        <rect x={23.5} y={4} width={7} height={4} fill="#0e0e1a"/>
        <circle cx={10.5} cy={7} r={1.0} fill="white" opacity={0.7}/>
        <circle cx={28.5} cy={7} r={1.0} fill="white" opacity={0.7}/>
      </>)}
    </svg>
  );
}

// 前髪アイコン
function FrontHairIcon({ style, color }: { style: AvatarCustomization["frontHair"]; color:string }) {
  return (
    <svg width={28} height={24} viewBox="0 0 20 20">
      <circle cx={10} cy={12} r={7} fill="#f5c98a"/>
      {style==="bangs"  && <rect x={3} y={5.5} width={14} height={4} rx={0.8} fill={color}/>}
      {style==="side"   && <polygon points="3,5 13,5 13,9 3,9.5" fill={color}/>}
      {style==="center" && (<>
        <polygon points="3,5 9.5,5 9.5,9.5 3,9.8" fill={color}/>
        <polygon points="10.5,5 17,5 17,9.8 10.5,9.5" fill={color}/>
      </>)}
      {style==="none"   && <ellipse cx={10} cy={5.5} rx={7} ry={4} fill={color} opacity={0.3}/>}
    </svg>
  );
}

// 後髪アイコン
function BackHairIcon({ style, color }: { style: AvatarCustomization["backHair"]; color:string }) {
  return (
    <svg width={28} height={32} viewBox="0 0 20 28">
      <ellipse cx={10} cy={8} rx={8} ry={6.5} fill={color}/>
      <circle cx={10} cy={10} r={5.5} fill="#f5c98a"/>
      {style==="medium"  && (<>
        <rect x={1.5} y={9} width={3.5} height={10} rx={1.8} fill={color}/>
        <rect x={15} y={9} width={3.5} height={10} rx={1.8} fill={color}/>
      </>)}
      {style==="long"    && (<>
        <rect x={1.5} y={9} width={3.5} height={19} rx={1.8} fill={color}/>
        <rect x={15} y={9} width={3.5} height={19} rx={1.8} fill={color}/>
      </>)}
      {style==="bob"     && <rect x={1.5} y={10} width={17} height={6} rx={2.5} fill={color}/>}
    </svg>
  );
}

// ============================================================
// 共通ボタンコンポーネント
// ============================================================
function OptionBtn<T extends string>({
  value, current, label, children, onClick,
}: {
  value: T; current: T; label: string; children?: React.ReactNode;
  onClick: (v: T) => void;
}) {
  const selected = value === current;
  return (
    <button
      onClick={() => onClick(value)}
      style={{
        display:         "flex",
        flexDirection:   "column",
        alignItems:      "center",
        justifyContent:  "center",
        gap:             2,
        padding:         "6px 4px",
        minWidth:        58,
        borderRadius:    8,
        border:          selected ? "2px solid #FFD700" : "2px solid #2a1860",
        backgroundColor: selected ? "rgba(255,215,0,0.1)" : "#0f0a1e",
        boxShadow:       selected ? "0 0 8px rgba(255,215,0,0.5)" : "none",
        cursor:          "pointer",
        transition:      "all 0.15s",
      }}
    >
      {children}
      <span style={{ fontSize:9, color: selected ? "#FFD700" : "#9980cc",
        fontFamily:"'DotGothic16',monospace", letterSpacing:"0.05em" }}>
        {label}
      </span>
    </button>
  );
}

// ============================================================
// AvatarBuilder
// ============================================================
interface Props {
  playerName:          string;
  playerIndex:         number;
  initialCustomization?: AvatarCustomization;
  onDone:              (c: AvatarCustomization) => void;
  onBack:              () => void;
}

type Tab = "face" | "hair" | "color";

export function AvatarBuilder({ playerName, playerIndex, initialCustomization, onDone, onBack }: Props) {
  const [c, setC] = useState<AvatarCustomization>(initialCustomization ?? DEFAULT_CUSTOMIZATION);
  const [tab, setTab] = useState<Tab>("face");

  const set = <K extends keyof AvatarCustomization>(key: K, val: AvatarCustomization[K]) =>
    setC(prev => ({ ...prev, [key]: val }));

  const previewDNA = customizationToDNA(c);

  // アクセントカラー（プレイヤー番号別）
  const ACCENTS = ["#ef4444","#3b82f6","#22c55e","#f59e0b"];
  const accent = ACCENTS[playerIndex % 4];

  return (
    <div style={{
      position:   "fixed", inset: 0, zIndex: 100,
      backgroundColor: "#050315",
      display:    "flex", flexDirection: "column",
      height:     "100dvh", overflow: "hidden",
    }}>

      {/* ─── ヘッダー ─── */}
      <div style={{
        flexShrink: 0,
        display:    "flex", alignItems:"center", gap:8,
        padding:    "12px 16px",
        borderBottom: "2px solid #1a0e40",
        backgroundColor: "#07041a",
      }}>
        <button onClick={onBack} style={{
          background:"none", border:"none", color:"#9980cc", fontSize:20, cursor:"pointer", padding:4,
        }}>◀</button>
        <div style={{ flex:1, textAlign:"center" }}>
          <div style={{ color: accent, fontFamily:"'DotGothic16',monospace", fontSize:11, letterSpacing:"0.1em" }}>
            PLAYER {playerIndex+1}
          </div>
          <div style={{ color:"#FFD700", fontFamily:"'DotGothic16',monospace", fontSize:14 }}>
            {playerName || `プレイヤー${playerIndex+1}`} のキャラ作成
          </div>
        </div>
        <div style={{ width:28 }}/>
      </div>

      {/* ─── プレビュー ─── */}
      <div style={{
        flexShrink: 0,
        display:    "flex", flexDirection:"column", alignItems:"center",
        padding:    "16px 0 8px",
        background: "linear-gradient(180deg,#0a0630 0%,#050315 100%)",
        borderBottom: "1px solid #1a0e40",
      }}>
        {/* 年齢ステージプレビュー（2段：子供 & 大人） */}
        <div style={{ display:"flex", gap:20, alignItems:"flex-end" }}>
          {/* 幼少期 */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <svg width={56} height={90} viewBox="0 0 16 26"
              style={{ filter:"drop-shadow(0 0 6px rgba(192,132,252,0.4))" }}>
              <PixelAvatarBody dna={previewDNA} stage="child" happiness={80} job="none"/>
            </svg>
            <span style={{ fontSize:8, color:"#6040a0", fontFamily:"'DotGothic16',monospace" }}>小学生</span>
          </div>

          {/* メインプレビュー（若者） */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <svg width={100} height={160} viewBox="0 0 16 26"
              style={{ filter:"drop-shadow(0 2px 12px rgba(255,215,0,0.3))" }}>
              <PixelAvatarBody dna={previewDNA} stage="young" happiness={80} job="none"/>
            </svg>
            <span style={{ fontSize:9, color:"#FFD700", fontFamily:"'DotGothic16',monospace" }}>若者</span>
          </div>

          {/* 老後 */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <svg width={56} height={90} viewBox="0 0 16 26"
              style={{ filter:"drop-shadow(0 0 6px rgba(255,215,0,0.2))" }}>
              <PixelAvatarBody dna={previewDNA} stage="elder" happiness={80} job="none"/>
            </svg>
            <span style={{ fontSize:8, color:"#6040a0", fontFamily:"'DotGothic16',monospace" }}>老後</span>
          </div>
        </div>
      </div>

      {/* ─── タブ ─── */}
      <div style={{
        flexShrink: 0,
        display:    "flex",
        borderBottom: "2px solid #1a0e40",
        backgroundColor: "#07041a",
      }}>
        {(["face","hair","color"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "10px 0",
            background:  "none", border: "none",
            borderBottom: tab===t ? `3px solid #FFD700` : "3px solid transparent",
            color:        tab===t ? "#FFD700" : "#6040a0",
            fontFamily:   "'DotGothic16',monospace",
            fontSize:     12, cursor:"pointer",
            letterSpacing:"0.05em",
          }}>
            {t==="face"?"顔":t==="hair"?"髪":"色"}
          </button>
        ))}
      </div>

      {/* ─── オプションエリア（スクロール可能） ─── */}
      <div style={{ flex:1, overflowY:"auto", padding:"12px 16px 100px" }}>

        {/* ====== 顔タブ ====== */}
        {tab==="face" && (<>

          {/* 性別 */}
          <Section title="性別">
            <div style={{ display:"flex", gap:8 }}>
              <OptionBtn value="male" current={c.gender} label="♂ 男" onClick={v => set("gender",v)}>
                <span style={{ fontSize:20 }}>👦</span>
              </OptionBtn>
              <OptionBtn value="female" current={c.gender} label="♀ 女" onClick={v => set("gender",v)}>
                <span style={{ fontSize:20 }}>👧</span>
              </OptionBtn>
            </div>
          </Section>

          {/* りんかく */}
          <Section title="りんかく">
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {(["round","square","slim"] as const).map(v => (
                <OptionBtn key={v} value={v} current={c.outline}
                  label={v==="round"?"丸顔":v==="square"?"四角顔":"面長"}
                  onClick={val => set("outline",val)}>
                  <FaceIcon shape={v}/>
                </OptionBtn>
              ))}
            </div>
          </Section>

          {/* 目 */}
          <Section title="目">
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {(["normal","big","sharp","sleepy"] as const).map(v => (
                <OptionBtn key={v} value={v} current={c.eyes}
                  label={v==="normal"?"普通":v==="big"?"大きい":v==="sharp"?"シャープ":"眠そう"}
                  onClick={val => set("eyes",val)}>
                  <EyeIcon shape={v}/>
                </OptionBtn>
              ))}
            </div>
          </Section>

          {/* 鼻 */}
          <Section title="鼻">
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {(["normal","small","button"] as const).map(v => (
                <OptionBtn key={v} value={v} current={c.nose}
                  label={v==="normal"?"普通":v==="small"?"小さい":"ボタン"}
                  onClick={val => set("nose",val)}>
                  <NoseIcon style={v}/>
                </OptionBtn>
              ))}
            </div>
          </Section>

          {/* 口 */}
          <Section title="口">
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {(["wide","normal","small"] as const).map(v => (
                <OptionBtn key={v} value={v} current={c.mouth}
                  label={v==="wide"?"広め":"普通"}
                  onClick={val => set("mouth",val)}>
                  <MouthIcon size={v}/>
                </OptionBtn>
              ))}
            </div>
          </Section>
        </>)}

        {/* ====== 髪タブ ====== */}
        {tab==="hair" && (<>
          {/* 前髪 */}
          <Section title="前髪">
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {(["bangs","side","center","none"] as const).map(v => (
                <OptionBtn key={v} value={v} current={c.frontHair}
                  label={v==="bangs"?"前髪":v==="side"?"サイド":v==="center"?"センター":"なし"}
                  onClick={val => set("frontHair",val)}>
                  <FrontHairIcon style={v} color={c.hairColor}/>
                </OptionBtn>
              ))}
            </div>
          </Section>

          {/* 後髪 */}
          <Section title="後髪">
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {(["short","medium","long","bob"] as const).map(v => (
                <OptionBtn key={v} value={v} current={c.backHair}
                  label={v==="short"?"ショート":v==="medium"?"ミディアム":v==="long"?"ロング":"ボブ"}
                  onClick={val => set("backHair",val)}>
                  <BackHairIcon style={v} color={c.hairColor}/>
                </OptionBtn>
              ))}
            </div>
          </Section>
        </>)}

        {/* ====== 色タブ ====== */}
        {tab==="color" && (<>
          <Section title="髪色">
            <ColorPalette colors={HAIR_COLORS} selected={c.hairColor} onSelect={v => set("hairColor",v)}/>
          </Section>
          <Section title="肌色">
            <ColorPalette colors={SKIN_COLORS} selected={c.skinColor} onSelect={v => set("skinColor",v)}/>
          </Section>
          <Section title="服の色">
            <ColorPalette colors={CLOTHES_COLORS} selected={c.clothesColor} onSelect={v => set("clothesColor",v)}/>
          </Section>
        </>)}
      </div>

      {/* ─── 完成ボタン（固定下部） ─── */}
      <div style={{
        position:        "fixed", bottom:0, left:0, right:0,
        padding:         "12px 16px",
        paddingBottom:   "max(12px, env(safe-area-inset-bottom))",
        backgroundColor: "#07041a",
        borderTop:       "2px solid #1a0e40",
      }}>
        <button
          onClick={() => onDone(c)}
          style={{
            width:           "100%", padding:"14px 0",
            borderRadius:    12,
            background:      "linear-gradient(180deg,#c8a000,#8a6000)",
            color:           "#000", fontFamily:"'DotGothic16',monospace",
            fontSize:        18, fontWeight:"bold", letterSpacing:"0.12em",
            border:          "3px solid #FFD700",
            boxShadow:       "0 4px 0 #5a4000, 0 0 20px rgba(255,215,0,0.4)",
            cursor:          "pointer",
          }}
        >
          ✓ 完成！
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// サブコンポーネント
// ────────────────────────────────────────────────
function Section({ title, children }: { title:string; children:React.ReactNode }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{
        color:"#9980cc", fontSize:10, fontFamily:"'DotGothic16',monospace",
        letterSpacing:"0.12em", marginBottom:8, borderLeft:"3px solid #4a2880", paddingLeft:8,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function ColorPalette({ colors, selected, onSelect }: {
  colors: { hex:string; label:string }[];
  selected: string;
  onSelect: (hex:string) => void;
}) {
  return (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
      {colors.map(({ hex, label }) => {
        const sel = selected === hex;
        return (
          <button key={hex} onClick={() => onSelect(hex)} style={{
            width:44, height:44,
            borderRadius:8,
            backgroundColor: hex,
            border:     sel ? "3px solid #FFD700" : "2px solid #2a1860",
            boxShadow:  sel ? `0 0 10px rgba(255,215,0,0.6), 0 0 0 2px rgba(255,215,0,0.3)` : "none",
            cursor:     "pointer",
            display:    "flex", alignItems:"center", justifyContent:"center",
            transition: "all 0.12s",
            position:   "relative",
          }}>
            {sel && (
              <span style={{ color:"#fff", fontSize:16, textShadow:"0 1px 2px #000" }}>✓</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function NoseIcon({ style }: { style: "normal"|"small"|"button" }) {
  return (
    <svg width={28} height={20} viewBox="0 0 20 20">
      <rect x={2} y={2} width={16} height={16} rx={8} fill="#f5c98a"/>
      {style==="normal"  && (<><circle cx={8} cy={13} r={1.4} fill="#c08060" opacity={0.6}/>
        <circle cx={12} cy={13} r={1.4} fill="#c08060" opacity={0.6}/></>)}
      {style==="small"   && <circle cx={10} cy={12} r={1.0} fill="#c08060" opacity={0.5}/>}
      {style==="button"  && <circle cx={10} cy={12} r={2.0} fill="#c08060" opacity={0.55}/>}
    </svg>
  );
}

function MouthIcon({ size }: { size: "wide"|"normal"|"small" }) {
  const w = size==="wide" ? 10 : size==="small" ? 5 : 7;
  const cx = 10;
  return (
    <svg width={32} height={18} viewBox="0 0 20 18">
      <rect x={2} y={2} width={16} height={14} rx={7} fill="#f5c98a"/>
      <path d={`M ${cx-w/2} 11 Q ${cx} ${11+w*0.5} ${cx+w/2} 11`}
        fill="none" stroke="#7a3020" strokeWidth={1.3} strokeLinecap="round"/>
    </svg>
  );
}
