"use client";

import { useEffect } from "react";

function getVisitorId() {
  const key = "daily-english-visitor-id";
  let visitorId = window.localStorage.getItem(key);

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    window.localStorage.setItem(key, visitorId);
  }

  return visitorId;
}

export function ViewTracker() {
  useEffect(() => {
    const payload = JSON.stringify({
      path: window.location.pathname,
      visitorId: getVisitorId(),
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/view", new Blob([payload], { type: "application/json" }));
      return;
    }

    fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
}
