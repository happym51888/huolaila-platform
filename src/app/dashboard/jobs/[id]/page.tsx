import { notFound } from "next/navigation";

import { JobForm } from "@/components/admin/job-form";
import { db } from "@/lib/db";
import { requireAdminPageSession } from "@/lib/admin-page";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdminPageSession();
  const { id } = await params;

  const [companies, job] = await Promise.all([
    db.hiringCompany.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    db.job.findUnique({
      where: { id },
    }),
  ]);

  if (!job) {
    notFound();
  }

  if (session.admin.role !== "SUPER_ADMIN" && job.createdById !== session.admin.id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-teal-600">编辑岗位</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">{job.title}</h2>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-sm">
        <JobForm
          companies={companies}
          job={{
            id: job.id,
            auditStatus: job.auditStatus,
            title: job.title,
            industry: job.industry,
            district: job.district,
            location: job.location,
            employmentMode: job.employmentMode,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            salaryUnit: job.salaryUnit,
            settlementCycle: job.settlementCycle,
            ageMin: job.ageMin,
            ageMax: job.ageMax,
            genderRequirement: job.genderRequirement,
            educationRequirement: job.educationRequirement,
            experienceRequirement: job.experienceRequirement,
            certificateRequirements: Array.isArray(job.certificateRequirements)
              ? job.certificateRequirements.map(String)
              : [],
            meals: job.meals,
            accommodation: job.accommodation,
            shifts: job.shifts,
            benefits: Array.isArray(job.benefits) ? job.benefits.map(String) : [],
            headcount: job.headcount,
            remainingCount: job.remainingCount,
            deadline: job.deadline.toISOString(),
            description: job.description,
            highlight: job.highlight,
            companyId: job.companyId,
          }}
        />
      </section>
    </div>
  );
}
