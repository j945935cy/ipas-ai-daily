import { NextResponse } from "next/server";
import { sendSiteMail } from "@/lib/mail";

type MailBody = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
};

export async function POST(request: Request) {
  let body: MailBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "請送出有效的 JSON 資料。" },
      { status: 400 },
    );
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { success: false, message: "請完整填寫姓名、Email 與訊息。" },
      { status: 400 },
    );
  }

  try {
    await sendSiteMail({
      to: process.env.MAIL_TO ?? "j945935@gmail.com",
      subject: `網站聯絡表單：${name}`,
      text: `姓名：${name}
Email：${email}

訊息內容：
${message}`,
      replyTo: email,
    });

    return NextResponse.json({
      success: true,
      message: "信件已寄出。",
    });
  } catch (error) {
    console.error("send-mail failed", error);

    return NextResponse.json(
      { success: false, message: "寄信失敗，請檢查 SMTP 環境變數設定。" },
      { status: 500 },
    );
  }
}
