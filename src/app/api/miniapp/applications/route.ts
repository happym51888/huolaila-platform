import type { NextRequest } from "next/server";

import { AuditStatus } from "@prisma/client";
import { conflict, internalError, notFound, unauthorized, validationError } from "@/app/api/_lib/errors";
import { created, json } from "@/app/api/_lib/response";
import { requireCandidateSession } from "@/app/api/_lib/candidate";
import { parseBody } from "@/app/api/_lib/validation";
import { db } from "@/lib/db";
import { notifyApplicationSubmitted } from "@/lib/notifications";
import { serializeMiniappApplication } from "@/lib/serializers";
import { createApplicationSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  try {
    const session = await requireCandidateSession(request);
    if (!session) {
      return unauthorized();
    }

    const items = await db.application.findMany({
      where: {
        candidateId: session.candidate.id,
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
      orderBy: {
        appliedAt: "desc",
      },
    });

    return json(items.map((item) => serializeMiniappApplication(item)));
  } catch (error) {
    console.error("GET /api/miniapp/applications", error);
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireCandidateSession(request);
    if (!session) {
      return unauthorized();
    }

    const { data, error } = await parseBody(request, createApplicationSchema);
    if (error) {
      return validationError(error);
    }

    const job = await db.job.findFirst({
      where: {
        id: data.jobId,
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

    const existing = await db.application.findFirst({
      where: {
        candidateId: session.candidate.id,
        jobId: job.id,
      },
    });

    if (existing) {
      return conflict("您已经报名过这个岗位");
    }

    const application = await db.application.create({
      data: {
        candidateId: session.candidate.id,
        jobId: job.id,
        note: data.note,
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
    });

    await db.conversation.upsert({
      where: {
        candidateId_jobId_recruiterId: {
          candidateId: session.candidate.id,
          jobId: job.id,
          recruiterId: job.createdById,
        },
      },
      update: {
        lastMessageAt: new Date(),
      },
      create: {
        candidateId: session.candidate.id,
        jobId: job.id,
        recruiterId: job.createdById,
        lastMessageAt: new Date(),
        messages: {
          create: {
            senderType: "ADMIN",
            adminSenderId: job.createdById,
            content: "收到您的报名信息了，我先帮您确认名额，稍后电话或微信联系您",
          },
        },
      },
    });

    await notifyApplicationSubmitted({
      applicationId: application.id,
      recruiterPhone: job.createdBy.phone,
      candidateName:
        session.candidate.profile?.realName || session.candidate.wechatNickname || "求职",
      jobTitle: job.title,
    });

    return created(serializeMiniappApplication(application));
  } catch (error) {
    console.error("POST /api/miniapp/applications", error);
    return internalError();
  }
}
