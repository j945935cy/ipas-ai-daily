export const DEFAULT_COURSE = "daily-english";
export const KIDS_COURSE = "kids-english";
export const MOTIVATION_COURSE = "motivational-english";
export const GRAMMAR_COURSE = "grammar-english";
export const PHRASE_COURSE = "phrase-english";
export const PATTERN_COURSE = "pattern-english";
export const AI_COURSE = "ai-knowledge-english";
export const TRAVEL_COURSE = "travel-english";
export const LIFE_COURSE = "life-english";
export const BUSINESS_COURSE = "business-english";
export const CHAT_COURSE = "chat-english";

export const courses = {
  [DEFAULT_COURSE]: {
    id: DEFAULT_COURSE,
    slug: DEFAULT_COURSE,
    name: "每日 AI 重點",
    description: "每天整理一個 iPAS AI 備考核心觀念，搭配白話說明、關鍵詞與例題方向。",
  },
  [KIDS_COURSE]: {
    id: KIDS_COURSE,
    slug: KIDS_COURSE,
    name: "AI 基礎概念",
    description: "用短句拆解資料、模型、訓練、推論與評估等入門概念。",
  },
  [MOTIVATION_COURSE]: {
    id: MOTIVATION_COURSE,
    slug: MOTIVATION_COURSE,
    name: "備考節奏提醒",
    description: "每天一個小提醒，把證照準備拆成可持續的微任務。",
  },
  [GRAMMAR_COURSE]: {
    id: GRAMMAR_COURSE,
    slug: GRAMMAR_COURSE,
    name: "資料與治理",
    description: "整理資料來源、資料品質、隱私、偏誤、治理與法規倫理等常考主題。",
  },
  [PHRASE_COURSE]: {
    id: PHRASE_COURSE,
    slug: PHRASE_COURSE,
    name: "每日 AI 名詞",
    description: "每天熟悉一個 AI、資料科學或生成式 AI 常見名詞。",
  },
  [PATTERN_COURSE]: {
    id: PATTERN_COURSE,
    slug: PATTERN_COURSE,
    name: "AI 應用案例",
    description: "整合生活、產業與商業導入情境，練習判斷需求、資料、效益與風險。",
  },
  [AI_COURSE]: {
    id: AI_COURSE,
    slug: AI_COURSE,
    name: "AI 核心知識",
    description: "聚焦機器學習、深度學習、生成式 AI、評估指標與模型限制。",
  },
  [TRAVEL_COURSE]: {
    id: TRAVEL_COURSE,
    slug: TRAVEL_COURSE,
    name: "產業案例",
    description: "從製造、金融、醫療、零售與公共服務看 AI 導入方式。",
  },
  [LIFE_COURSE]: {
    id: LIFE_COURSE,
    slug: LIFE_COURSE,
    name: "生活 AI 應用",
    description: "整理日常工具、助理、推薦系統與生成式 AI 的使用觀念。",
  },
  [BUSINESS_COURSE]: {
    id: BUSINESS_COURSE,
    slug: BUSINESS_COURSE,
    name: "商業導入",
    description: "練習用商業需求、效益、成本、流程與風險來評估 AI 專案。",
  },
  [CHAT_COURSE]: {
    id: CHAT_COURSE,
    slug: CHAT_COURSE,
    name: "考點問答",
    description: "用問答形式複習容易混淆的觀念，幫助考前快速回想。",
  },
} as const;

export type CourseSlug = keyof typeof courses;

export function normalizeCourseSlug(value: unknown): CourseSlug {
  return typeof value === "string" && value in courses ? (value as CourseSlug) : DEFAULT_COURSE;
}
