import type { NextRequest } from "next/server";

import { json, created } from "@/app/api/_lib/response";
import { internalError, notFound, unauthorized, validationError } from "@/app/api/_lib/errors";
import { requireCandidateSession } from "@/app/api/_lib/candidate";
import { parseBody } from "@/app/api/_lib/validation";
import { db } from "@/lib/db";
import { sendMessageSchema } from "@/lib/schemas";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireCandidateSession(request);
    if (!session) {
      return unauthorized();
    }

    const { id } = await context.params;
    const conversation = await db.conversation.findFirst({
      where: {
        id,
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
    });

    if (!conversation) {
      return notFound("会话");
    }

    await db.message.updateMany({
      where: {
        conversationId: conversation.id,
        senderType: "ADMIN",
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return json({
      id: conversation.id,
      title: conversation.job?.title || "岗位咨询",
      counterpart: conversation.recruiter.name,
      messages: conversation.messages.map((message) => ({
        id: message.id,
        from:
          message.senderType === "CANDIDATE"
            ? "user"
            : message.senderType === "ADMIN"
              ? "recruiter"
              : "system",
        content: message.content,
        time: message.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/miniapp/conversations/:id/messages", error);
    return internalError();
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireCandidateSession(request);
    if (!session) {
      return unauthorized();
    }

    const { id } = await context.params;
    const conversation = await db.conversation.findFirst({
      where: {
        id,
        candidateId: session.candidate.id,
      },
    });

    if (!conversation) {
      return notFound("会话");
    }

    const { data, error } = await parseBody(request, sendMessageSchema);
    if (error) {
      return validationError(error);
    }

    const message = await db.message.create({
      data: {
        conversationId: conversation.id,
        senderType: "CANDIDATE",
        candidateSenderId: session.candidate.id,
        content: data.content,
      },
    });

    await db.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        lastMessageAt: message.createdAt,
      },
    });

    return created({
      id: message.id,
      from: "user",
      content: message.content,
      time: message.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("POST /api/miniapp/conversations/:id/messages", error);
    return internalError();
  }
}
