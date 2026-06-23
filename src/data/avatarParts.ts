// ============================================================
// アバターパーツ選択肢データ
// PNG素材が揃い次第、pngPath を設定すると自動で差し替わる
// ============================================================

export interface PartOption {
  id: number;
  name: string;
  pngPath?: string;  // /assets/avatar/... (将来のPNG素材パス)
}

export interface ColorOption {
  id: number;
  hex: string;
  name: string;
}

// ---------- 肌の色（5種） ----------
export const SKIN_TONES: Record<number, ColorOption> = {
  1: { id: 1, hex: "#fde8c8", name: "白い" },
  2: { id: 2, hex: "#f5c98a", name: "標準" },
  3: { id: 3, hex: "#d4956a", name: "小麦" },
  4: { id: 4, hex: "#a06040", name: "褐色" },
  5: { id: 5, hex: "#7a4a30", name: "黒い" },
};

// ---------- 髪の色（8色） ----------
export const HAIR_COLORS: Record<number, ColorOption> = {
  1: { id: 1, hex: "#1a0808", name: "黒" },
  2: { id: 2, hex: "#3d2010", name: "茶" },
  3: { id: 3, hex: "#6B2A08", name: "赤茶" },
  4: { id: 4, hex: "#c8a050", name: "金茶" },
  5: { id: 5, hex: "#e8d080", name: "金" },
  6: { id: 6, hex: "#b83000", name: "赤" },
  7: { id: 7, hex: "#5a2060", name: "紫" },
  8: { id: 8, hex: "#909098", name: "銀" },
};

// ---------- 髪型（男性 10種） ----------
export const HAIR_STYLES_MALE: PartOption[] = [
  { id: 1,  name: "サイドスウェプト",   pngPath: "/assets/avatar/hair/male_h01_front.png" },
  { id: 2,  name: "ショート",           pngPath: "/assets/avatar/hair/male_h02_front.png" },
  { id: 3,  name: "センター分け",       pngPath: "/assets/avatar/hair/male_h03_front.png" },
  { id: 4,  name: "オールバック",       pngPath: "/assets/avatar/hair/male_h04_front.png" },
  { id: 5,  name: "ウェーブ",           pngPath: "/assets/avatar/hair/male_h05_front.png" },
  { id: 6,  name: "ツーブロック",       pngPath: "/assets/avatar/hair/male_h06_front.png" },
  { id: 7,  name: "ロング",             pngPath: "/assets/avatar/hair/male_h07_front.png" },
  { id: 8,  name: "パーマ",             pngPath: "/assets/avatar/hair/male_h08_front.png" },
  { id: 9,  name: "スポーティー",       pngPath: "/assets/avatar/hair/male_h09_front.png" },
  { id: 10, name: "モヒカン",           pngPath: "/assets/avatar/hair/male_h10_front.png" },
];

// ---------- 髪型（女性 10種） ----------
export const HAIR_STYLES_FEMALE: PartOption[] = [
  { id: 1,  name: "ロングストレート",   pngPath: "/assets/avatar/hair/female_h01_front.png" },
  { id: 2,  name: "ポニーテール",       pngPath: "/assets/avatar/hair/female_h02_front.png" },
  { id: 3,  name: "ツインテール",       pngPath: "/assets/avatar/hair/female_h03_front.png" },
  { id: 4,  name: "ボブ",               pngPath: "/assets/avatar/hair/female_h04_front.png" },
  { id: 5,  name: "ウェーブロング",     pngPath: "/assets/avatar/hair/female_h05_front.png" },
  { id: 6,  name: "ショートボブ",       pngPath: "/assets/avatar/hair/female_h06_front.png" },
  { id: 7,  name: "サイドアップ",       pngPath: "/assets/avatar/hair/female_h07_front.png" },
  { id: 8,  name: "おさげ",             pngPath: "/assets/avatar/hair/female_h08_front.png" },
  { id: 9,  name: "アップスタイル",     pngPath: "/assets/avatar/hair/female_h09_front.png" },
  { id: 10, name: "ハーフアップ",       pngPath: "/assets/avatar/hair/female_h10_front.png" },
];

// ---------- 目（10種） ----------
export const EYE_TYPES: PartOption[] = [
  { id: 1,  name: "標準",       pngPath: "/assets/avatar/eyes/eye_01.png" },
  { id: 2,  name: "大きい",     pngPath: "/assets/avatar/eyes/eye_02.png" },
  { id: 3,  name: "たれ目",     pngPath: "/assets/avatar/eyes/eye_03.png" },
  { id: 4,  name: "つり目",     pngPath: "/assets/avatar/eyes/eye_04.png" },
  { id: 5,  name: "切れ長",     pngPath: "/assets/avatar/eyes/eye_05.png" },
  { id: 6,  name: "丸い",       pngPath: "/assets/avatar/eyes/eye_06.png" },
  { id: 7,  name: "眠そう",     pngPath: "/assets/avatar/eyes/eye_07.png" },
  { id: 8,  name: "キラキラ",   pngPath: "/assets/avatar/eyes/eye_08.png" },
  { id: 9,  name: "細い",       pngPath: "/assets/avatar/eyes/eye_09.png" },
  { id: 10, name: "にこにこ",   pngPath: "/assets/avatar/eyes/eye_10.png" },
];

// ---------- 眉（6種） ----------
export const BROW_TYPES: PartOption[] = [
  { id: 1, name: "標準",     pngPath: "/assets/avatar/brows/brow_01.png" },
  { id: 2, name: "アーチ",   pngPath: "/assets/avatar/brows/brow_02.png" },
  { id: 3, name: "太め",     pngPath: "/assets/avatar/brows/brow_03.png" },
  { id: 4, name: "細め",     pngPath: "/assets/avatar/brows/brow_04.png" },
  { id: 5, name: "困り眉",   pngPath: "/assets/avatar/brows/brow_05.png" },
  { id: 6, name: "凛々しい", pngPath: "/assets/avatar/brows/brow_06.png" },
];

// ---------- 口（6種） ----------
export const MOUTH_TYPES: PartOption[] = [
  { id: 1, name: "スマイル",   pngPath: "/assets/avatar/mouth/mouth_01.png" },
  { id: 2, name: "普通",       pngPath: "/assets/avatar/mouth/mouth_02.png" },
  { id: 3, name: "にっこり",   pngPath: "/assets/avatar/mouth/mouth_03.png" },
  { id: 4, name: "ぽかん",     pngPath: "/assets/avatar/mouth/mouth_04.png" },
  { id: 5, name: "ちょっぴり", pngPath: "/assets/avatar/mouth/mouth_05.png" },
  { id: 6, name: "いたずら",   pngPath: "/assets/avatar/mouth/mouth_06.png" },
];

// ---------- 服（10種） ----------
export const CLOTHES_TYPES: PartOption[] = [
  { id: 1,  name: "パーカー",     pngPath: "/assets/avatar/clothes/clothes_01.png" },
  { id: 2,  name: "スーツ",       pngPath: "/assets/avatar/clothes/clothes_02.png" },
  { id: 3,  name: "学生服（男）", pngPath: "/assets/avatar/clothes/clothes_03.png" },
  { id: 4,  name: "ジャケット",   pngPath: "/assets/avatar/clothes/clothes_04.png" },
  { id: 5,  name: "Tシャツ",      pngPath: "/assets/avatar/clothes/clothes_05.png" },
  { id: 6,  name: "セーラー服",   pngPath: "/assets/avatar/clothes/clothes_06.png" },
  { id: 7,  name: "白衣",         pngPath: "/assets/avatar/clothes/clothes_07.png" },
  { id: 8,  name: "スポーツ",     pngPath: "/assets/avatar/clothes/clothes_08.png" },
  { id: 9,  name: "作業着",       pngPath: "/assets/avatar/clothes/clothes_09.png" },
  { id: 10, name: "ジャージ",     pngPath: "/assets/avatar/clothes/clothes_10.png" },
];

// ---------- 服の色（10色） ----------
export const CLOTHES_COLORS: ColorOption[] = [
  { id: 1,  hex: "#dc2626", name: "赤" },
  { id: 2,  hex: "#2563eb", name: "青" },
  { id: 3,  hex: "#16a34a", name: "緑" },
  { id: 4,  hex: "#7c3aed", name: "紫" },
  { id: 5,  hex: "#d97706", name: "橙" },
  { id: 6,  hex: "#db2777", name: "ピンク" },
  { id: 7,  hex: "#0891b2", name: "水色" },
  { id: 8,  hex: "#111820", name: "黒" },
  { id: 9,  hex: "#6b7280", name: "グレー" },
  { id: 10, hex: "#f0ece4", name: "白" },
];

// ---------- アクセサリー（8種） ----------
export const ACCESSORIES: PartOption[] = [
  { id: 1, name: "眼鏡",         pngPath: "/assets/avatar/accessories/acc_01.png" },
  { id: 2, name: "サングラス",   pngPath: "/assets/avatar/accessories/acc_02.png" },
  { id: 3, name: "ハット",       pngPath: "/assets/avatar/accessories/acc_03.png" },
  { id: 4, name: "キャップ",     pngPath: "/assets/avatar/accessories/acc_04.png" },
  { id: 5, name: "ヘッドフォン", pngPath: "/assets/avatar/accessories/acc_05.png" },
  { id: 6, name: "マスク",       pngPath: "/assets/avatar/accessories/acc_06.png" },
  { id: 7, name: "ネックレス",   pngPath: "/assets/avatar/accessories/acc_07.png" },
  { id: 8, name: "なし",         pngPath: undefined },
];

// ---------- ファイルパス生成ユーティリティ ----------
/** 髪の後ろレイヤーPNGパス */
export function hairBackPng(gender: "male"|"female", style: number, colorId: number): string {
  return `/assets/avatar/hair/${gender}_h${String(style).padStart(2,"0")}_back_c${colorId}.png`;
}

/** 髪の前レイヤーPNGパス */
export function hairFrontPng(gender: "male"|"female", style: number, colorId: number): string {
  return `/assets/avatar/hair/${gender}_h${String(style).padStart(2,"0")}_front_c${colorId}.png`;
}

/** ボディPNGパス（年齢ステージ別） */
export function bodyPng(gender: "male"|"female", skinTone: number, ageStage: number): string {
  return `/assets/avatar/body/${gender}_skin${skinTone}_age${ageStage}.png`;
}

/** 服PNGパス */
export function clothesPng(type: number, colorHex: string): string {
  const colorId = CLOTHES_COLORS.find(c => c.hex === colorHex)?.id ?? 1;
  return `/assets/avatar/clothes/clothes_${String(type).padStart(2,"0")}_c${colorId}.png`;
}

/** 年齢ステージボディPNGパス */
export function ageStagePng(ageStage: number): string {
  return `/assets/avatar/age-stages/age_${String(ageStage).padStart(2,"0")}_body.png`;
}
