import type { NextRequest } from "next/server";

import { created } from "@/app/api/_lib/response";
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
import { reviewJobSchema } from "@/lib/schemas";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return unauthorized();
    }

    if (session.admin.role !== "SUPER_ADMIN") {
      return forbidden("只有超级管理员可以审核岗位");
    }

    const { id } = await context.params;
    const job = await db.job.findUnique({
      where: { id },
    });

    if (!job) {
      return notFound("岗位");
    }

    const { data, error } = await parseBody(request, reviewJobSchema);
    if (error) {
      return validationError(error);
    }

    const updated = await db.job.update({
      where: { id },
      data: {
        auditStatus: data.auditStatus,
        reviewNote: data.reviewNote,
        reviewedById: session.admin.id,
        publishedAt: data.auditStatus === "APPROVED" ? new Date() : null,
      },
    });

    await db.auditLog.create({
      data: {
        entityType: "job",
        entityId: updated.id,
        action: data.auditStatus,
        note: data.reviewNote,
        jobId: updated.id,
        actorId: session.admin.id,
      },
    });

    return created(updated);
  } catch (error) {
    console.error("POST /api/admin/jobs/:id/review", error);
    return internalError();
  }
}
