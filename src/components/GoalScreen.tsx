"use client";
import { useState } from "react";
import type { Player } from "@/types/game";
import { AVATAR_COLORS, LIFE_STAGE_INFO, JOB_LABELS } from "@/types/game";
import { getTitleDef } from "@/utils/titles";

interface Props {
  players:  Player[];
  onReset:  () => void;
}

type TabType = "ranking" | "history" | "titles";
type RankType = "money" | "happiness" | "overall";

function overallScore(p: Player) {
  // マイナス資産はスコアをそのまま減らす（借金はペナルティ）
  return Math.round(p.money * 0.4 + p.happiness * 80 * 0.35 + p.fame * 80 * 0.25);
}

// ---------- 人生年表タイムライン ----------
function LifeTimeline({ player }: { player: Player }) {
  const ci = AVATAR_COLORS[player.avatar.color];

  // 選択・重要イベントのみ表示（age 昇順でソート）
  const entries = [...player.history]
    .filter(h => h.age !== undefined || h.isChoice)
    .sort((a, b) => {
      const ageA = a.age ?? 999;
      const ageB = b.age ?? 999;
      if (ageA !== ageB) return ageA - ageB;
      return (a.turn ?? 0) - (b.turn ?? 0);
    });

  // age ごとにグループ化
  const grouped: { age: number; items: typeof entries }[] = [];
  for (const h of entries) {
    const age = h.age ?? 0;
    const last = grouped[grouped.length - 1];
    if (last && last.age === age) {
      last.items.push(h);
    } else {
      grouped.push({ age, items: [h] });
    }
  }

  return (
    <div
      className="rounded p-3 mb-4"
      style={{ background: "#060218", border: `2px solid ${ci.bg}` }}
    >
      {/* ヘッダー */}
      <div className="flex items-center gap-2 mb-3 pb-2"
        style={{ borderBottom: `1px solid ${ci.bg}33` }}>
        <div className="flex items-center justify-center text-base rounded-sm flex-shrink-0"
          style={{ width: 30, height: 30, backgroundColor: ci.bg, border: `2px solid ${ci.border}` }}>
          {player.avatar.emoji}
        </div>
        <div>
          <span className="font-bold retro-text" style={{ color: ci.bg, fontSize: 13 }}>
            {player.name}
          </span>
          <span style={{ color: "#5040a0", fontSize: 9, marginLeft: 8 }}>
            {LIFE_STAGE_INFO[player.lifeStage].emoji} {LIFE_STAGE_INFO[player.lifeStage].label}
          </span>
        </div>
      </div>

      {/* 年表本体 */}
      {grouped.length === 0 ? (
        <div style={{ color: "#4a3880", fontSize: 11, textAlign: "center", padding: "8px 0" }}>
          履歴なし
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          {/* 縦ライン */}
          <div style={{
            position: "absolute", left: 32, top: 8, bottom: 8,
            width: 2, background: `${ci.bg}33`,
          }} />

          {grouped.map(({ age, items }, gi) => (
            <div key={gi} className="flex items-start gap-3 mb-2">
              {/* 年齢バッジ */}
              <div className="flex-shrink-0 flex items-center justify-center font-bold retro-text"
                style={{
                  width: 40, height: 22,
                  background: age === 0 ? ci.bg : "#0a0440",
                  border: `1px solid ${ci.bg}66`,
                  borderRadius: 2,
                  color: age === 0 ? "#fff" : ci.bg,
                  fontSize: 9,
                  position: "relative", zIndex: 1,
                }}>
                {age}歳
              </div>

              {/* イベントリスト */}
              <div style={{ flex: 1, paddingTop: 2 }}>
                {items.map((h, hi) => (
                  <div key={hi} className="flex items-start gap-1.5 mb-0.5">
                    <span style={{ fontSize: 12, lineHeight: 1.4 }}>{h.emoji}</span>
                    <span style={{
                      fontSize: 10,
                      color: h.isChoice ? "#ffd700" : "#c4b5d4",
                      fontWeight: h.isChoice ? "bold" : "normal",
                      lineHeight: 1.4,
                    }}>
                      {h.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- ランキングカード ----------
function RankCard({ player, rank, label, score, isFirst }: {
  player: Player; rank: number; label: string; score: string; isFirst: boolean;
}) {
  const ci       = AVATAR_COLORS[player.avatar.color];
  const stage    = LIFE_STAGE_INFO[player.lifeStage];
  const MEDALS   = ["🥇", "🥈", "🥉", "4️⃣"];
  const isDebt   = score.startsWith("借金");
  return (
    <div
      className="flex items-center gap-2 p-3 rounded"
      style={{
        background: "#08041a",
        border: isFirst ? "2px solid var(--color-gold)" : "2px solid #2a1060",
        boxShadow: isFirst ? "0 0 12px rgba(255,204,0,0.2)" : "none",
        marginBottom: 8,
      }}
    >
      <span className="text-2xl w-8 text-center flex-shrink-0">{MEDALS[rank]}</span>
      <div className="flex items-center justify-center text-xl rounded-sm flex-shrink-0"
        style={{ width: 38, height: 38, backgroundColor: ci.bg, border: `2px solid ${ci.border}` }}>
        {player.avatar.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-bold retro-text truncate" style={{ color: isFirst ? "var(--color-gold)" : "#e2d9f5", fontSize: 13 }}>
            {player.name}
          </span>
          <span style={{ color: stage.color, fontSize: 9 }}>{stage.emoji}</span>
        </div>
        <div style={{ color: "#6050a0", fontSize: 9 }}>{JOB_LABELS[player.job]}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div style={{ color: "#6050a0", fontSize: 9 }}>{label}</div>
        <div className="font-bold retro-text" style={{
          color: isDebt ? "var(--color-red)" : isFirst ? "var(--color-green)" : "#c4b5d4",
          fontSize: 12,
        }}>
          {score}
        </div>
      </div>
    </div>
  );
}

// ---------- 称号バッジ ----------
function TitleBadge({ id }: { id: string }) {
  const def = getTitleDef(id);
  if (!def) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 font-bold"
      style={{ background: def.color + "22", color: def.color, border: `1px solid ${def.color}66`, fontSize: 10 }}>
      {def.emoji} {def.name}
    </span>
  );
}

export function GoalScreen({ players, onReset }: Props) {
  const [tab, setTab]          = useState<TabType>("ranking");
  const [rankType, setRankType] = useState<RankType>("money");

  const byMoney     = [...players].sort((a, b) => b.money     - a.money);
  const byHappiness = [...players].sort((a, b) => b.happiness - a.happiness);
  const byOverall   = [...players].sort((a, b) => overallScore(b) - overallScore(a));
  const ranked      = rankType === "money" ? byMoney : rankType === "happiness" ? byHappiness : byOverall;

  const RANK_TABS = [
    { key: "money" as RankType,     icon: "💰", label: "資産" },
    { key: "happiness" as RankType, icon: "😊", label: "幸福度" },
    { key: "overall" as RankType,   icon: "🏆", label: "総合" },
  ];

  function moneyLabel(m: number): string {
    if (m < 0) return `借金 ${Math.abs(m).toLocaleString()}万`;
    return `${m.toLocaleString()}万`;
  }

  function scoreDisplay(p: Player) {
    if (rankType === "money")     return { label: p.money < 0 ? "借金" : "資産", val: moneyLabel(p.money) };
    if (rankType === "happiness") return { label: "幸福度", val: `${p.happiness}/100` };
    return { label: "総合スコア", val: overallScore(p).toLocaleString() };
  }

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100dvh", backgroundColor: "var(--color-bg)" }}>

      {/* ヘッダー */}
      <div
        className="flex-shrink-0 pt-8 pb-3 text-center"
        style={{ background: "linear-gradient(180deg, #1a0850, #08041a)", borderBottom: "3px solid var(--color-gold)" }}
      >
        <div className="text-4xl mb-1">🏆</div>
        <div className="font-bold retro-text" style={{ color: "var(--color-gold)", fontSize: 20, letterSpacing: "0.1em" }}>
          GAME OVER
        </div>
        <div style={{ color: "#6050a0", fontSize: 11 }}>最終結果発表</div>
      </div>

      {/* タブ */}
      <div className="flex-shrink-0 flex" style={{ background: "#08041a", borderBottom: "2px solid #2a1060" }}>
        {(["ranking", "history", "titles"] as TabType[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 font-bold text-center btn-retro"
            style={{
              color: tab === t ? "var(--color-gold)" : "#4a3880",
              borderBottom: tab === t ? "3px solid var(--color-gold)" : "3px solid transparent",
              background: "transparent", fontSize: 11,
            }}
          >
            {t === "ranking" ? "🏆 順位" : t === "history" ? "📖 年表" : "🏅 称号"}
          </button>
        ))}
      </div>

      {/* スクロールエリア */}
      <div className="flex-1 overflow-y-auto px-3 py-3 pb-28">

        {/* ===== ランキングタブ ===== */}
        {tab === "ranking" && (
          <>
            {/* 優勝者バナー */}
            <div className="p-3 mb-3 text-center rounded anim-rare-glow"
              style={{ background: "#1a1400", border: "3px solid var(--color-gold)" }}>
              <div className="text-3xl mb-1">🎉</div>
              <div style={{ color: "#8070a0", fontSize: 10 }}>{RANK_TABS.find(t => t.key === rankType)?.label} 1位</div>
              <div className="flex items-center justify-center gap-3 mt-2">
                <div className="flex items-center justify-center text-2xl rounded-sm"
                  style={{
                    width: 52, height: 52,
                    backgroundColor: AVATAR_COLORS[ranked[0].avatar.color].bg,
                    border: "3px solid var(--color-gold)",
                    boxShadow: "0 0 12px var(--color-gold)",
                  }}>
                  {ranked[0].avatar.emoji}
                </div>
                <div className="text-left">
                  <div className="font-bold retro-text" style={{ color: "var(--color-gold)", fontSize: 18 }}>
                    {ranked[0].name}
                  </div>
                  <div className="font-bold" style={{
                    color: ranked[0].money < 0 && rankType === "money"
                      ? "var(--color-red)"
                      : "var(--color-green)",
                    fontSize: 14,
                  }}>
                    {scoreDisplay(ranked[0]).val}
                  </div>
                </div>
              </div>
            </div>

            {/* ランキング切り替え */}
            <div className="flex rounded mb-3 p-1" style={{ background: "#0a0620", border: "2px solid #2a1060" }}>
              {RANK_TABS.map(rt => (
                <button key={rt.key} onClick={() => setRankType(rt.key)}
                  className="btn-retro flex-1 py-2 text-center font-bold"
                  style={{
                    color: rankType === rt.key ? "var(--color-gold)" : "#4a3880",
                    background: rankType === rt.key ? "#1a1400" : "transparent",
                    border: rankType === rt.key ? "1px solid var(--color-gold)" : "1px solid transparent",
                    fontSize: 11,
                  }}
                >
                  {rt.icon} {rt.label}
                </button>
              ))}
            </div>

            {ranked.map((p, i) => {
              const { label, val } = scoreDisplay(p);
              return <RankCard key={p.id} player={p} rank={i} label={label} score={val} isFirst={i === 0} />;
            })}
          </>
        )}

        {/* ===== 人生履歴タブ ===== */}
        {tab === "history" && (
          <>
            <div className="font-bold retro-text mb-3 text-center" style={{ color: "#8070a0", fontSize: 11 }}>
              📖 あなたの人生年表
            </div>
            {players.map(p => <LifeTimeline key={p.id} player={p} />)}
          </>
        )}

        {/* ===== 称号タブ ===== */}
        {tab === "titles" && (
          <>
            <div className="font-bold retro-text mb-3 text-center" style={{ color: "#8070a0", fontSize: 11 }}>
              🏅 獲得した称号
            </div>
            {players.map(p => {
              const ci = AVATAR_COLORS[p.avatar.color];
              return (
                <div key={p.id} className="p-3 rounded mb-3"
                  style={{ background: "#08041a", border: `2px solid ${ci.bg}44` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center text-base rounded-sm"
                      style={{ width: 26, height: 26, backgroundColor: ci.bg }}>
                      {p.avatar.emoji}
                    </div>
                    <span className="font-bold" style={{ color: ci.bg, fontSize: 12 }}>{p.name}</span>
                  </div>
                  {p.titles.length === 0 ? (
                    <span style={{ color: "#4a3880", fontSize: 11 }}>称号なし</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {p.titles.map(t => <TitleBadge key={t} id={t} />)}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* もう一度ボタン（固定） */}
      <div className="fixed bottom-0 left-0 right-0 px-3 pt-2"
        style={{
          background: "#08041a", borderTop: "3px solid var(--color-border)",
          paddingBottom: "max(20px, env(safe-area-inset-bottom))",
        }}>
        <button onClick={onReset}
          className="btn-retro w-full py-4 font-bold text-xl retro-text tracking-wider"
          style={{
            background: "#1a1400", color: "var(--color-gold)",
            border: "3px solid var(--color-gold)",
            boxShadow: "3px 3px 0 #7a5500",
          }}>
          ▶ もう一度遊ぶ
        </button>
      </div>
    </div>
  );
}
