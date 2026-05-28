import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureDatabase, prisma } from "@/lib/prisma";
import { normalizeCourseSlug } from "@/lib/sentences";

export async function POST(request: Request) {
  await ensureDatabase();

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "請先登入。" }, { status: 401 });
  }

  const subscription = await request.json();
  const courseId = normalizeCourseSlug(subscription.courseId);
  const endpoint = String(subscription.endpoint ?? "");
  const p256dh = String(subscription.keys?.p256dh ?? "");
  const auth = String(subscription.keys?.auth ?? "");

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "推播訂閱資料不完整。" }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint_courseId: { endpoint, courseId } },
    update: { userId: user.id, p256dh, auth },
    create: { userId: user.id, courseId, endpoint, p256dh, auth },
  });

  return NextResponse.json({ ok: true });
}
