import { ApplicationStatus, AuditStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { requireAdminPageSession } from "@/lib/admin-page";

export default async function DashboardPage() {
  const session = await requireAdminPageSession();
  const recruiterFilter =
    session.admin.role === "SUPER_ADMIN" ? {} : { createdById: session.admin.id };

  const [jobCount, reviewCount, applicationCount, onboardedCount, recentJobs, recentApplications] =
    await Promise.all([
      db.job.count({ where: recruiterFilter }),
      db.job.count({ where: { ...recruiterFilter, auditStatus: AuditStatus.PENDING } }),
      db.application.count({
        where:
          session.admin.role === "SUPER_ADMIN"
            ? undefined
            : { job: { createdById: session.admin.id } },
      }),
      db.application.count({
        where:
          session.admin.role === "SUPER_ADMIN"
            ? { status: ApplicationStatus.ONBOARDED }
            : { status: ApplicationStatus.ONBOARDED, job: { createdById: session.admin.id } },
      }),
      db.job.findMany({
        where: recruiterFilter,
        include: { company: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.application.findMany({
        where:
          session.admin.role === "SUPER_ADMIN"
            ? undefined
            : { job: { createdById: session.admin.id } },
        include: {
          candidate: { include: { profile: true } },
          job: true,
        },
        orderBy: { appliedAt: "desc" },
        take: 5,
      }),
    ]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-teal-600">后台总览</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">今天继续把岗位和报名跑起来</h2>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          您当前看到的是可上线版后台骨架，已经接了数据库模型、认证、审核流、报名流和通知接口。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["岗位总数", jobCount],
          ["待审", reviewCount],
          ["报名总数", applicationCount],
          ["已入", onboardedCount],
        ].map(([title, value]) => (
          <div key={title} className="rounded-[1.5rem] bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">{title}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">最近岗位</h3>
          <div className="mt-4 space-y-4">
            {recentJobs.map((job) => (
              <div key={job.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-medium text-slate-900">{job.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {job.company.name} · {job.district} · {job.auditStatus}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">最近报名</h3>
          <div className="mt-4 space-y-4">
            {recentApplications.map((application) => (
              <div key={application.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-medium text-slate-900">
                  {application.candidate.profile?.realName || application.candidate.wechatNickname || "未填"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {application.job.title} · {application.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
