import type { NextRequest } from "next/server";
import { ApplicationStatus, Prisma } from "@prisma/client";
import { z } from "zod";

import { jsonList } from "@/app/api/_lib/response";
import { internalError, unauthorized, validationError } from "@/app/api/_lib/errors";
import { requireAdminSession } from "@/app/api/_lib/admin";
import { parseQuery } from "@/app/api/_lib/validation";
import { db } from "@/lib/db";

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
  status: z.nativeEnum(ApplicationStatus).optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return unauthorized();
    }

    const { data, error } = parseQuery(request, querySchema);
    if (error) {
      return validationError(error);
    }

    const where: Prisma.ApplicationWhereInput = {};
    if (session.admin.role !== "SUPER_ADMIN") {
      where.job = {
        createdById: session.admin.id,
      };
    }
    if (data.status) {
      where.status = data.status;
    }
    if (data.search) {
      where.OR = [
        { job: { title: { contains: data.search, mode: "insensitive" } } },
        { candidate: { profile: { realName: { contains: data.search, mode: "insensitive" } } } },
        { candidate: { phone: { contains: data.search, mode: "insensitive" } } },
      ];
    }

    const [items, total] = await Promise.all([
      db.application.findMany({
        where,
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
        skip: (data.page - 1) * data.pageSize,
        take: data.pageSize,
      }),
      db.application.count({ where }),
    ]);

    return jsonList(
      items.map((item) => ({
        id: item.id,
        status: item.status,
        appliedAt: item.appliedAt.toISOString(),
        note: item.note,
        candidateName: item.candidate.profile?.realName || item.candidate.wechatNickname || "未填",
        candidatePhone: item.candidate.phone || "",
        jobTitle: item.job.title,
        company: item.job.company.name,
      })),
      {
        total,
        page: data.page,
        pageSize: data.pageSize,
      },
    );
  } catch (error) {
    console.error("GET /api/admin/applications", error);
    return internalError();
  }
}
