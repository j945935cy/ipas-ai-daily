"use client";

import { useEffect, useState } from "react";

type Props = {
  isSignedIn: boolean;
  courseId?: string;
};

export function PushButton({ isSignedIn, courseId = "ipas-daily" }: Props) {
  const [subscribed, setSubscribed] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function toggleSubscription() {
    setMessage("");

    if (!isSignedIn) {
      setMessage("請先註冊或登入，再訂閱每日信。");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/mail/subscriptions", {
        method: subscribed ? "DELETE" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          pageUrl: subscribed ? undefined : window.location.href,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.error ?? "訂閱設定失敗，請稍後再試。");
        return;
      }

      setSubscribed(!subscribed);
      setMessage(subscribed ? "已取消這個分類的每日信。" : "已加入這個分類的每日信。每天會寄一封摘要信。");
    } catch {
      setMessage("訂閱設定失敗，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadSubscription() {
      if (!isSignedIn) {
        setSubscribed(false);
        return;
      }

      const response = await fetch("/api/mail/subscriptions", { credentials: "same-origin" });
      const data = await response.json().catch(() => ({}));

      if (!active || !response.ok) {
        return;
      }

      const isSubscribed = Boolean(data.courseIds?.includes(courseId));
      setSubscribed(isSubscribed);

      if (isSubscribed) {
        fetch("/api/mail/subscriptions", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId, pageUrl: window.location.href }),
        }).catch(() => undefined);
      }
    }

    loadSubscription();

    return () => {
      active = false;
    };
  }, [courseId, isSignedIn]);

  return (
    <div className="push-actions">
      <button type="button" className="primary-button" onClick={toggleSubscription} disabled={loading}>
        {loading ? "處理中" : subscribed ? "取消每日信" : "訂閱每日信"}
      </button>
      {message ? <p className="form-message">{message}</p> : null}
    </div>
  );
}
