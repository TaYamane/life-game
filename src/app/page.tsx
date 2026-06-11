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

// ── ゲームセーブ / ロード ──────────────────────────────
const SAVE_KEY = "life-game-save";

interface SaveData {
  appPhase: "offline_game";
  state: GameState;
}

function loadSaveData(): SaveData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;
    if (data.appPhase !== "offline_game") return null;
    if (!data.state || data.state.phase === "setup" || data.state.phase === "goal") return null;
    return data;
  } catch {
    return null;
  }
}

function clearSaveData(): void {
  if (typeof window !== "undefined") localStorage.removeItem(SAVE_KEY);
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

// ── 装飾用スピニングルーレット ────────────────────────────
function MiniRoulette({ size = 92 }: { size?: number }) {
  const cx = size / 2;
  const R  = size * 0.43;
  const RI = size * 0.15;
  const SEG = ["#ff2844","#ff8c00","#ffcc00","#00e864","#4488ff","#cc44ff"];

  function rad(deg: number) { return (deg - 90) * Math.PI / 180; }
  function pt(r: number, deg: number) {
    return { x: cx + r * Math.cos(rad(deg)), y: cx + r * Math.sin(rad(deg)) };
  }
  function sector(i: number) {
    const a1 = i * 60, a2 = (i + 1) * 60;
    const o = pt(RI, a1), p = pt(R, a1), q = pt(R, a2), n = pt(RI, a2);
    return [
      `M${o.x.toFixed(1)},${o.y.toFixed(1)}`,
      `L${p.x.toFixed(1)},${p.y.toFixed(1)}`,
      `A${R},${R} 0 0,1 ${q.x.toFixed(1)},${q.y.toFixed(1)}`,
      `L${n.x.toFixed(1)},${n.y.toFixed(1)}`,
      `A${RI},${RI} 0 0,0 ${o.x.toFixed(1)},${o.y.toFixed(1)}Z`,
    ].join(" ");
  }

  return (
    <svg
      width={size} height={size}
      style={{ filter: "drop-shadow(0 0 16px rgba(255,204,0,0.55))", overflow: "visible" }}
    >
      {/* 外枠 */}
      <circle cx={cx} cy={cx} r={R + 6} fill="none" stroke="var(--color-gold)" strokeWidth={2.5} opacity={0.6} />
      <circle cx={cx} cy={cx} r={R + 9} fill="none" stroke="var(--color-gold)" strokeWidth={1} opacity={0.25} />

      {/* ポインター（上） */}
      <polygon
        points={`${cx},${2} ${cx - 7},${16} ${cx + 7},${16}`}
        fill="var(--color-gold)"
        style={{ filter: "drop-shadow(0 0 4px var(--color-gold))" }}
      />

      {/* スピニンググループ（SVG ネイティブアニメーション） */}
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${cx} ${cx}`}
          to={`360 ${cx} ${cx}`}
          dur="5s"
          repeatCount="indefinite"
        />
        {SEG.map((col, i) => (
          <path key={i} d={sector(i)} fill={col} stroke="#000" strokeWidth={1.5} />
        ))}
        {/* ゴールドの区切り線 */}
        {[0,1,2,3,4,5].map(i => {
          const p1 = pt(RI, i * 60), p2 = pt(R, i * 60);
          return (
            <line key={i}
              x1={p1.x.toFixed(1)} y1={p1.y.toFixed(1)}
              x2={p2.x.toFixed(1)} y2={p2.y.toFixed(1)}
              stroke="rgba(0,0,0,0.4)" strokeWidth={1.5}
            />
          );
        })}
      </g>

      {/* センターハブ */}
      <circle cx={cx} cy={cx} r={RI + 1} fill="#08041a" stroke="var(--color-gold)" strokeWidth={2.5} />
      <circle cx={cx} cy={cx} r={4} fill="var(--color-gold)" />
    </svg>
  );
}

// ── タイトル画面 ──────────────────────────────────────────
function TitleScreen({
  onOffline, onCreateRoom, onJoinRoom, onResume, hasSavedGame,
}: {
  onOffline: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onResume?: () => void;
  hasSavedGame?: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center scanlines relative"
      style={{
        height: "100dvh",
        backgroundColor: "var(--color-bg)",
        overflowY: "auto",
        overflowX: "hidden",
      }}
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

      {/* グリッドライン装飾 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(60,40,120,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(60,40,120,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      {/* コンテンツ */}
      <div className="relative z-10 flex flex-col items-center w-full px-5 max-w-sm py-8 gap-0">

        {/* ─── ヘッダーバッジ ─── */}
        <div
          className="retro-text mb-4"
          style={{
            color: "#4a3880",
            fontSize: 9,
            letterSpacing: "0.55em",
            border: "1px solid #2a1860",
            padding: "3px 14px",
          }}
        >
          LIFE BOARD GAME
        </div>

        {/* ─── ルーレット ─── */}
        <div style={{ marginBottom: 18 }}>
          <MiniRoulette size={96} />
        </div>

        {/* ─── メインタイトル ─── */}
        <div className="text-center mb-1">
          <h1
            className="font-bold retro-text anim-title-flicker anim-title-glow"
            style={{
              color: "var(--color-gold)",
              fontSize: 32,
              letterSpacing: "0.18em",
              lineHeight: 1,
              textShadow: "0 0 20px rgba(255,204,0,0.6), 2px 2px 0 #000",
            }}
          >
            PIXEL LIFE
          </h1>
          <div
            className="retro-text"
            style={{
              color: "#c084fc",
              fontSize: 13,
              letterSpacing: "0.6em",
              marginTop: 4,
              textShadow: "0 0 10px rgba(192,132,252,0.55)",
            }}
          >
            (仮)
          </div>
        </div>

        {/* ─── PRESS START ─── */}
        <p
          className="anim-title-sub retro-text"
          style={{
            color: "#6040a0",
            fontSize: 10,
            letterSpacing: "0.28em",
            marginBottom: 22,
            marginTop: 8,
          }}
        >
          ▶ PRESS START ◀
        </p>

        {/* ─── ボタン群 ─── */}
        <div className="w-full flex flex-col gap-2.5">

          {/* 続きから（セーブあり時のみ） */}
          {hasSavedGame && onResume && (
            <button
              onClick={onResume}
              className="btn-retro w-full font-bold retro-text tracking-wider"
              style={{
                padding: "14px 0",
                background: "linear-gradient(180deg, #001e00, #001200)",
                color: "var(--color-green)",
                border: "2px solid var(--color-green)",
                boxShadow: "3px 3px 0 #004400, 0 0 14px rgba(0,232,100,0.2)",
                fontSize: 15,
              }}
            >
              ▶ 続きから遊ぶ
            </button>
          )}

          {/* オフライン */}
          <button
            onClick={onOffline}
            className="btn-retro w-full font-bold retro-text tracking-wider"
            style={{
              padding: "14px 0",
              background: "linear-gradient(180deg, #0e0060, #060038)",
              color: "var(--color-gold)",
              border: "2px solid var(--color-gold)",
              boxShadow: "3px 3px 0 #7a5500, 0 0 14px rgba(255,204,0,0.2)",
              fontSize: 15,
            }}
          >
            🎮 オフラインで遊ぶ
          </button>

          {/* ONLINE 仕切り */}
          <div className="flex items-center gap-2" style={{ margin: "2px 0" }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #3a2080)" }} />
            <span
              className="retro-text"
              style={{ color: "#3a2060", fontSize: 9, letterSpacing: "0.4em", padding: "0 4px" }}
            >
              ONLINE
            </span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #3a2080, transparent)" }} />
          </div>

          {/* ルームを作る */}
          <button
            onClick={onCreateRoom}
            className="btn-retro w-full font-bold retro-text tracking-wider"
            style={{
              padding: "14px 0",
              background: "linear-gradient(180deg, #001e30, #001020)",
              color: "var(--color-cyan)",
              border: "2px solid var(--color-cyan)",
              boxShadow: "3px 3px 0 #005566, 0 0 14px rgba(0,224,255,0.15)",
              fontSize: 15,
            }}
          >
            🏠 ルームを作る
          </button>

          {/* コードで参加 */}
          <button
            onClick={onJoinRoom}
            className="btn-retro w-full font-bold retro-text tracking-wider"
            style={{
              padding: "14px 0",
              background: "linear-gradient(180deg, #1e0038, #110022)",
              color: "#c084fc",
              border: "2px solid #7c3aed",
              boxShadow: "3px 3px 0 #3a0088, 0 0 14px rgba(124,58,237,0.15)",
              fontSize: 15,
            }}
          >
            🚪 コードで参加
          </button>
        </div>

        {/* ─── アバターカラードット ─── */}
        <div className="flex gap-3 mt-5">
          {Object.values(AVATAR_COLORS).map((c, i) => (
            <div
              key={i}
              className="rounded-full anim-title-dot"
              style={{
                width: 10, height: 10,
                backgroundColor: c.bg,
                boxShadow: `0 0 7px ${c.bg}`,
                animationDelay: `${i * 0.22}s`,
              }}
            />
          ))}
        </div>

        <p style={{ color: "#2e1e60", fontSize: 9, marginTop: 10 }}>
          スマホ縦画面推奨
        </p>

      </div>
    </div>
  );
}

// ============================================================
// メインページ
// ============================================================
type AppPhase = "title" | "offline_setup" | "offline_game" | "online_lobby" | "online_game";

export default function Home() {
  const [savedGame, setSavedGame]       = useState<SaveData | null>(null);
  const [appPhase, setAppPhase]         = useState<AppPhase>("title");
  const [onlineInitMode, setOnlineInitMode] = useState<"create" | "join" | null>(null);
  const [myPlayerId]                    = useState(getOrCreatePlayerId);
  const [roomId, setRoomId]             = useState<string | null>(null);
  const [isHost, setIsHost]             = useState(false);
  const hasInitOnline             = useRef(false); // 初回同期フラグ

  const { state, startGame, rollDice, dismissEvent, makeChoice, chooseCareer, endTurn, resetGame, setState, marriageRoll, confessionRoll } = useGameStore();

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

  // ── マウント後にlocalStorageからセーブデータを読み込む（SSR回避）──
  useEffect(() => {
    setSavedGame(loadSaveData());
  }, []);

  // ── オフラインゲーム状態をlocalStorageに自動セーブ ──
  useEffect(() => {
    if (appPhase !== "offline_game") return;
    if (state.phase === "setup" || state.phase === "goal") return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ appPhase, state }));
    } catch { /* quota exceeded 等は無視 */ }
  }, [state, appPhase]);

  // ── 続きから再開 ──────────────────────────────────
  const handleResume = useCallback(() => {
    const save = loadSaveData(); // 常に最新値をlocalStorageから直接読む
    if (!save) return;
    setState(save.state);
    setAppPhase("offline_game");
  }, [setState]);

  // ── リセット（セーブデータも削除）────────────────
  const handleReset = useCallback(() => {
    resetGame();
    clearSaveData();
    setAppPhase("title");
    setRoomId(null);
    setIsHost(false);
    setOnlineInitMode(null);
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

  const onlineMarriageRoll = useCallback((value: number) => {
    if (currentPlayerIdRef.current !== myPlayerId) return;
    pendingSyncRef.current = true;
    marriageRoll(value);
  }, [myPlayerId, marriageRoll]);

  const onlineConfessionRoll = useCallback((value: number) => {
    if (currentPlayerIdRef.current !== myPlayerId) return;
    pendingSyncRef.current = true;
    confessionRoll(value);
  }, [myPlayerId, confessionRoll]);

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
        onCreateRoom={() => { setOnlineInitMode("create"); setAppPhase("online_lobby"); }}
        onJoinRoom={() => { setOnlineInitMode("join"); setAppPhase("online_lobby"); }}
        onResume={handleResume}
        hasSavedGame={!!savedGame}
      />
    );
  }

  if (appPhase === "online_lobby") {
    return (
      <div style={{ height: "100dvh", backgroundColor: "var(--color-bg)", overflowY: "auto" }}>
        <MultiplayerSetup
          myPlayerId={myPlayerId}
          defaultMode={onlineInitMode ?? undefined}
          onGameStart={handleOnlineGameStart}
          onBack={() => { setAppPhase("title"); setOnlineInitMode(null); }}
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
        onMarriageRoll={appPhase === "online_game" ? onlineMarriageRoll : marriageRoll}
        onConfessionRoll={appPhase === "online_game" ? onlineConfessionRoll : confessionRoll}
        onEndTurn={appPhase === "online_game" ? onlineEndTurn : endTurn}
        isMyTurn={isMyTurn}
      />
    );
  }

  return (
    <TitleScreen
      onOffline={() => setAppPhase("offline_setup")}
      onCreateRoom={() => { setOnlineInitMode("create"); setAppPhase("online_lobby"); }}
      onJoinRoom={() => { setOnlineInitMode("join"); setAppPhase("online_lobby"); }}
      onResume={handleResume}
      hasSavedGame={!!savedGame}
    />
  );
}


