import type { getViewStats } from "@/lib/analytics";

type Props = {
  stats: Awaited<ReturnType<typeof getViewStats>>;
};

export function AnalyticsPanel({ stats }: Props) {
  return (
    <section className="tool-panel analytics-panel">
      <div>
        <p className="eyebrow">Analytics</p>
        <h2>瀏覽人數統計</h2>
      </div>

      <div className="stats-grid">
        <div>
          <span>總瀏覽</span>
          <strong>{stats.totalViews}</strong>
        </div>
        <div>
          <span>今日瀏覽</span>
          <strong>{stats.todayViews}</strong>
        </div>
        <div>
          <span>近 7 天</span>
          <strong>{stats.weekViews}</strong>
        </div>
        <div>
          <span>訪客數</span>
          <strong>{stats.uniqueVisitors}</strong>
        </div>
      </div>

      <div className="analytics-list">
        <h3>熱門頁面</h3>
        {stats.topPaths.length ? (
          stats.topPaths.map((item) => (
            <p key={item.path}>
              <span>{item.path}</span>
              <strong>{item.views}</strong>
            </p>
          ))
        ) : (
          <p>尚無資料</p>
        )}
      </div>
    </section>
  );
}
