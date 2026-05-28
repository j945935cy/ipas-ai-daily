import webpush from "web-push";
import { ensureDatabase, prisma } from "./prisma";
import {
  DEFAULT_COURSE,
  AI_COURSE,
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

const pushMeta = {
  [DEFAULT_COURSE]: {
    title: "每日 AI 重點",
    url: "/daily",
  },
  [KIDS_COURSE]: {
    title: "AI 基礎概念",
    url: "/foundations",
  },
  [MOTIVATION_COURSE]: {
    title: "備考節奏提醒",
    url: "/daily",
  },
  [GRAMMAR_COURSE]: {
    title: "資料與治理",
    url: "/governance",
  },
  [PHRASE_COURSE]: {
    title: "每日 AI 名詞",
    url: "/foundations",
  },
  [PATTERN_COURSE]: {
    title: "AI 應用案例",
    url: "/cases",
  },
  [AI_COURSE]: {
    title: "AI 核心知識",
    url: "/daily",
  },
  [TRAVEL_COURSE]: {
    title: "產業案例",
    url: "/cases",
  },
  [LIFE_COURSE]: {
    title: "生活 AI 應用",
    url: "/cases",
  },
  [BUSINESS_COURSE]: {
    title: "商業導入",
    url: "/cases",
  },
  [CHAT_COURSE]: {
    title: "考點問答",
    url: "/qa",
  },
} satisfies Record<CourseSlug, { title: string; url: string }>;

export function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@example.com";

  if (!publicKey || !privateKey) {
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export async function sendDailySentencePush(courseId: CourseSlug = DEFAULT_COURSE) {
  await ensureDatabase();

  if (!configureWebPush()) {
    return { sent: 0, failed: 0, skipped: true };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sentence = await prisma.dailySentence.findFirst({
    where: {
      courseId,
      publishDate: { lte: today },
    },
    orderBy: { publishDate: "desc" },
  });

  if (!sentence) {
    return { sent: 0, failed: 0, skipped: true };
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { courseId },
    include: {
      user: {
        select: { email: true },
      },
    },
  });
  let sent = 0;
  let failed = 0;
  let cleaned = 0;
  const failures: Array<{ email: string; statusCode?: number; reason: string }> = [];

  await Promise.all(
    subscriptions.map(async (item) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: item.endpoint,
            keys: { p256dh: item.p256dh, auth: item.auth },
          },
          JSON.stringify({
            title: pushMeta[courseId].title,
            body: sentence.sentence,
            url: pushMeta[courseId].url,
          }),
        );
        sent += 1;
      } catch (error) {
        failed += 1;
        const statusCode =
          typeof error === "object" && error !== null && "statusCode" in error
            ? Number(error.statusCode)
            : undefined;
        const reason = error instanceof Error ? error.message : "Unknown push error";

        failures.push({ email: item.user.email, statusCode, reason });

        if (statusCode === 403 || statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: item.id } });
          cleaned += 1;
        }
      }
    }),
  );

  return { sent, failed, cleaned, skipped: false, failures };
}
