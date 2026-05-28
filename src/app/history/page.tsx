import Link from "next/link";
import { DEFAULT_COURSE, getAllSentences } from "@/lib/sentences";
import { pageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "每日 AI 重點歷史句子",
  "瀏覽每日 AI 重點的歷史句子、中文解釋、文法重點與延伸例句。",
);

export default async function HistoryPage() {
  const sentences = await getAllSentences(DEFAULT_COURSE);

  return (
    <main className="shell">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Archive</p>
          <h1>每日 AI 重點歷史句子</h1>
        </div>
        <Link href="/daily" className="ghost-button">
          回到每日 AI 重點
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
                <strong>句型</strong>
                <p>{item.grammarNote}</p>
              </div>
              <div>
                <strong>單字</strong>
                <p>{item.vocabulary}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
