import Link from "next/link";
import { getAllSentences, GRAMMAR_COURSE } from "@/lib/sentences";
import { pageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "資料與治理歷史概念",
  "瀏覽資料與治理的歷史單元、治理重點、中文解釋與情境例子。",
);

export default async function GovernanceHistoryPage() {
  const sentences = await getAllSentences(GRAMMAR_COURSE);

  return (
    <main className="shell grammar-shell">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Governance Archive</p>
          <h1>資料與治理歷史單元</h1>
        </div>
        <Link href="/governance" className="ghost-button">
          回到資料與治理
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
                <strong>治理重點</strong>
                <p>{item.grammarNote}</p>
              </div>
              <div>
                <strong>案例提醒</strong>
                <p>{item.example}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
