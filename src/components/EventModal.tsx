"use client";
import { useState, useEffect, useRef } from "react";
import type { GameEvent, Player } from "@/types/game";
import { CATEGORY_INFO, JOB_LABELS, AVATAR_COLORS } from "@/types/game";
import { DotAvatar } from "./DotAvatar";

interface Props {
  event:     GameEvent;
  player:    Player;
  onDismiss: () => void;
  isMyTurn?: boolean;
}

// ============================================================
// ユーティリティ
// ============================================================
function formatMoney(m: number): string {
  if (m === 0) return "0円";
  const sign = m > 0 ? "+" : "-";
  const abs  = Math.abs(m);
  if (abs >= 10000) return `${sign}${(abs / 10000).toFixed(1)}億円`;
  if (abs >= 1)     return `${sign}${abs.toLocaleString()}万円`;
  return `${sign}${Math.round(abs * 10000).toLocaleString()}円`;
}

function getRarity(event: GameEvent): "normal" | "rare" | "legendary" {
  const e = event.effect;
  const impact = Math.abs(e.money ?? 0) / 100 + Math.abs(e.happiness ?? 0) + Math.abs(e.fame ?? 0);
  if (impact >= 35) return "legendary";
  if (impact >= 18) return "rare";
  return "normal";
}

// ── シーン背景（SFCのゾーン背景風） ──────────
const SCENE_BG: Record<string, { bg: string; darkBg: string; pattern: string }> = {
  love:   { bg: "#e84060", darkBg: "#a02040", pattern: "#c02050" },
  work:   { bg: "#3a9850", darkBg: "#1a6030", pattern: "#2a7840" },
  money:  { bg: "#d09010", darkBg: "#906008", pattern: "#b07010" },
  social: { bg: "#4858c8", darkBg: "#283898", pattern: "#3848a8" },
  life:   { bg: "#2890a8", darkBg: "#186078", pattern: "#1878a0" },
  chance: { bg: "#8848c0", darkBg: "#582898", pattern: "#7038a8" },
};
const SCENE_LEGENDARY = { bg: "#a07010", darkBg: "#604008", pattern: "#886000" };

// ── 効果行 ────────────────────────────────────
interface EffectRow { icon: string; label: string; value: string; positive: boolean }
function buildEffects(event: GameEvent, player: Player): EffectRow[] {
  const e = event.effect;
  const rows: EffectRow[] = [];
  if (e.moneyHalf) {
    rows.push({ icon: "💰", label: "資産", value: `→${Math.floor(player.money / 2).toLocaleString()}万円`, positive: false });
  } else if (e.money !== undefined) {
    rows.push({ icon: "💰", label: "資産", value: formatMoney(e.money), positive: e.money > 0 });
  }
  if (e.happiness !== undefined) rows.push({ icon: "😊", label: "幸福", value: `${e.happiness > 0 ? "+" : ""}${e.happiness}`, positive: e.happiness > 0 });
  if (e.fame      !== undefined) rows.push({ icon: "⭐", label: "知名", value: `${e.fame > 0 ? "+" : ""}${e.fame}`, positive: e.fame > 0 });
  if (e.moveSquares !== undefined) rows.push({ icon: "🎲", label: "移動", value: `${e.moveSquares > 0 ? "+" : ""}${e.moveSquares}マス`, positive: e.moveSquares > 0 });
  if (e.rollAgain)    rows.push({ icon: "🎯", label: "", value: "もう一度！", positive: true });
  if (e.marry)        rows.push({ icon: "💒", label: "", value: "結婚！",      positive: true });
  if (e.divorce)      rows.push({ icon: "💔", label: "", value: "離婚…",       positive: false });
  if (e.getPet)       rows.push({ icon: "🐾", label: "", value: "ペット！",    positive: true });
  if (e.startCompany) rows.push({ icon: "🚀", label: "", value: "起業！",      positive: true });
  if (e.setJob) rows.push({ icon: "💼", label: "職業", value: `→ ${JOB_LABELS[e.setJob]}`, positive: e.setJob !== "none" });
  return rows;
}

// ============================================================
// シーン（黄枠フレーム）
// ============================================================
function SceneFrame({
  event, player, phase,
}: { event: GameEvent; player: Player; phase: "back" | "front" }) {
  const rarity   = getRarity(event);
  const scene    = rarity === "legendary" ? SCENE_LEGENDARY : (SCENE_BG[event.category] ?? SCENE_BG.chance);
  const color    = AVATAR_COLORS[player.avatar.color];
  const isPos    = event.isPositive;

  // ?模様背景（裏面）
  if (phase === "back") {
    return (
      <div style={{
        flex: 1, position: "relative", overflow: "hidden",
        background: "#1a6030",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        {/* ？タイルパターン */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 22px, rgba(0,0,0,0.12) 22px, rgba(0,0,0,0.12) 23px), repeating-linear-gradient(90deg, transparent, transparent 22px, rgba(0,0,0,0.12) 22px, rgba(0,0,0,0.12) 23px)`,
        }} />
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexWrap: "wrap",
          opacity: 0.18, fontSize: 18, userSelect: "none", overflow: "hidden",
          lineHeight: 1.4, letterSpacing: 4,
        }}>
          {"？".repeat(120)}
        </div>

        {rarity !== "normal" && (
          <div style={{
            padding: "4px 16px", marginBottom: 12,
            background: rarity === "legendary" ? "#f5b800" : "#cc44ff",
            color: "#000", fontWeight: "bold", fontSize: 12, borderRadius: 2,
            border: "2px solid #000",
            fontFamily: "'DotGothic16', monospace",
            position: "relative", zIndex: 1,
          }}>
            {rarity === "legendary" ? "★ LEGENDARY ★" : "◆ RARE ◆"}
          </div>
        )}

        <div style={{
          fontSize: 64, position: "relative", zIndex: 1,
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))",
        }}>？</div>

        <div
          className="anim-blink"
          style={{
            marginTop: 12, fontSize: 12, fontWeight: "bold",
            color: "rgba(255,255,255,0.8)", letterSpacing: "0.15em",
            fontFamily: "'DotGothic16', monospace",
            position: "relative", zIndex: 1,
          }}
        >
          ▶ カードをひいています…
        </div>
      </div>
    );
  }

  // シーン表面
  return (
    <div style={{
      flex: 1, position: "relative", overflow: "hidden",
      background: scene.bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
    }}>
      {/* グラデーション背景 */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 50% 30%, ${scene.pattern}80 0%, ${scene.darkBg} 100%)`,
      }} />

      {/* レジェンダリーはキラキラ */}
      {rarity === "legendary" && (
        <div style={{
          position: "absolute", inset: 0, overflow: "hidden",
          display: "flex", flexWrap: "wrap", opacity: 0.25,
          fontSize: 20, lineHeight: 1.4, letterSpacing: 4, userSelect: "none",
        }}>
          {"★".repeat(60)}
        </div>
      )}

      {/* ポジティブなら明るいパターン */}
      {isPos && rarity === "normal" && (
        <div style={{
          position: "absolute", inset: 0, overflow: "hidden",
          display: "flex", flexWrap: "wrap", opacity: 0.08,
          fontSize: 16, lineHeight: 1.5, letterSpacing: 6, userSelect: "none",
        }}>
          {"♪".repeat(80)}
        </div>
      )}

      {/* カテゴリバッジ */}
      <div style={{
        position: "absolute", top: 8, left: 8, zIndex: 2,
        padding: "2px 8px",
        background: "rgba(0,0,0,0.55)", border: "2px solid rgba(255,255,255,0.4)",
        borderRadius: 2, fontSize: 10, color: "#fff",
        fontFamily: "'DotGothic16', monospace",
      }}>
        {CATEGORY_INFO[event.category].icon} {CATEGORY_INFO[event.category].label}
      </div>

      {/* レア度バッジ */}
      {rarity !== "normal" && (
        <div style={{
          position: "absolute", top: 8, right: 8, zIndex: 2,
          padding: "2px 8px",
          background: rarity === "legendary" ? "#f5b800" : "#7c3aed",
          color: rarity === "legendary" ? "#000" : "#fff",
          fontSize: 9, fontWeight: "bold", borderRadius: 2,
          fontFamily: "'DotGothic16', monospace",
        }}>
          {rarity === "legendary" ? "★LEGENDARY" : "◆RARE"}
        </div>
      )}

      {/* 絵文字（右上エリア） */}
      <div style={{
        position: "absolute", bottom: 60, right: 12,
        fontSize: 40, filter: rarity === "legendary" ? "drop-shadow(0 0 8px #ffd700)" : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
        zIndex: 2,
      }}>
        {event.emoji}
      </div>

      {/* ピクセルキャラ（中央下） */}
      <div style={{
        position: "relative", zIndex: 2,
        marginBottom: 4,
        filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.6))`,
      }}>
        <DotAvatar player={player} size={60} shadow />
      </div>
    </div>
  );
}

// ============================================================
// ダイアログボックス（SFCスタイル）
// ============================================================
function DialogBox({
  event, player, effects, onDismiss, isMyTurn,
}: {
  event: GameEvent; player: Player;
  effects: EffectRow[];
  onDismiss: () => void; isMyTurn: boolean;
}) {
  const [textIdx, setTextIdx]     = useState(0);
  const [showEffects, setShowEff] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fullText = event.title + "\n" + event.story;

  // タイプライター
  useEffect(() => {
    if (textIdx < fullText.length) {
      timerRef.current = setTimeout(() => setTextIdx(n => n + 1), 20);
    } else {
      setTimeout(() => setShowEff(true), 200);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [textIdx, fullText]);

  const isPos   = event.isPositive;
  const rarity  = getRarity(event);
  const accent  = isPos ? "#6effa0" : "#ff8080";

  return (
    <div style={{
      flexShrink: 0,
      background: "#1a2080",
      border: "4px solid #8090e0",
      boxShadow: "inset 0 0 0 2px #2a30a0, inset 0 0 0 3px rgba(255,255,255,0.08)",
      padding: "10px 12px 8px",
    }}>
      {/* 伏線回収バナー */}
      {event.isCallback && (
        <div style={{
          background: "linear-gradient(90deg,#3a0060,#600030)",
          border: "1px solid #cc44ff",
          borderRadius: 3,
          padding: "4px 8px",
          marginBottom: 6,
          textAlign: "center",
          fontSize: 10,
          fontFamily: "'DotGothic16', monospace",
          color: "#f0b0ff",
          letterSpacing: 1,
        }}>
          🔮 あの時の選択が返ってきた！
          {event.callbackNote && (
            <div style={{ fontSize: 9, color: "#c080dd", marginTop: 2 }}>
              {event.callbackNote}
            </div>
          )}
        </div>
      )}

      {/* プレイヤー名 + 金額 */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 6, paddingBottom: 4,
        borderBottom: "1px solid rgba(255,255,255,0.15)",
      }}>
        <span style={{
          color: "#c0c8ff", fontSize: 10,
          fontFamily: "'DotGothic16', monospace",
        }}>
          {player.name}
        </span>
        <span style={{
          color: player.money < 0 ? "#ff6060" : "#60ff90",
          fontSize: 11, fontWeight: "bold",
          fontFamily: "'DotGothic16', monospace",
        }}>
          {formatMoney(player.money)}
        </span>
      </div>

      {/* タイトル */}
      <div style={{
        fontSize: "var(--fs-lg)", fontWeight: "bold", color: accent, marginBottom: 4,
        textShadow: `0 0 8px ${accent}88`,
        fontFamily: "'DotGothic16', monospace",
        lineHeight: 1.3,
        minHeight: "1.3em",
      }}>
        {fullText.slice(0, textIdx).split("\n")[0]}
        {textIdx < event.title.length && <span className="anim-blink" style={{ marginLeft: 2 }}>█</span>}
      </div>

      {/* ストーリー（タイトル表示後） */}
      {textIdx > event.title.length && (
        <div style={{
          fontSize: "var(--fs-sm)", color: "#c0c8ff", lineHeight: 1.6, marginBottom: 6,
          minHeight: "2.8em",
          fontFamily: "'DotGothic16', monospace",
        }}>
          {fullText.slice(event.title.length + 1, textIdx)}
          {textIdx < fullText.length && (
            <span className="anim-blink" style={{ marginLeft: 2 }}>█</span>
          )}
        </div>
      )}

      {/* エフェクト一覧（テキスト完了後） */}
      {showEffects && effects.length > 0 && (
        <div className="anim-slide-up" style={{
          display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6,
        }}>
          {effects.map((ef, i) => (
            <div key={i} style={{
              padding: "2px 6px",
              background: ef.positive ? "rgba(60,200,100,0.25)" : "rgba(200,60,60,0.25)",
              border: `1px solid ${ef.positive ? "#40d060" : "#d04040"}`,
              borderRadius: 2,
              fontSize: 10, fontWeight: "bold",
              color: ef.positive ? "#60ff90" : "#ff8080",
              fontFamily: "'DotGothic16', monospace",
            }}>
              {ef.icon} {ef.label && `${ef.label}: `}{ef.value}
            </div>
          ))}
        </div>
      )}

      {/* OKボタン / 待機 */}
      {showEffects && isMyTurn && (
        <button
          onClick={onDismiss}
          className="anim-pop-in btn-retro"
          style={{
            display: "flex", width: "100%",
            alignItems: "center", justifyContent: "center",
            minHeight: "var(--touch-h)",
            background: "linear-gradient(180deg, #2a40b0, #1a2090)",
            color: "#ffffff", fontWeight: "bold", fontSize: "var(--fs-lg)",
            border: "3px solid #8090e0",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1), 3px 3px 0 #0a1060",
            borderRadius: 2,
            letterSpacing: "0.15em",
            fontFamily: "'DotGothic16', monospace",
          }}
        >
          ▶ OK！
        </button>
      )}

      {showEffects && !isMyTurn && (
        <div className="anim-blink" style={{
          textAlign: "center", padding: "10px 0",
          color: "#6070c0", fontSize: 11,
          fontFamily: "'DotGothic16', monospace",
        }}>
          ● {player.name} の操作を待っています…
        </div>
      )}

      {/* テキスト表示中はタップで全表示 */}
      {textIdx < fullText.length && (
        <div
          onClick={() => { setTextIdx(fullText.length); setShowEff(true); }}
          style={{
            textAlign: "right", fontSize: 9, color: "#5060a0",
            paddingTop: 4, cursor: "pointer",
            fontFamily: "'DotGothic16', monospace",
          }}
        >
          タップでスキップ ▶
        </div>
      )}
    </div>
  );
}

// ============================================================
// メインモーダル（SFCスタイル）
// ============================================================
export function EventModal({ event, player, onDismiss, isMyTurn = true }: Props) {
  const [revealed, setRevealed] = useState(false);
  const rarity  = getRarity(event);
  const effects = buildEffects(event, player);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 900);
    return () => clearTimeout(t);
  }, []);

  // SFCの黄枠フレーム
  const frameColor =
    rarity === "legendary" ? "#f5b800"
    : rarity === "rare"    ? "#cc44ff"
    : "#f5b800"; // SFCの黄色

  return (
    <div
      className="fixed inset-0 z-50"
      style={{
        // SFCの青いLIFE2背景
        background: "#1a2890",
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.04) 28px, rgba(255,255,255,0.04) 29px),
          repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(255,255,255,0.04) 28px, rgba(255,255,255,0.04) 29px)
        `,
        display: "flex", flexDirection: "column",
        paddingTop: "env(safe-area-inset-top, 12px)",
        paddingBottom: "env(safe-area-inset-bottom, 16px)",
      }}
    >
      {/* 薄いLIFE 2ウォーターマーク */}
      <div style={{
        position: "absolute", inset: 0, overflow: "hidden",
        display: "flex", flexWrap: "wrap", alignContent: "flex-start",
        opacity: 0.06, userSelect: "none", padding: 8,
        fontSize: 22, fontWeight: "bold", letterSpacing: 6, lineHeight: 1.6,
        color: "#fff",
        fontFamily: "'DotGothic16', monospace",
      }}>
        {"LIFE 2 LIFE 2 LIFE 2 LIFE 2 ".repeat(40)}
      </div>

      {/* ─── シーンフレーム（SFCの黄枠） ─── */}
      <div style={{
        flex: 1, margin: "8px 10px 6px",
        border: `5px solid ${frameColor}`,
        boxShadow: `
          0 0 0 2px #000,
          0 0 0 3px ${frameColor}44,
          inset 0 0 0 1px rgba(255,255,255,0.2),
          0 0 20px ${frameColor}44
        `,
        overflow: "hidden",
        position: "relative",
        display: "flex", flexDirection: "column",
        borderRadius: 2,
        minHeight: 0,
      }}>
        {revealed ? (
          <SceneFrame event={event} player={player} phase="front" />
        ) : (
          <SceneFrame event={event} player={player} phase="back" />
        )}
      </div>

      {/* ─── ダイアログボックス ─── */}
      {revealed && (
        <div style={{ margin: "0 6px 4px", flexShrink: 0 }}>
          <DialogBox
            event={event} player={player} effects={effects}
            onDismiss={onDismiss} isMyTurn={isMyTurn}
          />
        </div>
      )}

      {/* 非表示中のプレースホルダー */}
      {!revealed && (
        <div style={{
          height: 100, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div className="anim-blink" style={{
            color: "rgba(255,255,255,0.4)", fontSize: 11,
            fontFamily: "'DotGothic16', monospace",
            letterSpacing: "0.15em",
          }}>
            ● しばらくお待ちください…
          </div>
        </div>
      )}
    </div>
  );
}
