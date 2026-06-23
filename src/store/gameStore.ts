"use client";
import { useReducer, useCallback } from "react";
import type {
  GameState, Player, Avatar, GameEvent,
  LifeStage, JobType, HistoryEntry, ChoiceSquare, ChoiceOption,
  CareerTrigger, AvatarCustomization,
} from "@/types/game";
import type { AvatarConfig } from "@/types/avatar";
import { JOB_LABELS } from "@/types/game";
import { BOARD_SQUARES, TOTAL_SQUARES } from "@/data/board";
import { CHOICE_SQUARES } from "@/data/choices";
import { EVENT_CARDS, CHANCE_CARDS } from "@/data/events";
import {
  JOB_INITIAL_BONUS, JOB_EMOJI, JOB_CAREER_STORIES, CAREER_TRIGGER_LABELS,
} from "@/data/jobRequirements";
import { selectWeightedEvent } from "@/utils/eventSelector";
import { computeTitles } from "@/utils/titles";

export const STARTING_MONEY     = 0;
export const STARTING_HAPPINESS = 50;
export const STARTING_FAME      = 0;

function clamp(min: number, val: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

/** 幸福上昇をほぼ半分に抑える（下降はそのまま） */
function scaleHappy(val: number): number {
  return val > 0 ? Math.round(val * 0.5) : val;
}

// 位置→年齢変換（playerProfile.ts と同一ロジック）
function posToAge(position: number): number {
  if (position <= 14)  return Math.round((position / 14) * 5);              // 0〜5歳（乳幼児）
  if (position <= 25)  return 6  + Math.round(((position - 15) / 10) * 6); // 6〜12歳（小学生）
  if (position <= 39)  return 13 + Math.round(((position - 26) / 13) * 2); // 13〜15歳（中学〜高校）
  if (position <= 50)  return 16 + Math.round(((position - 40) / 10) * 2); // 16〜18歳（高校〜進路選択）
  if (position <= 58)  return 18 + Math.round(((position - 50) / 8)  * 5); // 18〜23歳（大学〜就活）← pos58=23歳
  if (position <= 69)  return 23 + Math.round(((position - 58) / 11) * 4); // 23〜27歳（社会人初期）
  if (position <= 110) return 27 + Math.round(((position - 70) / 40) * 13);// 27〜40歳（社会人・結婚）
  if (position <= 134) return 41 + Math.round(((position - 111) / 23) * 23);// 41〜64歳（壮年期）
  return               65 + Math.round(((position - 135) / 15) * 20);       // 65〜85歳（老後）
}

function calcLifeStage(p: Player): LifeStage {
  if (p.position >= 135) return "senior";
  if (p.position >= 111) return "adult";
  if (p.position >= 70)  return "youth";
  if (p.position >= 40)  return "teen";
  if (p.position >= 15)  return "child";
  return "baby";
}

function makeHistoryEntry(event: GameEvent, turnCount: number, position: number, isMarried: boolean): HistoryEntry | null {
  const e   = event.effect;
  const age = posToAge(position);
  if (event.isCallback)        return { emoji: "🔮", text: `【伏線回収】${event.title}`, turn: turnCount, age };
  if (e.setJob && e.setJob !== "none") {
    const label = (e.setJob === "youtuber" || e.setJob === "artist")
      ? `${JOB_LABELS[e.setJob]}を始めた（副業）`
      : `${JOB_LABELS[e.setJob]}になった`;
    return { emoji: "💼", text: label, turn: turnCount, age };
  }
  if (e.marry)       return { emoji: "💒", text: "結婚した",         turn: turnCount, age };
  if (e.divorce)     return { emoji: "💔", text: "離婚した",         turn: turnCount, age };
  if (e.getPet)      return { emoji: "🐾", text: "ペットを迎えた",   turn: turnCount, age };
  if (e.losePet)     return { emoji: "😢", text: "ペットとお別れ…", turn: turnCount, age };
  if (e.getChild)    return { emoji: "👶", text: isMarried ? "子供が生まれた！" : "養子を迎えた！", turn: turnCount, age };
  if (e.startCompany)return { emoji: "🚀", text: "起業した",         turn: turnCount, age };
  if ((e.money ?? 0) >= 500)    return { emoji: "💰", text: event.title, turn: turnCount, age };
  if ((e.money ?? 0) <= -400)   return { emoji: "😱", text: event.title, turn: turnCount, age };
  if ((e.happiness ?? 0) >= 35) return { emoji: "😊", text: event.title, turn: turnCount, age };
  return null;
}

const ZONE_MILESTONES: Record<number, { emoji: string; text: string }> = {
  15:  { emoji: "🏫", text: "小学校に入学した" },
  26:  { emoji: "📚", text: "中学生になった" },
  36:  { emoji: "🎒", text: "高校生になった" },
  51:  { emoji: "🎓", text: "新しい人生のステージへ" },
  60:  { emoji: "💼", text: "社会人としてスタートした" },
  135: { emoji: "🌅", text: "ついに引退。老後の始まり" },
  150: { emoji: "🏁", text: "ゴール！人生を完走した" },
};

function applyEventEffect(player: Player, event: GameEvent): Player {
  const e = event.effect;
  let p = { ...player };

  const prevMoney = p.money;
  if (e.moneyHalf) p.money = Math.floor(p.money / 2);
  else if (e.money !== undefined) p.money = p.money + e.money;  // マイナス可

  if (e.happiness !== undefined) p.happiness = clamp(0, p.happiness + scaleHappy(e.happiness), 100);
  if (e.fame      !== undefined) p.fame      = clamp(0, p.fame      + e.fame,                  100);

  // 副業判定: YouTuber/アーティストは既職業がある場合は副業扱い（主職は変えない）
  if (e.setJob !== undefined) {
    const isSideJob = (e.setJob === "youtuber" || e.setJob === "artist") && p.job !== "none";
    if (isSideJob) {
      p.flags = { ...p.flags, sideJob: e.setJob };
    } else {
      p.job = e.setJob;
    }
  }
  if (e.marry)       { p.isMarried = true;  p.gotMarried   = true; }
  if (e.divorce)     { p.isMarried = false; p.gotDivorced  = true; }
  if (e.getPet)      { p.hasPet = true;  p.hasPetEver = true; }
  if (e.losePet)     { p.hasPet = false; }
  if (e.getChild)    { p.hasChildren = true; }
  if (e.startCompany){ p.hasCompany = true; p.startedCompany = true; }

  // 初めてマイナスになった場合は破産フラグ＋借金ログ
  if (p.money < 0) {
    p.wentBankrupt = true;
    if (prevMoney >= 0) {
      // ゼロを下回った瞬間だけ履歴に残す
      p.history = [...p.history, {
        emoji: "🔴",
        text:  `借金 ${Math.abs(p.money).toLocaleString()}万円`,
        turn:  p.turnCount,
        age:   posToAge(p.position),
      }];
    }
  }
  // 発火済みコールバック・ユニークイベントを記録（重複防止）
  if ((event.isCallback || event.isUnique) && event.id && !(p.firedCallbacks ?? []).includes(event.id)) {
    p.firedCallbacks = [...(p.firedCallbacks ?? []), event.id];
  }

  if (event.id === "sns_burn")       p.snsBurned  = true;
  if (event.id === "invest_success") p.investWin  = true;
  if (event.id === "invest_fail")    p.investFail = true;

  if (event.isPositive) p.positiveEvents += 1;
  else                  p.negativeEvents  += 1;

  // デートカウント: pos25〜64 の恋愛ポジティブイベント（告白前の交流）
  if (event.category === "love" && event.isPositive && p.position >= 25 && p.position < 65) {
    p.dates = (p.dates ?? 0) + 1;
  }

  if (p.money > p.peakMoney) p.peakMoney = p.money;
  p.lifeStage = calcLifeStage(p);

  const entry = makeHistoryEntry(event, p.turnCount, p.position, p.isMarried);
  if (entry) p.history = [...p.history, entry];

  return p;
}

// ============================================================
// ============================================================
// 重要分岐マス（強制停止）定義
// ============================================================
/** マス番号 → "訪問済み" を示す flags キー */
const MANDATORY_STOPS = new Map<number, string>([
  [35,  "highSchoolRoute"],   // 高校受験
  [50,  "lifeRoute"],         // 進路選択
  [58,  "firstJobDone"],      // 就活（キャリア選択）
  [79,  "marriageResolved"],  // 結婚ルーレット（専用フラグ）
  [90,  "childChoice"],       // 子供選択
  [96,  "startupChoice"],     // 起業チャンス
  [118, "lateCareerDone"],    // キャリア再選択
  [133, "retirementChoice"],  // 早期退職
  [142, "seniorLifestyle"],   // 老後の生き方
]);

/**
 * from+1〜to の間に未訪問の強制停止マスがあれば最初のマス番号を返す
 * 既にフラグが立っているマス or 結婚済み（マス79）はスキップ
 */
function getFirstMandatoryStop(from: number, to: number, player: Player): number | null {
  for (let pos = from + 1; pos <= to; pos++) {
    if (!MANDATORY_STOPS.has(pos)) continue;
    const flagKey = MANDATORY_STOPS.get(pos)!;
    if (player.flags[flagKey] !== undefined) continue;       // 訪問済み
    if (pos === 79 && player.isMarried)      continue;       // 既婚はルーレット不要
    return pos;
  }
  return null;
}

// ============================================================
// Actions
// ============================================================
type Action =
  | { type: "START_GAME"; players: { name: string; avatar: Avatar; customization?: AvatarCustomization; avatarConfig?: AvatarConfig; playerId?: string }[] }
  | { type: "ROLL_DICE" }
  | { type: "DICE_RESULT"; value: number }
  | { type: "DISMISS_EVENT" }
  | { type: "MAKE_CHOICE"; optionId: string }
  | { type: "CHOOSE_CAREER"; job: JobType }
  | { type: "MARRIAGE_ROLL";    value: number }  // 結婚ルーレット結果
  | { type: "CONFESSION_ROLL"; value: number }  // 告白ルーレット結果
  | { type: "END_TURN" }
  | { type: "RESET_GAME" }
  | { type: "SET_STATE"; state: GameState };

function makeInitialPlayer(
  id: number, name: string, avatar: Avatar,
  customization?: AvatarCustomization, avatarConfig?: AvatarConfig, playerId?: string
): Player {
  return {
    id,
    playerId: playerId ?? `local-${id}`,
    name,
    avatar,
    customization,
    avatarConfig,
    money:          STARTING_MONEY,
    happiness:      STARTING_HAPPINESS,
    fame:           STARTING_FAME,
    position:       0,
    hasFinished:    false,
    job:            "none" as JobType,
    lifeStage:      "baby",
    isMarried:      false,
    hasPet:         false,
    hasCompany:     false,
    hasChildren:    false,
    flags:          {},
    firedCallbacks: [],
    dates:          0,
    titles:         [],
    gotMarried:     false,
    gotDivorced:    false,
    hasPetEver:     false,
    startedCompany: false,
    wentBankrupt:   false,
    snsBurned:      false,
    investWin:      false,
    investFail:     false,
    negativeEvents: 0,
    positiveEvents: 0,
    peakMoney:      STARTING_MONEY,
    history:        [{ emoji: "👶", text: "赤ちゃん誕生！人生のスタート！", turn: 0, age: 0 }],
    turnCount:      0,
  };
}

function createInitialState(): GameState {
  return {
    phase: "setup", players: [], currentPlayerIndex: 0,
    diceValue: null, isRolling: false,
    currentEvent: null, currentChoice: null, currentCareerChoice: null,
    finishedCount: 0, totalPlayers: 0, rollAgainFlag: false,
  };
}

// ============================================================
// Reducer
// ============================================================
function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {

    case "SET_STATE":
      return action.state;

    case "START_GAME": {
      const players = action.players.map((p, i) =>
        makeInitialPlayer(i, p.name, p.avatar, p.customization, p.avatarConfig, p.playerId)
      );
      return { ...createInitialState(), phase: "playing", players, totalPlayers: players.length };
    }

    case "ROLL_DICE": {
      if (state.phase !== "playing") return state;
      return { ...state, phase: "rolling", isRolling: true };
    }

    case "DICE_RESULT": {
      if (state.phase !== "rolling") return state;

      const player      = state.players[state.currentPlayerIndex];

      // ── 強制停止チェック ─────────────────────────────────────
      const rawTarget   = Math.min(player.position + action.value, TOTAL_SQUARES);
      const stopAt      = getFirstMandatoryStop(player.position, rawTarget, player);
      const newPosition = stopAt !== null ? stopAt : rawTarget;

      const hasFinished = newPosition >= TOTAL_SQUARES && !player.hasFinished;
      const newFinished = hasFinished ? state.finishedCount + 1 : state.finishedCount;
      const square      = BOARD_SQUARES[newPosition];

      // ── 若年ゾーン（0-39）の money_minus 特殊効果テーブル ──
      // 乳幼児〜小学生は本人がお金を払わないため、健康・知識への影響に変換する
      const YOUNG_SQUARE_EFFECTS: Record<number, { happiness: number; fame: number }> = {
        7:  { happiness: -15, fame:  0 },  // 風邪をひいた → 健康低下
        18: { happiness:  -5, fame:  0 },  // 教材費      → 親が払う
        23: { happiness:  -5, fame:  8 },  // 塾に入った  → 知識アップ
        28: { happiness:  -5, fame:  0 },  // 制服・部活  → 親が払う
        34: { happiness: -10, fame: 10 },  // 塾費用      → 猛勉強で知識アップ
      };

      // ── 給与所得者限定ボーナスマス（雇用されていない場合は収入なし） ──
      const SALARY_BONUS_SQUARES = new Set([67, 72, 87, 93, 108, 127]);
      const SALARY_JOBS = new Set(["salaryman", "civil_servant", "engineer", "doctor"]);

      // ── 事業収益マス（起業家・フリーランス・クリエイター限定） ──
      const BUSINESS_INCOME_SQUARES = new Set([99, 121]);
      const BUSINESS_JOBS = new Set(["entrepreneur", "freelancer", "youtuber", "artist"]);

      // ── 子供費用マス（hasChildren が必須） ──
      const CHILD_EXPENSE_SQUARES = new Set([92, 120]);

      let moneyDelta = 0, happyDelta = 0, fameDelta = 0;

      if (square.type === "money_plus") {
        const rawAmount = square.amount ?? 0;
        if (SALARY_BONUS_SQUARES.has(newPosition)) {
          // 給与ボーナス：給与所得者のみ受取
          if (SALARY_JOBS.has(player.job)) {
            moneyDelta = rawAmount;
            happyDelta = 2;
          } else {
            // 無職・自営・フリー・学生は収入なし
            moneyDelta = 0;
            happyDelta = player.job === "none" ? -5 : 0;
          }
        } else if (BUSINESS_INCOME_SQUARES.has(newPosition)) {
          // 事業収益：起業家・フリーランス・クリエイターのみ
          if (BUSINESS_JOBS.has(player.job) || player.hasCompany) {
            moneyDelta = rawAmount;
            happyDelta = 2;
          } else {
            moneyDelta = 0;
            happyDelta = 0;
          }
        } else {
          moneyDelta = rawAmount;
          happyDelta = 5;
        }
      }

      if (square.type === "money_minus") {
        const rawAmount = square.amount ?? 0;
        if (newPosition <= 39 && YOUNG_SQUARE_EFFECTS[newPosition]) {
          // 若年ゾーン：お金は減らさず健康・知識へ変換
          const youngEffect = YOUNG_SQUARE_EFFECTS[newPosition];
          moneyDelta = 0;
          happyDelta = youngEffect.happiness;
          fameDelta  = youngEffect.fame;
        } else if (CHILD_EXPENSE_SQUARES.has(newPosition) && !player.hasChildren) {
          // 子供費用マス：子供なしは発動しない
          moneyDelta = 0;
          happyDelta = 0;
        } else {
          moneyDelta = rawAmount;
          happyDelta = -5;
        }
      }

      const newTurnCount = player.turnCount + 1;
      const milestone = ZONE_MILESTONES[newPosition];

      const newMoney = player.money + moneyDelta; // マイナス可
      const wentIntoDebt = newMoney < 0 && player.money >= 0;

      const newAge = posToAge(newPosition);
      let updatedPlayer: Player = {
        ...player,
        position:    newPosition,
        money:       newMoney,
        happiness:   clamp(0, player.happiness + happyDelta, 100),
        fame:        clamp(0, player.fame + fameDelta, 100),
        hasFinished: player.hasFinished || hasFinished,
        finishOrder: hasFinished ? newFinished : player.finishOrder,
        turnCount:   newTurnCount,
        history: [
          ...(milestone
            ? [...player.history, { ...milestone, turn: newTurnCount, age: newAge }]
            : [...player.history]),
          // マスを踏んで初めて借金になった場合にログを追加
          ...(wentIntoDebt ? [{ emoji: "🔴", text: `借金 ${Math.abs(newMoney).toLocaleString()}万円`, turn: newTurnCount, age: newAge }] : []),
        ],
      };
      if (updatedPlayer.money < 0) updatedPlayer.wentBankrupt = true;
      updatedPlayer.lifeStage = calcLifeStage(updatedPlayer);
      if (updatedPlayer.money > updatedPlayer.peakMoney) {
        updatedPlayer.peakMoney = updatedPlayer.money;
      }

      const updatedPlayers = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? updatedPlayer : p
      );

      // ── 結婚ルーレット（マス79専用・未訪問かつ未婚のみ）──
      if (!hasFinished && newPosition === 79 && !updatedPlayer.flags.marriageResolved && !updatedPlayer.isMarried) {
        const hasPartner = updatedPlayer.flags.romanceChoice === "confess";
        return {
          ...state,
          phase:             "marriage_roulette",
          players:           updatedPlayers,
          diceValue:         action.value,
          isRolling:         false,
          currentChoice:     null,
          currentEvent:      null,
          currentCareerChoice: null,
          finishedCount:     newFinished,
          marriageRoulette:  { hasPartner },
        };
      }

      // ── キャリア選択マス（マス58・マス118）──
      const CAREER_SQUARES: Record<number, CareerTrigger> = {
        58:  "first_job",
        118: "late_career",
      };

      if (!hasFinished && square.type === "choice" && CAREER_SQUARES[newPosition]) {
        const trigger = CAREER_SQUARES[newPosition];
        return {
          ...state,
          phase:               "career_choice",
          players:             updatedPlayers,
          diceValue:           action.value,
          isRolling:           false,
          currentChoice:       null,
          currentEvent:        null,
          currentCareerChoice: { trigger, label: CAREER_TRIGGER_LABELS[trigger] },
          finishedCount:       newFinished,
        };
      }

      // ── 通常選択マス ──
      if (!hasFinished && square.type === "choice") {
        const choiceDef = CHOICE_SQUARES[newPosition];
        if (choiceDef) {
          return {
            ...state,
            phase:               "choice",
            players:             updatedPlayers,
            diceValue:           action.value,
            isRolling:           false,
            currentChoice:       choiceDef,
            currentEvent:        null,
            currentCareerChoice: null,
            finishedCount:       newFinished,
          };
        }
      }

      // ── 通常イベント・チャンス・もう一回 ──
      let event: GameEvent | null = null;
      if (!hasFinished) {
        if (square.type === "event") {
          const preferred = square.preferredCategory;
          if (preferred) {
            // preferredCategory が設定されているマスは必ずそのカテゴリから選択
            const pool = EVENT_CARDS.filter(e => e.category === preferred);
            event = pool.length > 0
              ? selectWeightedEvent(pool, updatedPlayer)
              : selectWeightedEvent(EVENT_CARDS, updatedPlayer);
          } else {
            event = selectWeightedEvent(EVENT_CARDS, updatedPlayer);
          }
        }
        if (square.type === "chance") event = selectWeightedEvent(CHANCE_CARDS, player);
        if (square.type === "roll_again") {
          event = {
            id: "roll_again_square", category: "chance",
            title: "もう一度マス！",
            story: "このマスに止まったことでボーナスが発生！",
            result: "サイコロをもう一度振れる！",
            effect: { rollAgain: true, happiness: 5 }, emoji: "🎯", isPositive: true,
          };
        }
      }

      return {
        ...state,
        phase:         event ? "event" : "show_result",
        players:       updatedPlayers,
        diceValue:     action.value,
        isRolling:     false,
        currentEvent:  event,
        currentChoice: null,
        finishedCount: newFinished,
        rollAgainFlag: false,
      };
    }

    case "MAKE_CHOICE": {
      if (state.phase !== "choice" || !state.currentChoice) return state;

      const choiceDef = state.currentChoice;
      const option: ChoiceOption | undefined = choiceDef.options.find(o => o.id === action.optionId);
      if (!option) return state;

      const player = state.players[state.currentPlayerIndex];

      // 選択結果をイベントとして適用
      const syntheticEvent: GameEvent = {
        id:         `choice_${choiceDef.flagKey}_${option.id}`,
        category:   "life",
        title:      `${choiceDef.title} → ${option.label}`,
        story:      option.description,
        result:     `「${option.label}」を選んだ。この選択がこれからの人生に影響を与える。`,
        effect:     option.effect,
        emoji:      option.emoji,
        isPositive: true,
      };

      let updated = applyEventEffect(player, syntheticEvent);

      // フラグを書き込む
      updated = {
        ...updated,
        flags: { ...updated.flags, [choiceDef.flagKey]: option.id },
        history: [
          ...updated.history,
          {
            emoji:    option.emoji,
            text:     `【選択】${choiceDef.title}：「${option.label}」を選んだ`,
            turn:     updated.turnCount,
            age:      posToAge(updated.position),
            isChoice: true,
          },
        ],
      };

      const updatedPlayers = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? updated : p
      );

      // ── 告白選択（romanceChoice → confess）→ 告白ルーレットへ ──
      if (choiceDef.flagKey === "romanceChoice" && option.id === "confess") {
        const dateCount = updated.dates ?? 0;
        // デート回数に応じた成功閾値（1〜5 / 6）
        const successThreshold = Math.min(5, dateCount + 1);
        return {
          ...state,
          phase:              "confession_roulette",
          players:            updatedPlayers,
          currentChoice:      null,
          currentEvent:       null,
          currentCareerChoice: null,
          confessionRoulette: { successThreshold, dateCount },
        };
      }

      // ── 転職選択で「転職する」を選んだ場合はキャリア選択へ連鎖 ──
      if (choiceDef.flagKey === "transferChoice" && option.id === "transfer") {
        return {
          ...state,
          phase:               "career_choice",
          players:             updatedPlayers,
          currentChoice:       null,
          currentEvent:        null,
          currentCareerChoice: { trigger: "transfer", label: CAREER_TRIGGER_LABELS["transfer"] },
        };
      }

      // 養子フラグ: 未婚で子供を得る選択の場合はテキストを変える
      const isAdoption = !!option.effect.getChild && !player.isMarried;

      // 選択結果をモーダルで表示するための表示専用イベント（効果は適用済み）
      const displayEvent: GameEvent = {
        id:            `choice_display_${choiceDef.flagKey}_${option.id}`,
        category:      "life",
        title:         isAdoption ? "👶 養子を迎えた！" : `${option.emoji} ${option.label}を選んだ！`,
        story:         isAdoption ? "未婚だったが、愛情いっぱいに子供を迎え入れた。これからは二人三脚で歩んでいこう。" : option.description,
        result:        isAdoption ? "一人でも家族を作る勇気ある決断。子供の笑顔が毎日の宝物になった。" : `「${option.label}」の選択がこれからの人生に刻まれた。あの時の決断がいつか返ってくる。`,
        effect:        {},
        emoji:         option.emoji,
        isPositive:    true,
        isDisplayOnly: true,
      };

      return {
        ...state,
        phase:               "event",
        players:             updatedPlayers,
        currentChoice:       null,
        currentEvent:        displayEvent,
        currentCareerChoice: null,
      };
    }

    case "DISMISS_EVENT": {
      if (state.phase !== "event" || !state.currentEvent) return state;

      const event  = state.currentEvent;
      const player = state.players[state.currentPlayerIndex];

      // 表示専用イベント（選択後の確認モーダル）は効果を再適用しない
      let updated  = event.isDisplayOnly ? player : applyEventEffect(player, event);

      let newFinished = state.finishedCount;
      if (!event.isDisplayOnly && event.effect.moveSquares !== undefined) {
        const newPos = clamp(0, updated.position + event.effect.moveSquares, TOTAL_SQUARES);
        const justFinished = newPos >= TOTAL_SQUARES && !updated.hasFinished;
        if (justFinished) newFinished = state.finishedCount + 1;
        const milestone = ZONE_MILESTONES[newPos];
        updated = {
          ...updated,
          position:    newPos,
          hasFinished: updated.hasFinished || justFinished,
          finishOrder: justFinished ? newFinished : updated.finishOrder,
          history: milestone
            ? [...updated.history, { ...milestone, turn: updated.turnCount }]
            : updated.history,
        };
      }

      const updatedPlayers = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? updated : p
      );

      const rollAgain = !event.isDisplayOnly && !!event.effect.rollAgain;
      return {
        ...state,
        phase:         rollAgain ? "playing" : "show_result",
        players:       updatedPlayers,
        currentEvent:  null,
        finishedCount: newFinished,
        rollAgainFlag: rollAgain,
      };
    }

    case "CHOOSE_CAREER": {
      if (state.phase !== "career_choice") return state;

      const player  = state.players[state.currentPlayerIndex];
      const job     = action.job;
      const bonus   = JOB_INITIAL_BONUS[job];
      const newAge  = posToAge(player.position);
      const newMoney = player.money + bonus.money;

      // 職業と初期ボーナスを適用
      const updated: Player = {
        ...player,
        job,
        money:       newMoney,
        happiness:   clamp(0, player.happiness + scaleHappy(bonus.happiness), 100),
        fame:        clamp(0, player.fame      + bonus.fame,      100),
        wentBankrupt:  newMoney < 0 ? true : player.wentBankrupt,
        peakMoney:     Math.max(player.peakMoney, newMoney),
        flags: {
          ...player.flags,
          chosenCareer: job,
          // 強制停止済みフラグ（マス58=first_job, マス118=late_career）
          ...(state.currentCareerChoice?.trigger === "first_job"  ? { firstJobDone:    job } : {}),
          ...(state.currentCareerChoice?.trigger === "late_career" ? { lateCareerDone: job } : {}),
        },
        firedCallbacks: player.firedCallbacks ?? [],
        lifeStage:     calcLifeStage({ ...player, position: player.position }),
        history: [
          ...player.history,
          {
            emoji: JOB_EMOJI[job],
            text:  `${JOB_LABELS[job]}として働き始めた`,
            turn:  player.turnCount,
            age:   newAge,
          },
        ],
      };

      const updatedPlayers = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? updated : p
      );

      // キャリア決定後の結果モーダル（表示専用）
      const displayEvent: GameEvent = {
        id:            `career_chosen_${job}`,
        category:      "work",
        title:         `${JOB_EMOJI[job]} ${JOB_LABELS[job]}としてのキャリアをスタート！`,
        story:         JOB_CAREER_STORIES[job],
        result:        bonus.money >= 0
          ? `初期報酬 +${bonus.money}万円、幸福度 +${bonus.happiness}。新しいキャリアの始まり！`
          : `初期投資 ${bonus.money}万円。リスクを取った挑戦が始まる！`,
        effect:        {},
        emoji:         JOB_EMOJI[job],
        isPositive:    bonus.money >= 0,
        isDisplayOnly: true,
      };

      return {
        ...state,
        phase:               "event",
        players:             updatedPlayers,
        currentCareerChoice: null,
        currentEvent:        displayEvent,
      };
    }

    // ============================================================
    // 結婚ルーレット結果処理
    // ============================================================
    case "MARRIAGE_ROLL": {
      if (state.phase !== "marriage_roulette") return state;

      const player     = state.players[state.currentPlayerIndex];
      const hasPartner = state.marriageRoulette?.hasPartner ?? false;
      // 成功閾値: 彼女あり = 4/6 (1〜4)、なし = 2/6 (1〜2)
      const success = action.value <= (hasPartner ? 4 : 2);

      // marriageResolved フラグを先に立てる
      const updatedPlayer: Player = {
        ...player,
        flags: { ...player.flags, marriageResolved: success ? "married" : "skipped" },
      };
      const updatedPlayers = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? updatedPlayer : p
      );

      const resultEvent: GameEvent = success ? {
        id:         "marriage_roulette_success",
        category:   "love",
        title:      "💒 結婚した！",
        story:      hasPartner
          ? "想い人との長い交際がついに実を結んだ。指輪を渡した瞬間、涙があふれた。"
          : "運命的な出会いから電撃婚！周りを驚かせた素敵なサプライズ。",
        result:     "人生最高の日！新しい人生の幕開けだ。",
        effect:     { marry: true, happiness: 30 },
        emoji:      "💍",
        isPositive: true,
      } : {
        id:         "marriage_roulette_fail",
        category:   "love",
        title:      hasPartner ? "今はまだその時ではなかった…" : "まだ縁がなかった…",
        story:      hasPartner
          ? "告白の準備をしていたが、タイミングが合わなかった。いつかきっと。"
          : "理想の相手に出会えなかった。でも人生はまだまだこれから。",
        result:     "今回は縁がなかった。焦らなくていい。",
        effect:     { happiness: -5 },
        emoji:      "💔",
        isPositive: false,
      };

      return {
        ...state,
        phase:            "event",
        players:          updatedPlayers,
        currentEvent:     resultEvent,
        currentChoice:    null,
        marriageRoulette: undefined,
      };
    }

    // ============================================================
    // 告白ルーレット結果処理
    // ============================================================
    case "CONFESSION_ROLL": {
      if (state.phase !== "confession_roulette") return state;

      const player    = state.players[state.currentPlayerIndex];
      const threshold = state.confessionRoulette?.successThreshold ?? 1;
      const success   = action.value <= threshold;

      // romanceChoice フラグを確定
      const flagValue = success ? "confess" : "confess_fail";
      const updatedPlayer: Player = {
        ...player,
        flags: { ...player.flags, romanceChoice: flagValue },
      };
      const updatedPlayers = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? updatedPlayer : p
      );

      const dateCount = state.confessionRoulette?.dateCount ?? 0;

      const resultEvent: GameEvent = success ? {
        id:         "confession_success",
        category:   "love",
        title:      "💕 付き合えた！！",
        story:      dateCount >= 3
          ? "重ねたデートがついに実を結んだ。「私も好き…ずっと言えなかった」という言葉に、胸が高鳴って止まらない。"
          : "勇気を出した一言が奇跡を起こした。「うん、私も気になってた！」――世界が輝いて見える。",
        result:     "交際スタート！ふたりの新しい物語が始まった。",
        effect:     { happiness: 35 },
        emoji:      "💑",
        isPositive: true,
      } : {
        id:         "confession_fail",
        category:   "love",
        title:      dateCount >= 2 ? "💔 もう少しだったかも…" : "💔 フラれた…",
        story:      dateCount >= 2
          ? "一緒に過ごした時間は本物だったのに、一歩が届かなかった。「友達として大切にしたい」――前を向こう。"
          : "勇気を出して告白したが「ごめん、友達としか思えない」という返事だった。しばらく辛い日々が続くかも。",
        result:     "傷ついたけど大人に一歩近づいた。また新しい出会いがきっとある。",
        effect:     { happiness: -15 },
        emoji:      "😢",
        isPositive: false,
      };

      return {
        ...state,
        phase:              "event",
        players:            updatedPlayers,
        currentEvent:       resultEvent,
        currentChoice:      null,
        confessionRoulette: undefined,
      };
    }

    case "END_TURN": {
      if (state.phase !== "show_result") return state;

      const allDone = state.players.every(p => p.hasFinished) ||
                      state.finishedCount >= state.totalPlayers;
      if (allDone) {
        const withTitles = state.players.map(p => ({ ...p, titles: computeTitles(p) }));
        return { ...state, phase: "goal", players: withTitles };
      }

      let next = (state.currentPlayerIndex + 1) % state.totalPlayers;
      let attempts = 0;
      while (state.players[next].hasFinished && attempts < state.totalPlayers) {
        next = (next + 1) % state.totalPlayers;
        attempts++;
      }
      return {
        ...state, phase: "playing",
        currentPlayerIndex: next, diceValue: null, rollAgainFlag: false,
      };
    }

    case "RESET_GAME":
      return createInitialState();

    default:
      return state;
  }
}

// ============================================================
// Hook
// ============================================================
export function useGameStore() {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());

  const startGame = useCallback(
    (players: { name: string; avatar: Avatar; customization?: AvatarCustomization; avatarConfig?: AvatarConfig; playerId?: string }[]) =>
      dispatch({ type: "START_GAME", players }), []
  );
  const rollDice    = useCallback((value: number) => {
    dispatch({ type: "ROLL_DICE" });
    dispatch({ type: "DICE_RESULT", value });
  }, []);
  const dismissEvent  = useCallback(() => dispatch({ type: "DISMISS_EVENT" }), []);
  const makeChoice    = useCallback((optionId: string) => dispatch({ type: "MAKE_CHOICE", optionId }), []);
  const chooseCareer  = useCallback((job: JobType) => dispatch({ type: "CHOOSE_CAREER", job }), []);
  const endTurn      = useCallback(() => dispatch({ type: "END_TURN"   }), []);
  const resetGame    = useCallback(() => dispatch({ type: "RESET_GAME" }), []);
  const setState     = useCallback((s: GameState) => dispatch({ type: "SET_STATE", state: s }), []);
  const marriageRoll    = useCallback((value: number) => dispatch({ type: "MARRIAGE_ROLL",    value }), []);
  const confessionRoll  = useCallback((value: number) => dispatch({ type: "CONFESSION_ROLL",  value }), []);

  return { state, startGame, rollDice, dismissEvent, makeChoice, chooseCareer, endTurn, resetGame, setState, marriageRoll, confessionRoll };
}
