import type { NextRequest } from "next/server";

import { created, json } from "@/app/api/_lib/response";
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
import { notifyNewRecruiterMessage } from "@/lib/notifications";
import { sendMessageSchema } from "@/lib/schemas";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return unauthorized();
    }

    const { id } = await context.params;
    const conversation = await db.conversation.findUnique({
      where: { id },
      include: {
        candidate: {
          include: {
            profile: true,
          },
        },
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

    if (session.admin.role !== "SUPER_ADMIN" && conversation.recruiterId !== session.admin.id) {
      return forbidden();
    }

    return json({
      id: conversation.id,
      title: conversation.job?.title || "岗位咨询",
      candidateName: conversation.candidate.profile?.realName || conversation.candidate.wechatNickname || "未填写",
      messages: conversation.messages.map((message) => ({
        id: message.id,
        from:
          message.senderType === "ADMIN"
            ? "admin"
            : message.senderType === "CANDIDATE"
              ? "candidate"
              : "system",
        content: message.content,
        time: message.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/conversations/:id/messages", error);
    return internalError();
  }
}

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
    const conversation = await db.conversation.findUnique({
      where: { id },
      include: {
        candidate: true,
        job: true,
      },
    });

    if (!conversation) {
      return notFound("会话");
    }

    if (session.admin.role !== "SUPER_ADMIN" && conversation.recruiterId !== session.admin.id) {
      return forbidden();
    }

    const { data, error } = await parseBody(request, sendMessageSchema);
    if (error) {
      return validationError(error);
    }

    const message = await db.message.create({
      data: {
        conversationId: conversation.id,
        senderType: "ADMIN",
        adminSenderId: session.admin.id,
        content: data.content,
      },
    });

    await db.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: message.createdAt,
      },
    });

    await notifyNewRecruiterMessage({
      candidateId: conversation.candidate.id,
      openId: conversation.candidate.openId,
      recruiterName: session.admin.name,
      jobTitle: conversation.job?.title || "岗位咨询",
      content: data.content,
    });

    return created({
      id: message.id,
      from: "admin",
      content: message.content,
      time: message.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("POST /api/admin/conversations/:id/messages", error);
    return internalError();
  }
}
