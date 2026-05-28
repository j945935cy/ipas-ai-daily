import Link from "next/link";
import { getAllSentences, KIDS_COURSE } from "@/lib/sentences";
import { pageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "AI 基礎概念歷史",
  "瀏覽 AI 基礎概念的歷史內容、中文解釋、關鍵詞與例子。",
);

export default async function FoundationsHistoryPage() {
  const sentences = await getAllSentences(KIDS_COURSE);

  return (
    <main className="shell kids-shell">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Foundations Archive</p>
          <h1>AI 基礎概念歷史</h1>
        </div>
        <Link href="/foundations" className="ghost-button">
          回到 AI 基礎概念
        </Link>
      </section>

      <section className="history-page-list">
        {sentences.map((item) => (
          <article key={item.id} className="history-card">
            <time>
              {item.publishDate.toLocaleDateString("zh-TW", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </time>
            <h2>{item.sentence}</h2>
            <p className="translation">{item.translation}</p>
            <div className="mini-grid">
              <div>
                <strong>核心觀念</strong>
                <p>{item.grammarNote}</p>
              </div>
              <div>
                <strong>關鍵詞</strong>
                <p>{item.vocabulary}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
