"use client";

import { useState } from "react";
import type { Avatar, AvatarColor, AvatarCustomization } from "@/types/game";
import { AVATAR_COLORS } from "@/types/game";
import { AvatarBuilder, DEFAULT_CUSTOMIZATION } from "./AvatarBuilder";
import { PixelAvatarBody, customizationToDNA } from "./DotAvatar";

interface Props {
  onStart: (players: { name: string; avatar: Avatar; customization?: AvatarCustomization }[]) => void;
}

const DEFAULT_NAMES   = ["プレイヤー1","プレイヤー2","プレイヤー3","プレイヤー4"];
const DEFAULT_COLORS: AvatarColor[] = ["red","blue","green","yellow"];

// ────────────────────────────────────────────────
// プレイヤーカード（1人分）
// ────────────────────────────────────────────────
interface PlayerCardProps {
  index:          number;
  name:           string;
  avatarColor:    AvatarColor;
  customization?: AvatarCustomization;
  onNameChange:   (n: string) => void;
  onColorChange:  (c: AvatarColor) => void;
  onOpenBuilder:  () => void;
}

const ACCENT_COLORS = ["#ef4444","#3b82f6","#22c55e","#f59e0b"];

function PlayerCard({
  index, name, avatarColor, customization, onNameChange, onColorChange, onOpenBuilder,
}: PlayerCardProps) {
  const accent = ACCENT_COLORS[index % 4];
  const colorInfo = AVATAR_COLORS[avatarColor];

  // プレビュー SVG
  const dna = customizationToDNA(customization ?? { ...DEFAULT_CUSTOMIZATION, clothesColor: colorInfo.bg });

  return (
    <div style={{
      borderRadius: 12,
      padding:      "12px",
      marginBottom: 12,
      backgroundColor: "var(--color-panel)",
      border:       `2px solid ${customization ? accent+"66" : "var(--color-border)"}`,
      boxShadow:    customization ? `0 0 12px ${accent}22` : "none",
    }}>
      {/* ラベル */}
      <div style={{ color:accent, fontFamily:"'DotGothic16',monospace", fontSize:10,
        letterSpacing:"0.15em", marginBottom:8 }}>
        PLAYER {index+1}
      </div>

      <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>

        {/* アバタープレビュー + 作成ボタン */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, flexShrink:0 }}>
          {/* アバター枠 */}
          <div style={{
            width:64, height:80,
            borderRadius:8,
            backgroundColor: "#0f0a1e",
            border: `2px solid ${customization ? accent : "var(--color-border)"}`,
            boxShadow: customization ? `0 0 10px ${accent}55` : "none",
            display:"flex", alignItems:"flex-end", justifyContent:"center",
            overflow:"hidden",
          }}>
            <svg width={52} height={75} viewBox="0 0 16 26" style={{ marginBottom:-2 }}>
              <PixelAvatarBody dna={dna} stage="young" happiness={80} job="none"/>
            </svg>
          </div>
          {/* 作成ボタン */}
          <button onClick={onOpenBuilder} style={{
            padding:         "5px 10px",
            borderRadius:    6,
            backgroundColor: customization ? accent+"22" : "#1a0e40",
            border:          `2px solid ${customization ? accent : "#2a1860"}`,
            color:           customization ? accent : "#9980cc",
            fontFamily:      "'DotGothic16',monospace",
            fontSize:        9, cursor:"pointer", letterSpacing:"0.08em",
            boxShadow:       customization ? `0 0 6px ${accent}44` : "none",
          }}>
            {customization ? "✏ 変更" : "🎨 作成"}
          </button>
        </div>

        {/* 右側：名前入力 + チームカラー */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:10 }}>
          {/* 名前 */}
          <input
            type="text"
            value={name}
            onChange={e => onNameChange(e.target.value)}
            placeholder={DEFAULT_NAMES[index]}
            maxLength={8}
            style={{
              width:"100%", borderRadius:8, padding:"8px 10px",
              backgroundColor:"#0f0a1e",
              border:"2px solid var(--color-border)",
              color:"var(--color-text)",
              fontFamily:"'DotGothic16',monospace",
              fontSize:16, outline:"none",
            }}
          />

          {/* チームカラー */}
          <div>
            <div style={{ color:"#9980cc", fontSize:9, fontFamily:"'DotGothic16',monospace",
              marginBottom:4, letterSpacing:"0.1em" }}>チームカラー</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {(Object.keys(AVATAR_COLORS) as AvatarColor[]).map(key => {
                const ci = AVATAR_COLORS[key];
                const sel = avatarColor === key;
                return (
                  <button key={key} onClick={() => onColorChange(key)} style={{
                    width:28, height:28, borderRadius:"50%",
                    backgroundColor: ci.bg,
                    border: sel ? "3px solid #FFD700" : `2px solid ${ci.border}`,
                    boxShadow: sel ? "0 0 8px rgba(255,215,0,0.7)" : "none",
                    cursor:"pointer", transition:"all 0.1s",
                  }}/>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// SetupScreen
// ────────────────────────────────────────────────
export function SetupScreen({ onStart }: Props) {
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState(["","","",""]);
  const [colors, setColors] = useState<AvatarColor[]>([...DEFAULT_COLORS]);
  const [customizations, setCustomizations] = useState<(AvatarCustomization|undefined)[]>([
    undefined, undefined, undefined, undefined,
  ]);
  const [builderIndex, setBuilderIndex] = useState<number|null>(null);

  const handleStart = () => {
    const activePlayers = Array.from({ length: playerCount }, (_, i) => ({
      name:          names[i].trim() || DEFAULT_NAMES[i],
      avatar:        { emoji:"😀", color: colors[i] } as Avatar,
      customization: customizations[i],
    }));
    onStart(activePlayers);
  };

  // ─── ビルダー表示中 ───
  if (builderIndex !== null) {
    return (
      <AvatarBuilder
        playerName={names[builderIndex].trim() || DEFAULT_NAMES[builderIndex]}
        playerIndex={builderIndex}
        initialCustomization={customizations[builderIndex] ?? {
          ...DEFAULT_CUSTOMIZATION,
          clothesColor: AVATAR_COLORS[colors[builderIndex]].bg,
        }}
        onDone={c => {
          setCustomizations(prev => {
            const next = [...prev]; next[builderIndex] = c; return next;
          });
          setBuilderIndex(null);
        }}
        onBack={() => setBuilderIndex(null)}
      />
    );
  }

  // ─── セットアップ画面 ───
  return (
    <div style={{
      display:"flex", flexDirection:"column", overflow:"hidden",
      height:"100dvh", backgroundColor:"var(--color-bg)",
    }}>

      {/* ヘッダー */}
      <div style={{ flexShrink:0, padding:"24px 16px 10px", textAlign:"center" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <span style={{ fontSize:22 }}>🎲</span>
          <h1 style={{ color:"var(--color-gold)", fontFamily:"'DotGothic16',monospace",
            fontSize:18, margin:0 }}>
            PIXEL LIFE
          </h1>
        </div>
        <p style={{ color:"#9980cc", fontFamily:"'DotGothic16',monospace",
          fontSize:9, marginTop:4, letterSpacing:"0.1em" }}>
          キャラクターを作成してゲームスタート！
        </p>
      </div>

      {/* 人数選択 */}
      <div style={{ flexShrink:0, padding:"0 16px 12px" }}>
        <div style={{
          borderRadius:10, padding:"10px 12px",
          backgroundColor:"var(--color-panel)", border:"2px solid var(--color-border)",
        }}>
          <div style={{ color:"var(--color-gold)", fontFamily:"'DotGothic16',monospace",
            fontSize:10, textAlign:"center", marginBottom:8, letterSpacing:"0.1em" }}>
            👥 プレイヤー人数
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:8 }}>
            {[1,2,3,4].map(n => (
              <button key={n} onClick={() => setPlayerCount(n)} style={{
                width:58, height:48, borderRadius:10,
                backgroundColor: playerCount===n ? "var(--color-gold)" : "#0f0a1e",
                color:           playerCount===n ? "#1f2937" : "var(--color-text)",
                border:          playerCount===n ? "3px solid #f59e0b" : "3px solid var(--color-border)",
                boxShadow:       playerCount===n ? "0 0 10px var(--color-gold)" : "none",
                fontFamily:      "'DotGothic16',monospace", fontSize:16, cursor:"pointer",
                transition:      "all 0.15s",
              }}>
                {n}人
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* プレイヤーカード一覧（スクロール可能） */}
      <div style={{ flex:1, overflowY:"auto", padding:"0 16px 100px" }}>
        {Array.from({ length: playerCount }, (_, i) => (
          <PlayerCard
            key={i}
            index={i}
            name={names[i]}
            avatarColor={colors[i]}
            customization={customizations[i]}
            onNameChange={n => setNames(prev => { const a=[...prev]; a[i]=n; return a; })}
            onColorChange={c => setColors(prev => { const a=[...prev]; a[i]=c; return a; })}
            onOpenBuilder={() => setBuilderIndex(i)}
          />
        ))}
      </div>

      {/* スタートボタン（固定下部） */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0,
        padding:"12px 16px",
        paddingBottom:"max(20px, env(safe-area-inset-bottom))",
        backgroundColor:"var(--color-bg)",
        borderTop:"2px solid var(--color-border)",
      }}>
        <button onClick={handleStart} style={{
          width:"100%", padding:"16px 0",
          borderRadius:14, fontFamily:"'DotGothic16',monospace",
          fontSize:20, fontWeight:"bold", letterSpacing:"0.1em",
          backgroundColor:"var(--color-gold)", color:"#1f2937",
          border:"none",
          boxShadow:"0 6px 0 #a16207, 0 8px 16px rgba(234,179,8,0.4)",
          cursor:"pointer",
        }}>
          🎮 ゲームスタート！
        </button>
      </div>
    </div>
  );
}
