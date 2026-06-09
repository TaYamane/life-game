import type { ChoiceSquare } from "@/types/game";

// ============================================================
// 選択マス定義 — 18箇所の人生の分岐点
//
// flagKey  : player.flags に書き込まれるキー
// option.id: フラグの値（伏線回収イベントの requireFlags と対応）
// ============================================================

export const CHOICE_SQUARES: Record<number, ChoiceSquare> = {

  // ─────────────────────────────────────────
  // Zone 1: 幼少期
  // ─────────────────────────────────────────

  12: {
    squareId: 12,
    flagKey: "kidsActivity",
    emoji: "🌱",
    title: "習い事を始めますか？",
    description: "幼い頃の習い事が、長い時間をかけて個性を育てます。",
    options: [
      {
        id: "sports",
        label: "スポーツ系",
        description: "体を動かす習い事。体力と根性が育つ。",
        effect: { happiness: 10 },
        emoji: "⚽",
      },
      {
        id: "music",
        label: "音楽・芸術系",
        description: "感性を磨く習い事。創造力と表現力が育つ。",
        effect: { happiness: 10 },
        emoji: "🎹",
      },
      {
        id: "none",
        label: "習わない",
        description: "自由な時間を子供らしく過ごす。その分お金は残る。",
        effect: { happiness: 5, money: 3 },
        emoji: "🏠",
      },
    ],
  },

  // ─────────────────────────────────────────
  // Zone 2: 学童期
  // ─────────────────────────────────────────

  25: {
    squareId: 25,
    flagKey: "clubActivity",
    emoji: "🏃",
    title: "部活・趣味の選択",
    description: "学生時代の活動が人格の基盤になります。どれを選びますか？",
    options: [
      {
        id: "cultural",
        label: "文化系の部活",
        description: "創造力・企画力・表現力が磨かれる。",
        effect: { happiness: 10 },
        emoji: "🎭",
      },
      {
        id: "sports",
        label: "体育系の部活",
        description: "体力・根性・チームワークが身につく。",
        effect: { happiness: 10 },
        emoji: "🏅",
      },
      {
        id: "none",
        label: "帰宅部",
        description: "自分の時間を自由に使う。好きなことに没頭できる。",
        effect: { happiness: 5, money: 3 },
        emoji: "🎮",
      },
    ],
  },

  35: {
    squareId: 35,
    flagKey: "highSchoolRoute",
    emoji: "📚",
    title: "高校受験、どの道へ？",
    description: "どの高校を選ぶかで、その後の進路が大きく変わります。",
    options: [
      {
        id: "elite",
        label: "難関校を目指す",
        description: "高い壁に挑戦。合格すれば将来の選択肢が広がる。",
        effect: { happiness: -5, money: -15 },
        emoji: "🎯",
      },
      {
        id: "normal",
        label: "身の丈に合った高校へ",
        description: "のびのびと高校生活を楽しめる。確実な道。",
        effect: { happiness: 10 },
        emoji: "🏫",
      },
      {
        id: "vocational",
        label: "工業・商業・専門系へ",
        description: "実践的なスキルを早期習得。就職への近道。",
        effect: { happiness: 10, money: 5 },
        emoji: "🔧",
      },
    ],
  },

  // ─────────────────────────────────────────
  // Zone 3: 青春期
  // ─────────────────────────────────────────

  44: {
    squareId: 44,
    flagKey: "scienceArts",
    emoji: "🔬",
    title: "専攻の方向性を決めよう",
    description: "高校での選択が将来のキャリアに深く影響します。医師・弁護士などの専門職は、ここでのルートが必須になります。",
    options: [
      {
        id: "science_medical",
        label: "理系・医療系",
        description: "医学・薬学・看護系。将来の医師・医療職への道が開ける。",
        effect: { happiness: 5 },
        emoji: "🩺",
      },
      {
        id: "science_tech",
        label: "理系・技術系",
        description: "工学・情報・理学系。エンジニア・研究職への道。AI時代に強い。",
        effect: { happiness: 5 },
        emoji: "🔬",
      },
      {
        id: "arts",
        label: "文系（法学・経済・文学）",
        description: "法学・経済・文学系。弁護士・経営・幅広い人脈が財産になる。",
        effect: { happiness: 5 },
        emoji: "📖",
      },
    ],
  },

  50: {
    squareId: 50,
    flagKey: "lifeRoute",
    emoji: "🚀",
    title: "高校卒業後の進路は？",
    description: "人生最初の大きな分岐点。どの道を選びますか？",
    options: [
      {
        id: "university",
        label: "大学へ進学",
        description: "4年間の学びと人脈。就職の幅と生涯収入が上がる。",
        effect: { money: -50, happiness: 15 },
        emoji: "🎓",
      },
      {
        id: "vocational_school",
        label: "専門学校へ",
        description: "専門技術を2年で集中習得。大卒より2年早く就職でき初期年収も高め。技術職・独立系職業への道が広がる。",
        effect: { money: -20, happiness: 12, fame: 8 },
        emoji: "🔨",
      },
      {
        id: "work",
        label: "すぐに就職",
        description: "最も早く稼ぎ始められる。実務経験が財産になる。",
        effect: { money: 30, happiness: 5 },
        emoji: "💪",
      },
    ],
  },

  // ※ マス58（就活戦略）とマス118（キャリア選択）は
  //    career_choice フェーズで処理するため CHOICE_SQUARES から除外

  65: {
    squareId: 65,
    flagKey: "romanceChoice",
    emoji: "💕",
    title: "気になる人に告白しますか？",
    description: "その一言が人生を大きく変えることがある。",
    options: [
      {
        id: "confess",
        label: "告白する！",
        description: "勇気を出して想いを伝える。結果は運次第だが、後悔はない。",
        effect: { happiness: 15 },
        emoji: "💌",
      },
      {
        id: "friend",
        label: "友人のままでいる",
        description: "今の関係を大切にする。別の幸せが待っているかも。",
        effect: { happiness: 5 },
        emoji: "🤝",
      },
    ],
  },

  // ─────────────────────────────────────────
  // Zone 4: 社会人・結婚
  // ─────────────────────────────────────────

  73: {
    squareId: 73,
    flagKey: "transferChoice",
    emoji: "🔀",
    title: "転職のオファーが来た！",
    description: "年収アップのチャンス。でも今の環境も悪くない。",
    options: [
      {
        id: "transfer",
        label: "転職する",
        description: "新しい環境で年収アップを狙う。人間関係はリセット。",
        effect: { money: 80, happiness: -5 },
        emoji: "🆙",
      },
      {
        id: "stay",
        label: "現職に残る",
        description: "積み上げた信頼と実績を守る。長期的な安定を選ぶ。",
        effect: { happiness: 10, fame: 5 },
        emoji: "🏠",
      },
    ],
  },

  79: {
    squareId: 79,
    flagKey: "marriageChoice",
    emoji: "💒",
    title: "人生のパートナーと一緒になりますか？",
    description: "どちらを選んでも、素晴らしい人生が待っています。",
    options: [
      {
        id: "marry",
        label: "結婚する",
        description: "喜びも責任も分かち合えるパートナーを得る。",
        effect: { money: -150, happiness: 35, marry: true },
        emoji: "💍",
      },
      {
        id: "single",
        label: "自由な道を選ぶ",
        description: "自分の時間とお金を自分のために使う。別の幸せがある。",
        effect: { happiness: 10, money: 50 },
        emoji: "🌟",
      },
    ],
  },

  84: {
    squareId: 84,
    flagKey: "lifePriority",
    emoji: "⚖️",
    title: "人生の優先順位は？",
    description: "仕事とプライベート、どちらに軸を置いて生きていきますか？",
    options: [
      {
        id: "career",
        label: "仕事・キャリアを優先",
        description: "成果と昇進を追い求める。お金は増えるが時間は減る。",
        effect: { money: 60, happiness: -5 },
        emoji: "📈",
      },
      {
        id: "family",
        label: "家族・趣味を優先",
        description: "豊かな人間関係と心の余裕を大切にする。",
        effect: { happiness: 20, money: -10 },
        emoji: "🏡",
      },
    ],
  },

  90: {
    squareId: 90,
    flagKey: "childChoice",
    emoji: "👶",
    title: "子供を持ちますか？",
    description: "子育ては大変だが、それ以上の喜びがある。あなたの選択は？",
    options: [
      {
        id: "yes",
        label: "子供を持つ",
        description: "新しい命と共に人生が豊かになる。お金と時間は必要。",
        effect: { money: -80, happiness: 40, getChild: true },
        emoji: "👨‍👩‍👧",
      },
      {
        id: "no",
        label: "今は持たない",
        description: "自分の人生に集中する。別の形の充実を求める。",
        effect: { happiness: 10, money: 30 },
        emoji: "🌿",
      },
    ],
  },

  96: {
    squareId: 96,
    flagKey: "startupChoice",
    emoji: "🚀",
    title: "起業のチャンスが来た！",
    description: "今まで温めてきたアイデアを形にするタイミングかもしれない。",
    options: [
      {
        id: "startup",
        label: "起業する！",
        description: "退路を断って夢を形に。リスクは大きいが夢がある。",
        effect: { money: -200, happiness: 25, startCompany: true, setJob: "entrepreneur" },
        emoji: "💡",
      },
      {
        id: "stay",
        label: "会社員を続ける",
        description: "安定した収入と信頼を守る。堅実な積み重ねを選ぶ。",
        effect: { happiness: 5, money: 20 },
        emoji: "🏢",
      },
    ],
  },

  103: {
    squareId: 103,
    flagKey: "parentingStyle",
    emoji: "🌱",
    title: "次世代への関わり方は？",
    description: "子供がいる人は育て方を、そうでない人は社会への関わり方を選びます。",
    options: [
      {
        id: "intensive",
        label: "しっかり投資する",
        description: "教育・機会に惜しみなく投資。子供（や社会）の可能性を広げる。",
        effect: { money: -100, happiness: 10 },
        emoji: "📚",
      },
      {
        id: "relaxed",
        label: "のびのびと育てる",
        description: "本人の意思を尊重して見守る。深い信頼関係が生まれる。",
        effect: { happiness: 20 },
        emoji: "🌸",
      },
    ],
  },

  // ─────────────────────────────────────────
  // Zone 5: 壮年期
  // ─────────────────────────────────────────

  112: {
    squareId: 112,
    flagKey: "investmentChoice",
    emoji: "💹",
    title: "老後のお金をどう増やす？",
    description: "積み上げた資産をどう運用するかで、老後の安心が変わります。",
    options: [
      {
        id: "invest",
        label: "投資・運用する",
        description: "リスクを取ってお金を増やす。長期で見ると有利。",
        effect: { money: -50, happiness: 5 },
        emoji: "📈",
      },
      {
        id: "save",
        label: "堅実に貯蓄",
        description: "着実に蓄える。リスクは低く、安心感がある。",
        effect: { happiness: 10 },
        emoji: "🏦",
      },
    ],
  },

  // ※ マス118（キャリア選択）は career_choice フェーズで処理

  125: {
    squareId: 125,
    flagKey: "caregivingChoice",
    emoji: "❤️",
    title: "親の介護をどうする？",
    description: "仕事と親孝行、どちらを選びますか？答えに正解はない。",
    options: [
      {
        id: "quit",
        label: "介護のために仕事を辞める",
        description: "親の側にいてあげられる。キャリアと収入は犠牲になる。",
        effect: { money: -200, happiness: 20, setJob: "none" },
        emoji: "🤲",
      },
      {
        id: "facility",
        label: "施設・サービスに任せる",
        description: "専門家に頼り、自分のキャリアも守る。費用はかかる。",
        effect: { money: -100, happiness: -5 },
        emoji: "🏥",
      },
    ],
  },

  133: {
    squareId: 133,
    flagKey: "retirementChoice",
    emoji: "🌅",
    title: "早期退職のオファーが来た。",
    description: "退職金の上乗せ提案。受けるか、働き続けるか。",
    options: [
      {
        id: "early",
        label: "早期退職を受け入れる",
        description: "退職金をもらって第二の人生を始める。自由な時間を手に入れる。",
        effect: { money: 300, happiness: 15, setJob: "none" },
        emoji: "🏖️",
      },
      {
        id: "continue",
        label: "現役を続ける",
        description: "働き続けることで収入と生きがいを守る。",
        effect: { money: 100, happiness: 5 },
        emoji: "💪",
      },
    ],
  },

  // ─────────────────────────────────────────
  // Zone 6: 老後
  // ─────────────────────────────────────────

  142: {
    squareId: 142,
    flagKey: "seniorLifestyle",
    emoji: "🌸",
    title: "老後の生き方は？",
    description: "人生の締めくくり。自分らしい豊かさを見つけましょう。",
    options: [
      {
        id: "hobby",
        label: "趣味・旅行を楽しむ",
        description: "ずっとやりたかったことに没頭する最高の時間。",
        effect: { money: -50, happiness: 35 },
        emoji: "🎨",
      },
      {
        id: "volunteer",
        label: "社会貢献・ボランティア",
        description: "積んできた経験を次世代に還元する。生きがいが生まれる。",
        effect: { happiness: 25, fame: 15 },
        emoji: "🤝",
      },
      {
        id: "work",
        label: "再就職・働き続ける",
        description: "現役感を保ちながら収入も確保する。体が動く限り。",
        effect: { money: 50, happiness: 15 },
        emoji: "💼",
      },
    ],
  },
};
