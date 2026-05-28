"use client";

import { FormEvent, useState } from "react";
import type { SessionUser } from "@/lib/auth";

type Props = {
  user: SessionUser | null;
};

export function AuthPanel({ user }: Props) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error ?? "操作失敗，請再試一次。");
      return;
    }

    window.location.reload();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  }

  if (user) {
    return (
      <div className="auth-card signed-in">
        <div>
          <span>已登入</span>
          <strong>{user.name || user.email}</strong>
        </div>
        <button type="button" className="ghost-button" onClick={logout}>
          登出
        </button>
      </div>
    );
  }

  return (
    <form className="auth-card" onSubmit={submit}>
      <div className="segmented" role="tablist" aria-label="登入或註冊">
        <button
          type="button"
          className={mode === "register" ? "active" : ""}
          onClick={() => setMode("register")}
        >
          註冊
        </button>
        <button
          type="button"
          className={mode === "login" ? "active" : ""}
          onClick={() => setMode("login")}
        >
          登入
        </button>
      </div>

      {mode === "register" ? (
        <label>
          名稱
          <input name="name" autoComplete="name" placeholder="Jack" />
        </label>
      ) : null}

      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>

      <label>
        密碼
        <input
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={8}
          required
        />
      </label>

      <button type="submit" className="primary-button" disabled={loading}>
        {loading ? "處理中" : mode === "register" ? "建立帳號" : "登入"}
      </button>
      {message ? <p className="form-message">{message}</p> : null}
    </form>
  );
}
