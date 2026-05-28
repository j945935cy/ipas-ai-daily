import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getRecentSentences, getTodaySentence, PATTERN_COURSE } from "@/lib/sentences";
import { pageMetadata } from "@/lib/metadata";
import { AuthPanel } from "../ui/auth-panel";
import { PushButton } from "../ui/push-button";
import { SpeakButton } from "../ui/speak-button";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "AI 應用案例",
  "每天拆解一個 AI 應用案例，練習判斷需求、資料、效益、限制與導入風險。",
);

export default async function CasesPage() {
  const [user, todayCase, recentCases] = await Promise.all([
    getCurrentUser(),
    getTodaySentence(PATTERN_COURSE),
    getRecentSentences(PATTERN_COURSE),
  ]);

  return (
    <main className="shell pattern-shell">
      <section className="topbar" aria-label="主選單">
        <div>
          <p className="eyebrow">AI Use Cases</p>
          <h1>AI 應用案例</h1>
        </div>
        <AuthPanel user={user} />
      </section>

      <nav className="main-nav" aria-label="主選單">
        <Link href="/">回首頁</Link>
        <Link href="/cases">今日案例</Link>
        <Link href="/cases/history">歷史案例</Link>
        <Link href="/daily">每日 AI 重點</Link>
        <Link href="/foundations">AI 基礎概念</Link>
        <Link href="/governance">資料與治理</Link>
        <Link href="/qa">考點問答</Link>
        {user?.isAdmin ? <Link href="/admin">管理後台</Link> : null}
      </nav>

      <section className="learning-layout">
        <article className="lesson">
          <div className="lesson-date">
            {todayCase.publishDate.toLocaleDateString("zh-TW", {
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </div>
          <p className="sentence pattern-title">{todayCase.sentence}</p>
          <SpeakButton text={todayCase.example} />
          <p className="translation">{todayCase.translation}</p>

          <div className="explain-grid">
            <section>
              <h2>案例重點</h2>
              <p>{todayCase.grammarNote}</p>
            </section>
            <section>
              <h2>導入提醒</h2>
              <p>{todayCase.usageNote}</p>
            </section>
            <section>
              <h2>關鍵詞</h2>
              <p>{todayCase.vocabulary}</p>
            </section>
            <section>
              <h2>情境例子</h2>
              <p>{todayCase.example}</p>
            </section>
          </div>
        </article>

        <aside className="side-panel">
          <div className="panel-block">
            <h2>手機提醒</h2>
            <p>登入後可以訂閱 AI 應用案例推播，讓手機每天收到一個導入情境與風險提醒。</p>
            <PushButton isSignedIn={Boolean(user)} courseId={PATTERN_COURSE} />
          </div>

          <div className="panel-block">
            <h2>最近案例</h2>
            <div className="history-list compact">
              {recentCases.map((item) => (
                <Link key={item.id} href="/cases/history" className="history-item">
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
