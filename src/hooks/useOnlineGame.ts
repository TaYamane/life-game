"use client";
import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { GameState } from "@/types/game";

// ============================================================
// オンラインゲーム同期フック
// ============================================================

interface UseOnlineGameOptions {
  roomId:      string | null;
  myPlayerId:  string;
  localState:  GameState;
  onRemoteState: (state: GameState) => void; // 他プレイヤーの更新を受け取る
}

export function useOnlineGame({
  roomId, myPlayerId, localState, onRemoteState,
}: UseOnlineGameOptions) {
  const lastSyncId = useRef<string | null>(null);
  const isSyncing  = useRef(false);

  // ── Realtime 購読 ──────────────────────────
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const newState = payload.new.game_state as GameState | null;
          if (!newState) return;
          // 自分が書き込んだ更新は無視（エコーキャンセル）
          if (newState._syncId && newState._syncId === lastSyncId.current) return;
          onRemoteState(newState);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, onRemoteState]);

  // ── ローカル状態を Supabase に書き込む ──────
  const syncState = useCallback(
    async (state: GameState) => {
      if (!roomId || isSyncing.current) return;

      const syncId = crypto.randomUUID();
      lastSyncId.current = syncId;
      const stateWithId  = { ...state, _syncId: syncId };

      isSyncing.current = true;
      await supabase
        .from("rooms")
        .update({ game_state: stateWithId })
        .eq("id", roomId);
      isSyncing.current = false;
    },
    [roomId]
  );

  return { syncState };
}

// ============================================================
// ルーム操作ユーティリティ
// ============================================================

/** 6文字のランダムルームコードを生成 */
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

/** ルームを作成してIDを返す */
export async function createRoom(
  hostId: string,
  hostName: string
): Promise<{ id: string; code: string } | null> {
  const code = generateRoomCode();
  const { data, error } = await supabase
    .from("rooms")
    .insert({
      code,
      host_id:      hostId,
      player_ids:   [hostId],
      player_names: [hostName],
      status:       "waiting",
    })
    .select("id, code")
    .single();

  if (error || !data) { console.error(error); return null; }
  return { id: data.id as string, code: data.code as string };
}

/** ルームコードでルームに参加 */
export async function joinRoom(
  code: string,
  playerId: string,
  playerName: string
): Promise<{ id: string; hostId: string; playerIds: string[]; playerNames: string[] } | null> {
  const { data: room, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", code.toUpperCase())
    .single();

  if (error || !room) return null;
  if (room.status !== "waiting") return null;

  const playerIds   = [...(room.player_ids   as string[]), playerId];
  const playerNames = [...(room.player_names as string[]), playerName];

  await supabase
    .from("rooms")
    .update({ player_ids: playerIds, player_names: playerNames })
    .eq("id", room.id);

  return {
    id:          room.id   as string,
    hostId:      room.host_id as string,
    playerIds,
    playerNames,
  };
}

/** ルームをリアルタイムで購読（ロビー用） */
export function subscribeRoom(
  roomId: string,
  onUpdate: (data: {
    playerIds:   string[];
    playerNames: string[];
    status:      string;
    gameState?:  GameState;
  }) => void
) {
  const channel = supabase
    .channel(`lobby:${roomId}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (payload: any) => {
        onUpdate({
          playerIds:   payload.new.player_ids   as string[],
          playerNames: payload.new.player_names as string[],
          status:      payload.new.status       as string,
          gameState:   payload.new.game_state   as GameState | undefined,
        });
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

/** ルームの現在の状態を一度取得 */
export async function fetchRoomState(roomId: string): Promise<GameState | null> {
  const { data } = await supabase
    .from("rooms")
    .select("game_state")
    .eq("id", roomId)
    .single();
  return (data?.game_state as GameState) ?? null;
}

/** ゲーム開始（ホストのみ） */
export async function startOnlineGame(roomId: string, gameState: GameState) {
  await supabase
    .from("rooms")
    .update({ status: "playing", game_state: gameState })
    .eq("id", roomId);
}
