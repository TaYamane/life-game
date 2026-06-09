"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { Avatar, AvatarColor } from "@/types/game";
import { AVATAR_COLORS, AVATAR_EMOJIS } from "@/types/game";
import {
  createRoom, joinRoom, subscribeRoom, fetchRoomState,
} from "@/hooks/useOnlineGame";
import type { GameState } from "@/types/game";
import { isSupabaseConfigured } from "@/lib/supabase";

interface Props {
  myPlayerId:   string;
  onGameStart: (params: {
    roomId:       string;
    playerIds:    string[];
    playerNames:  string[];
    isHost:       boolean;
    gameState?:   GameState;
  }) => void;
  onBack: () => void;
}

type Step = "menu" | "name" | "join" | "lobby";
const DEFAULT_COLORS: AvatarColor[] = ["red", "blue", "green", "yellow"];

/**
 * 全角英数字 → 半角、スペース削除、大文字化
 * 例: "ａｂＣ１２３" → "ABC123"
 */
function normalizeRoomCode(input: string): string {
  return input
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
    )
    .replace(/[\s　]/g, "") // 全角スペース・半角スペース除去
    .toUpperCase();
}

function AvatarPicker({ avatar, onChange }: { avatar: Avatar; onChange: (a: Avatar) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-1 flex-wrap">
        {AVATAR_EMOJIS.map(e => (
          <button key={e} onClick={() => onChange({ ...avatar, emoji: e })}
            className="btn-retro flex items-center justify-center text-lg"
            style={{
              width: 38, height: 38,
              background: avatar.emoji === e ? "#1a1060" : "#080420",
              border: avatar.emoji === e ? "2px solid var(--color-gold)" : "2px solid #2a1060",
            }}>
            {e}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {(Object.keys(AVATAR_COLORS) as AvatarColor[]).map(c => (
          <button key={c} onClick={() => onChange({ ...avatar, color: c })}
            className="btn-retro rounded-full"
            style={{
              width: 28, height: 28,
              backgroundColor: AVATAR_COLORS[c].bg,
              border: avatar.color === c ? "3px solid var(--color-gold)" : `3px solid ${AVATAR_COLORS[c].border}`,
              boxShadow: avatar.color === c ? "0 0 8px var(--color-gold)" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function MultiplayerSetup({ myPlayerId, onGameStart, onBack }: Props) {
  const [step, setStep]         = useState<Step>("menu");
  const [mode, setMode]         = useState<"create" | "join" | null>(null);
  const [name, setName]         = useState("");
  const [avatar, setAvatar]     = useState<Avatar>({ emoji: "😎", color: "blue" });
  const [joinCode, setJoinCode] = useState("");
  const [fullWidthWarn, setFullWidthWarn] = useState(false);
  const [roomId, setRoomId]     = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [isHost, setIsHost]     = useState(false);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [playerIds, setPlayerIds]     = useState<string[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const unsubRef = useRef<(() => void) | null>(null);

  // ロビー購読
  useEffect(() => {
    if (!roomId) return;
    unsubRef.current = subscribeRoom(roomId, async ({ playerIds: ids, playerNames: names, status, gameState }) => {
      setPlayerIds(ids);
      setPlayerNames(names);

      // ゲスト: ゲーム開始通知を受けたら参加
      if (status === "playing" && !isHost) {
        // game_state がペイロードに含まれない場合はフェッチ
        const gs = gameState ?? await fetchRoomState(roomId);
        if (gs) {
          onGameStart({ roomId, playerIds: ids, playerNames: names, isHost: false, gameState: gs });
        }
      }
    });
    return () => unsubRef.current?.();
  }, [roomId, isHost, onGameStart]);

  const handleCreateRoom = useCallback(async () => {
    if (!name.trim()) { setError("名前を入力してください"); return; }
    setLoading(true); setError("");
    const result = await createRoom(myPlayerId, name.trim());
    if (!result) { setError("ルーム作成に失敗しました。Supabase設定を確認してください。"); setLoading(false); return; }
    setRoomId(result.id);
    setRoomCode(result.code);
    setIsHost(true);
    setPlayerIds([myPlayerId]);
    setPlayerNames([name.trim()]);
    setStep("lobby");
    setLoading(false);
  }, [myPlayerId, name]);

  const handleJoinRoom = useCallback(async () => {
    if (!name.trim())          { setError("名前を入力してください"); return; }
    if (joinCode.length !== 6) { setError("6文字のコードを入力してください"); return; }
    setLoading(true); setError("");
    const result = await joinRoom(joinCode, myPlayerId, name.trim());
    if (!result) { setError("ルームが見つかりません。コードを確認してください。"); setLoading(false); return; }
    setRoomId(result.id);
    setRoomCode(joinCode.toUpperCase());
    setIsHost(false);
    setPlayerIds(result.playerIds);
    setPlayerNames(result.playerNames);
    setStep("lobby");
    setLoading(false);
  }, [myPlayerId, name, joinCode]);

  const handleStartGame = useCallback(() => {
    if (!roomId || playerIds.length < 2) return;
    onGameStart({ roomId, playerIds, playerNames, isHost: true });
  }, [roomId, playerIds, playerNames, onGameStart]);

  // ── Supabase 未設定 ──────────────────────────────
  if (!isSupabaseConfigured) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <div className="font-bold retro-text mb-3" style={{ color: "var(--color-gold)", fontSize: 16 }}>
          Supabase 未設定
        </div>
        <div style={{ color: "#8070a0", fontSize: 12, lineHeight: 1.8 }}>
          オンライン対戦には Supabase の設定が必要です。<br/>
          <code style={{ color: "#c084fc", fontSize: 11 }}>.env.local</code> に<br/>
          URL と ANON KEY を設定してください。<br/><br/>
          詳細: <code style={{ color: "#c084fc" }}>supabase/schema.sql</code> を参照。
        </div>
        <button onClick={onBack} className="btn-retro mt-6 px-6 py-3 font-bold retro-text"
          style={{ color: "var(--color-gold)", border: "2px solid var(--color-border)", background: "#0a0440", fontSize: 13 }}>
          ◀ 戻る
        </button>
      </div>
    );
  }

  // ── メニュー ─────────────────────────────────────
  if (step === "menu") return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-4">
      <div className="text-4xl mb-2">🌐</div>
      <div className="font-bold retro-text mb-4" style={{ color: "var(--color-gold)", fontSize: 18 }}>
        オンライン対戦
      </div>
      <button
        onClick={() => { setMode("create"); setStep("name"); }}
        className="btn-retro w-full py-5 font-bold retro-text text-xl tracking-wider"
        style={{ background: "#001a30", color: "var(--color-cyan)", border: "3px solid var(--color-cyan)", boxShadow: "3px 3px 0 #000" }}>
        🏠 ルームを作る
      </button>
      <button
        onClick={() => { setMode("join"); setStep("name"); }}
        className="btn-retro w-full py-5 font-bold retro-text text-xl tracking-wider"
        style={{ background: "#1a0030", color: "#c084fc", border: "3px solid #7c3aed", boxShadow: "3px 3px 0 #000" }}>
        🚪 ルームに参加する
      </button>
      <button onClick={onBack} className="btn-retro w-full py-3 font-bold retro-text"
        style={{ color: "#6050a0", border: "2px solid #2a1060", background: "transparent", fontSize: 13 }}>
        ◀ 戻る
      </button>
    </div>
  );

  // ── 名前入力 ─────────────────────────────────────
  if (step === "name") return (
    <div className="flex flex-col px-4 pt-10 gap-4">
      <div className="font-bold retro-text text-center mb-2" style={{ color: "var(--color-gold)", fontSize: 16 }}>
        {mode === "create" ? "🏠 ルーム作成" : "🚪 ルーム参加"} — プレイヤー設定
      </div>
      <input
        type="text" value={name} onChange={e => setName(e.target.value)}
        placeholder="あなたの名前（8文字まで）" maxLength={8}
        className="w-full px-3 py-3 font-bold outline-none"
        style={{ background: "#08041a", border: "2px solid #3a2480", color: "var(--color-text)", fontSize: 16 }}
      />
      <AvatarPicker avatar={avatar} onChange={setAvatar} />

      {error && <div style={{ color: "var(--color-red)", fontSize: 12 }}>{error}</div>}

      {/* コード入力（参加モード） */}
      {mode === "join" && (
        <>
          <input
            type="text" value={joinCode}
            onChange={e => {
              const raw = e.target.value;
              const normalized = normalizeRoomCode(raw);
              setFullWidthWarn(raw !== normalized && raw.length > 0);
              setJoinCode(normalized);
            }}
            placeholder="ルームコード (例: ABC123)" maxLength={6}
            className="w-full px-3 py-3 font-bold text-center tracking-widest outline-none"
            style={{ background: "#08041a", border: "2px solid #7c3aed", color: "#c084fc", fontSize: 22, letterSpacing: "0.3em" }}
          />
          {fullWidthWarn && (
            <div style={{ color: "var(--color-gold)", fontSize: 11, marginTop: -8 }}>
              ⚠ 全角文字を半角に自動変換しました
            </div>
          )}
        </>
      )}

      <button
        onClick={mode === "create" ? handleCreateRoom : handleJoinRoom}
        disabled={loading}
        className="btn-retro w-full py-5 font-bold retro-text text-xl"
        style={{
          background: mode === "create" ? "#001a30" : "#1a0030",
          color: mode === "create" ? "var(--color-cyan)" : "#c084fc",
          border: `3px solid ${mode === "create" ? "var(--color-cyan)" : "#7c3aed"}`,
          boxShadow: "3px 3px 0 #000",
          opacity: loading ? 0.7 : 1,
        }}>
        {loading
          ? (mode === "create" ? "作成中…" : "参加中…")
          : (mode === "create" ? "▶ ルームを作成" : "▶ 参加する")
        }
      </button>
      <button onClick={() => setStep("menu")} className="btn-retro py-2 font-bold retro-text text-center"
        style={{ color: "#6050a0", border: "2px solid #2a1060", background: "transparent", fontSize: 12 }}>
        ◀ 戻る
      </button>
    </div>
  );

  // ── ロビー ────────────────────────────────────────
  if (step === "lobby") return (
    <div className="flex flex-col px-4 pt-8 gap-4">
      <div className="text-center">
        <div className="font-bold retro-text" style={{ color: "var(--color-gold)", fontSize: 16 }}>
          {isHost ? "待機中…" : "ゲーム開始を待っています…"}
        </div>
        {isHost && <div style={{ color: "#8070a0", fontSize: 11 }}>友達にこのコードを教えてね！</div>}
      </div>

      {/* ルームコード */}
      <div className="text-center py-4"
        style={{ background: "#08041a", border: "3px solid var(--color-gold)", boxShadow: "3px 3px 0 #7a5500" }}>
        <div style={{ color: "#8070a0", fontSize: 11 }}>ルームコード</div>
        <div className="font-bold retro-text tracking-widest" style={{ color: "var(--color-gold)", fontSize: 36, letterSpacing: "0.3em" }}>
          {roomCode}
        </div>
        <div style={{ color: "#6050a0", fontSize: 10 }}>このコードをシェアしてください</div>
      </div>

      {/* 参加者リスト */}
      <div style={{ background: "#08041a", border: "2px solid #2a1060" }}>
        <div className="px-3 py-2" style={{ borderBottom: "1px solid #2a1060", color: "#8070a0", fontSize: 11 }}>
          👥 参加者 ({playerNames.length} / 4)
        </div>
        {playerNames.map((n, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid #1a0a40" }}>
            <div className="flex items-center justify-center text-base rounded-sm"
              style={{ width: 28, height: 28, backgroundColor: AVATAR_COLORS[DEFAULT_COLORS[i % 4]].bg }}>
              {AVATAR_EMOJIS[i % AVATAR_EMOJIS.length]}
            </div>
            <span className="font-bold" style={{ color: "#c4b5d4", fontSize: 13 }}>{n}</span>
            {i === 0 && (
              <span className="ml-auto px-2 py-0.5 font-bold"
                style={{ color: "var(--color-gold)", border: "1px solid var(--color-gold)", background: "#1a1400", fontSize: 9 }}>
                HOST
              </span>
            )}
            {playerIds[i] === myPlayerId && i > 0 && (
              <span className="ml-auto px-2 py-0.5 font-bold"
                style={{ color: "var(--color-cyan)", border: "1px solid var(--color-cyan)", background: "#001a30", fontSize: 9 }}>
                YOU
              </span>
            )}
          </div>
        ))}
        {playerNames.length < 2 && (
          <div className="px-3 py-3 text-center anim-blink" style={{ color: "#4a3880", fontSize: 11 }}>
            ● もう1人の参加を待っています…
          </div>
        )}
      </div>

      {isHost && (
        <button
          onClick={handleStartGame}
          disabled={playerNames.length < 2}
          className="btn-retro w-full py-5 font-bold retro-text text-xl tracking-wider"
          style={{
            background: playerNames.length >= 2 ? "#1a1400" : "#0a0820",
            color: playerNames.length >= 2 ? "var(--color-gold)" : "#3a3060",
            border: `3px solid ${playerNames.length >= 2 ? "var(--color-gold)" : "#2a1060"}`,
            boxShadow: playerNames.length >= 2 ? "3px 3px 0 #7a5500" : "none",
          }}>
          {playerNames.length < 2 ? "もう1人来るのを待ち中…" : "▶ ゲーム開始！"}
        </button>
      )}

      {!isHost && (
        <div className="py-4 text-center font-bold retro-text anim-blink"
          style={{ color: "#6050a0", fontSize: 13 }}>
          ● ホストがゲームを開始するまで待機中…
        </div>
      )}
    </div>
  );

  return null;
}
