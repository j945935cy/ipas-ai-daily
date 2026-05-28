"use client";

import { useEffect, useState } from "react";

type Props = {
  text: string;
};

export function SpeakButton({ text }: Props) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function speak() {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setMessage("這個瀏覽器不支援朗讀功能。");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.88;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setMessage("朗讀失敗，請稍後再試。");
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setMessage("");
    setIsSpeaking(true);
  }

  return (
    <div className="speak-control">
      <button type="button" className="speak-button" onClick={speak} aria-label={isSpeaking ? "停止朗讀今日重點" : "朗讀今日重點"}>
        <span aria-hidden="true">{isSpeaking ? "■" : "▶"}</span>
        {isSpeaking ? "停止朗讀" : "朗讀內容"}
      </button>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
