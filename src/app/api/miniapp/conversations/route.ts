import type { NextRequest } from "next/server";

import { json } from "@/app/api/_lib/response";
import { internalError, unauthorized } from "@/app/api/_lib/errors";
import { requireCandidateSession } from "@/app/api/_lib/candidate";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await requireCandidateSession(request);
    if (!session) {
      return unauthorized();
    }

    const items = await db.conversation.findMany({
      where: {
        candidateId: session.candidate.id,
      },
      include: {
        recruiter: true,
        job: true,
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    return json(
      items.map((item) => {
        const lastMessage = item.messages[item.messages.length - 1];
        const unread = item.messages.filter(
          (message) => message.senderType === "ADMIN" && !message.readAt,
        ).length;

        return {
          id: item.id,
          title: item.job?.title || "岗位咨询",
          counterpart: item.recruiter.name,
          lastMessage: lastMessage?.content || "",
          unread,
          updatedAt: item.lastMessageAt?.toISOString() || item.updatedAt.toISOString(),
        };
      }),
    );
  } catch (error) {
    console.error("GET /api/miniapp/conversations", error);
    return internalError();
  }
}
