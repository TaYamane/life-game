import type { Player } from "@/types/game";
import { JOB_LABELS } from "@/types/game";

// ============================================================
// 年齢計算 — 位置(0-150) → 年齢
// ============================================================
export function calcAge(position: number): number {
  if (position <= 14)  return Math.round((position / 14) * 5);
  if (position <= 39)  return 6  + Math.round(((position - 15)  / 24) * 9);
  if (position <= 69)  return 16 + Math.round(((position - 40)  / 29) * 6);
  if (position <= 110) return 23 + Math.round(((position - 70)  / 40) * 12);
  if (position <= 134) return 36 + Math.round(((position - 111) / 23) * 19);
  return                      56 + Math.round(((position - 135) / 15) * 9);
}

// ============================================================
// 年齢フレーズ — 「24歳 社会人2年目」のような文字列
// ============================================================
export function getAgePhrase(player: Player): string {
  const pos         = player.position;
  const age         = calcAge(pos);
  const flags       = player.flags ?? {};   // ← undefined セーフ
  const isMarried   = player.isMarried   ?? false;
  const hasChildren = player.hasChildren ?? false;

  if (age <= 0)  return "0歳 赤ちゃん";
  if (age === 1) return "1歳 よちよち歩き";
  if (age <= 5) {
    if (age <= 3) return `${age}歳 よちよち期`;
    return `${age}歳 幼稚園`;
  }

  // 小学生（6〜11歳：小1〜小6）
  if (age <= 11) {
    const grade = age - 5;  // 6→1, 7→2, …, 11→6
    return `${age}歳 小学${grade}年生`;
  }

  // 中学生（12〜14歳：中1〜中3）
  if (age <= 14) {
    const grade = age - 11;  // 12→1, 13→2, 14→3
    return `${age}歳 中学${grade}年生`;
  }

  // 高校生（15〜17歳：高1〜高3）
  if (age <= 17) {
    const grade = age - 14;  // 15→1, 16→2, 17→3
    return `${age}歳 高校${grade}年生`;
  }

  // 18〜22歳 — 進路フラグで分岐
  if (age <= 22) {
    const r = flags.lifeRoute;
    if (r === "work") {
      const yr = Math.max(1, age - 17);
      return `${age}歳 社会人${yr}年目`;
    }
    if (r === "vocational_school") {
      // 専門学校は2年制（18歳→1年、19歳→2年、20歳以降→卒業・社会人）
      const yr = age - 17;  // 18→1, 19→2
      if (yr <= 2) return `${age}歳 専門学校${yr}年生`;
      return `${age}歳 社会人${Math.max(1, age - 19)}年目`;
    }
    const yr = Math.max(1, age - 17);
    return `${age}歳 大学${yr}年生`;
  }

  // 23〜26歳 — 社会人初期
  if (age <= 26) {
    const yr = Math.max(1, age - 22);
    return `${age}歳 社会人${yr}年目`;
  }

  // 27〜32歳 — 結婚・子育てフェーズ
  if (age <= 32) {
    if (isMarried && hasChildren) return `${age}歳 子育て真っ最中`;
    if (isMarried) {
      const yr = Math.max(1, age - 26);
      return `${age}歳 新婚${yr}年目`;
    }
    return `${age}歳 キャリア形成期`;
  }

  // 33〜40歳
  if (age <= 40) {
    if (hasChildren) return `${age}歳 育児と仕事の両立`;
    if (isMarried)  return `${age}歳 共に歩む${age - 26}年目`;
    return `${age}歳 自分らしく生きる`;
  }

  // 41〜50歳
  if (age <= 50) {
    return `${age}歳 人生の充実期`;
  }

  // 51〜55歳
  if (age <= 55) {
    return `${age}歳 壮年後半`;
  }

  // 56〜60歳
  if (age <= 60) {
    return `${age}歳 定年前後`;
  }

  // 61歳〜
  return `${age}歳 老後の日々`;
}

// ============================================================
// 健康スコア（派生値）— 負の出来事が多いほど低下
// ============================================================
export function calcHealthScore(player: Player): number {
  const base = 100;
  const penalty = player.negativeEvents * 6 + (player.wentBankrupt ? 15 : 0);
  return Math.max(10, Math.min(100, base - penalty));
}

// ============================================================
// フラグ → 表示名マッピング
// ============================================================
export interface FlagLabel {
  key:   string;   // 表示上のラベル（例: "習い事"）
  icon:  string;
  value: string;   // 表示上の値（例: "スポーツ"）
}

const FLAG_KEY_LABELS: Record<string, string> = {
  kidsActivity:     "習い事",
  clubActivity:     "部活",
  highSchoolRoute:  "高校",
  scienceArts:      "文理",
  lifeRoute:        "進路",
  jobStrategy:      "就職先",
  romanceChoice:    "恋愛",
  transferChoice:   "転職",
  marriageChoice:   "結婚",
  lifePriority:     "生活軸",
  childChoice:      "子供",
  startupChoice:    "起業",
  parentingStyle:   "育て方",
  investmentChoice: "資産運用",
  careerLate:       "後半キャリア",
  caregivingChoice: "介護",
  retirementChoice: "退職",
  seniorLifestyle:  "老後",
};

const FLAG_VALUE_LABELS: Record<string, Record<string, { label: string; icon: string }>> = {
  kidsActivity: {
    sports:  { label: "スポーツ",   icon: "⚽" },
    music:   { label: "音楽・芸術", icon: "🎹" },
    none:    { label: "習わなかった", icon: "🏠" },
  },
  clubActivity: {
    cultural: { label: "文化系",  icon: "🎭" },
    sports:   { label: "体育系",  icon: "🏅" },
    none:     { label: "帰宅部",  icon: "🎮" },
  },
  highSchoolRoute: {
    elite:      { label: "難関校",    icon: "🎯" },
    normal:     { label: "普通校",    icon: "🏫" },
    vocational: { label: "工業・商業", icon: "🔧" },
  },
  scienceArts: {
    science_medical: { label: "理系・医療", icon: "🩺" },
    science_tech:    { label: "理系・技術", icon: "🔬" },
    science:         { label: "理系",        icon: "🧪" },   // 旧値（後方互換）
    arts:            { label: "文系",         icon: "📖" },
  },
  lifeRoute: {
    university:        { label: "大学進学",  icon: "🎓" },
    vocational_school: { label: "専門学校",  icon: "🔨" },
    work:              { label: "早期就職",  icon: "💪" },
  },
  jobStrategy: {
    large: { label: "大手企業",      icon: "🏢" },
    small: { label: "中小・ベンチャー", icon: "🌱" },
    civil: { label: "公務員",        icon: "🏛️" },
  },
  romanceChoice: {
    confess: { label: "告白した",   icon: "💌" },
    friend:  { label: "友人のまま", icon: "🤝" },
  },
  transferChoice: {
    transfer: { label: "転職した",  icon: "🆙" },
    stay:     { label: "現職継続",  icon: "🏢" },
  },
  marriageChoice: {
    marry:  { label: "結婚した",   icon: "💍" },
    single: { label: "独身を選んだ", icon: "🌟" },
  },
  lifePriority: {
    career: { label: "仕事優先", icon: "📈" },
    family: { label: "家族優先", icon: "🏡" },
  },
  childChoice: {
    yes: { label: "子供を持った",    icon: "👨‍👩‍👧" },
    no:  { label: "子供は持たなかった", icon: "🌿" },
  },
  startupChoice: {
    startup: { label: "起業した",    icon: "💡" },
    stay:    { label: "会社員継続",  icon: "🏢" },
  },
  parentingStyle: {
    intensive: { label: "教育重視",  icon: "📚" },
    relaxed:   { label: "のびのび",  icon: "🌸" },
  },
  investmentChoice: {
    invest: { label: "投資を選んだ", icon: "📈" },
    save:   { label: "貯蓄を選んだ", icon: "🏦" },
  },
  careerLate: {
    promote:     { label: "昇進を目指した", icon: "📋" },
    transfer:    { label: "転職した",       icon: "🔀" },
    independent: { label: "独立した",       icon: "🌊" },
  },
  caregivingChoice: {
    quit:     { label: "介護離職した",  icon: "🤲" },
    facility: { label: "施設に任せた",  icon: "🏥" },
  },
  retirementChoice: {
    early:    { label: "早期退職した", icon: "🏖️" },
    continue: { label: "現役を続けた", icon: "💪" },
  },
  seniorLifestyle: {
    hobby:     { label: "趣味・旅行",  icon: "🎨" },
    volunteer: { label: "社会貢献",   icon: "🤝" },
    work:      { label: "再就職",     icon: "💼" },
  },
};

// フラグを表示リストに変換
export function getChoiceHistory(flags: Record<string, string> | undefined): FlagLabel[] {
  if (!flags) return [];
  const result: FlagLabel[] = [];
  for (const [key, val] of Object.entries(flags)) {
    const keyLabel   = FLAG_KEY_LABELS[key];
    const valMap     = FLAG_VALUE_LABELS[key];
    if (!keyLabel || !valMap) continue;
    const valLabel = valMap[val];
    if (!valLabel) continue;
    result.push({ key: keyLabel, icon: valLabel.icon, value: valLabel.label });
  }
  return result;
}

// プレイヤーのステータスサマリー（ヘッダー用コンパクト版）
export function getStatusBadges(player: Player): Array<{ icon: string; label: string }> {
  const badges: Array<{ icon: string; label: string }> = [];
  if (player.job !== "none" && player.job !== "part_time") {
    badges.push({ icon: "💼", label: JOB_LABELS[player.job] });
  }
  if (player.isMarried)   badges.push({ icon: "💍", label: "既婚" });
  if (player.hasChildren) badges.push({ icon: "👶", label: "子あり" });
  if (player.hasPet)      badges.push({ icon: "🐾", label: "ペット" });
  return badges;
}
