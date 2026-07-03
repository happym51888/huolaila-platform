import type { NextRequest } from "next/server";

import { json } from "@/app/api/_lib/response";
import { internalError, unauthorized } from "@/app/api/_lib/errors";
import { requireCandidateSession } from "@/app/api/_lib/candidate";

/**
 * 返回当前登录用户的 OpenID / UnionID，用于在后台配置管理员白名单。
 * 任意已登录用户均可调用，便于复制到 .env 的 RECRUIT_ADMIN_OPENIDS / RECRUIT_ADMIN_UNIONIDS。
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireCandidateSession(request);
    if (!session) {
      return unauthorized();
    }

    return json({
      openId: session.candidate.openId,
      unionId: session.candidate.unionId ?? "",
    });
  } catch (error) {
    console.error("GET /api/miniapp/auth/me", error);
    return internalError();
  }
}
