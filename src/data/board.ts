import type { Square, ZoneType, SquareType, EventCategory } from "@/types/game";

export const TOTAL_SQUARES = 150;

// ============================================================
// ゾーン別カラー
// ============================================================
const Z: Record<ZoneType, { bg: string; lite: string; text: string }> = {
  babyhood:   { bg: "#2a0a30", lite: "#4a1a50", text: "#f9c8ff" },
  schooldays: { bg: "#0d1b4a", lite: "#1e3a8a", text: "#bfdbfe" },
  youth:      { bg: "#052020", lite: "#134e4e", text: "#99f6e4" },
  adulting:   { bg: "#1a1002", lite: "#451a03", text: "#fde68a" },
  midlife:    { bg: "#031a0a", lite: "#14532d", text: "#bbf7d0" },
  golden:     { bg: "#0f0a00", lite: "#713f12", text: "#fef3c7" },
};

function getZone(id: number): ZoneType {
  if (id <= 14)  return "babyhood";
  if (id <= 39)  return "schooldays";
  if (id <= 69)  return "youth";
  if (id <= 110) return "adulting";
  if (id <= 134) return "midlife";
  return "golden";
}

// ============================================================
// ランドマーク定義
// ============================================================
type LM = {
  type: SquareType;
  label: string;
  icon: string;
  amount?: number;
  cat?: EventCategory;
};

const LANDMARKS: Record<number, LM> = {

  // ===== BABYHOOD (0–14) =====
  0:   { type: "start",       label: "誕生！",             icon: "👶" },
  1:   { type: "event",       label: "はじめての一歩",     icon: "🐣", cat: "life" },
  2:   { type: "money_plus",  label: "お年玉",             icon: "🎍", amount: 1 },
  3:   { type: "event",       label: "お友達ができた",     icon: "👫", cat: "life" },
  4:   { type: "safe",        label: "すやすやお昼寝",     icon: "💤" },
  5:   { type: "event",       label: "誕生日パーティー",   icon: "🎂", cat: "life" },
  6:   { type: "money_plus",  label: "お祝い",             icon: "🎁", amount: 2 },
  7:   { type: "money_minus", label: "風邪をひいた",       icon: "🤧", amount: -1 },
  8:   { type: "event",       label: "お遊戯会で主役",     icon: "🎭", cat: "life" },
  9:   { type: "safe",        label: "元気いっぱい！",     icon: "🌈" },
  10:  { type: "event",       label: "幼稚園入園",         icon: "🌸", cat: "life" },
  11:  { type: "money_plus",  label: "お小遣い",           icon: "💴", amount: 2 },
  12:  { type: "choice",      label: "習い事選択★",       icon: "⭐" },
  13:  { type: "event",       label: "幼稚園の思い出",     icon: "🎨", cat: "life" },
  14:  { type: "chance",      label: "チャンス！",         icon: "★" },

  // ===== SCHOOLDAYS (15–39) =====
  15:  { type: "event",       label: "小学校入学",         icon: "🏫", cat: "life" },
  16:  { type: "money_plus",  label: "お年玉",             icon: "🎍", amount: 3 },
  17:  { type: "event",       label: "友達100人できるかな", icon: "👫", cat: "life" },
  18:  { type: "money_minus", label: "教材費",             icon: "🎒", amount: -3 },
  19:  { type: "event",       label: "運動会",             icon: "🏅", cat: "life" },
  20:  { type: "chance",      label: "チャンス！",         icon: "★" },
  21:  { type: "money_plus",  label: "お年玉大豊作",       icon: "💴", amount: 5 },
  22:  { type: "event",       label: "学芸会で大成功",     icon: "🎪", cat: "social" },
  23:  { type: "money_minus", label: "塾に入った",         icon: "📚", amount: -5 },
  24:  { type: "safe",        label: "放課後の友達と",     icon: "🤝" },
  25:  { type: "choice",      label: "部活・習い事★",     icon: "⭐" },
  26:  { type: "event",       label: "中学校入学",         icon: "📚", cat: "life" },
  27:  { type: "event",       label: "初恋をした…",       icon: "💕", cat: "love" },
  28:  { type: "money_minus", label: "制服・部活用品",     icon: "👕", amount: -8 },
  29:  { type: "event",       label: "文化祭で大活躍",     icon: "🎪", cat: "life" },
  30:  { type: "chance",      label: "チャンス！",         icon: "★" },
  31:  { type: "money_plus",  label: "お年玉",             icon: "🎍", amount: 8 },
  32:  { type: "event",       label: "受験勉強スタート",   icon: "📖", cat: "work" },
  33:  { type: "roll_again",  label: "もう一回！",         icon: "🎲" },
  34:  { type: "money_minus", label: "塾費用",             icon: "📗", amount: -10 },
  35:  { type: "choice",      label: "高校受験★",         icon: "⭐" },
  36:  { type: "event",       label: "高校入学！",         icon: "🎒", cat: "life" },
  37:  { type: "money_plus",  label: "入学祝い",           icon: "🎊", amount: 5 },
  38:  { type: "safe",        label: "新しい仲間たち",     icon: "🌱" },
  39:  { type: "event",       label: "青春が始まった",     icon: "💫", cat: "love" },

  // ===== YOUTH (40–69) =====
  40:  { type: "event",       label: "部活・文化祭の熱",   icon: "🔥", cat: "life" },
  41:  { type: "money_plus",  label: "初バイト代",         icon: "💴", amount: 10 },
  42:  { type: "money_minus", label: "スマホ代・交際費",   icon: "📱", amount: -10 },
  43:  { type: "event",       label: "恋愛のできごと",     icon: "💑", cat: "love" },
  44:  { type: "choice",      label: "文理選択★",         icon: "⭐" },
  45:  { type: "chance",      label: "チャンス！",         icon: "★" },
  46:  { type: "event",       label: "センター試験に挑む", icon: "📋", cat: "work" },
  47:  { type: "money_minus", label: "予備校・受験費",     icon: "📚", amount: -15 },
  48:  { type: "safe",        label: "勉強漬けの日々",     icon: "📝" },
  49:  { type: "roll_again",  label: "もう一回！",         icon: "🎲" },
  50:  { type: "choice",      label: "進路選択★大分岐",   icon: "⭐" },
  51:  { type: "event",       label: "新生活スタート",     icon: "🎓", cat: "life" },
  52:  { type: "money_plus",  label: "入学祝い",           icon: "🎊", amount: 8  },
  53:  { type: "money_minus", label: "学費・生活費",       icon: "🏠", amount: -20 },
  54:  { type: "event",       label: "サークル・友人",     icon: "🎸", cat: "life" },
  55:  { type: "chance",      label: "チャンス！",         icon: "★" },
  56:  { type: "event",       label: "インターン・就活準備", icon: "💻", cat: "work" },
  57:  { type: "money_plus",  label: "バイト・仕送り",     icon: "💴", amount: 20 },
  58:  { type: "choice",      label: "就活戦略★",         icon: "⭐" },
  59:  { type: "event",       label: "内定獲得！",         icon: "🎉", cat: "work" },
  60:  { type: "event",       label: "社会人デビュー",     icon: "💼", cat: "work" },
  61:  { type: "money_plus",  label: "はじめての給料",     icon: "💰", amount: 30 },
  62:  { type: "money_minus", label: "一人暮らし出費",     icon: "🏠", amount: -15 },
  63:  { type: "safe",        label: "仕事が楽しくなってきた", icon: "😊" },
  64:  { type: "chance",      label: "チャンス！",         icon: "★" },
  65:  { type: "choice",      label: "恋愛選択★",         icon: "⭐" },
  66:  { type: "event",       label: "素敵な出会い",       icon: "💘", cat: "love" },
  67:  { type: "money_plus",  label: "ボーナス",           icon: "💰", amount: 20 },
  68:  { type: "money_minus", label: "デート・交際費",     icon: "🌸", amount: -20 },
  69:  { type: "event",       label: "仕事の洗礼",         icon: "😤", cat: "work" },

  // ===== ADULTING (70–110) =====
  70:  { type: "chance",      label: "チャンス！",         icon: "★" },
  71:  { type: "event",       label: "昇進チャンス",       icon: "📋", cat: "work" },
  72:  { type: "money_plus",  label: "ボーナス支給",       icon: "💰", amount: 50 },
  73:  { type: "choice",      label: "転職チャンス★",     icon: "⭐" },
  74:  { type: "event",       label: "仕事の実力が試される", icon: "💪", cat: "work" },
  75:  { type: "money_minus", label: "税金・社会保険",     icon: "📊", amount: -30 },
  76:  { type: "event",       label: "交際が深まる",       icon: "💏", cat: "love" },
  77:  { type: "safe",        label: "充実した毎日",       icon: "🌟" },
  78:  { type: "money_plus",  label: "副業・臨時収入",     icon: "💴", amount: 40 },
  79:  { type: "choice",      label: "結婚選択★大分岐",   icon: "⭐" },
  80:  { type: "event",       label: "人生の新章が始まる", icon: "🌅", cat: "love" },
  81:  { type: "money_minus", label: "結婚式・引越し費",   icon: "💒", amount: -150 },
  82:  { type: "money_plus",  label: "結婚祝い金",         icon: "🎊", amount: 100 },
  83:  { type: "event",       label: "新しい家族の形",     icon: "🏡", cat: "love" },
  84:  { type: "choice",      label: "人生の優先順位★",   icon: "⭐" },
  85:  { type: "chance",      label: "チャンス！",         icon: "★" },
  86:  { type: "event",       label: "仕事での大きな出来事", icon: "🏢", cat: "work" },
  87:  { type: "money_plus",  label: "昇給・ボーナス",     icon: "💰", amount: 60 },
  88:  { type: "money_minus", label: "生活費・ローン",     icon: "🏦", amount: -30 },
  89:  { type: "safe",        label: "家族と過ごす週末",   icon: "🏠" },
  90:  { type: "choice",      label: "子供の選択★大分岐", icon: "⭐" },
  91:  { type: "event",       label: "家族の形が変わった", icon: "👨‍👩‍👧", cat: "love" },
  92:  { type: "money_minus", label: "育児・教育費",       icon: "🍼", amount: -80 },
  93:  { type: "money_plus",  label: "ボーナス",           icon: "💰", amount: 50 },
  94:  { type: "event",       label: "家族のできごと",     icon: "💝", cat: "love" },
  95:  { type: "chance",      label: "チャンス！",         icon: "★" },
  96:  { type: "choice",      label: "起業チャンス★大分岐", icon: "⭐" },
  97:  { type: "event",       label: "仕事の大きな転機",   icon: "🔀", cat: "work" },
  98:  { type: "money_minus", label: "大きな出費",         icon: "💸", amount: -200 },
  99:  { type: "money_plus",  label: "利益・ボーナス",     icon: "📈", amount: 100 },
  100: { type: "event",       label: "マイホームを検討",   icon: "🏡", cat: "life" },
  101: { type: "money_minus", label: "住宅購入（頭金）",     icon: "🏦", amount: -1500 },
  102: { type: "event",       label: "仕事でのできごと",   icon: "💼", cat: "work" },
  103: { type: "choice",      label: "次世代への関わり方★", icon: "⭐" },
  104: { type: "chance",      label: "チャンス！",         icon: "★" },
  105: { type: "money_plus",  label: "資産運用益",         icon: "💰", amount: 150 },
  106: { type: "event",       label: "管理職に昇進",       icon: "📋", cat: "work" },
  107: { type: "money_minus", label: "税金・費用",         icon: "📊", amount: -60 },
  108: { type: "money_plus",  label: "年収アップ",         icon: "💰", amount: 200 },
  109: { type: "event",       label: "健康を意識し始めた", icon: "💊", cat: "life" },
  110: { type: "safe",        label: "人生の折り返し",     icon: "🌅" },

  // ===== MIDLIFE (111–134) =====
  111: { type: "roll_again",  label: "もう一回！",         icon: "🎲" },
  112: { type: "choice",      label: "資産運用★",         icon: "⭐" },
  113: { type: "event",       label: "投資の結果が出た",   icon: "📈", cat: "money" },
  114: { type: "money_minus", label: "医療費",             icon: "🏥", amount: -100 },
  115: { type: "money_plus",  label: "副収入・配当",       icon: "💰", amount: 200 },
  116: { type: "event",       label: "会社での出来事",     icon: "🏢", cat: "work" },
  117: { type: "chance",      label: "チャンス！",         icon: "★" },
  118: { type: "choice",      label: "キャリア選択★",     icon: "⭐" },
  119: { type: "event",       label: "仕事の大きな成果",   icon: "🏆", cat: "work" },
  120: { type: "money_minus", label: "子供の学費・仕送り", icon: "🎓", amount: -100 },
  121: { type: "money_plus",  label: "事業収益",           icon: "💰", amount: 150 },
  122: { type: "event",       label: "親の介護が始まった", icon: "❤️", cat: "life" },
  123: { type: "chance",      label: "チャンス！",         icon: "★" },
  124: { type: "safe",        label: "充実した日々",       icon: "🌸" },
  125: { type: "choice",      label: "介護の選択★",       icon: "⭐" },
  126: { type: "event",       label: "人生を振り返り始めた", icon: "🌟", cat: "life" },
  127: { type: "money_plus",  label: "大型ボーナス",       icon: "💰", amount: 300 },
  128: { type: "money_minus", label: "まとまった支出",     icon: "💸", amount: -200 },
  129: { type: "roll_again",  label: "もう一回！",         icon: "🎲" },
  130: { type: "chance",      label: "チャンス！",         icon: "★" },
  131: { type: "event",       label: "健康の課題と向き合う", icon: "💊", cat: "life" },
  132: { type: "money_plus",  label: "長年の蓄積が実った", icon: "📈", amount: 500 },
  133: { type: "choice",      label: "早期退職★",         icon: "⭐" },
  134: { type: "event",       label: "定年退職",           icon: "🎊", cat: "work" },

  // ===== GOLDEN (135–150) =====
  135: { type: "money_plus",  label: "退職金",             icon: "💰", amount: 800 },
  136: { type: "event",       label: "老後生活スタート",   icon: "🌅", cat: "life" },
  137: { type: "chance",      label: "チャンス！",         icon: "★" },
  138: { type: "safe",        label: "趣味三昧の日々",     icon: "🎨" },
  139: { type: "event",       label: "孫が生まれた！",     icon: "👶", cat: "love" },
  140: { type: "money_plus",  label: "長年の投資が実った", icon: "💰", amount: 1000 },
  141: { type: "money_minus", label: "医療費・健康管理",   icon: "🏥", amount: -200 },
  142: { type: "choice",      label: "老後の生き方★",     icon: "⭐" },
  143: { type: "event",       label: "老後の充実した日々", icon: "🌸", cat: "life" },
  144: { type: "money_plus",  label: "不動産・株の果実",   icon: "📈", amount: 500 },
  145: { type: "safe",        label: "孫と過ごす午後",     icon: "👨‍👩‍👧‍👦" },
  146: { type: "event",       label: "家族が集まった",     icon: "💝", cat: "love" },
  147: { type: "chance",      label: "チャンス！",         icon: "★" },
  148: { type: "roll_again",  label: "もう一回！",         icon: "🎲" },
  149: { type: "event",       label: "人生を振り返る",     icon: "🌟", cat: "life" },
  150: { type: "goal",        label: "老後の幸せ",         icon: "🏆" },
};

// ============================================================
// ゾーン別フィラー
// ============================================================
type FillerDef = [SquareType, string, string, number?, EventCategory?];

const FILLERS: Record<ZoneType, FillerDef[]> = {
  babyhood: [
    ["safe",        "元気いっぱい",         "🌱"],
    ["event",       "かわいいできごと",     "✨", undefined, "life"],
    ["money_plus",  "お祝いをもらった",     "🎂", 1],
    ["safe",        "ぐっすり眠った",       "💤"],
    ["money_minus", "お薬をもらった",       "💊", -1],
    ["event",       "家族の思い出",         "🎉", undefined, "life"],
  ],
  schooldays: [
    ["safe",        "学校が楽しい",         "📚"],
    ["event",       "学校のできごと",       "🏫", undefined, "life"],
    ["money_plus",  "お小遣いもらった",     "💴", 3],
    ["safe",        "友達と放課後",         "👫"],
    ["money_minus", "文具・給食費",         "✏️", -3],
    ["event",       "青春のできごと",       "⭐", undefined, "life"],
    ["money_minus", "塾・習い事",           "📚", -8],
    ["event",       "勉強のできごと",       "📝", undefined, "work"],
  ],
  youth: [
    ["safe",        "大学・社会への準備",   "🎓"],
    ["event",       "青春のできごと",       "🎸", undefined, "life"],
    ["money_plus",  "バイト代",             "💴", 12],
    ["money_minus", "交際費・娯楽",         "🍻", -12],
    ["event",       "恋愛のできごと",       "💕", undefined, "love"],
    ["safe",        "友人との思い出",       "🌸"],
    ["money_minus", "生活費",               "🏠", -15],
    ["event",       "仕事のできごと",       "💼", undefined, "work"],
    ["money_plus",  "ボーナス・臨時収入",   "💰", 40],
  ],
  adulting: [
    ["safe",        "仕事に精を出す",       "💼"],
    ["event",       "社会人のできごと",     "🏢", undefined, "work"],
    ["money_plus",  "給料・ボーナス",       "💰", 80],
    ["money_minus", "生活費・ローン",       "🏦", -60],
    ["event",       "家族のできごと",       "👨‍👩‍👧", undefined, "love"],
    ["safe",        "充実した毎日",         "🌟"],
    ["money_minus", "税金・社会保険",       "📊", -50],
    ["event",       "お金のできごと",       "💹", undefined, "money"],
    ["money_plus",  "投資・副業収益",       "📈", 100],
    ["safe",        "家族と過ごす休日",     "🏠"],
  ],
  midlife: [
    ["safe",        "仕事の充実期",         "🏆"],
    ["event",       "壮年期のできごと",     "🏢", undefined, "work"],
    ["money_plus",  "高収入フェーズ",       "💰", 150],
    ["money_minus", "各種費用",             "📊", -80],
    ["event",       "家族のできごと",       "💝", undefined, "love"],
    ["safe",        "人生の充実期",         "🌸"],
    ["money_minus", "医療費",               "🏥", -60],
    ["event",       "健康・老後のできごと", "💊", undefined, "life"],
  ],
  golden: [
    ["safe",        "のんびり隠居生活",     "🌅"],
    ["event",       "老後のできごと",       "🌸", undefined, "life"],
    ["money_plus",  "年金・配当",           "💰", 200],
    ["money_minus", "医療費・介護費",       "🏥", -150],
    ["event",       "家族のできごと",       "💝", undefined, "love"],
    ["safe",        "孫の成長を見守る",     "👶"],
  ],
};

// ============================================================
// ボード生成
// ============================================================
function generateBoard(): Square[] {
  const squares: Square[] = [];

  const zoneStarts: Record<ZoneType, number> = {
    babyhood: 0, schooldays: 15, youth: 40,
    adulting: 70, midlife: 111, golden: 135,
  };

  for (let id = 0; id <= TOTAL_SQUARES; id++) {
    const zone      = getZone(id);
    const colors    = Z[zone];
    const isSpecial = id === 0 || id === TOTAL_SQUARES;

    const lm = LANDMARKS[id];
    if (lm) {
      squares.push({
        id,
        type:      lm.type,
        label:     lm.label,
        icon:      lm.icon,
        bgColor:   isSpecial ? "#ca8a04" : lm.type === "choice" ? "#7a1a1a" : (id % 3 === 0 ? colors.lite : colors.bg),
        textColor: isSpecial ? "#1f2937" : lm.type === "choice" ? "#ffe4e1" : colors.text,
        zone,
        ...(lm.amount !== undefined ? { amount: lm.amount } : {}),
        ...(lm.cat    !== undefined ? { preferredCategory: lm.cat } : {}),
      });
      continue;
    }

    const pattern = FILLERS[zone];
    const offset  = (id - zoneStarts[zone]) % pattern.length;
    const [type, label, icon, amount, cat] = pattern[offset];

    const isChanceTrigger = id % 13 === 0 && type !== "chance";

    squares.push({
      id,
      type:      isChanceTrigger ? "chance" : type,
      label:     isChanceTrigger ? "チャンス！" : label,
      icon:      isChanceTrigger ? "★" : icon,
      bgColor:   isChanceTrigger ? "#3b2200" : (id % 3 === 0 ? colors.lite : colors.bg),
      textColor: isChanceTrigger ? "#fde68a" : colors.text,
      zone,
      ...((!isChanceTrigger && amount !== undefined) ? { amount } : {}),
      ...((!isChanceTrigger && cat    !== undefined) ? { preferredCategory: cat } : {}),
    });
  }

  return squares;
}

export const BOARD_SQUARES: Square[] = generateBoard();

// ============================================================
// ユーティリティ
// ============================================================

export function getSquareIdAtGrid(row: number, col: number): number {
  return row % 2 === 0 ? row * 5 + col : row * 5 + (4 - col);
}

export function getGridPosition(squareId: number): { row: number; col: number } {
  const row      = Math.floor(squareId / 5);
  const posInRow = squareId % 5;
  return { row, col: row % 2 === 0 ? posInRow : 4 - posInRow };
}

export function getZoneForRow(row: number): ZoneType {
  const firstSq = row * 5;
  if (firstSq <= 14)  return "babyhood";
  if (firstSq <= 39)  return "schooldays";
  if (firstSq <= 69)  return "youth";
  if (firstSq <= 110) return "adulting";
  if (firstSq <= 134) return "midlife";
  return "golden";
}
