// ============================================================
// 型定義 v5 — 150マス人生ゲーム（フラグ・選択システム対応）
// ============================================================

// ---------- 盤面ゾーン（6区分） ----------
export type ZoneType =
  | "babyhood"   // 0–14   赤ちゃん〜幼稚園
  | "schooldays" // 15–39  小学生〜中学生
  | "youth"      // 40–69  高校〜大学・就職
  | "adulting"   // 70–110 社会人・結婚
  | "midlife"    // 111–134 壮年期
  | "golden";    // 135–150 老後・引退

export const ZONE_INFO: Record<ZoneType, {
  label: string; emoji: string; color: string; bgColor: string; rows: [number, number];
}> = {
  babyhood:   { label: "赤ちゃん〜幼稚園", emoji: "👶", color: "#f472b6", bgColor: "#1f0516", rows: [0,  2]  },
  schooldays: { label: "小学生〜中学生",   emoji: "🏫", color: "#60a5fa", bgColor: "#070f2a", rows: [3,  7]  },
  youth:      { label: "高校〜大学・就職", emoji: "🎒", color: "#34d399", bgColor: "#052020", rows: [8,  13] },
  adulting:   { label: "社会人・結婚",     emoji: "💼", color: "#fbbf24", bgColor: "#1a1002", rows: [14, 22] },
  midlife:    { label: "壮年期",           emoji: "🏢", color: "#4ade80", bgColor: "#031a0a", rows: [23, 26] },
  golden:     { label: "老後・引退",       emoji: "🌅", color: "#ffd700", bgColor: "#0f0a00", rows: [27, 30] },
};

// ---------- 盤面マス ----------
export type SquareType =
  | "start" | "goal"
  | "money_plus" | "money_minus"
  | "event" | "chance" | "safe" | "roll_again"
  | "choice";   // 人生の選択マス（フラグセット）

export type EventCategory = "work" | "love" | "money" | "social" | "life" | "chance";

export interface Square {
  id:                 number;
  type:               SquareType;
  label:              string;
  amount?:            number;
  icon:               string;
  bgColor:            string;
  textColor:          string;
  zone:               ZoneType;
  preferredCategory?: EventCategory;
}

// ---------- アバター ----------
export type AvatarColor = "red" | "blue" | "green" | "yellow" | "purple" | "pink";

export const AVATAR_COLORS: Record<AvatarColor, { bg: string; border: string; label: string }> = {
  red:    { bg: "#ef4444", border: "#b91c1c", label: "あか" },
  blue:   { bg: "#3b82f6", border: "#1d4ed8", label: "あお" },
  green:  { bg: "#22c55e", border: "#15803d", label: "みどり" },
  yellow: { bg: "#eab308", border: "#a16207", label: "きいろ" },
  purple: { bg: "#a855f7", border: "#7e22ce", label: "むらさき" },
  pink:   { bg: "#ec4899", border: "#be185d", label: "ピンク" },
};

export const AVATAR_EMOJIS = ["😀", "😎", "🥳", "🤩", "😺", "🐸", "🦊", "🐼"];

export interface Avatar { emoji: string; color: AvatarColor; }

// ---------- アバターカスタマイズ（将来拡張用） ----------
export interface AvatarCustomization {
  hairStyle?: "short" | "long" | "curly" | "bald";
  hairColor?: string;
  outfit?:    "casual" | "formal" | "uniform" | "sporty";
  accessory?: "glasses" | "hat" | "crown" | "none";
  skinTone?:  "light" | "medium" | "dark";
}

// ---------- 職業 ----------
export type JobType =
  | "none" | "part_time" | "salaryman" | "civil_servant"
  | "engineer" | "doctor" | "lawyer" | "youtuber" | "entrepreneur" | "freelancer" | "artist"
  // ── 隠し職業（特定条件を満たしたプレイヤーのみ解放） ──
  | "inventor"       // 発明家
  | "investor"       // 投資家
  | "astronaut"      // 宇宙飛行士
  | "pro_gamer"      // プロゲーマー
  | "shadow_ruler"   // 陰の支配者
  | "legendary_neet";// 伝説のニート

export const JOB_LABELS: Record<JobType, string> = {
  none:           "無職",
  part_time:      "アルバイト",
  salaryman:      "会社員",
  civil_servant:  "公務員",
  engineer:       "エンジニア",
  doctor:         "医師",
  lawyer:         "弁護士",
  youtuber:       "YouTuber",
  entrepreneur:   "経営者",
  freelancer:     "フリーランス",
  artist:         "アーティスト",
  // 隠し職業
  inventor:       "発明家",
  investor:       "投資家",
  astronaut:      "宇宙飛行士",
  pro_gamer:      "プロゲーマー",
  shadow_ruler:   "陰の支配者",
  legendary_neet: "伝説のニート",
};

export const JOB_INCOME: Record<JobType, number> = {
  none:            0,
  part_time:      20,
  salaryman:      50,
  civil_servant:  45,
  engineer:       80,
  doctor:        150,
  lawyer:        130,
  youtuber:      200,
  entrepreneur:    0,
  freelancer:     60,
  artist:         30,
  // 隠し職業
  inventor:      180,
  investor:      300,
  astronaut:     250,
  pro_gamer:     120,
  shadow_ruler:  500,
  legendary_neet:  0,
};

// ---------- ライフステージ（位置ベース） ----------
export type LifeStage =
  | "baby"       // 0–14
  | "child"      // 15–39
  | "teen"       // 40–69
  | "youth"      // 70–110
  | "adult"      // 111–134
  | "middleage"  // (reserved)
  | "senior";    // 135–150

export const LIFE_STAGE_INFO: Record<LifeStage, { label: string; emoji: string; color: string }> = {
  baby:      { label: "赤ちゃん", emoji: "👶", color: "#c084fc" },
  child:     { label: "学生",     emoji: "🏫", color: "#60a5fa" },
  teen:      { label: "青春",     emoji: "🎒", color: "#34d399" },
  youth:     { label: "社会人",   emoji: "💼", color: "#fbbf24" },
  adult:     { label: "壮年期",   emoji: "🏢", color: "#4ade80" },
  middleage: { label: "中年",     emoji: "🏡", color: "#f472b6" },
  senior:    { label: "シニア",   emoji: "🌅", color: "#ffd700" },
};

// ---------- イベント効果 ----------
export interface EventEffect {
  money?:        number;
  happiness?:    number;
  fame?:         number;
  moneyHalf?:    boolean;
  setJob?:       JobType;
  marry?:        boolean;
  divorce?:      boolean;
  getPet?:       boolean;
  losePet?:      boolean;
  getChild?:     boolean;
  startCompany?: boolean;
  moveSquares?:  number;
  rollAgain?:    boolean;
}

// ---------- イベント発生条件 ----------
export interface EventConditions {
  // ── ハード条件 ──
  requireMarried?:    boolean;
  requireSingle?:     boolean;
  requirePet?:        boolean;
  requireNoPet?:      boolean;
  requireChildren?:   boolean;
  requireNoChildren?: boolean;
  requireCompany?:    boolean;
  requireNoCompany?:  boolean;
  requireJobs?:       JobType[];
  forbidJobs?:        JobType[];
  minMoney?:          number;
  maxMoney?:          number;
  minFame?:           number;
  maxFame?:           number;
  minHappiness?:      number;
  maxHappiness?:      number;
  minPosition?:       number;
  maxPosition?:       number;
  // ── フラグ条件（選択の伏線回収）──
  requireFlags?:      Record<string, string>;  // { flagKey: "value" }
  forbidFlags?:       Record<string, string>;
  // ── ソフト条件 ──
  baseWeight?:            number;
  boostIfJobs?:           JobType[];
  boostIfMarried?:        boolean;
  boostIfSingle?:         boolean;
  boostIfPet?:            boolean;
  boostIfHasChildren?:    boolean;
  boostIfHighMoney?:      boolean;
  boostIfLowMoney?:       boolean;
  boostIfHighFame?:       boolean;
  boostIfLowHappiness?:   boolean;
  boostIfHighHappiness?:  boolean;
  boostIfHasCompany?:     boolean;
}

export const CATEGORY_INFO: Record<EventCategory, { label: string; color: string; icon: string }> = {
  work:   { label: "仕事",     color: "#3b82f6", icon: "💼" },
  love:   { label: "恋愛",     color: "#ec4899", icon: "💕" },
  money:  { label: "お金",     color: "#22c55e", icon: "💰" },
  social: { label: "社会",     color: "#ef4444", icon: "🔥" },
  life:   { label: "生活",     color: "#f59e0b", icon: "🏠" },
  chance: { label: "チャンス", color: "#a855f7", icon: "⭐" },
};

export interface GameEvent {
  id:           string;
  category:     EventCategory;
  title:        string;
  story:        string;
  result:       string;
  effect:       EventEffect;
  emoji:        string;
  isPositive:   boolean;
  isCallback?:  boolean;    // true = 伏線回収イベント（UI で特別演出）
  callbackNote?: string;    // 「マス○○の選択が返ってきた」テキスト
  isUnique?:    boolean;    // true = 1プレイヤーにつき1回のみ発生（成長マイルストーン等）
  isDisplayOnly?: boolean;  // true = 効果適用済み・DISMISS_EVENT で再適用しない（選択後確認モーダル用）
  conditions?:  EventConditions;
}

// ---------- 選択マス ----------
export interface ChoiceOption {
  id:          string;   // 選択肢の識別子（= flagValue）
  label:       string;
  description: string;
  effect:      EventEffect;
  emoji:       string;
}

export interface ChoiceSquare {
  squareId:    number;
  flagKey:     string;   // player.flags に書き込むキー
  title:       string;
  description: string;
  emoji:       string;
  options:     ChoiceOption[];
}

// ---------- 人生履歴 ----------
export interface HistoryEntry {
  emoji:    string;
  text:     string;
  turn:     number;
  age?:     number;     // 発生時の年齢（人生年表用）
  isChoice?: boolean;   // 選択マスの履歴
}

// ---------- プレイヤー ----------
export interface Player {
  id:       number;
  playerId: string;
  name:     string;
  avatar:   Avatar;

  money:     number;
  happiness: number;
  fame:      number;

  position:    number;
  hasFinished: boolean;
  finishOrder?: number;

  job:        JobType;
  lifeStage:  LifeStage;
  isMarried:  boolean;
  hasPet:     boolean;
  hasCompany: boolean;
  hasChildren: boolean;

  // 選択フラグ（伏線システム）
  flags: Record<string, string>;

  // 発火済みコールバックID（同一イベントの重複発生防止）
  firedCallbacks: string[];

  // デート回数（pos25〜64 の恋愛ポジティブイベント数）
  dates: number;

  // 称号フラグ
  titles:         string[];
  gotMarried:     boolean;
  gotDivorced:    boolean;
  hasPetEver:     boolean;
  startedCompany: boolean;
  wentBankrupt:   boolean;
  snsBurned:      boolean;
  investWin:      boolean;
  investFail:     boolean;
  negativeEvents: number;
  positiveEvents: number;
  peakMoney:      number;

  history:   HistoryEntry[];
  turnCount: number;
}

// ---------- ゲーム状態 ----------
export type CareerTrigger = "first_job" | "transfer" | "late_career";

export interface CareerChoiceContext {
  trigger: CareerTrigger;
  label:   string;
}

export type GamePhase =
  | "setup" | "playing" | "rolling"
  | "show_result" | "event" | "choice" | "career_choice"
  | "marriage_roulette"    // 結婚ルーレット（確率判定）
  | "confession_roulette"  // 告白ルーレット（デート回数で確率変動）
  | "goal";

export interface GameState {
  phase:               GamePhase;
  players:             Player[];
  currentPlayerIndex:  number;
  diceValue:           number | null;
  isRolling:           boolean;
  currentEvent:        GameEvent | null;
  currentChoice:       ChoiceSquare | null;       // 選択マス用
  currentCareerChoice: CareerChoiceContext | null; // キャリア選択用
  finishedCount:       number;
  totalPlayers:        number;
  rollAgainFlag:       boolean;
  marriageRoulette?:   { hasPartner: boolean };
  confessionRoulette?: { successThreshold: number; dateCount: number }; // 告白ルーレット
  _syncId?:            string;
}

// ---------- オンライン ----------
export type OnlineMode = "offline" | "host" | "guest";

export interface RoomInfo {
  id:          string;
  code:        string;
  status:      "waiting" | "playing" | "finished";
  playerIds:   string[];
  playerNames: string[];
}
