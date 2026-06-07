import { ensureDatabase, prisma } from "./prisma";
import { sendSiteMail } from "./mail";
import {
  DEFAULT_COURSE,
  KIDS_COURSE,
  MOTIVATION_COURSE,
  GRAMMAR_COURSE,
  PHRASE_COURSE,
  PATTERN_COURSE,
  AI_COURSE,
  TRAVEL_COURSE,
  LIFE_COURSE,
  BUSINESS_COURSE,
  CHAT_COURSE,
  type CourseSlug,
} from "./courses";
import { getTodaySentence } from "./sentences";

const siteUrl = process.env.DAILY_EMAIL_URL ?? "https://ipas-ai-daily.vercel.app";

const mailMeta = {
  [DEFAULT_COURSE]: { title: "每日 AI 重點", url: "/daily" },
  [KIDS_COURSE]: { title: "AI 基礎概念", url: "/foundations" },
  [MOTIVATION_COURSE]: { title: "備考節奏提醒", url: "/daily" },
  [GRAMMAR_COURSE]: { title: "資料與治理", url: "/governance" },
  [PHRASE_COURSE]: { title: "每日 AI 名詞", url: "/foundations" },
  [PATTERN_COURSE]: { title: "AI 應用案例", url: "/cases" },
  [AI_COURSE]: { title: "AI 核心知識", url: "/daily" },
  [TRAVEL_COURSE]: { title: "產業案例", url: "/cases" },
  [LIFE_COURSE]: { title: "生活 AI 應用", url: "/cases" },
  [BUSINESS_COURSE]: { title: "商業導入", url: "/cases" },
  [CHAT_COURSE]: { title: "考點問答", url: "/qa" },
} satisfies Record<CourseSlug, { title: string; url: string }>;

function absoluteUrl(pathOrUrl: string) {
  return new URL(pathOrUrl, siteUrl).toString();
}

function buildDailyMail({
  title,
  url,
  sentence,
}: {
  title: string;
  url: string;
  sentence: Awaited<ReturnType<typeof getTodaySentence>>;
}) {
  const subject = `iPAS AI Daily｜${title}：${sentence.sentence}`;
  const text = `你好，這是今天的 iPAS AI Daily：

${title}：${sentence.sentence}

中文：${sentence.translation}

核心觀念：${sentence.grammarNote}

複習提示：${sentence.usageNote}

關鍵詞：${sentence.vocabulary}

例子：${sentence.example}

查看今日內容：${url}`;

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <p>你好，這是今天的 iPAS AI Daily：</p>
    <p><strong>${title}：</strong>${sentence.sentence}</p>
    <p><strong>中文：</strong>${sentence.translation}</p>
    <p><strong>核心觀念：</strong>${sentence.grammarNote}</p>
    <p><strong>複習提示：</strong>${sentence.usageNote}</p>
    <p><strong>關鍵詞：</strong>${sentence.vocabulary}</p>
    <p><strong>例子：</strong>${sentence.example}</p>
    <p><a href="${url}">查看今日內容</a></p>
  </body>
</html>`;

  return { subject, text, html };
}

export async function sendDailySentenceMail(courseId: CourseSlug = DEFAULT_COURSE) {
  try {
    await ensureDatabase();
  } catch {
    return { sent: 0, failed: 0, skipped: true, reason: "database-unavailable" };
  }

  const meta = mailMeta[courseId];
  const sentence = await getTodaySentence(courseId);
  const subscriptions = await prisma.mailSubscription.findMany({
    where: { courseId },
    include: {
      user: {
        select: { email: true },
      },
    },
  });

  if (!subscriptions.length) {
    return { sent: 0, failed: 0, skipped: true, reason: "no-subscriptions" };
  }

  let sent = 0;
  let failed = 0;
  const failures: Array<{ email: string; reason: string }> = [];
  const mail = buildDailyMail({
    title: meta.title,
    url: absoluteUrl(meta.url),
    sentence,
  });

  await Promise.all(
    subscriptions.map(async (item) => {
      try {
        await sendSiteMail({
          to: item.user.email,
          subject: mail.subject,
          text: mail.text,
          html: mail.html,
        });
        sent += 1;
      } catch (error) {
        failed += 1;
        failures.push({
          email: item.user.email,
          reason: error instanceof Error ? error.message : "Unknown mail error",
        });
      }
    }),
  );

  return { sent, failed, skipped: false, failures };
}
