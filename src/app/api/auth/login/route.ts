import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureDatabase, prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await ensureDatabase();
  } catch {
    return NextResponse.json(
      { error: "資料庫尚未啟動，暫時無法登入。請先啟動 PostgreSQL。" },
      { status: 503 },
    );
  }

  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !valid) {
    return NextResponse.json({ error: "Email 或密碼不正確。" }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin },
  });
}
