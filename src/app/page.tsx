"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { useOnlineGame, startOnlineGame } from "@/hooks/useOnlineGame";
import { SetupScreen } from "@/components/SetupScreen";
import { GameScreen } from "@/components/GameScreen";
import { GoalScreen } from "@/components/GoalScreen";
import { MultiplayerSetup } from "@/components/MultiplayerSetup";
import type { Avatar, GameState } from "@/types/game";
import { AVATAR_COLORS } from "@/types/game";

// ── プレイヤーUUID を localStorage に永続化 ──────────
function getOrCreatePlayerId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("life-game-player-id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("life-game-player-id", id); }
  return id;
}

// ── タイトル画面 ──────────────────────────────────────
const TITLE_STARS = [
  { x: "8%",  y: "12%", size: 2, color: "#ffcc00", delay: "0s",    dur: "2.1s" },
  { x: "88%", y: "9%",  size: 2, color: "#4488ff", delay: "0.4s",  dur: "2.8s" },
  { x: "15%", y: "45%", size: 1, color: "#cc44ff", delay: "0.8s",  dur: "1.9s" },
  { x: "92%", y: "40%", size: 2, color: "#00e864", delay: "1.2s",  dur: "2.4s" },
  { x: "5%",  y: "72%", size: 1, color: "#00e0ff", delay: "0.2s",  dur: "2.6s" },
  { x: "95%", y: "68%", size: 2, color: "#ff2844", delay: "1.5s",  dur: "2.2s" },
  { x: "50%", y: "5%",  size: 1, color: "#ffcc00", delay: "0.6s",  dur: "3.0s" },
  { x: "75%", y: "22%", size: 2, color: "#ff8c00", delay: "1.0s",  dur: "2.3s" },
  { x: "30%", y: "18%", size: 1, color: "#4488ff", delay: "1.8s",  dur: "1.8s" },
  { x: "60%", y: "78%", size: 1, color: "#cc44ff", delay: "0.9s",  dur: "2.7s" },
];

function TitleScreen({ onOffline, onOnline }: { onOffline: () => void; onOnline: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center overflow-hidden scanlines relative"
      style={{ height: "100dvh", backgroundColor: "var(--color-bg)" }}
    >
      {/* 星の背景 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {TITLE_STARS.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full anim-title-star"
            style={{
              left: s.x, top: s.y,
              width: s.size * 3, height: s.size * 3,
              backgroundColor: s.color,
              boxShadow: `0 0 4px ${s.color}`,
              animationDelay: s.delay,
              animationDuration: s.dur,
            }}
          />
        ))}
      </div>

      {/* タイトルブロック */}
      <div className="text-center mb-8 px-6 relative z-10">
        <div className="text-6xl mb-4 anim-title-dice" style={{ display: "inline-block" }}>🎲</div>

        <div
          className="retro-text mb-1"
          style={{ color: "#6050a0", fontSize: 10, letterSpacing: "0.4em" }}
        >
          ── LIFE ADVENTURE GAME ──
        </div>

        <h1
          className="font-bold retro-text leading-tight anim-title-flicker anim-title-glow"
          style={{ color: "var(--color-gold)", fontSize: 24, letterSpacing: "0.1em" }}
        >
          ドキドキ<br />人生冒険ゲーム
        </h1>

        <p
          className="anim-title-sub retro-text"
          style={{ color: "#c084fc", fontSize: 11, marginTop: 14, letterSpacing: "0.2em" }}
        >
          ▶ PRESS START ◀
        </p>
      </div>

      {/* ボタン */}
      <div className="w-full px-6 space-y-4 max-w-sm relative z-10">
        <button onClick={onOffline}
          className="btn-retro w-full py-5 font-bold retro-text text-xl tracking-wider"
          style={{
            background: "#0a0050",
            color: "var(--color-gold)",
            border: "3px solid var(--color-gold)",
            boxShadow: "3px 3px 0 #7a5500, 0 0 14px rgba(255,204,0,0.25)",
          }}>
          🎮 ひとりで遊ぶ
        </button>
        <button onClick={onOnline}
          className="btn-retro w-full py-5 font-bold retro-text text-xl tracking-wider"
          style={{
            background: "#001830",
            color: "var(--color-cyan)",
            border: "3px solid var(--color-cyan)",
            boxShadow: "3px 3px 0 #005566, 0 0 14px rgba(0,224,255,0.2)",
          }}>
          🌐 友達と遊ぶ
        </button>
      </div>

      {/* アバタードット */}
      <div className="mt-10 flex gap-4 relative z-10">
        {Object.values(AVATAR_COLORS).map((c, i) => (
          <div
            key={i}
            className="rounded-full anim-title-dot"
            style={{
              width: 12, height: 12,
              backgroundColor: c.bg,
              boxShadow: `0 0 8px ${c.bg}`,
              animationDelay: `${i * 0.25}s`,
            }}
          />
        ))}
      </div>

      <p style={{ color: "#3a2880", fontSize: 9, marginTop: 16 }}>スマホ縦画面推奨</p>
    </div>
  );
}

// ============================================================
// メインページ
// ============================================================
type AppPhase = "title" | "offline_setup" | "offline_game" | "online_lobby" | "online_game";

export default function Home() {
  const [appPhase, setAppPhase]   = useState<AppPhase>("title");
  const [myPlayerId]              = useState(getOrCreatePlayerId);
  const [roomId, setRoomId]       = useState<string | null>(null);
  const [isHost, setIsHost]       = useState(false);
  const hasInitOnline             = useRef(false); // 初回同期フラグ

  const { state, startGame, rollDice, dismissEvent, makeChoice, chooseCareer, endTurn, resetGame, setState } = useGameStore();

  // ── オンライン同期フック ──────────────────────────
  const handleRemoteState = useCallback((s: GameState) => {
    setState(s);
  }, [setState]);

  const { syncState } = useOnlineGame({
    roomId:        appPhase === "online_game" ? roomId : null,
    myPlayerId,
    localState:    state,
    onRemoteState: handleRemoteState,
  });

  // ── ホスト: state が "playing" になったら Supabase に初期状態を書き込む ──
  useEffect(() => {
    if (appPhase !== "online_game" || !isHost || !roomId) return;
    if (state.phase !== "playing")                         return;
    if (hasInitOnline.current)                             return;

    hasInitOnline.current = true;
    startOnlineGame(roomId, state).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, appPhase, isHost, roomId]);

  // ── 自分のアクション後に必ず同期（pendingSyncRef 方式）──
  // currentPlayerIndex が変わった後でも「誰がアクションしたか」を追跡できる。
  const pendingSyncRef = useRef(false);

  useEffect(() => {
    if (appPhase !== "online_game") return;
    if (!pendingSyncRef.current) return;
    pendingSyncRef.current = false;
    syncState(state).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // ── オンラインゲーム開始コールバック ──────────────
  const handleOnlineGameStart = useCallback(({
    roomId: rid, playerIds, playerNames, isHost: host, gameState,
  }: {
    roomId:       string;
    playerIds:    string[];
    playerNames:  string[];
    isHost:       boolean;
    gameState?:   GameState;
  }) => {
    setRoomId(rid);
    setIsHost(host);
    hasInitOnline.current = false;

    if (host) {
      // ホスト: プレイヤー設定してゲーム開始。Supabase 書き込みは useEffect が担当
      const avatarEmojis = ["😀", "😎", "🥳", "🤩"];
      const avatarColors = ["red", "blue", "green", "yellow"] as const;
      const players = playerNames.map((name, i) => ({
        name,
        avatar: {
          emoji: avatarEmojis[i % avatarEmojis.length],
          color: avatarColors[i % avatarColors.length],
        } as { emoji: string; color: typeof avatarColors[number] },
        playerId: playerIds[i],
      }));
      startGame(players);
    } else {
      // ゲスト: 受け取った gameState を適用
      if (gameState) setState(gameState);
    }

    setAppPhase("online_game");
  }, [startGame, setState]);

  // ── リセット ──────────────────────────────────────
  const handleReset = useCallback(() => {
    resetGame();
    setAppPhase("title");
    setRoomId(null);
    setIsHost(false);
    hasInitOnline.current = false;
  }, [resetGame]);

  // ── 自分のターンか判定 ────────────────────────────
  const currentPlayer = state.players[state.currentPlayerIndex];
  const isMyTurn =
    appPhase !== "online_game" ||
    currentPlayer?.playerId === myPlayerId;

  // 常に最新の currentPlayerId を参照できる ref
  const currentPlayerIdRef = useRef<string | undefined>(undefined);
  currentPlayerIdRef.current = currentPlayer?.playerId;

  // ── オンライン用アクションラッパー ──────────────
  // useCallback のクロージャ古化を防ぐため ref で直接比較
  const onlineRollDice = useCallback((value: number) => {
    if (currentPlayerIdRef.current !== myPlayerId) return;
    pendingSyncRef.current = true;
    rollDice(value);
  }, [myPlayerId, rollDice]);

  const onlineDismissEvent = useCallback(() => {
    if (currentPlayerIdRef.current !== myPlayerId) return;
    pendingSyncRef.current = true;
    dismissEvent();
  }, [myPlayerId, dismissEvent]);

  const onlineMakeChoice = useCallback((optionId: string) => {
    if (currentPlayerIdRef.current !== myPlayerId) return;
    pendingSyncRef.current = true;
    makeChoice(optionId);
  }, [myPlayerId, makeChoice]);

  const onlineChooseCareer = useCallback((job: import("@/types/game").JobType) => {
    if (currentPlayerIdRef.current !== myPlayerId) return;
    pendingSyncRef.current = true;
    chooseCareer(job);
  }, [myPlayerId, chooseCareer]);

  const onlineEndTurn = useCallback(() => {
    if (currentPlayerIdRef.current !== myPlayerId) return;
    pendingSyncRef.current = true;
    endTurn();
  }, [myPlayerId, endTurn]);

  // ── 描画分岐 ─────────────────────────────────────
  if (appPhase === "title") {
    return (
      <TitleScreen
        onOffline={() => setAppPhase("offline_setup")}
        onOnline={() => setAppPhase("online_lobby")}
      />
    );
  }

  if (appPhase === "online_lobby") {
    return (
      <div style={{ height: "100dvh", backgroundColor: "var(--color-bg)", overflowY: "auto" }}>
        <MultiplayerSetup
          myPlayerId={myPlayerId}
          onGameStart={handleOnlineGameStart}
          onBack={() => setAppPhase("title")}
        />
      </div>
    );
  }

  if ((appPhase === "offline_setup") && state.phase === "setup") {
    return (
      <SetupScreen
        onStart={players => { startGame(players); setAppPhase("offline_game"); }}
      />
    );
  }

  if (state.phase === "goal") {
    return <GoalScreen players={state.players} onReset={handleReset} />;
  }

  if (state.phase !== "setup") {
    return (
      <GameScreen
        state={state}
        onRollDice={appPhase === "online_game" ? onlineRollDice : rollDice}
        onDismissEvent={appPhase === "online_game" ? onlineDismissEvent : dismissEvent}
        onMakeChoice={appPhase === "online_game" ? onlineMakeChoice : makeChoice}
        onChooseCareer={appPhase === "online_game" ? onlineChooseCareer : chooseCareer}
        onEndTurn={appPhase === "online_game" ? onlineEndTurn : endTurn}
        isMyTurn={isMyTurn}
      />
    );
  }

  return (
    <TitleScreen
      onOffline={() => setAppPhase("offline_setup")}
      onOnline={() => setAppPhase("online_lobby")}
    />
  );
}
