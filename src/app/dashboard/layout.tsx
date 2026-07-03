import Link from "next/link";

import { LogoutButton } from "@/components/admin/logout-button";
import { requireAdminPageSession } from "@/lib/admin-page";

const navItems = [
  { href: "/dashboard", label: "总览" },
  { href: "/dashboard/jobs", label: "岗位管理" },
  { href: "/dashboard/reviews", label: "审核中心" },
  { href: "/dashboard/applications", label: "报名管理" },
  { href: "/dashboard/messages", label: "消息中心" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminPageSession();

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-6">
        <aside className="sticky top-6 h-[calc(100vh-3rem)] w-72 rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm text-teal-300">活来了后台</p>
          <h1 className="mt-3 text-2xl font-semibold">{session.admin.name}</h1>
          <p className="mt-2 text-sm text-slate-400">{session.admin.role}</p>
          <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className="block rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8">
            <LogoutButton />
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
