import type { NextRequest } from "next/server";

import { AuditStatus } from "@prisma/client";
import { json } from "@/app/api/_lib/response";
import { internalError, notFound } from "@/app/api/_lib/errors";
import { requireCandidateSession } from "@/app/api/_lib/candidate";
import { db } from "@/lib/db";
import { serializeMiniappJob } from "@/lib/serializers";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const session = await requireCandidateSession(request);
    const job = await db.job.findFirst({
      where: {
        id,
        auditStatus: AuditStatus.APPROVED,
      },
      include: {
        company: true,
        createdBy: true,
      },
    });

    if (!job) {
      return notFound("岗位");
    }

    return json(serializeMiniappJob(job, session?.candidate.profile ?? null));
  } catch (error) {
    console.error("GET /api/miniapp/jobs/:id", error);
    return internalError();
  }
}
