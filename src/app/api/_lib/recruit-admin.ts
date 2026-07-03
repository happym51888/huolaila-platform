import type { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { requireCandidateSession } from "@/app/api/_lib/candidate";

function parseWhitelist(value?: string) {
  return String(value || "")
    .split(/[，,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function requireRecruitAdminCandidateSession(request: NextRequest) {
  const session = await requireCandidateSession(request);
  if (!session) {
    return null;
  }

  const openIdWhitelist = parseWhitelist(env.RECRUIT_ADMIN_OPENIDS);
  const unionIdWhitelist = parseWhitelist(env.RECRUIT_ADMIN_UNIONIDS);
  const unionId = session.candidate.unionId || "";
  const isAllowed = openIdWhitelist.includes(session.candidate.openId)
    || (unionId && unionIdWhitelist.includes(unionId));

  if (!isAllowed) {
    return null;
  }

  return session;
}

export async function getRecruitActorAdmin() {
  const byDefaultEmail = await db.adminUser.findUnique({
    where: { email: env.DEFAULT_ADMIN_EMAIL },
  });
  if (byDefaultEmail) {
    return byDefaultEmail;
  }

  return db.adminUser.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
}
