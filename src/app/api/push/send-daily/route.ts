import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { courses, type CourseSlug } from "@/lib/courses";
import { sendDailySentencePush } from "@/lib/push";

export async function POST() {
  const user = await getCurrentUser();

  if (!user?.isAdmin) {
    return NextResponse.json({ error: "需要管理員權限。" }, { status: 403 });
  }

  const results = await Promise.all(
    Object.keys(courses).map(async (courseId) => ({
      courseId,
      ...(await sendDailySentencePush(courseId as CourseSlug)),
    })),
  );

  return NextResponse.json({
    sent: results.reduce((sum, item) => sum + item.sent, 0),
    failed: results.reduce((sum, item) => sum + item.failed, 0),
    skipped: results.every((item) => item.skipped),
    results,
  });
}
