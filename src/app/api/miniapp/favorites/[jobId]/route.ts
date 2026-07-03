import type { NextRequest } from "next/server";

import { internalError, unauthorized } from "@/app/api/_lib/errors";
import { noContent } from "@/app/api/_lib/response";
import { requireCandidateSession } from "@/app/api/_lib/candidate";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> },
) {
  try {
    const session = await requireCandidateSession(request);
    if (!session) {
      return unauthorized();
    }

    const { jobId } = await context.params;

    await db.jobFavorite.deleteMany({
      where: {
        candidateId: session.candidate.id,
        jobId,
      },
    });

    return noContent();
  } catch (error) {
    console.error("DELETE /api/miniapp/favorites/:jobId", error);
    return internalError();
  }
}
