import type { NextRequest } from "next/server";

import { AuditStatus, Prisma } from "@prisma/client";
import { jsonList } from "@/app/api/_lib/response";
import { internalError, validationError } from "@/app/api/_lib/errors";
import { parseQuery } from "@/app/api/_lib/validation";
import { requireCandidateSession } from "@/app/api/_lib/candidate";
import { db } from "@/lib/db";
import { serializeMiniappJob } from "@/lib/serializers";
import { jobListQuerySchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  try {
    const { data, error } = parseQuery(request, jobListQuerySchema);
    if (error) {
      return validationError(error);
    }

    const session = await requireCandidateSession(request);
    const where: Prisma.JobWhereInput = {
      auditStatus: AuditStatus.APPROVED,
    };

    if (data.search) {
      where.OR = [
        { title: { contains: data.search, mode: "insensitive" } },
        { industry: { contains: data.search, mode: "insensitive" } },
        { location: { contains: data.search, mode: "insensitive" } },
        { description: { contains: data.search, mode: "insensitive" } },
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

    const [items, total] = await Promise.all([
      db.job.findMany({
        where,
        include: {
          company: true,
          createdBy: true,
        },
        orderBy: [
          {
            publishedAt: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        skip: (data.page - 1) * data.pageSize,
        take: data.pageSize,
      }),
      db.job.count({ where }),
    ]);

    const jobs = items
      .map((job) => serializeMiniappJob(job, session?.candidate.profile ?? null))
      .sort((a, b) => b.matchScore - a.matchScore);

    return jsonList(jobs, {
      total,
      page: data.page,
      pageSize: data.pageSize,
    });
  } catch (error) {
    console.error("GET /api/miniapp/jobs", error);
    return internalError();
  }
}
