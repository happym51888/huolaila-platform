import { AuditStatus } from "@prisma/client";

import { ReviewActions } from "@/components/admin/review-actions";
import { db } from "@/lib/db";
import { requireAdminPageSession } from "@/lib/admin-page";

export default async function ReviewsPage() {
  const session = await requireAdminPageSession();
  const jobs = await db.job.findMany({
    where:
      session.admin.role === "SUPER_ADMIN"
        ? {
            auditStatus: AuditStatus.PENDING,
          }
        : {
            auditStatus: AuditStatus.PENDING,
            createdById: session.admin.id,
          },
    include: {
      company: true,
      createdBy: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-teal-600">审核中心</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">待审核岗位</h2>
      </section>

      <section className="space-y-6">
        {jobs.map((job) => (
          <div key={job.id} className="rounded-[2rem] bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm text-slate-500">
                  {job.company.name} · 提交"{job.createdBy.name}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">{job.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{job.description}</p>
              </div>
              <div className="w-full max-w-sm">
                <ReviewActions jobId={job.id} />
              </div>
            </div>
          </div>
        ))}
        {jobs.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-8 text-sm text-slate-500 shadow-sm">
            当前没有待审核岗位
          </div>
        ) : null}
      </section>
    </div>
  );
}
