import type { NextRequest } from "next/server";

import { AuditStatus } from "@prisma/client";
import { json } from "@/app/api/_lib/response";
import { internalError, notFound, unauthorized, validationError } from "@/app/api/_lib/errors";
import { parseBody } from "@/app/api/_lib/validation";
import { getRecruitActorAdmin, requireRecruitAdminCandidateSession } from "@/app/api/_lib/recruit-admin";
import { db } from "@/lib/db";
import { miniappRecruitReviewSchema } from "@/lib/schemas";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRecruitAdminCandidateSession(request);
    if (!session) {
      return unauthorized();
    }

    const { data, error } = await parseBody(request, miniappRecruitReviewSchema);
    if (error) {
      return validationError(error);
    }

    const actorAdmin = await getRecruitActorAdmin();
    if (!actorAdmin) {
      return internalError("系统未初始化管理员账号");
    }

    const { id } = await context.params;
    const existing = await db.job.findUnique({ where: { id } });
    if (!existing) {
      return notFound("岗位");
    }

    const updated = await db.job.update({
      where: { id },
      data: {
        auditStatus: data.action === "approve" ? AuditStatus.APPROVED : AuditStatus.REJECTED,
        reviewNote: data.note || null,
        reviewedById: actorAdmin.id,
        publishedAt: data.action === "approve" ? new Date() : null,
      },
    });

    return json({
      id: updated.id,
      auditStatus: updated.auditStatus,
      reviewNote: updated.reviewNote || "",
    });
  } catch (error) {
    console.error("PATCH /api/miniapp/recruit/reviews/:id", error);
    return internalError();
  }
}
