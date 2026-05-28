import Link from "next/link";
import { CHAT_COURSE, getAllSentences } from "@/lib/sentences";
import { pageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "考點問答歷史",
  "瀏覽考點問答的歷史內容，複習 iPAS AI 常見題型與容易混淆的觀念。",
);

export default async function QaHistoryPage() {
  const lessons = await getAllSentences(CHAT_COURSE);

  return (
    <main className="shell chat-shell">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Q&A Archive</p>
          <h1>考點問答歷史</h1>
        </div>
        <Link href="/qa" className="ghost-button">
          回到考點問答
        </Link>
      </section>

      <section className="history-page-list">
        {lessons.map((item) => (
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
                <strong>解題提示</strong>
                <p>{item.usageNote}</p>
              </div>
              <div>
                <strong>例子</strong>
                <p>{item.example}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
