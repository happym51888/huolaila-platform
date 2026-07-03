import type { NextRequest } from "next/server";

import { json } from "@/app/api/_lib/response";
import { internalError, unauthorized } from "@/app/api/_lib/errors";
import { requireRecruitAdminCandidateSession } from "@/app/api/_lib/recruit-admin";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await requireRecruitAdminCandidateSession(request);
    if (!session) {
      return unauthorized();
    }

    const items = await db.job.findMany({
      where: {},
      include: {
        company: true,
      },
      orderBy: [{ createdAt: "desc" }],
      take: 100,
    });

    return json(items.map((item) => ({
      id: item.id,
      title: item.title,
      company: item.company.name,
      district: item.district,
      mode: item.employmentMode,
      salaryText: `${item.salaryMin}-${item.salaryMax} 元/月`,
      auditStatus: item.auditStatus,
      auditNote: item.reviewNote || "",
      source: "platform",
      createdAt: item.createdAt.toISOString(),
    })));
  } catch (error) {
    console.error("GET /api/miniapp/recruit/reviews", error);
    return internalError();
  }
}
