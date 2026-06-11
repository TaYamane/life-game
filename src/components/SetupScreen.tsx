"use client";

import { useState } from "react";
import type { Avatar, AvatarColor } from "@/types/game";
import { AVATAR_COLORS, AVATAR_EMOJIS } from "@/types/game";

interface Props {
  onStart: (players: { name: string; avatar: Avatar }[]) => void;
}

const DEFAULT_NAMES = ["プレイヤー1", "プレイヤー2", "プレイヤー3", "プレイヤー4"];

interface PlayerFormProps {
  index: number;
  name: string;
  avatar: Avatar;
  onNameChange: (name: string) => void;
  onAvatarChange: (avatar: Avatar) => void;
}

function PlayerForm({ index, name, avatar, onNameChange, onAvatarChange }: PlayerFormProps) {
  const colorInfo = AVATAR_COLORS[avatar.color];

  return (
    <div
      className="rounded-2xl p-3 mb-3"
      style={{
        backgroundColor: "var(--color-panel)",
        border: "2px solid var(--color-border)",
      }}
    >
      {/* 上段: アバター + 名前入力 */}
      <div className="flex items-center gap-3 mb-3">
        {/* アバタープレビュー */}
        <div
          className="flex items-center justify-center rounded-full flex-shrink-0 text-2xl"
          style={{
            width: 52,
            height: 52,
            backgroundColor: colorInfo.bg,
            border: `3px solid ${colorInfo.border}`,
            boxShadow: `0 3px 0 ${colorInfo.border}`,
          }}
        >
          {avatar.emoji}
        </div>

        <div className="flex-1">
          <div className="text-xs font-bold mb-1" style={{ color: "var(--color-gold)" }}>
            プレイヤー {index + 1}
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={DEFAULT_NAMES[index]}
            maxLength={8}
            className="w-full rounded-xl px-3 py-2 font-bold outline-none"
            style={{
              backgroundColor: "#0f0a1e",
              border: "2px solid var(--color-border)",
              color: "var(--color-text)",
              fontSize: 16, // iOSズーム防止のため16px以上必須
            }}
          />
        </div>
      </div>

      {/* 下段: 絵文字 + 色 を横並び */}
      <div className="flex gap-4">
        {/* 絵文字選択 */}
        <div className="flex-1">
          <div className="text-xs mb-1" style={{ color: "#9980cc" }}>えがお</div>
          <div className="flex gap-1 flex-wrap">
            {AVATAR_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onAvatarChange({ ...avatar, emoji })}
                className="btn-touch rounded-lg flex items-center justify-center"
                style={{
                  width: 34,
                  height: 34,
                  fontSize: 18,
                  backgroundColor: avatar.emoji === emoji ? "var(--color-border)" : "#0f0a1e",
                  border: avatar.emoji === emoji
                    ? "2px solid var(--color-gold)"
                    : "2px solid var(--color-border)",
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* 色選択 */}
        <div>
          <div className="text-xs mb-1" style={{ color: "#9980cc" }}>いろ</div>
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-1.5">
              {(["red", "blue", "green"] as AvatarColor[]).map((colorKey) => (
                <ColorDot
                  key={colorKey}
                  colorKey={colorKey}
                  selected={avatar.color === colorKey}
                  onSelect={() => onAvatarChange({ ...avatar, color: colorKey })}
                />
              ))}
            </div>
            <div className="flex gap-1.5">
              {(["yellow", "purple", "pink"] as AvatarColor[]).map((colorKey) => (
                <ColorDot
                  key={colorKey}
                  colorKey={colorKey}
                  selected={avatar.color === colorKey}
                  onSelect={() => onAvatarChange({ ...avatar, color: colorKey })}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorDot({
  colorKey,
  selected,
  onSelect,
}: {
  colorKey: AvatarColor;
  selected: boolean;
  onSelect: () => void;
}) {
  const colorInfo = AVATAR_COLORS[colorKey];
  return (
    <button
      onClick={onSelect}
      className="btn-touch rounded-full"
      style={{
        width: 30,
        height: 30,
        backgroundColor: colorInfo.bg,
        border: selected ? "3px solid var(--color-gold)" : `3px solid ${colorInfo.border}`,
        boxShadow: selected ? "0 0 8px var(--color-gold)" : "none",
      }}
    />
  );
}

export function SetupScreen({ onStart }: Props) {
  const [playerCount, setPlayerCount] = useState(2);
  const [players, setPlayers] = useState<{ name: string; avatar: Avatar }[]>([
    { name: "", avatar: { emoji: "😀", color: "red" } },
    { name: "", avatar: { emoji: "😎", color: "blue" } },
    { name: "", avatar: { emoji: "🥳", color: "green" } },
    { name: "", avatar: { emoji: "🤩", color: "yellow" } },
  ]);

  const handleStart = () => {
    const activePlayers = players.slice(0, playerCount).map((p, i) => ({
      name: p.name.trim() || DEFAULT_NAMES[i],
      avatar: p.avatar,
    }));
    onStart(activePlayers);
  };

  return (
    // h-[100dvh]: アドレスバーを含む実際の画面高さに固定
    <div
      className="flex flex-col overflow-hidden"
      style={{
        height: "100dvh",
        backgroundColor: "var(--color-bg)",
      }}
    >
      {/* ===== ヘッダー (固定高さ) ===== */}
      <div className="flex-shrink-0 pt-8 pb-3 px-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl">🎲</span>
          <h1
            className="game-text text-xl"
            style={{ color: "var(--color-gold)" }}
          >
            PIXEL LIFE (仮)
          </h1>
        </div>
        <p className="text-xs mt-1" style={{ color: "#9980cc" }}>
          友達と通話しながら遊ぼう！
        </p>
      </div>

      {/* ===== 人数選択 (固定高さ) ===== */}
      <div className="flex-shrink-0 px-4 mb-2">
        <div
          className="rounded-xl p-3"
          style={{
            backgroundColor: "var(--color-panel)",
            border: "2px solid var(--color-border)",
          }}
        >
          <div
            className="text-xs font-bold mb-2 text-center"
            style={{ color: "var(--color-gold)" }}
          >
            👥 プレイヤー人数を選ぶ
          </div>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setPlayerCount(n)}
                className="btn-touch rounded-xl font-bold text-lg"
                style={{
                  width: 62,
                  height: 52,
                  backgroundColor: playerCount === n ? "var(--color-gold)" : "#0f0a1e",
                  color: playerCount === n ? "#1f2937" : "var(--color-text)",
                  border: playerCount === n
                    ? "3px solid #f59e0b"
                    : "3px solid var(--color-border)",
                  boxShadow: playerCount === n ? "0 0 10px var(--color-gold)" : "none",
                }}
              >
                {n}人
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== プレイヤー設定 (スクロール可能) ===== */}
      {/* pb-28 でボタン分のスペースを確保 */}
      <div className="flex-1 overflow-y-auto px-4 pb-28">
        {Array.from({ length: playerCount }).map((_, i) => (
          <PlayerForm
            key={i}
            index={i}
            name={players[i].name}
            avatar={players[i].avatar}
            onNameChange={(name) => {
              setPlayers(prev => {
                const next = [...prev];
                next[i] = { ...next[i], name };
                return next;
              });
            }}
            onAvatarChange={(avatar) => {
              setPlayers(prev => {
                const next = [...prev];
                next[i] = { ...next[i], avatar };
                return next;
              });
            }}
          />
        ))}
      </div>

      {/* ===== ゲームスタートボタン (画面下部に固定) ===== */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3"
        style={{
          backgroundColor: "var(--color-bg)",
          borderTop: "2px solid var(--color-border)",
          // iPhoneのセーフエリア対応
          paddingBottom: "max(24px, env(safe-area-inset-bottom))",
        }}
      >
        <button
          onClick={handleStart}
          className="btn-touch w-full rounded-2xl font-black text-2xl py-5"
          style={{
            backgroundColor: "var(--color-gold)",
            color: "#1f2937",
            boxShadow: "0 6px 0 #a16207, 0 8px 16px rgba(234,179,8,0.4)",
            letterSpacing: "0.08em",
          }}
        >
          🎮 ゲームスタート！
        </button>
      </div>
    </div>
  );
}
