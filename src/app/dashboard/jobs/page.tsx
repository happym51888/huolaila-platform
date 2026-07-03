import Link from "next/link";

import { auditStatusLabelMap, formatSalary } from "@/lib/constants";
import { db } from "@/lib/db";
import { requireAdminPageSession } from "@/lib/admin-page";

export default async function JobsPage() {
  const session = await requireAdminPageSession();
  const jobs = await db.job.findMany({
    where:
      session.admin.role === "SUPER_ADMIN"
        ? undefined
        : {
            createdById: session.admin.id,
          },
    include: {
      company: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between rounded-[2rem] bg-white p-8 shadow-sm">
        <div>
          <p className="text-sm font-medium text-teal-600">岗位管理</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">发布、编辑和跟踪岗位</h2>
        </div>
        <Link
          className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-teal-700"
          href="/dashboard/jobs/new"
        >
          新建岗位
        </Link>
      </section>

      <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["岗位", "企业", "区域", "薪资", "状", "操作"].map((title) => (
                <th key={title} className="px-6 py-4 font-medium text-slate-500">
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900">{job.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{job.industry}</p>
                </td>
                <td className="px-6 py-4 text-slate-600">{job.company.name}</td>
                <td className="px-6 py-4 text-slate-600">{job.district}</td>
                <td className="px-6 py-4 text-slate-600">
                  {formatSalary(job)}
                </td>
                <td className="px-6 py-4 text-slate-600">{auditStatusLabelMap[job.auditStatus]}</td>
                <td className="px-6 py-4">
                  <Link className="text-teal-600 hover:text-teal-700" href={`/dashboard/jobs/${job.id}`}>
                    编辑
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
