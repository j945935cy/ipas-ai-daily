import { NextResponse } from "next/server";
import { ensureDatabase } from "./prisma";

export async function ensureDatabaseResponse(action: string) {
  try {
    await ensureDatabase();
    return null;
  } catch {
    return NextResponse.json(
      { error: `資料庫尚未啟動，暫時無法${action}。請先啟動 PostgreSQL。` },
      { status: 503 },
    );
  }
}
