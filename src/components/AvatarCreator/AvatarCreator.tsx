"use client";

import { useState, useCallback } from "react";
import type { AvatarConfig, AgeStage } from "@/types/avatar";
import {
  DEFAULT_AVATAR_CONFIG, AGE_STAGE_META, AGE_STAGES, getAgeStage,
} from "@/types/avatar";
import {
  SKIN_TONES, HAIR_COLORS, CLOTHES_COLORS,
  HAIR_STYLES_MALE, HAIR_STYLES_FEMALE,
  EYE_TYPES, BROW_TYPES, MOUTH_TYPES,
  CLOTHES_TYPES, ACCESSORIES,
} from "@/data/avatarParts";
import { AvatarSVG } from "./AvatarSVG";

// ─── 定数 ────────────────────────────────────────────────────
const PANEL_BG   = "#0e0a28";
const BORDER     = "#2a1860";
const GOLD       = "#FFD700";
const MUTED      = "#9980cc";
const CARD_BG    = "#12103a";
const SEL_BG     = "rgba(255,215,0,0.12)";

type Tab = "face" | "hair" | "clothes" | "color" | "acc";
const TABS: { id: Tab; label: string }[] = [
  { id: "face",    label: "顔" },
  { id: "hair",    label: "髪" },
  { id: "clothes", label: "服" },
  { id: "color",   label: "色" },
  { id: "acc",     label: "アクセ" },
];

// ─── 共通スタイルヘルパー ──────────────────────────────────────
function selBtn(selected: boolean): React.CSSProperties {
  return {
    border:          selected ? `2px solid ${GOLD}` : `1.5px solid ${BORDER}`,
    backgroundColor: selected ? SEL_BG : CARD_BG,
    boxShadow:       selected ? `0 0 8px rgba(255,215,0,0.35)` : "none",
    borderRadius:    8,
    cursor:          "pointer",
    padding:         "6px 4px",
    transition:      "all 0.12s",
    display:         "flex",
    flexDirection:   "column",
    alignItems:      "center",
    gap:             4,
  };
}

// ─── 色スウォッチグリッド ──────────────────────────────────────
function ColorGrid({
  options, selected, onSelect,
}: {
  options: { hex: string; name: string }[];
  selected: string;
  onSelect: (hex: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(o => {
        const sel = selected === o.hex;
        return (
          <button
            key={o.hex}
            onClick={() => onSelect(o.hex)}
            title={o.name}
            style={{
              width: 40, height: 40, borderRadius: 8,
              backgroundColor: o.hex,
              border:     sel ? `3px solid ${GOLD}` : `2px solid ${BORDER}`,
              boxShadow:  sel ? `0 0 10px rgba(255,215,0,0.55)` : "none",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {sel && <span style={{ color: "#fff", fontSize: 14, textShadow: "0 1px 2px #000" }}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}

// ─── 数値IDスウォッチグリッド（色付きドット） ─────────────────
function ColorIdGrid({
  options, selected, onSelect,
}: {
  options: { id: number; hex: string; name: string }[];
  selected: number;
  onSelect: (id: number) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(o => {
        const sel = selected === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onSelect(o.id)}
            title={o.name}
            style={{
              width: 40, height: 40, borderRadius: 8,
              backgroundColor: o.hex,
              border:     sel ? `3px solid ${GOLD}` : `2px solid ${BORDER}`,
              boxShadow:  sel ? `0 0 10px rgba(255,215,0,0.55)` : "none",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {sel && <span style={{ color: "#fff", fontSize: 14, textShadow: "0 1px 2px #000" }}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}

// ─── 数値選択グリッド（文字サムネイル） ───────────────────────
function PartGrid<T extends { id: number; name: string }>({
  options, selected, onSelect, renderThumb,
}: {
  options: T[];
  selected: number;
  onSelect: (id: number) => void;
  renderThumb?: (item: T) => React.ReactNode;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
      {options.map(o => {
        const sel = selected === o.id;
        return (
          <button key={o.id} onClick={() => onSelect(o.id)} style={selBtn(sel)}>
            {renderThumb ? (
              <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {renderThumb(o)}
              </div>
            ) : (
              <span style={{
                fontSize: 10, color: sel ? GOLD : MUTED,
                fontFamily: "'DotGothic16',monospace", textAlign: "center",
                lineHeight: 1.2,
              }}>
                {o.id}
              </span>
            )}
            <span style={{
              fontSize: 9, color: sel ? GOLD : MUTED,
              fontFamily: "'DotGothic16',monospace", textAlign: "center",
              lineHeight: 1.2, letterSpacing: "0.02em",
            }}>
              {o.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── セクションラベル ─────────────────────────────────────────
function SLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      color: MUTED, fontSize: 10,
      fontFamily: "'DotGothic16',monospace",
      letterSpacing: "0.1em", marginBottom: 6, marginTop: 12,
      borderLeft: `3px solid ${BORDER}`, paddingLeft: 8,
    }}>
      {children}
    </div>
  );
}

// ─── 年齢ステージサムネイル行 ─────────────────────────────────
function AgeStageRow({ config }: { config: AvatarConfig }) {
  return (
    <div style={{
      flexShrink: 0,
      overflowX: "auto",
      borderTop: `1px solid ${BORDER}`,
      padding: "10px 12px 6px",
      backgroundColor: PANEL_BG,
    }}>
      <div style={{
        fontFamily: "'DotGothic16',monospace", fontSize: 9,
        color: MUTED, letterSpacing: "0.1em", marginBottom: 8,
      }}>
        成長イメージ — 同じ顔のまま変化
      </div>
      <div style={{ display: "flex", gap: 8, width: "max-content" }}>
        {AGE_STAGES.map(stage => {
          const meta = AGE_STAGE_META[stage];
          const stageConfig: AvatarConfig = { ...config, ageStage: stage };
          return (
            <div key={stage} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            }}>
              <div style={{
                width: 44, height: 66,
                borderRadius: 6,
                border: stage === config.ageStage ? `1.5px solid ${GOLD}` : `1px solid ${BORDER}`,
                backgroundColor: CARD_BG,
                overflow: "hidden",
                display: "flex", alignItems: "flex-end", justifyContent: "center",
              }}>
                <AvatarSVG config={stageConfig} width={44} height={66}/>
              </div>
              <span style={{
                fontSize: 9, color: stage === config.ageStage ? GOLD : MUTED,
                fontFamily: "'DotGothic16',monospace",
              }}>
                {meta.label}
              </span>
              <span style={{ fontSize: 8, color: "#6040a0", fontFamily: "'DotGothic16',monospace" }}>
                {meta.sub}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// メインコンポーネント
// ============================================================
interface Props {
  playerName:  string;
  playerIndex: number;
  initial?:    AvatarConfig;
  onDone:      (config: AvatarConfig) => void;
  onBack:      () => void;
}

export function AvatarCreator({
  playerName, playerIndex, initial, onDone, onBack,
}: Props) {
  const [config, setConfig] = useState<AvatarConfig>(
    initial ?? { ...DEFAULT_AVATAR_CONFIG }
  );
  const [tab, setTab]   = useState<Tab>("face");

  const set = useCallback(<K extends keyof AvatarConfig>(k: K, v: AvatarConfig[K]) => {
    setConfig(prev => ({ ...prev, [k]: v }));
  }, []);

  const ACCENTS = ["#ef4444","#3b82f6","#22c55e","#f59e0b"];
  const accent  = ACCENTS[playerIndex % 4];
  const hairStyles = config.gender === "male" ? HAIR_STYLES_MALE : HAIR_STYLES_FEMALE;

  return (
    <div style={{
      position:        "fixed", inset: 0, zIndex: 200,
      backgroundColor: "#050315",
      display:         "flex", flexDirection: "column",
      height:          "100dvh", overflow: "hidden",
    }}>

      {/* ── ヘッダー ───────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 14px",
        borderBottom: `2px solid ${BORDER}`,
        backgroundColor: "#07041a",
      }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", color: MUTED,
          fontSize: 22, cursor: "pointer", padding: 4, lineHeight: 1,
        }}>◀</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ color: accent, fontFamily: "'DotGothic16',monospace",
            fontSize: 10, letterSpacing: "0.14em" }}>
            PLAYER {playerIndex + 1}
          </div>
          <div style={{ color: GOLD, fontFamily: "'DotGothic16',monospace", fontSize: 14 }}>
            {playerName || `プレイヤー${playerIndex+1}`} のキャラ作成
          </div>
        </div>
        <div style={{ width: 30 }}/>
      </div>

      {/* ── メインエリア（プレビュー + パネル横並び or 縦積み） ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* プレビュー */}
        <div style={{
          flexShrink: 0,
          background: "linear-gradient(180deg,#0a0630 0%,#050315 100%)",
          borderBottom: `1px solid ${BORDER}`,
          display: "flex", justifyContent: "center", alignItems: "center",
          padding: "12px 0 8px",
        }}>
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", inset: -4,
              borderRadius: 12,
              border: `1.5px solid ${BORDER}`,
              pointerEvents: "none",
            }}/>
            <AvatarSVG config={config} width={108} height={162}/>
          </div>

          {/* 性別切り替え（プレビュー横） */}
          <div style={{
            display: "flex", flexDirection: "column", gap: 6, marginLeft: 16,
          }}>
            {(["male","female"] as const).map(g => (
              <button key={g}
                onClick={() => { set("gender", g); set("hairStyle", 1); }}
                style={{
                  padding: "6px 10px", borderRadius: 6, cursor: "pointer",
                  border:          config.gender === g ? `2px solid ${GOLD}` : `1.5px solid ${BORDER}`,
                  backgroundColor: config.gender === g ? SEL_BG : CARD_BG,
                  color:           config.gender === g ? GOLD : MUTED,
                  fontFamily:      "'DotGothic16',monospace", fontSize: 11,
                }}>
                {g === "male" ? "♂ 男" : "♀ 女"}
              </button>
            ))}
          </div>
        </div>

        {/* タブバー */}
        <div style={{
          flexShrink: 0,
          display: "flex",
          borderBottom: `2px solid ${BORDER}`,
          backgroundColor: "#07041a",
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "9px 0",
              background: "none", border: "none",
              borderBottom: tab === t.id ? `3px solid ${GOLD}` : "3px solid transparent",
              color:        tab === t.id ? GOLD : "#6040a0",
              fontFamily:   "'DotGothic16',monospace", fontSize: 11,
              cursor: "pointer", letterSpacing: "0.06em",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* オプションエリア（スクロール） */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px 16px" }}>

          {/* ── 顔タブ ─── */}
          {tab === "face" && (<>
            <SLabel>肌の色</SLabel>
            <ColorIdGrid
              options={Object.values(SKIN_TONES)}
              selected={config.skinTone}
              onSelect={v => set("skinTone", v as AvatarConfig["skinTone"])}
            />

            <SLabel>目</SLabel>
            <PartGrid
              options={EYE_TYPES}
              selected={config.eyeType}
              onSelect={v => set("eyeType", v)}
              renderThumb={o => (
                <span style={{ fontSize: 9, color: MUTED, fontFamily: "monospace" }}>{o.id}</span>
              )}
            />

            <SLabel>眉</SLabel>
            <PartGrid
              options={BROW_TYPES}
              selected={config.browType}
              onSelect={v => set("browType", v)}
            />

            <SLabel>口</SLabel>
            <PartGrid
              options={MOUTH_TYPES}
              selected={config.mouthType}
              onSelect={v => set("mouthType", v)}
            />
          </>)}

          {/* ── 髪タブ ─── */}
          {tab === "hair" && (<>
            <SLabel>髪型（{config.gender === "male" ? "男性" : "女性"} 10種）</SLabel>
            <PartGrid
              options={hairStyles}
              selected={config.hairStyle}
              onSelect={v => set("hairStyle", v)}
            />

            <SLabel>髪の色</SLabel>
            <ColorIdGrid
              options={Object.values(HAIR_COLORS)}
              selected={config.hairColor}
              onSelect={v => set("hairColor", v)}
            />
          </>)}

          {/* ── 服タブ ─── */}
          {tab === "clothes" && (<>
            <SLabel>服の種類（10種）</SLabel>
            <PartGrid
              options={CLOTHES_TYPES}
              selected={config.clothesType}
              onSelect={v => set("clothesType", v)}
            />
          </>)}

          {/* ── 色タブ ─── */}
          {tab === "color" && (<>
            <SLabel>服の色</SLabel>
            <ColorGrid
              options={CLOTHES_COLORS}
              selected={config.clothesColor}
              onSelect={v => set("clothesColor", v)}
            />
          </>)}

          {/* ── アクセタブ ─── */}
          {tab === "acc" && (<>
            <SLabel>アクセサリー</SLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
              {/* なし */}
              <button onClick={() => set("accessory", null)} style={selBtn(config.accessory === null)}>
                <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 16, color: MUTED }}>×</span>
                </div>
                <span style={{ fontSize: 9, color: config.accessory === null ? GOLD : MUTED,
                  fontFamily: "'DotGothic16',monospace" }}>なし</span>
              </button>
              {ACCESSORIES.filter(a => a.id !== 8).map(a => (
                <button key={a.id} onClick={() => set("accessory", a.id)}
                  style={selBtn(config.accessory === a.id)}>
                  <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 9, color: MUTED, fontFamily: "monospace", textAlign: "center" }}>
                      {a.id}
                    </span>
                  </div>
                  <span style={{ fontSize: 9,
                    color: config.accessory === a.id ? GOLD : MUTED,
                    fontFamily: "'DotGothic16',monospace", textAlign: "center", lineHeight: 1.2 }}>
                    {a.name}
                  </span>
                </button>
              ))}
            </div>
          </>)}
        </div>

        {/* 年齢ステージ行 */}
        <AgeStageRow config={config}/>
      </div>

      {/* ── 完成ボタン（固定下部） ─────────────────────────── */}
      <div style={{
        flexShrink: 0,
        padding: "10px 16px",
        paddingBottom: "max(10px, env(safe-area-inset-bottom))",
        backgroundColor: "#07041a",
        borderTop: `2px solid ${BORDER}`,
      }}>
        <button
          onClick={() => onDone(config)}
          style={{
            width: "100%", padding: "14px 0",
            borderRadius: 12,
            background:   `linear-gradient(180deg,#c8a000,#8a6000)`,
            color:        "#000", fontFamily: "'DotGothic16',monospace",
            fontSize: 18, fontWeight: "bold", letterSpacing: "0.14em",
            border:  `3px solid ${GOLD}`,
            boxShadow: `0 4px 0 #5a4000, 0 0 20px rgba(255,215,0,0.35)`,
            cursor: "pointer",
          }}
        >
          ✓ 完成！
        </button>
      </div>
    </div>
  );
}
