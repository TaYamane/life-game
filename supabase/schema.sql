-- ============================================================
-- ドキドキ人生冒険ゲーム — Supabase スキーマ
-- Supabase の SQL Editor でこのファイルを実行してください
-- ============================================================

-- rooms テーブル
create table if not exists rooms (
  id           uuid primary key default gen_random_uuid(),
  code         text unique not null,          -- 6文字のルームコード例: "ABC123"
  game_state   jsonb,                         -- GameState全体をJSON保存
  status       text default 'waiting',        -- 'waiting' | 'playing' | 'finished'
  player_ids   text[] default '{}',           -- 参加プレイヤーのUUID配列
  player_names text[] default '{}',           -- 表示名配列
  host_id      text not null,                 -- ホストのUUID
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- RLS（行レベルセキュリティ）— 全員が読み書きできるシンプル設定
alter table rooms enable row level security;

create policy "public_read"   on rooms for select using (true);
create policy "public_insert" on rooms for insert with check (true);
create policy "public_update" on rooms for update using (true);

-- Realtime を有効化（Supabase Dashboard > Database > Replication で rooms テーブルをONに）
-- または下記のコメントアウトを外して実行:
-- alter publication supabase_realtime add table rooms;

-- updated_at 自動更新トリガー
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger rooms_updated_at
  before update on rooms
  for each row execute function update_updated_at();
