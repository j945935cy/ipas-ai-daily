"use client";

import { useState } from "react";

export function PushTestPanel() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendTest() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/mail/send-daily", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? "每日信測試失敗。");
        return;
      }

      if (data.skipped) {
        setMessage("每日信略過：沒有訂閱者或沒有今日內容。");
        return;
      }

      setMessage(`每日信寄送完成：成功 ${data.sent} 筆，失敗 ${data.failed} 筆。`);
    } catch {
      setMessage("每日信測試失敗，請確認伺服器狀態與 SMTP 設定。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="tool-panel">
      <div>
        <p className="eyebrow">Mail</p>
        <h2>每日信寄送測試</h2>
      </div>
      <p>
        先用正式帳號訂閱每日信，再按這個按鈕。若信箱收到今日內容，代表訂閱與 SMTP
        都已打通。
      </p>
      <button type="button" className="primary-button" onClick={sendTest} disabled={loading}>
        {loading ? "寄送中" : "寄送今日每日信測試"}
      </button>
      {message ? <p className="form-message">{message}</p> : null}
    </section>
  );
}
