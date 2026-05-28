import { NextResponse } from "next/server";
import { courses, type CourseSlug } from "@/lib/courses";
import { sendDailySentencePush } from "@/lib/push";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (secret) {
    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const results = await Promise.all(
    Object.keys(courses).map(async (courseId) => ({
      courseId,
      ...(await sendDailySentencePush(courseId as CourseSlug)),
    })),
  );

  const sent = results.reduce((sum, item) => sum + item.sent, 0);
  const failed = results.reduce((sum, item) => sum + item.failed, 0);

  console.info("daily-push cron completed", { sent, failed, results });

  return NextResponse.json({
    sent,
    failed,
    results,
  });
}
