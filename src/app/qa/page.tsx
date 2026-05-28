import Link from "next/link";
import { CHAT_COURSE, getRecentSentences, getTodaySentence } from "@/lib/sentences";
import { getCurrentUser } from "@/lib/auth";
import { pageMetadata } from "@/lib/metadata";
import { AuthPanel } from "../ui/auth-panel";
import { PushButton } from "../ui/push-button";
import { SpeakButton } from "../ui/speak-button";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "考點問答",
  "每天用問答形式複習 iPAS AI 常見考點，快速辨識容易混淆的觀念。",
);

export default async function QaPage() {
  const [user, todayLesson, recentLessons] = await Promise.all([
    getCurrentUser(),
    getTodaySentence(CHAT_COURSE),
    getRecentSentences(CHAT_COURSE),
  ]);

  return (
    <main className="shell chat-shell">
      <section className="topbar" aria-label="頁首">
        <div>
          <p className="eyebrow">Q&A Drill</p>
          <h1>考點問答</h1>
        </div>
        <AuthPanel user={user} />
      </section>

      <nav className="main-nav" aria-label="主選單">
        <Link href="/">首頁</Link>
        <Link href="/qa">今日考點問答</Link>
        <Link href="/qa/history">考點問答歷史</Link>
        <Link href="/daily">每日 AI 重點</Link>
        <Link href="/foundations">AI 基礎概念</Link>
        <Link href="/governance">資料與治理</Link>
        <Link href="/cases">AI 應用案例</Link>
        {user?.isAdmin ? <Link href="/admin">管理後台</Link> : null}
      </nav>

      <section className="learning-layout">
        <article className="lesson">
          <div className="lesson-date">
            {todayLesson.publishDate.toLocaleDateString("zh-TW", {
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </div>
          <p className="sentence chat-title">{todayLesson.sentence}</p>
          <SpeakButton text={todayLesson.sentence} />
          <p className="translation">{todayLesson.translation}</p>

          <div className="explain-grid">
            <section>
              <h2>核心觀念</h2>
              <p>{todayLesson.grammarNote}</p>
            </section>
            <section>
              <h2>解題提示</h2>
              <p>{todayLesson.usageNote}</p>
            </section>
            <section>
              <h2>關鍵詞</h2>
              <p>{todayLesson.vocabulary}</p>
            </section>
            <section>
              <h2>例子</h2>
              <p>{todayLesson.example}</p>
            </section>
          </div>
        </article>

        <aside className="side-panel">
          <div className="panel-block">
            <h2>訂閱考點問答</h2>
            <p>登入後可以訂閱每日考點問答推播，每天練一個iPAS AI 考試常見觀念。</p>
            <PushButton isSignedIn={Boolean(user)} courseId={CHAT_COURSE} />
          </div>

          <div className="panel-block">
            <h2>最近考點問答</h2>
            <div className="history-list compact">
              {recentLessons.map((item) => (
                <Link key={item.id} href="/qa/history" className="history-item">
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
