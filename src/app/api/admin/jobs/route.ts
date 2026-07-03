import type { NextRequest } from "next/server";

import { Prisma } from "@prisma/client";
import { created, jsonList } from "@/app/api/_lib/response";
import {
  forbidden,
  internalError,
  unauthorized,
  validationError,
} from "@/app/api/_lib/errors";
import { requireAdminSession } from "@/app/api/_lib/admin";
import { parseBody, parseQuery } from "@/app/api/_lib/validation";
import { db } from "@/lib/db";
import { createJobSchema, jobListQuerySchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return unauthorized();
    }

    const { data, error } = parseQuery(request, jobListQuerySchema);
    if (error) {
      return validationError(error);
    }

    const where: Prisma.JobWhereInput = {};
    if (session.admin.role !== "SUPER_ADMIN") {
      where.createdById = session.admin.id;
    }
    if (data.search) {
      where.OR = [
        { title: { contains: data.search, mode: "insensitive" } },
        { company: { name: { contains: data.search, mode: "insensitive" } } },
      ];
    }
    if (data.district) {
      where.district = data.district;
    }
    if (data.industry) {
      where.industry = data.industry;
    }
    if (data.employmentMode) {
      where.employmentMode = data.employmentMode;
    }
    if (data.auditStatus) {
      where.auditStatus = data.auditStatus;
    }

    const [items, total] = await Promise.all([
      db.job.findMany({
        where,
        include: {
          company: true,
          createdBy: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (data.page - 1) * data.pageSize,
        take: data.pageSize,
      }),
      db.job.count({ where }),
    ]);

    return jsonList(
      items.map((item) => ({
        id: item.id,
        title: item.title,
        company: item.company.name,
        industry: item.industry,
        district: item.district,
        employmentMode: item.employmentMode,
        salaryMin: item.salaryMin,
        salaryMax: item.salaryMax,
        remainingCount: item.remainingCount,
        auditStatus: item.auditStatus,
        recruiter: item.createdBy.name,
        createdAt: item.createdAt.toISOString(),
      })),
      {
        total,
        page: data.page,
        pageSize: data.pageSize,
      },
    );
  } catch (error) {
    console.error("GET /api/admin/jobs", error);
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return unauthorized();
    }

    const { data, error } = await parseBody(request, createJobSchema);
    if (error) {
      return validationError(error);
    }

    if (data.salaryMin > data.salaryMax || data.ageMin > data.ageMax) {
      return forbidden("请检查年龄和薪资范围");
    }

    const job = await db.job.create({
      data: {
        title: data.title,
        industry: data.industry,
        district: data.district,
        location: data.location,
        employmentMode: data.employmentMode,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        salaryUnit: data.salaryUnit,
        settlementCycle: data.settlementCycle,
        ageMin: data.ageMin,
        ageMax: data.ageMax,
        genderRequirement: data.genderRequirement,
        educationRequirement: data.educationRequirement || null,
        experienceRequirement: data.experienceRequirement,
        certificateRequirements: data.certificateRequirements,
        meals: data.meals,
        accommodation: data.accommodation,
        shifts: data.shifts,
        benefits: data.benefits,
        headcount: data.headcount,
        remainingCount: data.remainingCount || data.headcount,
        deadline: new Date(data.deadline),
        description: data.description,
        highlight: data.highlight,
        companyId: data.companyId,
        createdById: session.admin.id,
        auditStatus: data.submitForReview ? "PENDING" : "DRAFT",
      },
    });

    return created(job);
  } catch (error) {
    console.error("POST /api/admin/jobs", error);
    return internalError();
  }
}
