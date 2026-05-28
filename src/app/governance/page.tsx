import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getRecentSentences, getTodaySentence, GRAMMAR_COURSE } from "@/lib/sentences";
import { pageMetadata } from "@/lib/metadata";
import { AuthPanel } from "../ui/auth-panel";
import { PushButton } from "../ui/push-button";
import { SpeakButton } from "../ui/speak-button";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "資料與治理",
  "每天複習資料品質、隱私、偏誤、權限、合規與 AI 治理常考主題。",
);

export default async function GovernancePage() {
  const [user, todaySentence, recentSentences] = await Promise.all([
    getCurrentUser(),
    getTodaySentence(GRAMMAR_COURSE),
    getRecentSentences(GRAMMAR_COURSE),
  ]);

  return (
    <main className="shell grammar-shell">
      <section className="topbar" aria-label="主要頁面">
        <div>
          <p className="eyebrow">Data Governance</p>
          <h1>資料與治理</h1>
        </div>
        <AuthPanel user={user} />
      </section>

      <nav className="main-nav" aria-label="主要頁面">
        <Link href="/">入口站</Link>
        <Link href="/governance">今日治理</Link>
        <Link href="/governance/history">歷史治理</Link>
        <Link href="/daily">每日 AI 重點</Link>
        <Link href="/foundations">AI 基礎概念</Link>
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
          <p className="sentence grammar-title">{todaySentence.sentence}</p>
          <SpeakButton text={todaySentence.example} />
          <p className="translation">{todaySentence.translation}</p>

          <div className="explain-grid">
            <section>
              <h2>治理重點</h2>
              <p>{todaySentence.grammarNote}</p>
            </section>
            <section>
              <h2>複習提示</h2>
              <p>{todaySentence.usageNote}</p>
            </section>
            <section>
              <h2>關鍵字</h2>
              <p>{todaySentence.vocabulary}</p>
            </section>
            <section>
              <h2>案例提醒</h2>
              <p>{todaySentence.example}</p>
            </section>
          </div>
        </article>

        <aside className="side-panel">
          <div className="panel-block">
            <h2>手機推送</h2>
            <p>登入後可訂閱資料與治理通知。每天複習一個治理觀念，累積風險判斷力。</p>
            <PushButton isSignedIn={Boolean(user)} courseId={GRAMMAR_COURSE} />
          </div>

          <div className="panel-block">
            <h2>最近治理主題</h2>
            <div className="history-list compact">
              {recentSentences.map((item) => (
                <Link key={item.id} href="/governance/history" className="history-item">
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
