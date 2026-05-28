import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { ensureDatabase, prisma } from "@/lib/prisma";

const userSelect = {
  id: true,
  email: true,
  name: true,
  isAdmin: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      learningHistory: true,
      pushSubscriptions: true,
    },
  },
};

async function requireAdmin() {
  const currentUser = await getCurrentUser();

  if (!currentUser?.isAdmin) {
    return {
      currentUser: null,
      response: NextResponse.json({ error: "沒有管理員權限。" }, { status: 403 }),
    };
  }

  return { currentUser, response: null };
}

function normalizeUserInput(body: Record<string, unknown>) {
  return {
    email: String(body.email ?? "").trim().toLowerCase(),
    name: String(body.name ?? "").trim() || null,
    password: String(body.password ?? ""),
    isAdmin: Boolean(body.isAdmin),
  };
}

export async function GET() {
  await ensureDatabase();

  const { response } = await requireAdmin();

  if (response) {
    return response;
  }

  const users = await prisma.user.findMany({
    orderBy: [{ isAdmin: "desc" }, { createdAt: "desc" }],
    select: userSelect,
  });

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  await ensureDatabase();

  const { response } = await requireAdmin();

  if (response) {
    return response;
  }

  const body = await request.json();
  const { email, name, password, isAdmin } = normalizeUserInput(body);

  if (!email.includes("@") || password.length < 8) {
    return NextResponse.json(
      { error: "請輸入有效 Email，密碼至少 8 個字元。" },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: { email, passwordHash, name, isAdmin },
      select: userSelect,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "這個 Email 已經存在。" }, { status: 409 });
  }
}

export async function PATCH(request: Request) {
  await ensureDatabase();

  const { currentUser, response } = await requireAdmin();

  if (response) {
    return response;
  }

  const body = await request.json();
  const id = String(body.id ?? "");
  const { email, name, password, isAdmin } = normalizeUserInput(body);

  if (!id) {
    return NextResponse.json({ error: "缺少使用者 ID。" }, { status: 400 });
  }

  if (!email.includes("@")) {
    return NextResponse.json({ error: "請輸入有效 Email。" }, { status: 400 });
  }

  if (password && password.length < 8) {
    return NextResponse.json({ error: "新密碼至少 8 個字元。" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { id } });

  if (!existingUser) {
    return NextResponse.json({ error: "找不到使用者。" }, { status: 404 });
  }

  if (existingUser.isAdmin && !isAdmin) {
    const adminCount = await prisma.user.count({ where: { isAdmin: true } });

    if (adminCount <= 1) {
      return NextResponse.json({ error: "至少需要保留一位管理員。" }, { status: 400 });
    }
  }

  const data: {
    email: string;
    name: string | null;
    isAdmin: boolean;
    passwordHash?: string;
  } = { email, name, isAdmin };

  if (password) {
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });

    return NextResponse.json({
      user,
      currentUserChanged: currentUser?.id === user.id,
    });
  } catch {
    return NextResponse.json({ error: "更新失敗，Email 可能已被使用。" }, { status: 409 });
  }
}

export async function DELETE(request: Request) {
  await ensureDatabase();

  const { currentUser, response } = await requireAdmin();

  if (response) {
    return response;
  }

  const body = await request.json();
  const id = String(body.id ?? "");

  if (!id) {
    return NextResponse.json({ error: "缺少使用者 ID。" }, { status: 400 });
  }

  if (currentUser?.id === id) {
    return NextResponse.json({ error: "不能刪除目前登入的帳號。" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { id } });

  if (!existingUser) {
    return NextResponse.json({ error: "找不到使用者。" }, { status: 404 });
  }

  if (existingUser.isAdmin) {
    const adminCount = await prisma.user.count({ where: { isAdmin: true } });

    if (adminCount <= 1) {
      return NextResponse.json({ error: "至少需要保留一位管理員。" }, { status: 400 });
    }
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ deleted: true });
}
