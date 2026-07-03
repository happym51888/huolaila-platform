import type { NextRequest } from "next/server";
import { z } from "zod";

import { created, json } from "@/app/api/_lib/response";
import { internalError, unauthorized, validationError } from "@/app/api/_lib/errors";
import { requireCandidateSession } from "@/app/api/_lib/candidate";
import { parseBody } from "@/app/api/_lib/validation";
import { db } from "@/lib/db";
import { serializeMiniappJob } from "@/lib/serializers";

const bodySchema = z.object({
  jobId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireCandidateSession(request);
    if (!session) {
      return unauthorized();
    }

    const favorites = await db.jobFavorite.findMany({
      where: {
        candidateId: session.candidate.id,
      },
      include: {
        job: {
          include: {
            company: true,
            createdBy: { select: { name: true, phone: true, wechatId: true } },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return json(
      favorites.map((item) => ({
        id: item.id,
        job: serializeMiniappJob(item.job, session.candidate.profile),
      })),
    );
  } catch (error) {
    console.error("GET /api/miniapp/favorites", error);
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireCandidateSession(request);
    if (!session) {
      return unauthorized();
    }

    const { data, error } = await parseBody(request, bodySchema);
    if (error) {
      return validationError(error);
    }

    const favorite = await db.jobFavorite.upsert({
      where: {
        candidateId_jobId: {
          candidateId: session.candidate.id,
          jobId: data.jobId,
        },
      },
      update: {},
      create: {
        candidateId: session.candidate.id,
        jobId: data.jobId,
      },
    });

    return created(favorite);
  } catch (error) {
    console.error("POST /api/miniapp/favorites", error);
    return internalError();
  }
}
