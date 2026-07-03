import type { NextRequest } from "next/server";

import { ApplicationStatus } from "@prisma/client";
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
import { applicationStatusLabelMap } from "@/lib/constants";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { notifyApplicationStatusChanged } from "@/lib/notifications";
import { updateApplicationStatusSchema } from "@/lib/schemas";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return unauthorized();
    }

    const { id } = await context.params;
    const application = await db.application.findUnique({
      where: { id },
      include: {
        candidate: true,
        job: true,
      },
    });

    if (!application) {
      return notFound("报名记录");
    }

    if (session.admin.role !== "SUPER_ADMIN" && application.job.createdById !== session.admin.id) {
      return forbidden();
    }

    const { data, error } = await parseBody(request, updateApplicationStatusSchema);
    if (error) {
      return validationError(error);
    }

    const updated = await db.application.update({
      where: { id },
      data: {
        status: data.status,
        note: data.note,
        reviewedById: session.admin.id,
        statusUpdatedAt: new Date(),
        onboardedAt: data.status === ApplicationStatus.ONBOARDED ? new Date() : null,
      },
    });

    if (data.status === ApplicationStatus.ONBOARDED) {
      await db.commissionRecord.upsert({
        where: {
          applicationId: application.id,
        },
        update: {
          amount: data.commissionAmount || env.DEFAULT_COMMISSION_AMOUNT,
          confirmedById: session.admin.id,
        },
        create: {
          applicationId: application.id,
          companyId: application.job.companyId,
          jobId: application.job.id,
          candidateId: application.candidate.id,
          amount: data.commissionAmount || env.DEFAULT_COMMISSION_AMOUNT,
          confirmedById: session.admin.id,
        },
      });
    }

    await notifyApplicationStatusChanged({
      applicationId: application.id,
      candidateId: application.candidate.id,
      openId: application.candidate.openId,
      jobTitle: application.job.title,
      statusLabel: applicationStatusLabelMap[data.status],
      message: data.note || "顾问已更新您的报名进度",
    });

    return created(updated);
  } catch (error) {
    console.error("POST /api/admin/applications/:id/status", error);
    return internalError();
  }
}
