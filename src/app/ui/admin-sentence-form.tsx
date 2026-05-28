"use client";

import { FormEvent, useState } from "react";
import {
  DEFAULT_COURSE,
  GRAMMAR_COURSE,
  KIDS_COURSE,
  PATTERN_COURSE,
  CHAT_COURSE,
} from "@/lib/courses";

type Props = {
  defaultDate?: string;
};

export function AdminSentenceForm({ defaultDate }: Props) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const response = await fetch("/api/admin/sentences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json();
      setMessage(data.error ?? "儲存失敗。");
      return;
    }

    setMessage("已儲存每日內容。");
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <div>
        <p className="eyebrow">Admin</p>
        <h2>新增或更新每日內容</h2>
      </div>

      <label>
        課程
        <select name="courseId" defaultValue={DEFAULT_COURSE}>
          <option value={DEFAULT_COURSE}>每日 AI 重點</option>
          <option value={KIDS_COURSE}>AI 基礎概念</option>
          <option value={GRAMMAR_COURSE}>資料與治理</option>
          <option value={PATTERN_COURSE}>AI 應用案例</option>
          <option value={CHAT_COURSE}>考點問答</option>
        </select>
      </label>
      <label>
        發布日期
        <input name="publishDate" type="date" defaultValue={defaultDate} required />
      </label>
      <label>
        今日重點、名詞或標題
        <input name="sentence" required />
      </label>
      <label>
        說明
        <textarea name="translation" required />
      </label>
      <label>
        核心觀念
        <textarea name="grammarNote" required />
      </label>
      <label>
        用法或練習
        <textarea name="usageNote" required />
      </label>
      <label>
        關鍵詞
        <textarea name="vocabulary" required />
      </label>
      <label>
        延伸例題或提醒
        <input name="example" required />
      </label>

      <button type="submit" className="primary-button" disabled={loading}>
        {loading ? "儲存中" : "儲存內容"}
      </button>
      {message ? <p className="form-message">{message}</p> : null}
    </form>
  );
}
