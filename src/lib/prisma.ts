import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { PrismaPostgresAdapter } from "@prisma/adapter-ppg";
import { PrismaPg } from "@prisma/adapter-pg";
import { Client } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const log: Prisma.LogLevel[] =
    process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];
  const connectionString = process.env.DATABASE_URL;

  if (connectionString?.startsWith("postgres")) {
    const databaseHost = new URL(connectionString).host;

    if (databaseHost.includes("db.prisma.io")) {
      return new PrismaClient({
        adapter: new PrismaPostgresAdapter({ connectionString }),
        log,
      });
    }

    return new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
      log,
    });
  }

  return new PrismaClient({ log });
}

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

let setupPromise: Promise<void> | null = null;
let localDatabaseUnavailableUntil = 0;

export async function ensureDatabase() {
  await assertLocalDatabaseReachable();
  setupPromise ??= setupDatabase();
  try {
    await setupPromise;
  } catch (error) {
    setupPromise = null;
    throw error;
  }
}

async function assertLocalDatabaseReachable() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString?.startsWith("postgres")) {
    return;
  }

  const databaseUrl = new URL(connectionString);

  if (!["localhost", "127.0.0.1"].includes(databaseUrl.hostname)) {
    return;
  }

  if (Date.now() < localDatabaseUnavailableUntil) {
    throw new Error("Local database is not reachable.");
  }

  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 500,
  });

  try {
    await client.connect();
  } catch {
    localDatabaseUnavailableUntil = Date.now() + 3000;
    throw new Error("Local database is not reachable.");
  } finally {
    await client.end().catch(() => {});
  }
}

async function setupDatabase() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Course" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "slug" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Course_slug_key" ON "Course"("slug");`);
  await prisma.$executeRawUnsafe(`
    INSERT INTO "Course" ("id", "slug", "name", "description", "updatedAt")
    VALUES
      ('daily-english', 'daily-english', '每日 AI 重點', '每天整理一個 iPAS AI 備考核心觀念。', CURRENT_TIMESTAMP),
      ('kids-english', 'kids-english', 'AI 基礎概念', '用短句拆解資料、模型、訓練、推論與評估等入門概念。', CURRENT_TIMESTAMP),
      ('grammar-english', 'grammar-english', '資料與治理', '整理資料來源、資料品質、隱私、偏誤、治理與法規倫理等常考主題。', CURRENT_TIMESTAMP),
      ('pattern-english', 'pattern-english', 'AI 應用案例', '整合生活、產業與商業導入情境，練習判斷需求、資料、效益與風險。', CURRENT_TIMESTAMP),
      ('chat-english', 'chat-english', '考點問答', '用問答形式複習容易混淆的觀念，幫助考前快速回想。', CURRENT_TIMESTAMP)
    ON CONFLICT ("id") DO UPDATE SET
      "slug" = EXCLUDED."slug",
      "name" = EXCLUDED."name",
      "description" = EXCLUDED."description",
      "updatedAt" = CURRENT_TIMESTAMP;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL,
      "name" TEXT,
      "passwordHash" TEXT NOT NULL,
      "isAdmin" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "DailySentence" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "courseId" TEXT NOT NULL DEFAULT 'daily-english',
      "sentence" TEXT NOT NULL,
      "translation" TEXT NOT NULL,
      "grammarNote" TEXT NOT NULL,
      "usageNote" TEXT NOT NULL,
      "vocabulary" TEXT NOT NULL,
      "example" TEXT NOT NULL,
      "publishDate" TIMESTAMP(3) NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "DailySentence" ADD COLUMN IF NOT EXISTS "courseId" TEXT NOT NULL DEFAULT 'daily-english';`,
  );
  await prisma.$executeRawUnsafe(`UPDATE "DailySentence" SET "courseId" = 'daily-english' WHERE "courseId" IS NULL;`);
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "DailySentence_publishDate_key";`);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "DailySentence_courseId_publishDate_key" ON "DailySentence"("courseId", "publishDate");`,
  );
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "DailySentence_courseId_idx" ON "DailySentence"("courseId");`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PushSubscription" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "courseId" TEXT NOT NULL DEFAULT 'daily-english',
      "endpoint" TEXT NOT NULL,
      "p256dh" TEXT NOT NULL,
      "auth" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PushSubscription_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "PushSubscription" ADD COLUMN IF NOT EXISTS "courseId" TEXT NOT NULL DEFAULT 'daily-english';`,
  );
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "PushSubscription_endpoint_key";`);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "PushSubscription_endpoint_courseId_key" ON "PushSubscription"("endpoint", "courseId");`,
  );
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PushSubscription_courseId_idx" ON "PushSubscription"("courseId");`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "MailSubscription" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "courseId" TEXT NOT NULL DEFAULT 'daily-english',
      "pageUrl" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "MailSubscription_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "MailSubscription_userId_courseId_key" ON "MailSubscription"("userId", "courseId");`,
  );
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "MailSubscription_courseId_idx" ON "MailSubscription"("courseId");`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "LearningHistory" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "sentenceId" TEXT NOT NULL,
      "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "LearningHistory_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "LearningHistory_sentenceId_fkey"
        FOREIGN KEY ("sentenceId") REFERENCES "DailySentence" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "LearningHistory_userId_sentenceId_key" ON "LearningHistory"("userId", "sentenceId");`,
  );

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PageView" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "path" TEXT NOT NULL,
      "visitorId" TEXT,
      "userAgent" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "PageView_createdAt_idx" ON "PageView"("createdAt");`,
  );
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PageView_path_idx" ON "PageView"("path");`);
}
