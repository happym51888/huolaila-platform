import type { NextRequest } from "next/server";

import { AuditStatus, EducationLevel, EmploymentMode, GenderRequirement, SalaryUnit, SettlementCycle } from "@prisma/client";
import { created } from "@/app/api/_lib/response";
import { internalError, unauthorized, validationError } from "@/app/api/_lib/errors";
import { parseBody } from "@/app/api/_lib/validation";
import { getRecruitActorAdmin, requireRecruitAdminCandidateSession } from "@/app/api/_lib/recruit-admin";
import { db } from "@/lib/db";
import { miniappRecruitCreateJobSchema } from "@/lib/schemas";

const modeMap: Record<string, EmploymentMode> = {
  "长期工": EmploymentMode.FULL_TIME,
  "短期工": EmploymentMode.SHORT_TERM,
  "临时工": EmploymentMode.TEMPORARY,
  "兼职": EmploymentMode.PART_TIME,
};

const settlementMap: Record<string, SettlementCycle> = {
  "月结": SettlementCycle.MONTHLY,
  "周结": SettlementCycle.WEEKLY,
  "日结": SettlementCycle.DAILY,
  "时结": SettlementCycle.HOURLY,
};

export async function POST(request: NextRequest) {
  try {
    const session = await requireRecruitAdminCandidateSession(request);
    if (!session) {
      return unauthorized();
    }

    const { data, error } = await parseBody(request, miniappRecruitCreateJobSchema);
    if (error) {
      return validationError(error);
    }

    const actorAdmin = await getRecruitActorAdmin();
    if (!actorAdmin) {
      return internalError("系统未初始化管理员账号");
    }

    const company = await db.hiringCompany.upsert({
      where: { name: data.company },
      update: {
        district: data.district,
        location: data.location,
      },
      create: {
        name: data.company,
        district: data.district,
        location: data.location,
      },
    });

    const settlementCycle = settlementMap[data.settlement] || SettlementCycle.MONTHLY;
    const job = await db.job.create({
      data: {
        title: data.title,
        industry: data.industry,
        district: data.district,
        location: data.location,
        employmentMode: modeMap[data.mode] || EmploymentMode.FULL_TIME,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        salaryUnit: SalaryUnit.MONTH,
        settlementCycle,
        ageMin: 16,
        ageMax: 55,
        genderRequirement: GenderRequirement.ANY,
        educationRequirement: EducationLevel.PRIMARY_MIDDLE,
        experienceRequirement: "不限",
        certificateRequirements: [],
        meals: data.meals || "",
        accommodation: data.accommodation || "",
        shifts: "",
        benefits: [],
        headcount: data.headcount,
        remainingCount: data.headcount,
        deadline: new Date("2099-12-31T00:00:00.000Z"),
        description: data.description,
        highlight: data.highlight || "",
        companyId: company.id,
        createdById: actorAdmin.id,
        auditStatus: AuditStatus.PENDING,
      },
    });

    return created({
      id: job.id,
      auditStatus: job.auditStatus,
    });
  } catch (error) {
    console.error("POST /api/miniapp/recruit/jobs", error);
    return internalError();
  }
}
