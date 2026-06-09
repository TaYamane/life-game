import type { Player, JobType, CareerTrigger } from "@/types/game";
import { JOB_LABELS } from "@/types/game";

// ============================================================
// 職業選択システム — 要件定義と選択肢ロジック
// ============================================================

export interface JobAvailability {
  job:          JobType;
  label:        string;
  description:  string;
  emoji:        string;
  income:       string;        // 収入レベルの説明
  available:    boolean;       // 選択可能か
  recommended:  boolean;       // プレイヤーの背景に合致するか
  lockedReason?: string;       // 選択不可の理由（available=falseのとき）
  initialBonus: { money: number; happiness: number; fame: number };
}

// ── 職業アイコン ────────────────────────────────────────────
export const JOB_EMOJI: Record<JobType, string> = {
  none:          "❓",
  part_time:     "🏪",
  salaryman:     "🏢",
  civil_servant: "🏛️",
  engineer:      "💻",
  doctor:        "🩺",
  lawyer:        "⚖️",
  youtuber:      "📹",
  entrepreneur:  "🚀",
  freelancer:    "🌊",
  artist:        "🎨",
};

// ── 収入レベル ───────────────────────────────────────────────
export const JOB_INCOME_LABEL: Record<JobType, string> = {
  none:          "無収入",
  part_time:     "低",
  salaryman:     "中",
  civil_servant: "中（安定）",
  engineer:      "中〜高",
  doctor:        "非常に高",
  lawyer:        "高",
  youtuber:      "変動大",
  entrepreneur:  "変動大",
  freelancer:    "中〜高",
  artist:        "低〜中",
};

// ── 職業説明文 ───────────────────────────────────────────────
export const JOB_DESCRIPTIONS: Record<JobType, string> = {
  none:
    "職業なし。",
  part_time:
    "アルバイト。スキルアップや就職活動の準備期間。",
  salaryman:
    "会社員。安定した収入と昇進の機会。大手・中小・ベンチャーなど多様な選択肢がある。",
  civil_servant:
    "公務員。終身雇用と手厚い年金が強み。公務員試験の合格が必要。",
  engineer:
    "エンジニア。高収入・需要の高い技術職。理系・技術系の背景があると有利。",
  doctor:
    "医師。高収入かつ社会貢献度が高い職業。大学医学部ルートが必須。",
  lawyer:
    "弁護士。高収入・社会的信頼が高い職業。大学法学部ルートが必須。",
  youtuber:
    "YouTuber。知名度が高いほど稼げる。ある程度の知名度がないと収益化できない。",
  entrepreneur:
    "経営者。リスクは高いが成功すれば大きなリターン。一定の資金と経験が必要。",
  freelancer:
    "フリーランス。自由な働き方。収入は実力と実績次第。",
  artist:
    "アーティスト。創造的な仕事で充実感が高い。収入は不安定なことが多い。",
};

// ── 初期ボーナス ─────────────────────────────────────────────
export const JOB_INITIAL_BONUS: Record<JobType, { money: number; happiness: number; fame: number }> = {
  none:          { money: 0,    happiness: 0,  fame: 0  },
  part_time:     { money: 10,   happiness: 10, fame: 0  },
  salaryman:     { money: 30,   happiness: 15, fame: 3  },
  civil_servant: { money: 25,   happiness: 20, fame: 3  },
  engineer:      { money: 50,   happiness: 15, fame: 5  },
  doctor:        { money: 200,  happiness: 25, fame: 15 },
  lawyer:        { money: 150,  happiness: 20, fame: 12 },
  youtuber:      { money: 20,   happiness: 30, fame: 20 },
  entrepreneur:  { money: -100, happiness: 25, fame: 10 },
  freelancer:    { money: 20,   happiness: 20, fame: 5  },
  artist:        { money: 10,   happiness: 30, fame: 10 },
};

// ── キャリア開始時のナレーション ─────────────────────────────
export const JOB_CAREER_STORIES: Record<JobType, string> = {
  none:          "職業を持たない選択をした。",
  part_time:     "まずはアルバイトから社会経験を積むことにした。お金の重さを体で覚える日々が始まる。",
  salaryman:     "会社員として社会人デビューを果たした。毎朝スーツを着て出勤する日々が始まる。",
  civil_servant: "公務員試験を突破し、安定した公務員の道を選んだ。社会の縁の下の力持ちとして働く。",
  engineer:      "エンジニアとしてのキャリアをスタート。コードが動いた瞬間の快感は格別だ。",
  doctor:        "6年間の医学部と2年間の研修を経て、ついに医師として働き始めた。命と向き合う毎日が始まる。",
  lawyer:        "司法試験を突破し、弁護士バッジを手にした。社会正義のために闘う覚悟だ。",
  youtuber:      "チャンネルを立ち上げ、動画クリエイターとして本格的に活動を開始した。",
  entrepreneur:  "退路を断って起業。リスクを恐れず、夢に向かって走り始めた。",
  freelancer:    "組織を離れ、フリーランスとして独立した。自由と引き換えに自己責任の世界が待っている。",
  artist:        "アーティストとして本格的に創作活動を始めた。好きを仕事にする覚悟を決めた。",
};

// ── キャリアトリガーのラベル ──────────────────────────────────
export const CAREER_TRIGGER_LABELS: Record<CareerTrigger, string> = {
  first_job:   "どんな職業に就きますか？",
  transfer:    "転職先の職業を選んでください",
  late_career: "これからのキャリアはどうしますか？",
};

// ── 各トリガーで表示する職業リスト ───────────────────────────
const FIRST_JOB_LIST:   JobType[] = ["salaryman", "civil_servant", "engineer", "doctor", "lawyer", "youtuber", "freelancer", "artist"];
const TRANSFER_LIST:    JobType[] = ["salaryman", "civil_servant", "engineer", "youtuber", "freelancer", "artist", "entrepreneur"];
const LATE_CAREER_LIST: JobType[] = ["salaryman", "civil_servant", "engineer", "doctor", "lawyer", "youtuber", "entrepreneur", "freelancer", "artist"];

// ============================================================
// 利用可能判定（メイン関数）
// ============================================================
export function checkJobAvailability(
  job: JobType,
  player: Player,
): { available: boolean; recommended: boolean; reason?: string } {
  const flags = player.flags ?? {};
  const pos   = player.position;

  switch (job) {

    case "salaryman":
      return {
        available:   pos >= 55,
        recommended: true,
        reason:      pos < 55 ? "社会人デビュー前は就職できません" : undefined,
      };

    case "civil_servant": {
      const hasQual =
        flags.lifeRoute === "university" ||
        flags.lifeRoute === "vocational_school" ||
        flags.highSchoolRoute === "vocational";
      return {
        available:   pos >= 55 && hasQual,
        recommended: hasQual,
        reason:      !hasQual
          ? "公務員試験合格には大学・専門学校卒が必要です"
          : pos < 55 ? "社会人デビュー前は就職できません" : undefined,
      };
    }

    case "engineer": {
      const hasBg =
        flags.scienceArts === "science_tech" ||
        flags.scienceArts === "science" ||
        flags.lifeRoute   === "vocational_school";
      return {
        available:   pos >= 55,
        recommended: hasBg,
        reason:      pos < 55 ? "社会人デビュー前は就職できません" : undefined,
      };
    }

    case "doctor": {
      const hasMedical =
        (flags.scienceArts === "science_medical" || flags.scienceArts === "science") &&
        flags.lifeRoute === "university";
      return {
        available:   pos >= 62 && pos <= 82 && hasMedical,
        recommended: hasMedical,
        reason:      !hasMedical
          ? "医師になるには大学（医学部・理系）ルートが必要です"
          : pos > 82
            ? "医師免許取得の適正年齢（〜26歳）を過ぎています"
            : pos < 62
              ? "まだ医師免許取得の年齢ではありません"
              : undefined,
      };
    }

    case "lawyer": {
      const hasLaw =
        flags.scienceArts === "arts" &&
        flags.lifeRoute   === "university";
      return {
        available:   pos >= 62 && pos <= 82 && hasLaw,
        recommended: hasLaw,
        reason:      !hasLaw
          ? "弁護士になるには大学（法学部・文系）ルートが必要です"
          : pos > 82
            ? "司法試験合格の適正年齢（〜26歳）を過ぎています"
            : pos < 62
              ? "まだ司法試験の年齢ではありません"
              : undefined,
      };
    }

    case "youtuber":
      return {
        available:   pos >= 40 && player.fame >= 15,
        recommended: player.fame >= 30,
        reason:      player.fame < 15
          ? `YouTuberには知名度15以上が必要です（現在: ${player.fame}）`
          : undefined,
      };

    case "entrepreneur":
      return {
        available:   pos >= 70 && player.money >= 100,
        recommended: player.hasCompany || player.money >= 500,
        reason:      pos < 70
          ? "起業は社会人経験を積んでから（30代以降）"
          : player.money < 100
            ? `起業には資金100万以上が必要です（現在: ${player.money}万）`
            : undefined,
      };

    case "freelancer": {
      const hasExperience = player.job !== "none" || pos >= 62;
      return {
        available:   pos >= 60 && hasExperience,
        recommended: ["salaryman", "engineer", "civil_servant", "doctor"].includes(player.job),
        reason:      !hasExperience
          ? "フリーランスには職歴が必要です"
          : pos < 60 ? "まだ独立できる段階ではありません" : undefined,
      };
    }

    case "artist":
      return {
        available:   pos >= 40,
        recommended:
          flags.kidsActivity === "music" ||
          flags.clubActivity  === "cultural" ||
          flags.scienceArts   === "arts",
        reason: pos < 40 ? "クリエイター活動はもう少し後から" : undefined,
      };

    default:
      return { available: false, recommended: false, reason: "選択不可" };
  }
}

// ============================================================
// トリガー別の職業リストを生成
// ============================================================
export function getCareerOptions(trigger: CareerTrigger, player: Player): JobAvailability[] {
  const jobList =
    trigger === "first_job"   ? FIRST_JOB_LIST :
    trigger === "transfer"    ? TRANSFER_LIST   :
    LATE_CAREER_LIST;

  return jobList.map(job => {
    const check = checkJobAvailability(job, player);
    return {
      job,
      label:        JOB_LABELS[job],
      description:  JOB_DESCRIPTIONS[job],
      emoji:        JOB_EMOJI[job],
      income:       JOB_INCOME_LABEL[job],
      available:    check.available,
      recommended:  check.recommended,
      lockedReason: check.reason,
      initialBonus: JOB_INITIAL_BONUS[job],
    };
  });
}
