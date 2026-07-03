import { ApplicationStatus, AuditStatus } from "@prisma/client";

import { json } from "@/app/api/_lib/response";
import { internalError, unauthorized } from "@/app/api/_lib/errors";
import { requireAdminSession } from "@/app/api/_lib/admin";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return unauthorized();
    }

    const recruiterFilter =
      session.admin.role === "SUPER_ADMIN"
        ? {}
        : {
            createdById: session.admin.id,
          };

    const [jobCount, reviewCount, applicationCount, onboardedCount, commissionAgg] =
      await Promise.all([
        db.job.count({
          where: recruiterFilter,
        }),
        db.job.count({
          where: {
            ...recruiterFilter,
            auditStatus: AuditStatus.PENDING,
          },
        }),
        db.application.count({
          where:
            session.admin.role === "SUPER_ADMIN"
              ? undefined
              : {
                  job: {
                    createdById: session.admin.id,
                  },
                },
        }),
        db.application.count({
          where:
            session.admin.role === "SUPER_ADMIN"
              ? { status: ApplicationStatus.ONBOARDED }
              : {
                  status: ApplicationStatus.ONBOARDED,
                  job: {
                    createdById: session.admin.id,
                  },
                },
        }),
        db.commissionRecord.aggregate({
          _sum: {
            amount: true,
          },
          where:
            session.admin.role === "SUPER_ADMIN"
              ? undefined
              : {
                  job: {
                    createdById: session.admin.id,
                  },
                },
        }),
      ]);

    return json({
      jobs: jobCount,
      pendingReviews: reviewCount,
      applications: applicationCount,
      onboarded: onboardedCount,
      commissionAmount: commissionAgg._sum.amount || 0,
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard", error);
    return internalError();
  }
}
