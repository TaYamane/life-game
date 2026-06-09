/**
 * Supabase 接続テストスクリプト
 * 実行: node scripts/test-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js";

const url = "https://byqsceqaedtdebwpxbmo.supabase.co";
const key = "sb_publishable_DC1_cTS_edR4CUydi6BqWw_0dL-MU8V";

console.log("🔌 Supabase 接続テスト開始...\n");

const supabase = createClient(url, key);

// ① テーブル存在確認
console.log("① rooms テーブルの確認...");
const { data: rooms, error: roomsErr } = await supabase
  .from("rooms")
  .select("id")
  .limit(1);

if (roomsErr) {
  console.error("❌ rooms テーブルエラー:", roomsErr.message);
  console.error("   → supabase/schema.sql が実行されているか確認してください");
  process.exit(1);
}
console.log("✅ rooms テーブル OK\n");

// ② ルーム作成テスト
console.log("② テストルーム作成...");
const testCode = "TEST" + Math.random().toString(36).slice(2, 4).toUpperCase();
const { data: newRoom, error: insertErr } = await supabase
  .from("rooms")
  .insert({
    code:         testCode,
    host_id:      "test-host-id",
    player_ids:   ["test-host-id"],
    player_names: ["テストホスト"],
    status:       "waiting",
  })
  .select("id, code")
  .single();

if (insertErr) {
  console.error("❌ 挿入エラー:", insertErr.message);
  process.exit(1);
}
console.log(`✅ テストルーム作成 OK (code: ${newRoom.code})\n`);

// ③ Realtime チャンネル接続テスト
console.log("③ Realtime 接続テスト (3秒待機)...");
let realtimeOk = false;

const channel = supabase
  .channel("test-channel")
  .on("postgres_changes", {
    event: "UPDATE",
    schema: "public",
    table: "rooms",
    filter: `id=eq.${newRoom.id}`,
  }, () => { realtimeOk = true; })
  .subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      console.log("   Realtime チャンネル購読成功。更新テスト送信...");
      await supabase
        .from("rooms")
        .update({ status: "test" })
        .eq("id", newRoom.id);
    }
  });

await new Promise(r => setTimeout(r, 3000));

if (realtimeOk) {
  console.log("✅ Realtime OK - リアルタイム同期が動作しています！\n");
} else {
  console.log("⚠️  Realtime 未受信 (Supabase Dashboard で Realtime が有効か確認)\n");
}

// ④ テストデータ削除
await supabase.from("rooms").delete().eq("id", newRoom.id);
supabase.removeChannel(channel);
console.log("④ テストデータ削除完了\n");

// 結果サマリー
console.log("═══════════════════════════════");
if (realtimeOk) {
  console.log("🎉 全テスト通過！オンライン対戦が使用できます。");
  console.log("   npm run dev を起動してください。");
} else {
  console.log("✅ DB接続: OK");
  console.log("⚠️  Realtime: 要確認");
  console.log("");
  console.log("Realtime が動かない場合:");
  console.log("  Supabase Dashboard → Database → Replication");
  console.log("  または SQL Editor で実行:");
  console.log("  alter publication supabase_realtime add table rooms;");
}
console.log("═══════════════════════════════");
process.exit(0);
