import type { GameEvent, Player, EventConditions } from "@/types/game";

// ============================================================
// イベント重み計算
// ============================================================

/**
 * ハード条件チェック（requireXxx / forbidXxx / position / money / fame）
 * 満たさない場合は false を返す
 */
function passesHardConditions(event: GameEvent, player: Player): boolean {
  // 既に発火済みのコールバック・ユニークイベントは除外（1プレイヤーにつき1回のみ）
  if ((event.isCallback || event.isUnique) && (player.firedCallbacks ?? []).includes(event.id)) return false;

  const c: EventConditions | undefined = event.conditions;
  if (!c) return true;

  // 状態フラグ系
  if (c.requireMarried    !== undefined && c.requireMarried    !== player.isMarried)   return false;
  if (c.requireSingle     !== undefined && c.requireSingle     !== !player.isMarried)  return false;
  if (c.requirePet        !== undefined && c.requirePet        !== player.hasPet)      return false;
  if (c.requireNoPet      !== undefined && c.requireNoPet      !== !player.hasPet)     return false;
  if (c.requireChildren   !== undefined && c.requireChildren   !== player.hasChildren) return false;
  if (c.requireNoChildren !== undefined && c.requireNoChildren !== !player.hasChildren)return false;
  if (c.requireCompany    !== undefined && c.requireCompany    !== player.hasCompany)  return false;
  if (c.requireNoCompany  !== undefined && c.requireNoCompany  !== !player.hasCompany) return false;

  // 職業系
  if (c.requireJobs && !c.requireJobs.includes(player.job)) return false;
  if (c.forbidJobs  &&  c.forbidJobs.includes(player.job))  return false;

  // フラグ系（選択の伏線回収）
  if (c.requireFlags) {
    for (const [key, val] of Object.entries(c.requireFlags)) {
      if (player.flags[key] !== val) return false;
    }
  }
  if (c.forbidFlags) {
    for (const [key, val] of Object.entries(c.forbidFlags)) {
      if (player.flags[key] === val) return false;
    }
  }

  // 位置系
  if (c.minPosition !== undefined && player.position < c.minPosition) return false;
  if (c.maxPosition !== undefined && player.position > c.maxPosition) return false;

  return true;
}

/**
 * ソフト条件を含む完全な重み計算（ハード条件失敗時は 0 を返す）
 */
function calcWeight(event: GameEvent, player: Player): number {
  if (!passesHardConditions(event, player)) return 0;

  const c: EventConditions | undefined = event.conditions;
  if (!c) return 10;

  // ソフト条件（minMoney / minFame 等）
  if (c.minMoney     !== undefined && player.money     < c.minMoney)     return 0;
  if (c.maxMoney     !== undefined && player.money     > c.maxMoney)     return 0;
  if (c.minFame      !== undefined && player.fame      < c.minFame)      return 0;
  if (c.maxFame      !== undefined && player.fame      > c.maxFame)      return 0;
  if (c.minHappiness !== undefined && player.happiness < c.minHappiness) return 0;
  if (c.maxHappiness !== undefined && player.happiness > c.maxHappiness) return 0;

  // ブースト計算
  let w = c.baseWeight ?? 10;

  if (c.boostIfJobs        && c.boostIfJobs.includes(player.job)) w *= 3;
  if (c.boostIfMarried     && player.isMarried)    w *= 2;
  if (c.boostIfSingle      && !player.isMarried)   w *= 2;
  if (c.boostIfPet         && player.hasPet)        w *= 3;
  if (c.boostIfHasChildren && player.hasChildren)   w *= 2;
  if (c.boostIfHighMoney   && player.money >= 5000) w *= 2;
  if (c.boostIfLowMoney    && player.money < 1000)  w *= 2;
  if (c.boostIfHighFame    && player.fame  >= 60)   w *= 2;
  if (c.boostIfLowHappiness  && player.happiness <= 30) w *= 2;
  if (c.boostIfHighHappiness && player.happiness >= 70) w *= 2;
  if (c.boostIfHasCompany    && player.hasCompany)      w *= 2;

  return w;
}

/** 重み付きリストからランダム選択 */
function pickWeighted(items: { event: GameEvent; w: number }[]): GameEvent {
  const total = items.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * total;
  for (const { event, w } of items) {
    r -= w;
    if (r <= 0) return event;
  }
  return items[items.length - 1].event;
}

/**
 * プレイヤー状態に応じた重み付きランダムイベント選択
 *
 * 選択優先度:
 *  1. 全条件（ハード＋ソフト）を満たすイベントから重み付き選択
 *  2. ハード条件だけ満たすイベントから均等選択（money/fame制約を無視）
 *  3. 位置条件だけ満たすイベントから均等選択（状態系制約を無視）
 *  4. プール全体からランダム（最終手段・デバッグ用警告付き）
 *
 * ※ フォールバック 2 以降が発動した場合はコンソールに警告を出力する
 */
export function selectWeightedEvent(pool: GameEvent[], player: Player): GameEvent {
  // ── Level 1: 全条件クリア ──
  const weighted = pool.map(e => ({ event: e, w: calcWeight(e, player) }));
  const fullMatch = weighted.filter(x => x.w > 0);
  if (fullMatch.length > 0) return pickWeighted(fullMatch);

  // ── Level 2: ハード条件のみクリア（minMoney等は無視）──
  const hardMatch = pool.filter(e => passesHardConditions(e, player));
  if (hardMatch.length > 0) {
    console.warn(
      `[eventSelector] Level-2 fallback: no full match for player=${player.name} pos=${player.position}`,
      `using ${hardMatch.length} hard-match events`
    );
    return hardMatch[Math.floor(Math.random() * hardMatch.length)];
  }

  // ── Level 3: 位置条件のみクリア（状態系ハード条件を無視）──
  const posMatch = pool.filter(e => {
    const c = e.conditions;
    if (!c) return true;
    if (c.minPosition !== undefined && player.position < c.minPosition) return false;
    if (c.maxPosition !== undefined && player.position > c.maxPosition) return false;
    return true;
  });
  if (posMatch.length > 0) {
    console.warn(
      `[eventSelector] Level-3 fallback: pos-only match for player=${player.name} pos=${player.position}`
    );
    return posMatch[Math.floor(Math.random() * posMatch.length)];
  }

  // ── Level 4: 完全最終手段（発生してはいけない状況）──
  console.error(
    `[eventSelector] Level-4 emergency fallback for player=${player.name} pos=${player.position}` +
    ` — check event conditions!`
  );
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * デバッグ用: プレイヤー状態での各イベント重みを表示
 */
export function debugWeights(pool: GameEvent[], player: Player): void {
  console.group(`[eventSelector] player: ${player.name} (pos=${player.position})`);
  pool.forEach(e => {
    if (!passesHardConditions(e, player)) {
      console.log(`  ❌ ${e.id}: hard-condition blocked`);
    } else {
      const w = calcWeight(e, player);
      if (w > 0) console.log(`  ✅ ${e.id}: w=${w}`);
      else       console.log(`  ⚠️  ${e.id}: soft-condition blocked (money/fame)`);
    }
  });
  console.groupEnd();
}
