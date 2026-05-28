import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureDatabase, prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  await ensureDatabase();

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
