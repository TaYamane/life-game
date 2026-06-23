// ============================================================
// アバター型定義 v1
// AvatarConfig  : 見た目専用
// CharacterData : ゲーム進行専用
// ============================================================

// ---------- 年齢ステージ ----------
export type AgeStage = 0 | 6 | 15 | 22 | 30 | 45 | 65;

/** 年齢（数値）→ 表示ステージ変換 */
export function getAgeStage(age: number): AgeStage {
  if (age < 6)  return 0;
  if (age < 15) return 6;
  if (age < 22) return 15;
  if (age < 30) return 22;
  if (age < 45) return 30;
  if (age < 65) return 45;
  return 65;
}

// ---------- 見た目設定 ----------
export interface AvatarConfig {
  gender:       "male" | "female";
  skinTone:     1 | 2 | 3 | 4 | 5;
  hairStyle:    number;        // 1〜10 (性別ごと)
  hairColor:    number;        // 1〜8
  eyeType:      number;        // 1〜10
  browType:     number;        // 1〜6
  mouthType:    number;        // 1〜6
  clothesType:  number;        // 1〜10
  clothesColor: string;        // hex
  accessory:    number | null; // 1〜8 or null
  ageStage:     AgeStage;
  mapSprite?:   string;        // マップ用スプライト識別子
}

/** デフォルトのアバター設定 */
export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  gender:       "male",
  skinTone:     2,
  hairStyle:    1,
  hairColor:    2,
  eyeType:      1,
  browType:     1,
  mouthType:    1,
  clothesType:  1,
  clothesColor: "#dc2626",
  accessory:    null,
  ageStage:     22,
};

// ---------- ゲーム進行データ ----------
export interface CharacterData {
  age:           number;
  money:         number;
  happiness:     number;
  intelligence:  number;
  health:        number;
  communication: number;
  education:     string;
  job:           string;
  relationship:  string;
}

/** 年齢ステージのメタ情報 */
export const AGE_STAGE_META: Record<AgeStage, { label: string; sub: string }> = {
  0:  { label: "0歳",  sub: "赤ちゃん" },
  6:  { label: "6歳",  sub: "小学生" },
  15: { label: "15歳", sub: "高校生" },
  22: { label: "22歳", sub: "大学生" },
  30: { label: "30歳", sub: "社会人" },
  45: { label: "45歳", sub: "中年" },
  65: { label: "65歳", sub: "老年" },
};

export const AGE_STAGES: AgeStage[] = [0, 6, 15, 22, 30, 45, 65];
