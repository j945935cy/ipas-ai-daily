"use client";

import { useState } from "react";

export function PushTestPanel() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendTest() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/push/send-daily", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? "推播測試失敗。");
        return;
      }

      if (data.skipped) {
        setMessage("推播略過：尚未設定 VAPID key 或沒有今日句子。");
        return;
      }

      setMessage(`推播完成：成功 ${data.sent} 筆，失敗 ${data.failed} 筆。`);
    } catch {
      setMessage("推播測試失敗，請確認伺服器狀態。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="tool-panel">
      <div>
        <p className="eyebrow">Push</p>
        <h2>手機推播實機測試</h2>
      </div>
      <p>
        先用手機登入正式網址並允許通知，再按這個按鈕。若手機收到今日句子，代表訂閱與 Web Push
        都已打通。
      </p>
      <button type="button" className="primary-button" onClick={sendTest} disabled={loading}>
        {loading ? "發送中" : "發送今日句子測試"}
      </button>
      {message ? <p className="form-message">{message}</p> : null}
    </section>
  );
}
