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

  const url = new URL(request.url);
  const targetDateParam = url.searchParams.get("date");
  const targetDate = targetDateParam ? new Date(`${targetDateParam}T00:00:00`) : undefined;

  if (targetDateParam && Number.isNaN(targetDate?.getTime())) {
    return NextResponse.json({ error: "Invalid date. Use YYYY-MM-DD." }, { status: 400 });
  }

  const results = await Promise.all(
    Object.keys(courses).map(async (courseId) => ({
      courseId,
      ...(await sendDailySentencePush(courseId as CourseSlug, { targetDate })),
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
