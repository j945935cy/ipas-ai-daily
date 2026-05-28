import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ensureDatabase, prisma } from "@/lib/prisma";
import { pageMetadata } from "@/lib/metadata";
import { UserManager } from "@/app/ui/user-manager";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata("使用者管理", "管理會員帳號、角色與密碼。");

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser?.isAdmin) {
    redirect("/");
  }

  await ensureDatabase();

  const users = await prisma.user.findMany({
    orderBy: [{ isAdmin: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          learningHistory: true,
          pushSubscriptions: true,
        },
      },
    },
  });

  return (
    <main className="shell">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>使用者管理</h1>
        </div>
        <div className="admin-actions">
          <Link href="/admin" className="ghost-button">
            管理後台
          </Link>
          <Link href="/" className="ghost-button">
            回首頁
          </Link>
        </div>
      </section>

      <UserManager
        currentUserId={currentUser.id}
        initialUsers={users.map((user) => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        }))}
      />
    </main>
  );
}
