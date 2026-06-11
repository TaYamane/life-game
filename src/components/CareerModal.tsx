"use client";
import type { Player, JobType, CareerTrigger } from "@/types/game";
import { AVATAR_COLORS } from "@/types/game";
import {
  getCareerOptions,
  getHiddenJobOptions,
  CAREER_TRIGGER_LABELS,
  type JobAvailability,
  type HiddenJobAvailability,
} from "@/data/jobRequirements";

// ============================================================
// CareerModal — 職業選択画面
// ============================================================

interface Props {
  player:     Player;
  trigger:    CareerTrigger;
  onChoose:   (job: JobType) => void;
  isMyTurn:   boolean;
}

export function CareerModal({ player, trigger, onChoose, isMyTurn }: Props) {
  const ci         = AVATAR_COLORS[player.avatar.color];
  const options    = getCareerOptions(trigger, player);
  const hiddenJobs = getHiddenJobOptions(player);
  const title      = CAREER_TRIGGER_LABELS[trigger];

  const available   = options.filter(o => o.available);
  const unavailable = options.filter(o => !o.available);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 60,
      background: "rgba(0,0,0,0.90)",
      display: "flex", flexDirection: "column",
      overflowY: "auto",
    }}>
      {/* ── ヘッダー ── */}
      <div style={{
        flexShrink: 0,
        background: "linear-gradient(180deg, #0a0050 0%, #04001a 100%)",
        borderBottom: `3px solid ${ci.bg}`,
        padding: "env(safe-area-inset-top, 16px) 16px 14px",
        paddingTop: "max(env(safe-area-inset-top), 16px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: ci.bg, border: `2px solid ${ci.border}`,
            borderRadius: 4, fontSize: 20,
          }}>
            {player.avatar.emoji}
          </div>
          <div>
            <div style={{ fontSize: 9, color: ci.bg, letterSpacing: 2, textTransform: "uppercase" }}>
              💼 CAREER CHOICE
            </div>
            <div className="font-bold retro-text" style={{ color: "#f0e8ff", fontSize: 14 }}>
              {player.name}さん、{title}
            </div>
          </div>
        </div>
        <div style={{
          marginTop: 8, fontSize: 9, color: "#5040a0",
          display: "flex", gap: 12, flexWrap: "wrap",
        }}>
          <span style={{ color: "#f0e8ff" }}>● 選択可能</span>
          <span style={{ color: "#4a3870" }}>● 条件未達（グレー）</span>
          <span style={{ color: "#34d399" }}>● あなたに有利</span>
          {hiddenJobs.length > 0 && (
            <span style={{ color: "#ffd700" }}>🔮 隠し職業 解放済み！</span>
          )}
        </div>
      </div>

      {/* ── 職業リスト ── */}
      <div style={{ flex: 1, padding: "12px 12px 32px" }}>

        {/* 🔮 隠し職業（解放済みのみ最上部に表示） */}
        {hiddenJobs.length > 0 && (
          <>
            <div style={{
              fontSize: 9, letterSpacing: 2, marginBottom: 8, marginTop: 4,
              color: "#ffd700",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{
                display: "inline-block",
                animation: "pulse 1.5s ease-in-out infinite",
              }}>🔮</span>
              ── 隠し職業（特別解放）
            </div>
            <div style={{
              marginBottom: 20,
              padding: "10px 10px 4px",
              background: "linear-gradient(135deg, #0a0820, #150830)",
              border: "2px solid #ffd70066",
              borderRadius: 8,
              boxShadow: "0 0 16px #ffd70033",
            }}>
              <div style={{ fontSize: 8, color: "#ffd70088", marginBottom: 8 }}>
                ✨ あなたの歩んできた人生が、特別な道を切り拓いた
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {hiddenJobs.map(opt => (
                  <HiddenJobCard
                    key={opt.job}
                    opt={opt}
                    currentJob={player.job}
                    onChoose={isMyTurn ? onChoose : undefined}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* 通常職業 — 選択可能 */}
        {available.length > 0 && (
          <>
            <div style={{
              fontSize: 9, color: "#6050a0", letterSpacing: 2,
              marginBottom: 8, marginTop: 4,
            }}>
              ── 選択可能な職業
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {available.map(opt => (
                <JobCard
                  key={opt.job}
                  opt={opt}
                  currentJob={player.job}
                  onChoose={isMyTurn ? onChoose : undefined}
                  accentColor={ci.bg}
                />
              ))}
            </div>
          </>
        )}

        {/* 通常職業 — 条件未達 */}
        {unavailable.length > 0 && (
          <>
            <div style={{
              fontSize: 9, color: "#3a2860", letterSpacing: 2, marginBottom: 8,
            }}>
              ── 条件未達（参考）
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {unavailable.map(opt => (
                <JobCard
                  key={opt.job}
                  opt={opt}
                  currentJob={player.job}
                  onChoose={undefined}
                  accentColor={ci.bg}
                />
              ))}
            </div>
          </>
        )}

        {available.length === 0 && hiddenJobs.length === 0 && (
          <div style={{
            textAlign: "center", padding: "40px 0",
            color: "#5040a0", fontSize: 12,
            fontFamily: "'DotGothic16',monospace",
          }}>
            条件を満たす職業がありません
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 職業カード
// ============================================================
function JobCard({ opt, currentJob, onChoose, accentColor }: {
  opt:         JobAvailability;
  currentJob:  JobType;
  onChoose?:   (job: JobType) => void;
  accentColor: string;
}) {
  const isCurrent    = opt.job === currentJob;
  const canSelect    = opt.available && !!onChoose;
  const bonus        = opt.initialBonus;
  const bonusText    =
    bonus.money > 0 ? `初期 +${bonus.money}万` :
    bonus.money < 0 ? `初期 ${bonus.money}万（リスク）` :
    null;

  return (
    <button
      onClick={() => canSelect && onChoose!(opt.job)}
      disabled={!canSelect}
      style={{
        width: "100%",
        background: opt.available ? "#080230" : "#030110",
        border: isCurrent
          ? "2px solid #ffd700"
          : opt.available && opt.recommended
            ? "2px solid #34d399"
            : opt.available
              ? "2px solid #2a1060"
              : "1px solid #150832",
        borderRadius: 6,
        padding: "10px 12px",
        textAlign: "left",
        cursor: canSelect ? "pointer" : "not-allowed",
        opacity: opt.available ? 1 : 0.45,
        display: "flex",
        alignItems: "center",
        gap: 10,
        transition: "opacity 0.15s",
      }}
    >
      {/* アイコン */}
      <div style={{
        fontSize: 26, flexShrink: 0, lineHeight: 1,
        opacity: opt.available ? 1 : 0.4,
      }}>
        {opt.emoji}
      </div>

      {/* 情報 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 13, fontWeight: "bold",
            color: opt.available ? "#f0e8ff" : "#3a2860",
            fontFamily: "'DotGothic16',monospace",
          }}>
            {opt.label}
          </span>
          {opt.available && opt.recommended && (
            <span style={{
              fontSize: 8, color: "#34d399",
              background: "#03241a",
              border: "1px solid #34d39944",
              borderRadius: 2, padding: "1px 4px",
            }}>
              ✦ あなたに有利
            </span>
          )}
          {isCurrent && (
            <span style={{
              fontSize: 8, color: "#ffd700",
              background: "#1a1000",
              border: "1px solid #ffd70044",
              borderRadius: 2, padding: "1px 4px",
            }}>
              ★ 現在の職業
            </span>
          )}
        </div>
        <div style={{
          fontSize: 9,
          color: opt.available ? "#7060a0" : "#2a1a50",
          lineHeight: 1.5,
        }}>
          {opt.available ? opt.description : (opt.lockedReason ?? opt.description)}
        </div>
      </div>

      {/* 収入・ボーナス */}
      <div style={{ flexShrink: 0, textAlign: "right", minWidth: 52 }}>
        {opt.available ? (
          <>
            <div style={{ fontSize: 8, color: "#4030a0", marginBottom: 2 }}>収入</div>
            <div style={{
              fontSize: 9, color: "#c4b5d4",
              fontFamily: "'DotGothic16',monospace",
              lineHeight: 1.3,
            }}>
              {opt.income}
            </div>
            {bonusText && (
              <div style={{
                fontSize: 8, marginTop: 3,
                color: bonus.money >= 0 ? "#00e864" : "#ff6688",
              }}>
                {bonusText}
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 16, color: "#3a2860" }}>🔒</div>
        )}
      </div>
    </button>
  );
}

// ============================================================
// 隠し職業カード（金色・特別演出）
// ============================================================
function HiddenJobCard({ opt, currentJob, onChoose }: {
  opt:        HiddenJobAvailability;
  currentJob: JobType;
  onChoose?:  (job: JobType) => void;
}) {
  const isCurrent = opt.job === currentJob;
  const canSelect = !!onChoose;
  const bonus     = opt.initialBonus;

  return (
    <button
      onClick={() => canSelect && onChoose!(opt.job)}
      disabled={!canSelect}
      style={{
        width: "100%",
        background: "linear-gradient(135deg, #0f0820 0%, #1a0a2e 100%)",
        border: isCurrent
          ? "2px solid #fff"
          : "2px solid #ffd700",
        borderRadius: 6,
        padding: "12px 12px",
        textAlign: "left",
        cursor: canSelect ? "pointer" : "default",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 0 12px #ffd70044",
        marginBottom: 2,
        transition: "box-shadow 0.2s",
      }}
    >
      {/* アイコン */}
      <div style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>
        {opt.emoji}
      </div>

      {/* 情報 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 14, fontWeight: "bold",
            color: "#ffd700",
            fontFamily: "'DotGothic16',monospace",
            textShadow: "0 0 8px #ffd70088",
          }}>
            {opt.label}
          </span>
          <span style={{
            fontSize: 8, color: "#0a0820",
            background: "#ffd700",
            borderRadius: 2, padding: "1px 5px",
            fontWeight: "bold",
          }}>
            🔮 隠し職業
          </span>
          {isCurrent && (
            <span style={{
              fontSize: 8, color: "#ffd700",
              border: "1px solid #ffd70066",
              borderRadius: 2, padding: "1px 4px",
            }}>
              ★ 現在
            </span>
          )}
        </div>
        <div style={{
          fontSize: 9, color: "#b090d0", lineHeight: 1.6,
        }}>
          {opt.description}
        </div>
      </div>

      {/* ボーナス表示 */}
      <div style={{ flexShrink: 0, textAlign: "right", minWidth: 60 }}>
        <div style={{ fontSize: 8, color: "#ffd70088", marginBottom: 2 }}>初期ボーナス</div>
        {bonus.money !== 0 && (
          <div style={{
            fontSize: 9, fontFamily: "'DotGothic16',monospace",
            color: bonus.money > 0 ? "#ffd700" : "#ff6688",
          }}>
            {bonus.money > 0 ? `+${bonus.money}万` : `${bonus.money}万`}
          </div>
        )}
        <div style={{ fontSize: 9, color: "#c4b5d4", fontFamily: "'DotGothic16',monospace" }}>
          😊+{bonus.happiness}
        </div>
        <div style={{ fontSize: 9, color: "#c4b5d4", fontFamily: "'DotGothic16',monospace" }}>
          ⭐+{bonus.fame}
        </div>
      </div>
    </button>
  );
}
