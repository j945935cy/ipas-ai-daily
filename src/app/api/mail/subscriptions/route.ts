import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureDatabaseResponse } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { normalizeCourseSlug } from "@/lib/courses";

async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "請先登入。" }, { status: 401 }),
    };
  }

  return { user, response: null };
}

export async function GET() {
  const databaseError = await ensureDatabaseResponse("讀取每日信訂閱");

  if (databaseError) {
    return databaseError;
  }

  const { user, response } = await requireUser();

  if (response) {
    return response;
  }

  const subscriptions = await prisma.mailSubscription.findMany({
    where: { userId: user.id },
    select: { courseId: true },
  });

  return NextResponse.json({
    courseIds: subscriptions.map((item) => item.courseId),
  });
}

export async function POST(request: Request) {
  const databaseError = await ensureDatabaseResponse("儲存每日信訂閱");

  if (databaseError) {
    return databaseError;
  }

  const { user, response } = await requireUser();

  if (response) {
    return response;
  }

  const body = await request.json().catch(() => ({}));
  const courseId = normalizeCourseSlug(body.courseId);
  const pageUrl = typeof body.pageUrl === "string" ? body.pageUrl : null;

  await prisma.mailSubscription.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    update: { pageUrl },
    create: { userId: user.id, courseId, pageUrl },
  });

  return NextResponse.json({ ok: true, courseId });
}

export async function DELETE(request: Request) {
  const databaseError = await ensureDatabaseResponse("取消每日信訂閱");

  if (databaseError) {
    return databaseError;
  }

  const { user, response } = await requireUser();

  if (response) {
    return response;
  }

  const body = await request.json().catch(() => ({}));
  const courseId = normalizeCourseSlug(body.courseId);

  await prisma.mailSubscription.deleteMany({
    where: { userId: user.id, courseId },
  });

  return NextResponse.json({ ok: true, courseId });
}
