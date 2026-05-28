import Link from "next/link";
import { getAllSentences, PATTERN_COURSE } from "@/lib/sentences";
import { pageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "AI 應用案例歷史",
  "瀏覽 AI 應用案例的歷史案例、案例重點、導入提醒與情境例子。",
);

export default async function CasesHistoryPage() {
  const patterns = await getAllSentences(PATTERN_COURSE);

  return (
    <main className="shell pattern-shell">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Cases Archive</p>
          <h1>AI 應用案例歷史</h1>
        </div>
        <Link href="/cases" className="ghost-button">
          回到 AI 應用案例
        </Link>
      </section>

      <section className="history-page-list">
        {patterns.map((item) => (
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
                <strong>案例重點</strong>
                <p>{item.grammarNote}</p>
              </div>
              <div>
                <strong>情境例子</strong>
                <p>{item.example}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
