import { ApplicationStatusForm } from "@/components/admin/application-status-form";
import { applicationStatusLabelMap } from "@/lib/constants";
import { db } from "@/lib/db";
import { requireAdminPageSession } from "@/lib/admin-page";

export default async function ApplicationsPage() {
  const session = await requireAdminPageSession();
  const applications = await db.application.findMany({
    where:
      session.admin.role === "SUPER_ADMIN"
        ? undefined
        : {
            job: {
              createdById: session.admin.id,
            },
          },
    include: {
      candidate: {
        include: {
          profile: true,
        },
      },
      job: {
        include: {
          company: true,
        },
      },
    },
    orderBy: {
      appliedAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-teal-600">报名管理</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">跟进报名到入职的全过程</h2>
      </section>

      <section className="space-y-6">
        {applications.map((application) => (
          <div key={application.id} className="rounded-[2rem] bg-white p-8 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
              <div>
                <p className="text-sm text-slate-500">
                  {application.job.company.name} · {application.job.title}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                  {application.candidate.profile?.realName || application.candidate.wechatNickname || "未填写姓名"}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  当前状态：{applicationStatusLabelMap[application.status]} · 手机号{" "}
                  {application.candidate.phone || "未填"}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {application.candidate.profile?.workExperience || "暂无工作经历说明"}
                </p>
              </div>
              <ApplicationStatusForm
                applicationId={application.id}
                defaultStatus={application.status}
              />
            </div>
          </div>
        ))}
        {applications.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-8 text-sm text-slate-500 shadow-sm">
            目前还没有报名记录
          </div>
        ) : null}
      </section>
    </div>
  );
}
