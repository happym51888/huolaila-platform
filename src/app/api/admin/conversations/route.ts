import type { NextRequest } from "next/server";

import { json } from "@/app/api/_lib/response";
import { internalError, unauthorized } from "@/app/api/_lib/errors";
import { requireAdminSession } from "@/app/api/_lib/admin";
import { db } from "@/lib/db";

export async function GET(_request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return unauthorized();
    }

    const items = await db.conversation.findMany({
      where:
        session.admin.role === "SUPER_ADMIN"
          ? undefined
          : {
              recruiterId: session.admin.id,
            },
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
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    return json(
      items.map((item) => ({
        id: item.id,
        title: item.job?.title || "岗位咨询",
        recruiter: item.recruiter.name,
        candidateName: item.candidate.profile?.realName || item.candidate.wechatNickname || "未填",
        candidatePhone: item.candidate.phone || "",
        lastMessage: item.messages[item.messages.length - 1]?.content || "",
        updatedAt: item.lastMessageAt?.toISOString() || item.updatedAt.toISOString(),
      })),
    );
  } catch (error) {
    console.error("GET /api/admin/conversations", error);
    return internalError();
  }
}
