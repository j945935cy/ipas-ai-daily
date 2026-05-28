import { NextResponse } from "next/server";
import { ensureDatabase, prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  await ensureDatabase();

  const body = await request.json().catch(() => ({}));
  const path = String(body.path ?? "/").slice(0, 240);
  const visitorId = String(body.visitorId ?? "").slice(0, 120) || null;
  const userAgent = request.headers.get("user-agent")?.slice(0, 240) ?? null;

  await prisma.pageView.create({
    data: {
      path,
      visitorId,
      userAgent,
    },
  });

  return NextResponse.json({ ok: true });
}
