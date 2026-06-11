"use client";
import type { Player } from "@/types/game";
import { AVATAR_COLORS, JOB_LABELS } from "@/types/game";
import { calcAge, getAgePhrase, calcHealthScore, getChoiceHistory } from "@/utils/playerProfile";
import { DotAvatar } from "./DotAvatar";

interface Props {
  player:   Player;
  onClose:  () => void;
}

// ============================================================
// お金フォーマット（借金対応）
// ============================================================
function fmtMoney(m: number): string {
  if (m === 0) return "0円";
  const abs  = Math.abs(m);
  const sign = m < 0 ? "借金 " : "";
  if (abs >= 10000) return `${sign}${(abs / 10000).toFixed(1)}億円`;
  return `${sign}${abs.toLocaleString()}万円`;
}

// ============================================================
// ステータスバー
// ============================================================
function StatBar({ label, value, max, color, icon, suffix = "" }: {
  label: string; value: number; max: number; color: string; icon: string; suffix?: string;
}) {
  const pct = Math.round(Math.max(0, Math.min(max, value)) / max * 100);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 10, color: "#9080c0" }}>{icon} {label}</span>
        <span style={{ fontSize: 10, fontWeight: "bold", color, fontFamily: "'DotGothic16',monospace" }}>
          {value < 0 ? fmtMoney(value) : `${value}${suffix}`}
        </span>
      </div>
      <div style={{ height: 6, background: "#0a0830", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 3,
          width: `${pct}%`,
          background: color,
          transition: "width 0.5s",
        }}/>
      </div>
    </div>
  );
}

// ============================================================
// ライフステータス行
// ============================================================
function StatusRow({ icon, label, value, highlight }: {
  icon: string; label: string; value: string; highlight?: boolean;
}) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "5px 0",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
      <span style={{ fontSize: 10, color: "#7060a0" }}>{icon} {label}</span>
      <span style={{
        fontSize: 10, fontWeight: "bold", fontFamily: "'DotGothic16',monospace",
        color: highlight ? "#ffd700" : "#d0c8ff",
      }}>
        {value}
      </span>
    </div>
  );
}

// ============================================================
// 選択履歴バッジ
// ============================================================
function ChoiceBadge({ icon, keyLabel, value }: { icon: string; keyLabel: string; value: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 4,
      background: "#0a0440", border: "1px solid #2a1060",
      borderRadius: 4, padding: "3px 7px", flexShrink: 0,
    }}>
      <span style={{ fontSize: 12 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 8, color: "#6050a0", lineHeight: 1 }}>{keyLabel}</div>
        <div style={{ fontSize: 9, color: "#c0b0ff", fontWeight: "bold", lineHeight: 1.2 }}>{value}</div>
      </div>
    </div>
  );
}

// ============================================================
// メインプロフィールパネル
// ============================================================
export function PlayerProfile({ player, onClose }: Props) {
  const color   = AVATAR_COLORS[player.avatar.color];
  const age     = calcAge(player.position);
  const phrase  = getAgePhrase(player);
  const health  = calcHealthScore(player);
  const choices = getChoiceHistory(player.flags ?? {});

  // 資産バー用のスケール（借金時は0として表示、別途借金額を強調）
  const moneyForBar = Math.max(0, player.money);
  const moneyMax    = Math.max(1000, moneyForBar);

  return (
    <div
      className="anim-slide-up"
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        display: "flex", alignItems: "flex-end",
        background: "rgba(0,0,0,0.7)",
      }}
      onClick={onClose}
    >
      {/* パネル本体 */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%",
          maxHeight: "88dvh",
          overflowY: "auto",
          background: "linear-gradient(180deg, #0a0440 0%, #06021a 100%)",
          borderTop: "3px solid var(--color-border)",
          borderRadius: "16px 16px 0 0",
          paddingBottom: "max(20px, env(safe-area-inset-bottom))",
        }}
      >

        {/* ── ヘッダー ── */}
        <div style={{
          background: "#12084a",
          borderBottom: "2px solid var(--color-border)",
          padding: "12px 16px 10px",
          position: "sticky", top: 0, zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* アバター */}
            <div style={{
              width: 48, height: 52, overflow: "hidden",
              display: "flex", alignItems: "flex-end", justifyContent: "center",
              filter: `drop-shadow(0 0 6px ${color.bg})`,
            }}>
              <DotAvatar player={player} size={36} shadow />
            </div>

            {/* 名前 + 年齢 */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span className="font-bold retro-text" style={{ fontSize: 15, color: color.bg }}>
                  {player.name}
                </span>
                <span style={{
                  fontSize: 9, color: "#ffd700",
                  background: "#1a0a00", border: "1px solid #ffd70044",
                  borderRadius: 3, padding: "1px 5px",
                  fontFamily: "'DotGothic16',monospace",
                }}>
                  {age}歳
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#c0b0e0", fontFamily: "'DotGothic16',monospace" }}>
                {phrase}
              </div>
              <div style={{ fontSize: 9, color: "#7060a0", marginTop: 2 }}>
                マス {player.position} / 150
              </div>
            </div>

            {/* 閉じるボタン */}
            <button
              onClick={onClose}
              style={{
                background: "none", border: "1px solid #4a2f8a",
                borderRadius: 4, color: "#8070b0",
                width: 28, height: 28,
                fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        <div style={{ padding: "12px 14px" }}>

          {/* ── ステータスバー ── */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 9, color: "#5040a0", letterSpacing: 2,
              marginBottom: 8, textTransform: "uppercase",
            }}>
              ステータス
            </div>

            {/* 資産（借金の場合は特別表示） */}
            {player.money < 0 ? (
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: "#9080c0" }}>💰 資産</span>
                  <span style={{
                    fontSize: 10, fontWeight: "bold", color: "var(--color-red)",
                    fontFamily: "'DotGothic16',monospace",
                  }}>
                    🔴 {fmtMoney(player.money)}
                  </span>
                </div>
                <div style={{
                  height: 6, background: "#200010", borderRadius: 3,
                  border: "1px solid #800020",
                }}>
                  <div style={{ height: "100%", width: "100%", background: "#400020", borderRadius: 3 }}/>
                </div>
              </div>
            ) : (
              <StatBar
                label="資産" icon="💰" value={player.money}
                max={moneyMax} color="#00e864" suffix="万"
              />
            )}

            <StatBar label="幸福度" icon="😊" value={player.happiness} max={100} color="#f472b6" suffix="" />
            <StatBar label="健康"   icon="💪" value={health}           max={100} color="#34d399" suffix="" />
            <StatBar label="知名度" icon="📢" value={player.fame}       max={100} color="#fbbf24" suffix="" />
          </div>

          {/* ── ライフステータス ── */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 9, color: "#5040a0", letterSpacing: 2, marginBottom: 8,
            }}>
              ライフステータス
            </div>
            <div style={{
              background: "#06021a", border: "1px solid #2a1060",
              borderRadius: 6, padding: "4px 10px",
            }}>
              <StatusRow
                icon="💼" label="職業"
                value={JOB_LABELS[player.job]}
                highlight={player.job !== "none" && player.job !== "part_time"}
              />
              <StatusRow
                icon="💒" label="婚姻状況"
                value={player.isMarried ? "既婚" : "未婚"}
                highlight={player.isMarried}
              />
              <StatusRow
                icon="👶" label="子供"
                value={player.hasChildren ? "子供あり" : "子供なし"}
                highlight={player.hasChildren}
              />
              <StatusRow
                icon="🐾" label="ペット"
                value={player.hasPet ? "飼っている" : "なし"}
                highlight={player.hasPet}
              />
              {player.hasCompany && (
                <StatusRow icon="🚀" label="起業" value="経営者（会社あり）" highlight />
              )}
              <div style={{
                display: "flex", justifyContent: "space-between",
                padding: "5px 0",
              }}>
                <span style={{ fontSize: 10, color: "#7060a0" }}>📊 ポジティブ / ネガティブ</span>
                <span style={{ fontSize: 10, color: "#d0c8ff", fontFamily: "'DotGothic16',monospace" }}>
                  <span style={{ color: "#00e864" }}>+{player.positiveEvents}</span>
                  {" / "}
                  <span style={{ color: "var(--color-red)" }}>-{player.negativeEvents}</span>
                </span>
              </div>
            </div>
          </div>

          {/* ── 選択の記録 ── */}
          {choices.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{
                fontSize: 9, color: "#5040a0", letterSpacing: 2, marginBottom: 8,
              }}>
                あなたが歩んできた道
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {choices.map((c, i) => (
                  <ChoiceBadge key={i} icon={c.icon} keyLabel={c.key} value={c.value} />
                ))}
              </div>
            </div>
          )}

          {choices.length === 0 && player.position < 12 && (
            <div style={{
              textAlign: "center", padding: "12px 0",
              fontSize: 10, color: "#4030a0",
              fontFamily: "'DotGothic16',monospace",
            }}>
              まだ選択の分岐に達していません
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
