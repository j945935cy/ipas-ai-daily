import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sendSiteMail } from "@/lib/mail";
import { DEFAULT_COURSE, getTodaySentence } from "@/lib/sentences";

const DAILY_EMAIL_URL =
  process.env.DAILY_EMAIL_URL ?? "https://ipas-ai-daily.vercel.app/";

export async function POST() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "請先登入。" }, { status: 401 });
  }

  const todaySentence = await getTodaySentence(DEFAULT_COURSE);
  const dailyUrl = DAILY_EMAIL_URL;

  await sendSiteMail({
    to: user.email,
    subject: `iPAS AI Daily：${todaySentence.sentence}`,
    text: `你好，這是今天的 iPAS AI Daily：

今日重點：${todaySentence.sentence}

中文：${todaySentence.translation}

文法重點：${todaySentence.grammarNote}

用法說明：${todaySentence.usageNote}

單字片語：${todaySentence.vocabulary}

例句練習：${todaySentence.example}

查看今日內容：${dailyUrl}`,
    html: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <p>你好，這是今天的 iPAS AI Daily：</p>
    <p><strong>今日重點：</strong>${todaySentence.sentence}</p>
    <p><strong>中文：</strong>${todaySentence.translation}</p>
    <p><strong>文法重點：</strong>${todaySentence.grammarNote}</p>
    <p><strong>用法說明：</strong>${todaySentence.usageNote}</p>
    <p><strong>單字片語：</strong>${todaySentence.vocabulary}</p>
    <p><strong>例句練習：</strong>${todaySentence.example}</p>
    <p><a href="${dailyUrl}">查看今日內容</a></p>
  </body>
</html>`,
  });

  return NextResponse.json({
    ok: true,
    message: `已寄出到 ${user.email}。`,
  });
}
