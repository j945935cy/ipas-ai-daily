import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { DEFAULT_COURSE, getRecentSentences, getTodaySentence } from "@/lib/sentences";
import { pageMetadata } from "@/lib/metadata";
import { AuthPanel } from "../ui/auth-panel";
import { PushButton } from "../ui/push-button";
import { SpeakButton } from "../ui/speak-button";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "每日 AI 重點",
  "每天整理一個 iPAS AI 備考核心觀念，搭配中文解釋、關鍵詞、例子與手機推播。",
);

export default async function DailyPage() {
  const [user, todaySentence, recentSentences] = await Promise.all([
    getCurrentUser(),
    getTodaySentence(DEFAULT_COURSE),
    getRecentSentences(DEFAULT_COURSE),
  ]);

  return (
    <main className="shell">
      <section className="topbar" aria-label="主要頁面">
        <div>
          <p className="eyebrow">Daily Focus</p>
          <h1>每日 AI 重點</h1>
        </div>
        <AuthPanel user={user} />
      </section>

      <nav className="main-nav" aria-label="主要頁面">
        <Link href="/">入口站</Link>
        <Link href="/daily">今日概念</Link>
        <Link href="/history">歷史概念</Link>
        <Link href="/foundations">AI 基礎概念</Link>
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
              <h2>關鍵詞</h2>
              <p>{todaySentence.vocabulary}</p>
            </section>
            <section>
              <h2>例子</h2>
              <p>{todaySentence.example}</p>
            </section>
          </div>
        </article>

        <aside className="side-panel">
          <div className="panel-block">
            <h2>手機推送</h2>
            <p>登入後可訂閱每日 AI 重點通知。手機會收到今天的備考重點，方便固定複習。</p>
            <PushButton isSignedIn={Boolean(user)} />
          </div>

          <div className="panel-block">
            <h2>最近重點</h2>
            <div className="history-list compact">
              {recentSentences.map((item) => (
                <Link key={item.id} href="/history" className="history-item">
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
