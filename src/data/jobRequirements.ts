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
  none:           "❓",
  part_time:      "🏪",
  salaryman:      "🏢",
  civil_servant:  "🏛️",
  engineer:       "💻",
  doctor:         "🩺",
  lawyer:         "⚖️",
  youtuber:       "📹",
  entrepreneur:   "🚀",
  freelancer:     "🌊",
  artist:         "🎨",
  // 隠し職業
  inventor:       "⚙️",
  investor:       "💎",
  astronaut:      "🚀",
  pro_gamer:      "🎮",
  shadow_ruler:   "👁️",
  legendary_neet: "🛋️",
};

// ── 収入レベル ───────────────────────────────────────────────
export const JOB_INCOME_LABEL: Record<JobType, string> = {
  none:           "無収入",
  part_time:      "低",
  salaryman:      "中",
  civil_servant:  "中（安定）",
  engineer:       "中〜高",
  doctor:         "非常に高",
  lawyer:         "高",
  youtuber:       "変動大",
  entrepreneur:   "変動大",
  freelancer:     "中〜高",
  artist:         "低〜中",
  // 隠し職業
  inventor:       "高（特許収入）",
  investor:       "超高（複利）",
  astronaut:      "非常に高",
  pro_gamer:      "中〜超高",
  shadow_ruler:   "測定不能",
  legendary_neet: "ゼロ（幸福は∞）",
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
  // 隠し職業
  inventor:
    "人類の未来を変える発明で特許を量産。技術と起業経験を持つ者だけが辿り着ける道。",
  investor:
    "お金にお金を稼がせる達人。莫大な資産と鋭い嗅覚があれば、働かずとも億が動く。",
  astronaut:
    "宇宙を目指す究極のエリート。理系大学ルートと高い知名度、そして類稀な運が必要。",
  pro_gamer:
    "ゲームを極めた者だけが辿り着ける職業。若いうちにしか開放されない、儚くも輝く道。",
  shadow_ruler:
    "表舞台には決して出ない、世界を裏で動かす存在。莫大な資産と人脈、そして野心が必要。",
  legendary_neet:
    "働かずして幸福を極めた伝説の存在。お金は無いが、人生で最も自由な魂の持ち主。",
};

// ── 初期ボーナス ─────────────────────────────────────────────
export const JOB_INITIAL_BONUS: Record<JobType, { money: number; happiness: number; fame: number }> = {
  none:           { money: 0,    happiness: 0,  fame: 0  },
  part_time:      { money: 10,   happiness: 10, fame: 0  },
  salaryman:      { money: 30,   happiness: 15, fame: 3  },
  civil_servant:  { money: 25,   happiness: 20, fame: 3  },
  engineer:       { money: 50,   happiness: 15, fame: 5  },
  doctor:         { money: 200,  happiness: 25, fame: 15 },
  lawyer:         { money: 150,  happiness: 20, fame: 12 },
  youtuber:       { money: 20,   happiness: 30, fame: 20 },
  entrepreneur:   { money: -100, happiness: 25, fame: 10 },
  freelancer:     { money: 20,   happiness: 20, fame: 5  },
  artist:         { money: 10,   happiness: 30, fame: 10 },
  // 隠し職業（特別ボーナス）
  inventor:       { money: 300,  happiness: 30, fame: 25 },
  investor:       { money: 500,  happiness: 20, fame: 30 },
  astronaut:      { money: 400,  happiness: 35, fame: 40 },
  pro_gamer:      { money: 150,  happiness: 40, fame: 35 },
  shadow_ruler:   { money: 800,  happiness: 10, fame: 50 },
  legendary_neet: { money: -50,  happiness: 50, fame: 20 },
};

// ── キャリア開始時のナレーション ─────────────────────────────
export const JOB_CAREER_STORIES: Record<JobType, string> = {
  none:           "職業を持たない選択をした。",
  part_time:      "まずはアルバイトから社会経験を積むことにした。お金の重さを体で覚える日々が始まる。",
  salaryman:      "会社員として社会人デビューを果たした。毎朝スーツを着て出勤する日々が始まる。",
  civil_servant:  "公務員試験を突破し、安定した公務員の道を選んだ。社会の縁の下の力持ちとして働く。",
  engineer:       "エンジニアとしてのキャリアをスタート。コードが動いた瞬間の快感は格別だ。",
  doctor:         "6年間の医学部と2年間の研修を経て、ついに医師として働き始めた。命と向き合う毎日が始まる。",
  lawyer:         "司法試験を突破し、弁護士バッジを手にした。社会正義のために闘う覚悟だ。",
  youtuber:       "チャンネルを立ち上げ、動画クリエイターとして本格的に活動を開始した。",
  entrepreneur:   "退路を断って起業。リスクを恐れず、夢に向かって走り始めた。",
  freelancer:     "組織を離れ、フリーランスとして独立した。自由と引き換えに自己責任の世界が待っている。",
  artist:         "アーティストとして本格的に創作活動を始めた。好きを仕事にする覚悟を決めた。",
  // 隠し職業
  inventor:       "累積した技術と起業経験が結実した。特許を次々と生み出す発明家への道が開かれた。世界を変える何かが、すでに頭の中にある。",
  investor:       "資産が資産を呼ぶ領域に踏み込んだ。もう労働で稼ぐ必要はない。お金の流れを支配する側に回った瞬間だ。",
  astronaut:      "選ばれし者のみが辿り着く宇宙への道。厳しい訓練と審査を突破し、地球を飛び出す準備が整った。",
  pro_gamer:      "ゲームの腕が世界に認められた。大会の舞台で名前が叫ばれる。画面の向こうに無数のファンが待っている。",
  shadow_ruler:   "表舞台には決して出ない。だが世界の重要な決定には、必ずあなたの意志が反映される。誰も知らない、誰も気づかない権力の頂点。",
  legendary_neet: "働かないことで、逆に人生の真理を掴んだ。お金はないが魂は自由だ。伝説は静かに、ソファの上で生まれた。",
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

    // 隠し職業は checkJobAvailability では常に false（getHiddenJobOptions で別途判定）
    default:
      return { available: false, recommended: false, reason: "選択不可" };
  }
}

// ============================================================
// 隠し職業の解除判定
// ============================================================

export interface HiddenJobAvailability extends JobAvailability {
  unlockHint: string;   // 条件未達の時のヒント文
  isHidden:   true;
}

/** 隠し職業の解除条件チェック（全職業分） */
function checkHiddenJobUnlock(
  job: "inventor" | "investor" | "astronaut" | "pro_gamer" | "shadow_ruler" | "legendary_neet",
  player: Player,
): { unlocked: boolean; hint: string } {
  const flags = player.flags ?? {};
  const pos   = player.position;

  switch (job) {
    // ── 発明家 ──────────────────────────────────────────────
    // 条件: エンジニアor理系ルート + 起業経験あり + fame30以上 + pos90以降
    case "inventor": {
      const hasTech =
        player.job === "engineer" ||
        flags.scienceArts === "science_tech" ||
        flags.scienceArts === "science_medical";
      const hasStartup =
        player.hasCompany ||
        flags.startupChoice === "startup";
      const hasFame    = player.fame >= 30;
      const lateEnough = pos >= 90;
      if (!hasTech)    return { unlocked: false, hint: "エンジニア or 理系ルートが必要" };
      if (!hasStartup) return { unlocked: false, hint: "起業経験が必要（起業マスで起業すること）" };
      if (!hasFame)    return { unlocked: false, hint: `知名度30以上が必要（現在: ${player.fame}）` };
      if (!lateEnough) return { unlocked: false, hint: "もう少し経験を積んでから（pos90以降）" };
      return { unlocked: true, hint: "" };
    }

    // ── 投資家 ──────────────────────────────────────────────
    // 条件: 資産800万以上 + 投資選択済み + pos100以降
    case "investor": {
      const hasAsset   = player.money >= 800;
      const hasInvest  = flags.investmentChoice === "invest";
      const lateEnough = pos >= 100;
      if (!hasInvest)  return { unlocked: false, hint: "壮年期の「資産運用マス」で投資を選ぶこと" };
      if (!hasAsset)   return { unlocked: false, hint: `資産800万以上が必要（現在: ${player.money}万）` };
      if (!lateEnough) return { unlocked: false, hint: "40歳以降に解放（pos100以降）" };
      return { unlocked: true, hint: "" };
    }

    // ── 宇宙飛行士 ──────────────────────────────────────────
    // 条件: 理系大学ルート + fame40以上 + 50歳前（pos135未満）
    case "astronaut": {
      const hasScienceUni =
        (flags.scienceArts === "science_tech" || flags.scienceArts === "science_medical") &&
        flags.lifeRoute === "university";
      const hasFame      = player.fame >= 40;
      const notTooOld    = pos < 135;
      if (!hasScienceUni) return { unlocked: false, hint: "理系大学ルート（理系専攻＋大学進学）が必要" };
      if (!hasFame)       return { unlocked: false, hint: `知名度40以上が必要（現在: ${player.fame}）` };
      if (!notTooOld)     return { unlocked: false, hint: "宇宙飛行士への道は老後には閉ざされる" };
      return { unlocked: true, hint: "" };
    }

    // ── プロゲーマー ─────────────────────────────────────────
    // 条件: fame40以上 + 35歳前（pos110未満）
    case "pro_gamer": {
      const hasFame   = player.fame >= 40;
      const youngEnough = pos < 110;
      if (!youngEnough) return { unlocked: false, hint: "プロゲーマーになれるのは壮年期前まで" };
      if (!hasFame)     return { unlocked: false, hint: `知名度40以上が必要（現在: ${player.fame}）` };
      return { unlocked: true, hint: "" };
    }

    // ── 陰の支配者 ───────────────────────────────────────────
    // 条件: 資産1500万以上 + 起業あり + fame50以上 + pos111以降（壮年期〜）
    case "shadow_ruler": {
      const hasAsset   = player.money >= 1500;
      const hasCompany = player.hasCompany || flags.startupChoice === "startup";
      const hasFame    = player.fame >= 50;
      const lateEnough = pos >= 111;
      if (!lateEnough) return { unlocked: false, hint: "壮年期以降（pos111〜）に解放される謎の職業" };
      if (!hasCompany) return { unlocked: false, hint: "起業経験が必要" };
      if (!hasFame)    return { unlocked: false, hint: `知名度50以上が必要（現在: ${player.fame}）` };
      if (!hasAsset)   return { unlocked: false, hint: `資産1500万以上が必要（現在: ${player.money}万）` };
      return { unlocked: true, hint: "" };
    }

    // ── 伝説のニート ─────────────────────────────────────────
    // 条件: 現在の職業がnoneまたはpart_time + 幸福70以上 + pos60以降
    case "legendary_neet": {
      const isUnemployed  = player.job === "none" || player.job === "part_time";
      const hasHappiness  = player.happiness >= 70;
      const lateEnough    = pos >= 60;
      if (!lateEnough)    return { unlocked: false, hint: "就職しないで生き続けると開放される（pos60〜）" };
      if (!isUnemployed)  return { unlocked: false, hint: "職に就いていると選べない（無職・アルバイトのみ）" };
      if (!hasHappiness)  return { unlocked: false, hint: `幸福度70以上が必要（現在: ${player.happiness}）` };
      return { unlocked: true, hint: "" };
    }
  }
}

/** 隠し職業リスト（全キャリアトリガーで候補に入る） */
const HIDDEN_JOB_LIST = [
  "inventor", "investor", "astronaut", "pro_gamer", "shadow_ruler", "legendary_neet",
] as const;

/** 解放済み隠し職業の一覧を返す（条件未達のものは含まない） */
export function getHiddenJobOptions(player: Player): HiddenJobAvailability[] {
  return HIDDEN_JOB_LIST
    .map(job => {
      const check = checkHiddenJobUnlock(job, player);
      return {
        job         : job as JobType,
        label       : JOB_LABELS[job],
        description : JOB_DESCRIPTIONS[job],
        emoji       : JOB_EMOJI[job],
        income      : JOB_INCOME_LABEL[job],
        available   : check.unlocked,
        recommended : check.unlocked,
        lockedReason: check.hint || undefined,
        initialBonus: JOB_INITIAL_BONUS[job],
        unlockHint  : check.hint,
        isHidden    : true as const,
      };
    })
    .filter(j => j.available); // 解放済みのみ返す
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
