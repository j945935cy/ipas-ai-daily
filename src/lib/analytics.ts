import { ensureDatabase, prisma } from "./prisma";

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function daysAgo(days: number) {
  const date = startOfToday();
  date.setDate(date.getDate() - days);
  return date;
}

export async function getViewStats() {
  await ensureDatabase();

  const today = startOfToday();
  const sevenDaysAgo = daysAgo(6);

  const [totalViews, todayViews, weekViews, uniqueVisitors, topPaths, recentViews] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.count({ where: { createdAt: { gte: today } } }),
    prisma.pageView.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.pageView.findMany({
      distinct: ["visitorId"],
      where: { visitorId: { not: null } },
      select: { visitorId: true },
    }),
    prisma.pageView.groupBy({
      by: ["path"],
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 5,
    }),
    prisma.pageView.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, path: true, createdAt: true },
    }),
  ]);

  return {
    totalViews,
    todayViews,
    weekViews,
    uniqueVisitors: uniqueVisitors.length,
    topPaths: topPaths.map((item) => ({ path: item.path, views: item._count.path })),
    recentViews,
  };
}
