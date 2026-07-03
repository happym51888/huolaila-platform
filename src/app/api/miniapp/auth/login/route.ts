import type { NextRequest } from "next/server";

import { created } from "@/app/api/_lib/response";
import { internalError, validationError } from "@/app/api/_lib/errors";
import { parseBody } from "@/app/api/_lib/validation";
import { createCandidateToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { miniappLoginSchema } from "@/lib/schemas";
import { exchangeCodeForSession } from "@/lib/wechat";

export async function POST(request: NextRequest) {
  try {
    const { data, error } = await parseBody(request, miniappLoginSchema);
    if (error) {
      return validationError(error);
    }

    const sessionInfo = await exchangeCodeForSession(data.code);

    const candidate = await db.candidateUser.upsert({
      where: {
        openId: sessionInfo.openid,
      },
      update: {
        unionId: sessionInfo.unionid || undefined,
        sessionKey: sessionInfo.session_key,
        wechatNickname: data.nickname,
        avatarUrl: data.avatarUrl,
        phone: data.phone,
      },
      create: {
        openId: sessionInfo.openid,
        unionId: sessionInfo.unionid || undefined,
        sessionKey: sessionInfo.session_key,
        wechatNickname: data.nickname,
        avatarUrl: data.avatarUrl,
        phone: data.phone,
      },
      include: {
        profile: true,
      },
    });

    const token = await createCandidateToken(candidate);

    return created({
      token,
      user: {
        id: candidate.id,
        openId: candidate.openId,
        unionId: candidate.unionId ?? "",
        nickname: candidate.wechatNickname,
        avatarUrl: candidate.avatarUrl,
        phone: candidate.phone,
        profileCompleted: Boolean(candidate.profile?.profileCompletedAt),
      },
    });
  } catch (error) {
    console.error("POST /api/miniapp/auth/login", error);
    return internalError("微信登录失败，请检查配置后重试");
  }
}
