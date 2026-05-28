import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ViewTracker } from "./ui/view-tracker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "iPAS AI Daily",
    template: "%s",
  },
  description: "iPAS AI Daily 是為 iPAS 人工智慧應用規劃師準備的每日學習站，透過每日重點、概念解釋與練習提醒累積 AI 證照備考節奏。",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ViewTracker />
        {children}
      </body>
    </html>
  );
}
