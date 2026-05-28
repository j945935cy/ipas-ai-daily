"use client";

import { useState } from "react";

type Props = {
  isSignedIn: boolean;
  courseId?: string;
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function pushErrorMessage(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "通知權限未開啟，請在瀏覽器網址列左側的網站設定允許通知。";
    }

    if (error.name === "InvalidStateError") {
      return "瀏覽器保留了舊的推播訂閱，請重新整理後再按一次。";
    }
  }

  return "訂閱失敗，請確認通知權限已允許，並重新整理頁面後再試。";
}

export function PushButton({ isSignedIn, courseId = "daily-english" }: Props) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function subscribe() {
    setMessage("");

    if (!isSignedIn) {
      setMessage("請先註冊或登入。");
      return;
    }

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setMessage("這個瀏覽器目前不支援 Web Push。");
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!publicKey) {
      setMessage("尚未設定 VAPID public key，請先完成環境變數設定。");
      return;
    }

    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setMessage("通知權限未開啟。");
        return;
      }

      const oldSubscription = await registration.pushManager.getSubscription();

      if (oldSubscription) {
        await oldSubscription.unsubscribe();
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...subscription.toJSON(), courseId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setMessage(data.error ?? "訂閱失敗，請重新登入後再試。");
        return;
      }

      setMessage("已重新訂閱每日推送。");
    } catch (error) {
      setMessage(pushErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="push-actions">
      <button type="button" className="primary-button" onClick={subscribe} disabled={loading}>
        {loading ? "訂閱中" : "開啟每日推送"}
      </button>
      {message ? <p className="form-message">{message}</p> : null}
    </div>
  );
}
