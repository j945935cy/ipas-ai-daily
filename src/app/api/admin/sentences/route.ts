import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureDatabaseResponse } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { normalizeCourseSlug } from "@/lib/sentences";

export async function POST(request: Request) {
  const databaseError = await ensureDatabaseResponse("儲存每日內容");

  if (databaseError) {
    return databaseError;
  }

  const user = await getCurrentUser();

  if (!user?.isAdmin) {
    return NextResponse.json({ error: "需要管理員權限。" }, { status: 403 });
  }

  const body = await request.json();
  const courseId = normalizeCourseSlug(body.courseId);
  const publishDate = new Date(String(body.publishDate));
  publishDate.setHours(0, 0, 0, 0);

  const sentenceText = String(body.sentence ?? "").trim();
  const translation = String(body.translation ?? "").trim();

  if (!sentenceText || !translation || Number.isNaN(publishDate.getTime())) {
    return NextResponse.json({ error: "請填寫有效日期、今日重點與說明。" }, { status: 400 });
  }

  const sentence = await prisma.dailySentence.upsert({
    where: { courseId_publishDate: { courseId, publishDate } },
    update: {
      sentence: sentenceText,
      translation,
      grammarNote: String(body.grammarNote ?? "").trim(),
      usageNote: String(body.usageNote ?? "").trim(),
      vocabulary: String(body.vocabulary ?? "").trim(),
      example: String(body.example ?? "").trim(),
    },
    create: {
      courseId,
      sentence: sentenceText,
      translation,
      grammarNote: String(body.grammarNote ?? "").trim(),
      usageNote: String(body.usageNote ?? "").trim(),
      vocabulary: String(body.vocabulary ?? "").trim(),
      example: String(body.example ?? "").trim(),
      publishDate,
    },
  });

  return NextResponse.json({ sentence });
}

export async function DELETE(request: Request) {
  const databaseError = await ensureDatabaseResponse("刪除每日內容");

  if (databaseError) {
    return databaseError;
  }

  const user = await getCurrentUser();

  if (!user?.isAdmin) {
    return NextResponse.json({ error: "需要管理員權限。" }, { status: 403 });
  }

  const body = await request.json();
  const courseId = normalizeCourseSlug(body.courseId);
  const publishDate = new Date(String(body.publishDate));
  publishDate.setHours(0, 0, 0, 0);

  if (Number.isNaN(publishDate.getTime())) {
    return NextResponse.json({ error: "日期格式不正確。" }, { status: 400 });
  }

  const result = await prisma.dailySentence.deleteMany({
    where: {
      courseId,
      publishDate,
    },
  });

  return NextResponse.json({ deleted: result.count });
}
