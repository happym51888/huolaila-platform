import { JobForm } from "@/components/admin/job-form";
import { db } from "@/lib/db";

export default async function NewJobPage() {
  const companies = await db.hiringCompany.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-teal-600">新建岗位</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">发布一个新的招聘岗位</h2>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-sm">
        <JobForm companies={companies} job={null} />
      </section>
    </div>
  );
}
