import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getViewStats } from "@/lib/analytics";
import { getAllSentences } from "@/lib/sentences";
import { pageMetadata } from "@/lib/metadata";
import { AdminSentenceForm } from "../ui/admin-sentence-form";
import { AnalyticsPanel } from "../ui/analytics-panel";
import { PushTestPanel } from "../ui/push-test-panel";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "管理後台",
  "管理每日今日重點、查看瀏覽統計、測試推播與管理使用者。",
);

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user?.isAdmin) {
    redirect("/");
  }

  const [sentences, stats] = await Promise.all([getAllSentences(), getViewStats()]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="shell">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>管理後台</h1>
        </div>
        <div className="admin-actions">
          <Link href="/admin/users" className="ghost-button">
            使用者管理
          </Link>
          <Link href="/" className="ghost-button">
            回首頁
          </Link>
        </div>
      </section>

      <section className="admin-layout">
        <div className="admin-main-column">
          <AnalyticsPanel stats={stats} />
          <AdminSentenceForm defaultDate={today} />
        </div>
        <PushTestPanel />
      </section>

      <section className="list-section">
        <div className="section-title">
          <h2>已建立的句子</h2>
          <span>{sentences.length} 筆</span>
        </div>
        <div className="history-list">
          {sentences.map((item) => (
            <article key={item.id} className="history-card">
              <time>
                {item.publishDate.toLocaleDateString("zh-TW", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <h3>{item.sentence}</h3>
              <p>
                {item.course.name} - {item.translation}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
