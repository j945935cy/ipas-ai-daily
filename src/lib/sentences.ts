import { ensureDatabase, prisma } from "./prisma";
import {
  courses,
  AI_COURSE,
  DEFAULT_COURSE,
  GRAMMAR_COURSE,
  KIDS_COURSE,
  MOTIVATION_COURSE,
  PATTERN_COURSE,
  PHRASE_COURSE,
  TRAVEL_COURSE,
  LIFE_COURSE,
  BUSINESS_COURSE,
  CHAT_COURSE,
  type CourseSlug,
} from "./courses";

export {
  courses,
  AI_COURSE,
  DEFAULT_COURSE,
  GRAMMAR_COURSE,
  KIDS_COURSE,
  MOTIVATION_COURSE,
  PATTERN_COURSE,
  PHRASE_COURSE,
  TRAVEL_COURSE,
  LIFE_COURSE,
  BUSINESS_COURSE,
  CHAT_COURSE,
  normalizeCourseSlug,
} from "./courses";
export type { CourseSlug } from "./courses";

type SentenceFallback = {
  sentence: string;
  translation: string;
  grammarNote: string;
  usageNote: string;
  vocabulary: string;
  example: string;
};

let coursesPromise: Promise<void> | null = null;

const fallbackByCourse = {
  [DEFAULT_COURSE]: {
    sentence: "監督式學習",
    translation: "監督式學習使用已標註資料訓練模型，常見任務是分類與迴歸。",
    grammarNote: "題目若提到資料已有正確答案或標籤，通常指監督式學習。",
    usageNote: "先判斷輸出是類別還是數值，就能區分分類與迴歸。",
    vocabulary: "標籤: 正確答案；分類: 離散類別；迴歸: 連續數值。",
    example: "用房屋資料預測價格屬於迴歸，用影像判斷貓狗屬於分類。",
  },
  [KIDS_COURSE]: {
    sentence: "模型",
    translation: "模型是從資料中學到的規則或表示方式。",
    grammarNote: "訓練完成後，模型可對新資料做預測或生成。",
    usageNote: "不要把模型和資料庫混為一談；模型是學到規律後的結果。",
    vocabulary: "訓練: 學習規律；推論: 用模型產生結果；參數: 模型內部數值。",
    example: "垃圾郵件分類模型會根據信件特徵預測是否為垃圾郵件。",
  },
  [MOTIVATION_COURSE]: {
    sentence: "備考節奏",
    translation: "每天固定複習一個概念，比考前大量硬背更穩定。",
    grammarNote: "iPAS 題目常測概念差異，適合用短時間反覆辨識關鍵詞。",
    usageNote: "今天只要能說清楚一個名詞、一個限制與一個例子，就算有進度。",
    vocabulary: "複習: 重複理解；關鍵詞: 判斷題意的線索；例子: 幫助記憶的情境。",
    example: "先複習監督式、非監督式與強化學習的差異。",
  },
  [GRAMMAR_COURSE]: {
    sentence: "資料最小化",
    translation: "資料最小化是只蒐集與處理達成目的所必要的資料。",
    grammarNote: "它有助於降低個資、資安與合規風險。",
    usageNote: "看到個資或敏感資料題目時，先確認目的、必要性與權限。",
    vocabulary: "目的限制: 為特定目的使用；必要性: 不過度蒐集；個資: 可識別個人的資料。",
    example: "若只需統計年齡區間，就不一定要保存完整生日。",
  },
  [PHRASE_COURSE]: {
    sentence: "RAG",
    translation: "RAG 是檢索增強生成，先查找相關資料，再讓生成模型根據資料回答。",
    grammarNote: "RAG 常用於企業知識庫問答，可降低模型憑空編造的風險。",
    usageNote: "看到知識庫、文件查詢、引用來源與生成回答，常可聯想到 RAG。",
    vocabulary: "Retrieval: 檢索；Augmented: 增強；Generation: 生成；知識庫: 可查詢資料來源。",
    example: "企業內部制度問答可用 RAG 先找文件，再整理答案。",
  },
  [PATTERN_COURSE]: {
    sentence: "客服問答",
    translation: "客服問答系統可用 FAQ、知識庫與 RAG 提供即時回覆。",
    grammarNote: "導入時要注意答錯風險、升級人工客服與知識庫更新。",
    usageNote: "應先界定哪些問題可自動回答，哪些問題需要轉人工。",
    vocabulary: "RAG: 檢索增強生成；FAQ: 常見問題；Escalation: 轉人工。",
    example: "若問題涉及退費或合約爭議，應轉人工處理。",
  },
  [AI_COURSE]: {
    sentence: "大型語言模型",
    translation: "大型語言模型能根據上下文預測與生成文字。",
    grammarNote: "它擅長語言任務，但可能產生幻覺或過時資訊。",
    usageNote: "使用大型語言模型回答重要問題時，應查證來源與時間。",
    vocabulary: "LLM: 大型語言模型；上下文: 提供給模型的資訊；Token: 文字處理單位。",
    example: "LLM 可協助摘要文件，但法規或數據仍要查證官方來源。",
  },
  [TRAVEL_COURSE]: {
    sentence: "預測維護",
    translation: "預測維護用設備感測資料預測故障風險。",
    grammarNote: "成功關鍵是穩定資料蒐集、異常定義與維修流程整合。",
    usageNote: "製造業案例題常會考感測資料、異常偵測與停機成本。",
    vocabulary: "感測器: 蒐集設備狀態；異常偵測: 找不正常模式；停機成本: 設備停止損失。",
    example: "機台震動與溫度變化可用來預測故障。",
  },
  [LIFE_COURSE]: {
    sentence: "個人化推薦",
    translation: "推薦系統可依使用者行為與內容特徵提供個人化內容。",
    grammarNote: "常見於電商、影音平台、新聞與學習系統。",
    usageNote: "要注意冷啟動、隱私保護與過度同溫層問題。",
    vocabulary: "協同過濾: 看相似使用者；內容式推薦: 看物品特徵；冷啟動: 新資料不足。",
    example: "影音平台可依觀看紀錄推薦影片。",
  },
  [BUSINESS_COURSE]: {
    sentence: "AI 專案成功指標",
    translation: "AI 專案不只看模型分數，也要看業務效益、流程整合、風險與維運成本。",
    grammarNote: "導入規劃題常會要求先定義問題、資料與 KPI。",
    usageNote: "模型準確率高但無法上線或沒人使用，仍不算成功。",
    vocabulary: "KPI: 關鍵績效指標；Adoption: 採用率；Operations: 維運。",
    example: "客服模型要看是否降低等待時間與提升滿意度。",
  },
  [CHAT_COURSE]: {
    sentence: "分類和迴歸差在哪裡？",
    translation: "分類輸出類別，迴歸輸出連續數值。",
    grammarNote: "判斷題型時先看答案型態。",
    usageNote: "考題常用預測結果型態來測分類與迴歸差異。",
    vocabulary: "分類: 離散類別；迴歸: 連續數值；輸出型態: 最快判斷線索。",
    example: "預測是否流失是分類；預測下月銷售額是迴歸。",
  },
} satisfies Record<CourseSlug, SentenceFallback>;

export async function ensureCourses() {
  coursesPromise ??= setupCourses();
  try {
    await coursesPromise;
  } catch (error) {
    coursesPromise = null;
    throw error;
  }
}

async function setupCourses() {
  await ensureDatabase();

  for (const course of Object.values(courses)) {
    await prisma.course.upsert({
      where: { id: course.id },
      update: {
        slug: course.slug,
        name: course.name,
        description: course.description,
      },
      create: course,
    });
  }
}

function fallbackSentence(courseSlug: CourseSlug, publishDate = new Date()) {
  const date = new Date(publishDate);
  date.setHours(0, 0, 0, 0);

  return {
    id: `fallback-${courseSlug}`,
    ...fallbackByCourse[courseSlug],
    courseId: courseSlug,
    publishDate: date,
    createdAt: date,
    updatedAt: date,
  };
}

export async function getTodaySentence(courseSlug: CourseSlug = DEFAULT_COURSE) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    await ensureCourses();

    const sentence = await prisma.dailySentence.findFirst({
      where: {
        courseId: courseSlug,
        publishDate: { lte: today },
      },
      orderBy: { publishDate: "desc" },
    });

    if (sentence) {
      return sentence;
    }

    return prisma.dailySentence.create({
      data: {
        ...fallbackByCourse[courseSlug],
        courseId: courseSlug,
        publishDate: today,
      },
    });
  } catch {
    return fallbackSentence(courseSlug, today);
  }
}

export async function getRecentSentences(courseSlug: CourseSlug = DEFAULT_COURSE, limit = 7) {
  try {
    await ensureCourses();

    return prisma.dailySentence.findMany({
      where: { courseId: courseSlug },
      orderBy: { publishDate: "desc" },
      take: limit,
    });
  } catch {
    return [fallbackSentence(courseSlug)].slice(0, limit);
  }
}

export async function getAllSentences(courseSlug?: CourseSlug) {
  try {
    await ensureCourses();

    return prisma.dailySentence.findMany({
      where: courseSlug ? { courseId: courseSlug } : undefined,
      orderBy: [{ courseId: "asc" }, { publishDate: "desc" }],
      include: { course: true },
    });
  } catch {
    const courseSlugs = courseSlug ? [courseSlug] : Object.keys(courses);

    return courseSlugs.map((slug) => {
      const normalizedSlug = slug as CourseSlug;

      return {
        ...fallbackSentence(normalizedSlug),
        course: {
          ...courses[normalizedSlug],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
    });
  }
}
