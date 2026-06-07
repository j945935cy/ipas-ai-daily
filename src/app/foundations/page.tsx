import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getRecentSentences, getTodaySentence, KIDS_COURSE } from "@/lib/sentences";
import { pageMetadata } from "@/lib/metadata";
import { AuthPanel } from "../ui/auth-panel";
import { PushButton } from "../ui/push-button";
import { SpeakButton } from "../ui/speak-button";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "AI 基礎概念",
  "用短概念拆解資料、模型、訓練、推論與評估等 iPAS AI 入門主題。",
);

export default async function FoundationsPage() {
  const [user, todaySentence, recentSentences] = await Promise.all([
    getCurrentUser(),
    getTodaySentence(KIDS_COURSE),
    getRecentSentences(KIDS_COURSE),
  ]);

  return (
    <main className="shell kids-shell">
      <section className="topbar" aria-label="主要頁面">
        <div>
          <p className="eyebrow">AI Foundations</p>
          <h1>AI 基礎概念</h1>
        </div>
        <AuthPanel user={user} />
      </section>

      <nav className="main-nav" aria-label="主要頁面">
        <Link href="/">入口站</Link>
        <Link href="/foundations">今日概念</Link>
        <Link href="/foundations/history">歷史概念</Link>
        <Link href="/daily">每日 AI 重點</Link>
        <Link href="/governance">資料與治理</Link>
        <Link href="/cases">AI 應用案例</Link>
        <Link href="/qa">考點問答</Link>
        {user?.isAdmin ? <Link href="/admin">管理後台</Link> : null}
      </nav>

      <section className="learning-layout">
        <article className="lesson">
          <div className="lesson-date">
            {todaySentence.publishDate.toLocaleDateString("zh-TW", {
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </div>
          <p className="sentence">{todaySentence.sentence}</p>
          <SpeakButton text={todaySentence.sentence} />
          <p className="translation">{todaySentence.translation}</p>

          <div className="explain-grid">
            <section>
              <h2>核心觀念</h2>
              <p>{todaySentence.grammarNote}</p>
            </section>
            <section>
              <h2>複習提示</h2>
              <p>{todaySentence.usageNote}</p>
            </section>
            <section>
              <h2>單字</h2>
              <p>{todaySentence.vocabulary}</p>
            </section>
            <section>
              <h2>再練一句</h2>
              <p>{todaySentence.example}</p>
            </section>
          </div>
        </article>

        <aside className="side-panel">
          <div className="panel-block">
            <h2>每日信訂閱</h2>
            <p>登入後可訂閱 AI 基礎概念每日信。每天用短概念建立 AI 基礎。</p>
            <PushButton isSignedIn={Boolean(user)} courseId={KIDS_COURSE} />
          </div>

          <div className="panel-block">
            <h2>最近句子</h2>
            <div className="history-list compact">
              {recentSentences.map((item) => (
                <Link key={item.id} href="/foundations/history" className="history-item">
                  <time>
                    {item.publishDate.toLocaleDateString("zh-TW", {
                      month: "numeric",
                      day: "numeric",
                    })}
                  </time>
                  <p>{item.sentence}</p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
