"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { GameState, Player, JobType } from "@/types/game";
import { AVATAR_COLORS, LIFE_STAGE_INFO, JOB_LABELS } from "@/types/game";
import { BOARD_SQUARES, TOTAL_SQUARES } from "@/data/board";
import { calcAge, getAgePhrase, getStatusBadges } from "@/utils/playerProfile";
import { BoardMap } from "./BoardMap";
import { EventModal } from "./EventModal";
import { ChoiceModal } from "./ChoiceModal";
import { CareerModal } from "./CareerModal";
import { PlayerProfile } from "./PlayerProfile";
import { Roulette } from "./Roulette";
import { DotAvatar } from "./DotAvatar";

// お金フォーマット（億/万/円）
function formatMoney(m: number): string {
  if (m === 0) return "0円";
  const abs = Math.abs(m);
  const sign = m < 0 ? "-" : "";
  if (abs >= 10000) return `${sign}${(abs / 10000).toFixed(1)}億円`;
  if (abs >= 1)     return `${sign}${abs.toLocaleString()}万円`;
  return `${sign}${Math.round(abs * 10000).toLocaleString()}円`;
}

interface Props {
  state:            GameState;
  onRollDice:       (value: number) => void;
  onDismissEvent:   () => void;
  onMakeChoice?:    (optionId: string) => void;
  onChooseCareer?:  (job: JobType) => void;
  onMarriageRoll?:  (value: number) => void;
  onEndTurn:        () => void;
  isMyTurn?:        boolean;
}

// ---------- パラメータバー ----------
function ParamBar({ icon, value, color }: { icon: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ fontSize: 12 }}>{icon}</span>
      <div className="flex-1 rounded-sm overflow-hidden" style={{ height: 5, background: "#0a0830" }}>
        <div
          className="h-full rounded-sm"
          style={{ width: `${Math.round((value / 100) * 100)}%`, backgroundColor: color, transition: "width 0.5s" }}
        />
      </div>
      <span style={{ color, fontSize: 9, width: 16, textAlign: "right" }}>{value}</span>
    </div>
  );
}

// ---------- プレイヤーミニカード ----------
function PlayerMiniCard({ player, isActive, displayPos, onProfileOpen }: {
  player: Player; isActive: boolean; displayPos: number; onProfileOpen: () => void;
}) {
  const color  = AVATAR_COLORS[player.avatar.color];
  const age    = calcAge(player.position);
  const badges = getStatusBadges(player);

  return (
    <div
      className="flex flex-col items-center flex-shrink-0"
      style={{
        backgroundColor: isActive ? color.bg + "28" : "transparent",
        border: isActive ? `2px solid ${color.bg}` : "2px solid transparent",
        boxShadow: isActive ? `0 0 10px ${color.bg}55, inset 0 0 8px ${color.bg}11` : "none",
        opacity: player.hasFinished ? 0.4 : 1,
        borderRadius: 5,
        minWidth: "var(--card-w)",
        padding: "var(--sp-1) var(--sp-1)",
        transform: isActive ? "scale(1.05)" : "scale(1)",
        transition: "transform 0.2s, box-shadow 0.2s",
        zIndex: isActive ? 2 : 1,
      }}
    >
      {/* ピクセルキャラ＋プロフィールボタン */}
      <div style={{ position: "relative" }}>
        <div style={{
          width: "var(--avatar-sz)", height: "var(--avatar-sz)", overflow: "hidden",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          filter: isActive ? `drop-shadow(0 0 4px ${color.bg})` : undefined,
        }}>
          <DotAvatar player={player} size={22} />
        </div>
        {/* プロフィールボタン（右上） — タッチターゲット拡大 */}
        <button
          onClick={onProfileOpen}
          style={{
            position: "absolute", top: -5, right: -9,
            width: 18, height: 18,
            background: color.bg,
            border: `1px solid ${color.border}`,
            borderRadius: "50%",
            color: "#fff",
            fontSize: 9,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            lineHeight: 1,
            zIndex: 2,
          }}
          title={`${player.name}のプロフィール`}
        >
          i
        </button>
      </div>

      {/* 名前 */}
      <div
        className="font-bold truncate"
        style={{
          color: isActive ? "#fff" : "#6050a0",
          fontSize: "var(--fs-xs)",
          maxWidth: "var(--card-w)",
          lineHeight: 1.2,
          marginTop: 1,
        }}
      >
        {player.name}
      </div>

      {/* 年齢 */}
      <div style={{
        color: "#ffd700",
        fontSize: "var(--fs-sm)",
        fontWeight: "bold",
        fontFamily: "'DotGothic16',monospace",
        lineHeight: 1.2,
      }}>
        {age}歳
      </div>

      {/* 資産 */}
      <div style={{
        color: player.money < 0 ? "var(--color-red)" : isActive ? "var(--color-green)" : "#404070",
        fontSize: "var(--fs-2xs)", fontWeight: "bold",
        lineHeight: 1.2,
      }}>
        {player.money < 0 ? `借金${Math.abs(player.money)}万` : formatMoney(player.money)}
      </div>

      {/* ライフステータスアイコン */}
      {badges.length > 0 && (
        <div style={{ display: "flex", gap: 1, justifyContent: "center" }}>
          {badges.slice(0, 2).map((b, i) => (
            <span key={i} style={{ fontSize: "var(--fs-xs)" }}>{b.icon}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- ターン結果バナー ----------
function TurnResultBanner({ diceValue, player, onEndTurn, isMyTurn }: {
  diceValue: number; player: Player; onEndTurn: () => void; isMyTurn: boolean;
}) {
  const square  = BOARD_SQUARES[player.position];
  const hasMoney = square.type === "money_plus" || square.type === "money_minus";
  const amount   = square.amount ?? 0;

  return (
    <div
      className="flex-shrink-0 anim-slide-up"
      style={{
        background: "#08041a",
        borderTop: "3px solid var(--color-border)",
        padding: "var(--sp-3)",
        paddingBottom: "max(var(--sp-4), env(safe-area-inset-bottom))",
      }}
    >
      <div
        style={{
          background: "#000", border: "2px solid #2a1060",
          padding: "var(--sp-2) var(--sp-3)",
          marginBottom: "var(--sp-3)",
        }}
      >
        <div className="flex items-center gap-3 mb-1">
          <span style={{ fontSize: "var(--fs-2xl)" }}>
            {["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][diceValue]}
          </span>
          <div>
            <div className="font-bold retro-text" style={{ color: "var(--color-gold)", fontSize: "var(--fs-md)" }}>
              {player.name}　{diceValue} が出た！
            </div>
            <div style={{ color: "#8070a0", fontSize: "var(--fs-sm)" }}>
              {square.icon} {square.label}
            </div>
          </div>
        </div>
        {hasMoney && (
          <>
            <div
              className="text-center font-bold retro-text"
              style={{
                fontSize: "var(--fs-xl)",
                color: amount > 0 ? "var(--color-green)" : "var(--color-red)",
                textShadow: `0 0 8px ${amount > 0 ? "var(--color-green)" : "var(--color-red)"}`,
              }}
            >
              {formatMoney(amount)}
            </div>
            {player.money < 0 && (
              <div className="text-center font-bold retro-text anim-blink" style={{ fontSize: "var(--fs-sm)", color: "var(--color-red)" }}>
                🔴 借金 {Math.abs(player.money).toLocaleString()}万円
              </div>
            )}
          </>
        )}
        {square.type === "safe" && (
          <div className="text-center" style={{ color: "var(--color-blue)", fontSize: "var(--fs-sm)" }}>
            休憩所。何も起きない。
          </div>
        )}
        {square.type === "goal" && (
          <div className="text-center font-bold retro-text" style={{ fontSize: "var(--fs-xl)", color: "var(--color-gold)" }}>
            🏁 GOAL!!
          </div>
        )}
      </div>

      {isMyTurn ? (
        <button
          onClick={onEndTurn}
          className="btn-retro w-full font-bold tracking-wider retro-text"
          style={{
            background: "#0a0050",
            color: "#a080ff",
            border: "3px solid #4a2f8a",
            boxShadow: "3px 3px 0 #000",
            borderRadius: 2,
            fontSize: "var(--fs-lg)",
            minHeight: "var(--touch-h)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ▶ 次のプレイヤーへ
        </button>
      ) : (
        <div
          className="w-full text-center font-bold retro-text anim-blink"
          style={{
            color: "#4a3880",
            fontSize: "var(--fs-sm)",
            border: "2px solid #2a1060",
            borderRadius: 2,
            minHeight: "var(--touch-h)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ● {player.name} の結果を待っています…
        </div>
      )}
    </div>
  );
}

// ============================================================
// メインゲーム画面
// ============================================================
export function GameScreen({ state, onRollDice, onDismissEvent, onMakeChoice, onChooseCareer, onMarriageRoll, onEndTurn, isMyTurn = true }: Props) {
  const { players, currentPlayerIndex, phase, diceValue, currentEvent, currentChoice } = state;

  // プロフィールパネル（null = 非表示、player index = 表示）
  const [profileIdx, setProfileIdx] = useState<number | null>(null);
  const currentPlayer = players[currentPlayerIndex];
  const stageInfo     = LIFE_STAGE_INFO[currentPlayer.lifeStage];
  const colorInfo     = AVATAR_COLORS[currentPlayer.avatar.color];

  // ==============================
  // コマ移動アニメーション管理
  // ==============================
  const [displayPositions, setDisplayPositions] = useState<number[]>(
    () => players.map(p => p.position)
  );
  const [isMoving, setIsMoving]       = useState(false);
  const [landingSquare, setLanding]   = useState<number | null>(null);
  const prevPosRef                    = useRef<number>(0);
  const moveTimerRef                  = useRef<ReturnType<typeof setInterval> | null>(null);

  // プレイヤーが増減したとき表示位置も同期
  useEffect(() => {
    if (!isMoving) {
      setDisplayPositions(players.map(p => p.position));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players.length]);

  // 非現在プレイヤーは常に実際の位置に同期
  useEffect(() => {
    if (!isMoving) {
      setDisplayPositions(players.map(p => p.position));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayerIndex]);

  // ルーレット完了 → サイコロ結果を即ストアに反映
  const handleRouletteComplete = useCallback((value: number) => {
    if (!isMyTurn) return; // 二重ガード: 自分のターンでなければ無視
    prevPosRef.current = players[currentPlayerIndex].position;
    onRollDice(value); // ストアが即座に位置を更新
  }, [players, currentPlayerIndex, onRollDice, isMyTurn]);

  // ストアの currentPlayer.position が変わったら移動アニメーション開始
  const storePos = currentPlayer.position;
  useEffect(() => {
    const from = prevPosRef.current;
    const to   = storePos;

    // rolling/playing/setup フェーズでは何もしない
    if (phase === "playing" || phase === "rolling" || phase === "setup") {
      setDisplayPositions(players.map(p => p.position));
      return;
    }
    if (from === to) return;

    // アニメーション開始
    setIsMoving(true);
    setLanding(null);
    if (moveTimerRef.current) clearInterval(moveTimerRef.current);

    let current = from;
    const msPerSquare = Math.max(160, Math.min(250, Math.round(1200 / Math.abs(to - from))));

    moveTimerRef.current = setInterval(() => {
      const step = current < to ? current + 1 : current - 1;
      current = step;

      setDisplayPositions(prev => {
        const next = [...prev];
        next[currentPlayerIndex] = current;
        return next;
      });

      if (current === to) {
        if (moveTimerRef.current) clearInterval(moveTimerRef.current);
        setLanding(to);
        setTimeout(() => {
          setIsMoving(false);
          setLanding(null);
          prevPosRef.current = to;
        }, 500);
      }
    }, msPerSquare);

    return () => {
      if (moveTimerRef.current) clearInterval(moveTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storePos]);

  // 結婚ルーレット完了コールバック
  const handleMarriageComplete = useCallback((value: number) => {
    if (!isMyTurn) return;
    onMarriageRoll?.(value);
  }, [isMyTurn, onMarriageRoll]);

  // アニメーション中はモーダルを表示しない
  const showEventModal      = phase === "event"            && !isMoving;
  const showChoiceModal     = phase === "choice"           && !isMoving && !!currentChoice;
  const showCareerModal     = phase === "career_choice"    && !isMoving && !!state.currentCareerChoice;
  const showMarriageRoulette = phase === "marriage_roulette" && !isMoving;
  const showResultBanner    = phase === "show_result" && !isMoving;
  const showRoulette  = phase === "playing"  && isMyTurn;
  const isSpinning    = phase === "rolling"  && isMyTurn;
  const isWaiting     = !isMyTurn && (phase === "playing" || phase === "rolling");

  return (
    <div
      className="flex flex-col overflow-hidden scanlines relative"
      style={{ height: "100dvh", backgroundColor: "var(--color-bg)" }}
    >
      {/* ===== ヘッダー ===== */}
      <div
        className="flex-shrink-0 px-2 py-1.5"
        style={{
          background: "linear-gradient(90deg, #0a0440, #180860, #0a0440)",
          borderBottom: "3px solid var(--color-border)",
        }}
      >
        <div className="flex justify-around">
          {players.map((p, i) => (
            <PlayerMiniCard
              key={p.id}
              player={p}
              isActive={i === currentPlayerIndex}
              displayPos={displayPositions[i] ?? p.position}
              onProfileOpen={() => setProfileIdx(profileIdx === i ? null : i)}
            />
          ))}
        </div>

        {/* 年齢フレーズバー */}
        <div style={{
          display: "flex",
          justifyContent: "space-around",
          paddingTop: "var(--sp-1)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          {players.map((p, i) => (
            <div
              key={p.id}
              style={{
                fontSize: "var(--fs-2xs)",
                color: i === currentPlayerIndex ? "#c0b0ff" : "#4a3880",
                fontFamily: "'DotGothic16',monospace",
                textAlign: "center",
                minWidth: "var(--card-w)",
                lineHeight: 1.3,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {getAgePhrase(p)}
            </div>
          ))}
        </div>
      </div>

      {/* ===== 盤面 ===== */}
      <div className="flex-1 overflow-y-auto">
        <BoardMap
          players={players}
          currentPlayerIndex={currentPlayerIndex}
          displayPositions={displayPositions}
          landingSquare={landingSquare}
        />
      </div>

      {/* ===== アクションエリア ===== */}
      {showResultBanner && diceValue !== null ? (
        <TurnResultBanner
          diceValue={diceValue}
          player={currentPlayer}
          onEndTurn={onEndTurn}
          isMyTurn={isMyTurn}
        />
      ) : (
        <div
          className="flex-shrink-0 relative"
          style={{
            background: "linear-gradient(180deg, #0c0840, #080420)",
            borderTop: "3px solid var(--color-border)",
            padding: "var(--sp-3)",
            paddingBottom: "max(var(--sp-3), env(safe-area-inset-bottom))",
          }}
        >
          {/* プレイヤー情報バー */}
          <div className="flex items-center gap-2 mb-2">
            {/* ピクセルキャラ */}
            <div style={{
              flexShrink: 0,
              width: "clamp(38px, 10vw, 48px)",
              height: "clamp(42px, 11vw, 52px)",
              backgroundColor: colorInfo.bg + "22",
              border: `2px solid ${colorInfo.border}`,
              borderRadius: 3,
              display: "flex", alignItems: "flex-end", justifyContent: "center",
              boxShadow: `0 0 10px ${colorInfo.bg}55, 2px 2px 0 #000`,
              overflow: "hidden",
            }}>
              <DotAvatar player={currentPlayer} size={32} shadow />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                <span className="font-bold retro-text truncate" style={{ color: "var(--color-gold)", fontSize: "var(--fs-md)" }}>
                  {currentPlayer.name}
                </span>
                <span style={{
                  fontSize: "var(--fs-xs)", color: "#ffd700", flexShrink: 0,
                  background: "#1a0a00", border: "1px solid #ffd70044",
                  borderRadius: 3, padding: "1px 5px",
                  fontFamily: "'DotGothic16',monospace",
                }}>
                  {calcAge(currentPlayer.position)}歳
                </span>
                <button
                  onClick={() => setProfileIdx(currentPlayerIndex)}
                  style={{
                    background: "#2a1060",
                    border: "1px solid #6040a0",
                    borderRadius: 4,
                    color: "#c0a0ff",
                    fontSize: "var(--fs-2xs)",
                    padding: "2px 5px",
                    cursor: "pointer",
                    flexShrink: 0,
                    minHeight: 24,
                  }}
                >
                  👤 詳細
                </button>
              </div>
              <div style={{ color: "#c0b0e0", fontSize: "var(--fs-xs)", marginBottom: 2, fontFamily: "'DotGothic16',monospace" }}>
                {getAgePhrase(currentPlayer)}
              </div>
              <div className="mb-1" style={{ color: "#6050a0", fontSize: "var(--fs-xs)" }}>
                {JOB_LABELS[currentPlayer.job]}
                <span style={{
                  marginLeft: 4, fontWeight: "bold",
                  color: currentPlayer.money < 0 ? "var(--color-red)" : "var(--color-green)",
                  fontSize: "var(--fs-sm)",
                }}>
                  {currentPlayer.money < 0
                    ? `🔴 借金${Math.abs(currentPlayer.money).toLocaleString()}万`
                    : formatMoney(currentPlayer.money)}
                </span>
              </div>
              <div className="space-y-0.5">
                <ParamBar icon="😊" value={currentPlayer.happiness} color="#a060ff" />
                <ParamBar icon="🌟" value={currentPlayer.fame}      color="#ffcc00" />
              </div>
            </div>
          </div>

          {/* ルーレット / 移動中 / 他プレイヤー待機 */}
          {isMoving ? (
            <div
              className="text-center font-bold retro-text anim-blink"
              style={{
                color: "var(--color-gold)",
                fontSize: "var(--fs-lg)",
                letterSpacing: "0.1em",
                minHeight: "var(--touch-h)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ▶▶▶ 移動中… ▶▶▶
            </div>
          ) : isWaiting ? (
            <div
              className="text-center font-bold retro-text anim-blink"
              style={{
                color: "#6050a0",
                fontSize: "var(--fs-md)",
                minHeight: "var(--touch-h)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ● {currentPlayer.name} のターンを待っています…
            </div>
          ) : (showRoulette || isSpinning) ? (
            <Roulette onComplete={handleRouletteComplete} />
          ) : null}
        </div>
      )}

      {/* ===== イベントモーダル ===== */}
      {showEventModal && currentEvent && (
        <EventModal
          event={currentEvent}
          player={currentPlayer}
          onDismiss={onDismissEvent}
          isMyTurn={isMyTurn}
        />
      )}

      {/* ===== 選択モーダル ===== */}
      {showChoiceModal && currentChoice && (
        <ChoiceModal
          choice={currentChoice}
          onChoose={onMakeChoice ?? (() => {})}
          isMyTurn={isMyTurn}
        />
      )}

      {/* ===== キャリア選択モーダル ===== */}
      {showCareerModal && state.currentCareerChoice && (
        <CareerModal
          player={currentPlayer}
          trigger={state.currentCareerChoice.trigger}
          onChoose={onChooseCareer ?? (() => {})}
          isMyTurn={isMyTurn}
        />
      )}

      {/* ===== 結婚ルーレットモーダル ===== */}
      {showMarriageRoulette && (
        <div
          className="absolute inset-0 z-40 flex flex-col"
          style={{ background: "rgba(4,2,20,0.96)", overflowY: "auto" }}
        >
          <div className="flex flex-col items-center px-5 pt-8 pb-6 gap-4">
            {/* タイトル */}
            <div className="text-center">
              <div style={{ fontSize: 44 }}>💒</div>
              <div
                className="font-bold retro-text mt-2"
                style={{ color: "var(--color-gold)", fontSize: 18, letterSpacing: "0.08em" }}
              >
                結婚の運命を試せ！
              </div>
              {state.marriageRoulette?.hasPartner ? (
                <div style={{ color: "#c084fc", fontSize: 12, marginTop: 6 }}>
                  ♥ 想い人がいる → <span style={{ color: "var(--color-green)", fontWeight: "bold" }}>4/6 で成功</span>
                </div>
              ) : (
                <div style={{ color: "#8070a0", fontSize: 12, marginTop: 6 }}>
                  まだ出会いが少ない → <span style={{ color: "#ff8c00", fontWeight: "bold" }}>2/6 で成功</span>
                </div>
              )}
              {/* 確率インジケーター */}
              <div className="flex gap-1 justify-center mt-3">
                {[1,2,3,4,5,6].map(n => {
                  const threshold = state.marriageRoulette?.hasPartner ? 4 : 2;
                  const isSuccess = n <= threshold;
                  return (
                    <div
                      key={n}
                      style={{
                        width: 28, height: 28,
                        borderRadius: 4,
                        background: isSuccess ? "var(--color-green)" : "#2a1060",
                        border: isSuccess ? "2px solid #00e864" : "2px solid #3a2060",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: isSuccess ? "#000" : "#4a3080",
                        fontSize: 13, fontWeight: "bold",
                        fontFamily: "'DotGothic16',monospace",
                      }}
                    >
                      {n}
                    </div>
                  );
                })}
              </div>
              <div style={{ color: "#4a3880", fontSize: 10, marginTop: 4 }}>
                {state.marriageRoulette?.hasPartner ? "1〜4 = 結婚　5〜6 = 今回は縁がなかった" : "1〜2 = 結婚　3〜6 = 今回は縁がなかった"}
              </div>
            </div>

            {/* ルーレット（自分のターンのみ操作可） */}
            {isMyTurn ? (
              <Roulette onComplete={handleMarriageComplete} />
            ) : (
              <div
                className="w-full py-6 text-center font-bold retro-text anim-blink"
                style={{ color: "#4a3880", fontSize: 14, border: "2px solid #2a1060" }}
              >
                ● {currentPlayer.name} が運命のルーレットを回しています…
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== プロフィールパネル ===== */}
      {profileIdx !== null && players[profileIdx] && (
        <PlayerProfile
          player={players[profileIdx]}
          onClose={() => setProfileIdx(null)}
        />
      )}
    </div>
  );
}
