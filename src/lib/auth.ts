import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { ensureDatabase, prisma } from "./prisma";

const SESSION_COOKIE = "ipas_ai_daily_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-change-before-production",
);

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
};

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    await ensureDatabase();

    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId;

    if (typeof userId !== "string") {
      return null;
    }

    return await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, isAdmin: true },
    });
  } catch {
    return null;
  }
}
