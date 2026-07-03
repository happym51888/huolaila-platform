import type { NextRequest } from "next/server";

import { created, json } from "@/app/api/_lib/response";
import {
  forbidden,
  internalError,
  notFound,
  unauthorized,
  validationError,
} from "@/app/api/_lib/errors";
import { requireAdminSession } from "@/app/api/_lib/admin";
import { parseBody } from "@/app/api/_lib/validation";
import { db } from "@/lib/db";
import { updateJobSchema } from "@/lib/schemas";

async function getAccessibleJob(id: string, adminId: string, role: string) {
  const job = await db.job.findUnique({
    where: { id },
    include: {
      company: true,
      createdBy: true,
    },
  });

  if (!job) {
    return null;
  }

  if (role !== "SUPER_ADMIN" && job.createdById !== adminId) {
    throw new Error("FORBIDDEN");
  }

  return job;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return unauthorized();
    }

    const { id } = await context.params;
    const job = await getAccessibleJob(id, session.admin.id, session.admin.role);
    if (!job) {
      return notFound("岗位");
    }

    return json(job);
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return forbidden();
    }

    console.error("GET /api/admin/jobs/:id", error);
    return internalError();
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return unauthorized();
    }

    const { id } = await context.params;
    const existing = await getAccessibleJob(id, session.admin.id, session.admin.role);
    if (!existing) {
      return notFound("岗位");
    }

    const { data, error } = await parseBody(request, updateJobSchema);
    if (error) {
      return validationError(error);
    }

    const job = await db.job.update({
      where: { id },
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
        educationRequirement: data.educationRequirement || undefined,
        experienceRequirement: data.experienceRequirement,
        certificateRequirements: data.certificateRequirements,
        meals: data.meals,
        accommodation: data.accommodation,
        shifts: data.shifts,
        benefits: data.benefits,
        headcount: data.headcount,
        remainingCount: data.remainingCount,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        description: data.description,
        highlight: data.highlight,
        companyId: data.companyId,
        auditStatus:
          data.submitForReview === true
            ? "PENDING"
            : data.submitForReview === false && existing.auditStatus === "DRAFT"
              ? "DRAFT"
              : undefined,
      },
    });

    return created(job);
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return forbidden();
    }

    console.error("PATCH /api/admin/jobs/:id", error);
    return internalError();
  }
}
