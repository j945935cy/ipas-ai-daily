import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureDatabase, prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  await ensureDatabase();

  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const name = String(body.name ?? "").trim();
  const password = String(body.password ?? "");

  if (!email.includes("@") || password.length < 8) {
    return NextResponse.json(
      { error: "請輸入有效 Email，密碼至少 8 個字元。" },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const userCount = await prisma.user.count();
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash,
        isAdmin: userCount === 0,
      },
    });

    await createSession(user.id);
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin },
    });
  } catch {
    return NextResponse.json({ error: "這個 Email 已經註冊。" }, { status: 409 });
  }
}
