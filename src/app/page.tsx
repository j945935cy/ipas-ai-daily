import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { pageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "首頁",
  "iPAS AI Daily 每日學習入口：用五個主題建立 iPAS 人工智慧應用規劃師的備考節奏。",
);

const sites = [
  {
    href: "/daily",
    label: "Daily Focus",
    title: "每日 AI 重點",
    description: "每天整理一個 iPAS AI 備考核心觀念，搭配白話說明、關鍵詞與例題方向。",
    sample: "監督式學習會使用已標註資料訓練模型。",
    tone: "daily",
  },
  {
    href: "/foundations",
    label: "Foundations",
    title: "AI 基礎概念",
    description: "用短句拆解資料、模型、訓練、推論與評估等入門概念。",
    sample: "資料品質會直接影響模型輸出品質。",
    tone: "kids",
  },
  {
    href: "/governance",
    label: "Data & Governance",
    title: "資料與治理",
    description: "整理資料來源、資料品質、隱私、偏誤、治理與法規倫理等常考主題。",
    sample: "個資處理需要同時考量目的、必要性與安全保護。",
    tone: "grammar",
  },
  {
    href: "/cases",
    label: "Use Cases",
    title: "AI 應用案例",
    description: "整合生活、產業與商業導入情境，練習判斷需求、資料、效益與風險。",
    sample: "預測維護會用設備資料提前辨識異常風險。",
    tone: "pattern",
  },
  {
    href: "/qa",
    label: "Q&A Drill",
    title: "考點問答",
    description: "用問答形式複習容易混淆的觀念，幫助考前快速回想。",
    sample: "分類與迴歸最大的差異是輸出型態。",
    tone: "chat",
  },
];

export default async function PortalPage() {
  const user = await getCurrentUser();

  return (
    <main className="shell portal-shell">
      <section className="portal-hero">
        <div>
          <p className="eyebrow">iPAS AI Daily</p>
          <h1>iPAS AI Daily</h1>
          <p>
            這裡把 iPAS 人工智慧應用規劃師的備考內容濃縮成五個每日主題。每天讀一個重點、複習一個概念、累積一點 AI 應用判斷力。
          </p>
        </div>
        <nav className="main-nav portal-nav" aria-label="主要頁面">
          <Link href="/daily">每日 AI 重點</Link>
          <Link href="/foundations">AI 基礎概念</Link>
          <Link href="/governance">資料與治理</Link>
          <Link href="/cases">AI 應用案例</Link>
          <Link href="/qa">考點問答</Link>
          {user?.isAdmin ? <Link href="/admin">管理後台</Link> : null}
        </nav>
      </section>

      <section className="portal-grid" aria-label="iPAS AI Daily 學習入口">
        {sites.map((site) => (
          <Link key={site.href} href={site.href} className={`portal-card ${site.tone}`}>
            <span>{site.label}</span>
            <h2>{site.title}</h2>
            <p>{site.description}</p>
            <blockquote>{site.sample}</blockquote>
            <strong>進入學習</strong>
          </Link>
        ))}
      </section>
    </main>
  );
}
