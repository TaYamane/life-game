"use client";
import type { ChoiceSquare } from "@/types/game";

interface Props {
  choice:    ChoiceSquare;
  onChoose:  (optionId: string) => void;
  isMyTurn:  boolean;
}

// 効果サマリーを短く表示
function effectSummary(effect: ChoiceSquare["options"][0]["effect"]): string {
  const parts: string[] = [];
  if (effect.money !== undefined) {
    parts.push(effect.money > 0 ? `お金+${effect.money}万` : `お金${effect.money}万`);
  }
  if (effect.happiness !== undefined) {
    parts.push(effect.happiness > 0 ? `幸福+${effect.happiness}` : `幸福${effect.happiness}`);
  }
  if (effect.fame !== undefined && effect.fame !== 0) {
    parts.push(`知名度${effect.fame > 0 ? "+" : ""}${effect.fame}`);
  }
  if (effect.marry)        parts.push("💒 結婚");
  if (effect.getChild)     parts.push("👶 子供");
  if (effect.startCompany) parts.push("🚀 起業");
  if (effect.setJob)       parts.push(`💼 職業変更`);
  return parts.length > 0 ? parts.join("  ") : "変化なし";
}

export function ChoiceModal({ choice, onChoose, isMyTurn }: Props) {
  const cols = choice.options.length === 2 ? "grid-cols-2" : "grid-cols-1";

  return (
    <div
      className="anim-slide-up"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "flex-end",
        background: "rgba(0,0,0,0.75)",
      }}
    >
      <div
        style={{
          width: "100%",
          background: "linear-gradient(180deg, #0a0440 0%, #080220 100%)",
          borderTop: "3px solid var(--color-border)",
          paddingBottom: "max(20px, env(safe-area-inset-bottom))",
          maxHeight: "85dvh",
          overflowY: "auto",
        }}
      >
        {/* ヘッダー */}
        <div
          style={{
            background: "#150060",
            borderBottom: "2px solid var(--color-border)",
            padding: "var(--sp-3) var(--sp-4)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "var(--fs-xs)", color: "#cc44ff", letterSpacing: 3, marginBottom: 4 }}>
            ★ 人生の分岐点 ★
          </div>
          <div style={{ fontSize: "var(--fs-xl)", marginBottom: 4 }}>{choice.emoji}</div>
          <div
            className="font-bold retro-text"
            style={{ fontSize: "var(--fs-lg)", color: "#fff", letterSpacing: 1 }}
          >
            {choice.title}
          </div>
          <div style={{ fontSize: "var(--fs-sm)", color: "#8070b0", marginTop: 4, lineHeight: 1.5 }}>
            {choice.description}
          </div>
        </div>

        {/* 選択肢 */}
        <div style={{ padding: "12px 12px 0" }}>
          {isMyTurn ? (
            <div className={`grid ${cols} gap-3`}>
              {choice.options.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => onChoose(opt.id)}
                  className="btn-retro"
                  style={{
                    background: "#0a0050",
                    border: "2px solid #4a2f8a",
                    borderRadius: 4,
                    padding: "var(--sp-3) var(--sp-2)",
                    minHeight: "var(--touch-h)",
                    textAlign: "center",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "var(--sp-1)",
                  }}
                >
                  <div style={{ fontSize: "var(--fs-xl)" }}>{opt.emoji}</div>
                  <div
                    className="font-bold retro-text"
                    style={{ fontSize: "var(--fs-md)", color: "#e8d8ff", lineHeight: 1.3 }}
                  >
                    {opt.label}
                  </div>
                  <div style={{ fontSize: "var(--fs-xs)", color: "#6050a0", lineHeight: 1.4 }}>
                    {opt.description}
                  </div>
                  <div
                    style={{
                      marginTop: 2,
                      fontSize: "var(--fs-xs)",
                      color: "#00e864",
                      background: "#001a08",
                      border: "1px solid #005020",
                      borderRadius: 3,
                      padding: "3px 8px",
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    {effectSummary(opt.effect)}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div
              className="text-center anim-blink"
              style={{
                padding: "20px 12px",
                color: "#4a3880",
                fontSize: 13,
                border: "2px solid #2a1060",
                borderRadius: 4,
              }}
            >
              ● 相手が選択中です…
            </div>
          )}
        </div>

        {/* フッター注記 */}
        <div style={{ padding: "8px 16px 4px", textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#4a3060", lineHeight: 1.5 }}>
            この選択は記録され、後のイベントに影響を与えます
          </div>
        </div>
      </div>
    </div>
  );
}
