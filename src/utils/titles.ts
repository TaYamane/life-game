import type { Player } from "@/types/game";

// ============================================================
// 称号システム
// ============================================================

export interface TitleDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  condition: (p: Player) => boolean;
  color: string;
}

export const TITLE_DEFINITIONS: TitleDef[] = [
  {
    id: "billionaire",
    name: "億万長者",
    emoji: "💰",
    description: "資産1億円以上でゴール",
    condition: (p) => p.money >= 10000,
    color: "#ffd700",
  },
  {
    id: "bankrupt",
    name: "借金王",
    emoji: "💀",
    description: "一度でも資産0になった",
    condition: (p) => p.wentBankrupt,
    color: "#ef4444",
  },
  {
    id: "invest_king",
    name: "投資王",
    emoji: "📈",
    description: "投資で大成功した",
    condition: (p) => p.investWin,
    color: "#22c55e",
  },
  {
    id: "invest_loser",
    name: "投資失敗王",
    emoji: "📉",
    description: "投資で大失敗した",
    condition: (p) => p.investFail,
    color: "#f87171",
  },
  {
    id: "sns_fire",
    name: "炎上王",
    emoji: "🔥",
    description: "SNSで炎上した",
    condition: (p) => p.snsBurned,
    color: "#fb923c",
  },
  {
    id: "dog_lover",
    name: "犬好き",
    emoji: "🐕",
    description: "ペットを持った",
    condition: (p) => p.hasPetEver,
    color: "#a78bfa",
  },
  {
    id: "married",
    name: "ハッピー婚活王",
    emoji: "💒",
    description: "結婚した",
    condition: (p) => p.gotMarried,
    color: "#f9a8d4",
  },
  {
    id: "divorced",
    name: "バツイチ",
    emoji: "💔",
    description: "離婚を経験した",
    condition: (p) => p.gotDivorced,
    color: "#fca5a5",
  },
  {
    id: "entrepreneur",
    name: "起業家",
    emoji: "🚀",
    description: "起業した",
    condition: (p) => p.startedCompany,
    color: "#60a5fa",
  },
  {
    id: "happy_person",
    name: "幸福者",
    emoji: "😊",
    description: "幸福度80以上でゴール",
    condition: (p) => p.happiness >= 80,
    color: "#4ade80",
  },
  {
    id: "celebrity",
    name: "有名人",
    emoji: "🌟",
    description: "知名度80以上でゴール",
    condition: (p) => p.fame >= 80,
    color: "#facc15",
  },
  {
    id: "lucky_star",
    name: "幸運の星",
    emoji: "🍀",
    description: "ポジティブイベント5回以上",
    condition: (p) => p.positiveEvents >= 5,
    color: "#86efac",
  },
  {
    id: "unlucky_star",
    name: "不運の星",
    emoji: "😢",
    description: "ネガティブイベント5回以上",
    condition: (p) => p.negativeEvents >= 5,
    color: "#94a3b8",
  },
  {
    id: "ceo",
    name: "頂点の経営者",
    emoji: "👑",
    description: "起業して経営者でゴール",
    condition: (p) => p.job === "entrepreneur",
    color: "#ffd700",
  },
  {
    id: "ordinary",
    name: "普通の人",
    emoji: "🙂",
    description: "何も特別なことが起きなかった",
    condition: (p) =>
      !p.gotMarried && !p.gotDivorced && !p.hasPetEver &&
      !p.startedCompany && !p.snsBurned && !p.investWin && !p.investFail &&
      p.money < 10000 && p.happiness < 80 && p.fame < 80,
    color: "#9ca3af",
  },
];

export function computeTitles(player: Player): string[] {
  return TITLE_DEFINITIONS
    .filter((def) => def.condition(player))
    .map((def) => def.id);
}

export function getTitleDef(id: string): TitleDef | undefined {
  return TITLE_DEFINITIONS.find((t) => t.id === id);
}
