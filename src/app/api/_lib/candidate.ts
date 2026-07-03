import type { NextRequest } from "next/server";

import { parseBearerToken, verifyCandidateToken } from "@/lib/auth";
import { db } from "@/lib/db";

export async function requireCandidateSession(request: NextRequest) {
  const token = parseBearerToken(request.headers.get("authorization"));
  if (!token) {
    return null;
  }

  const payload = await verifyCandidateToken(token);
  if (!payload) {
    return null;
  }

  const candidate = await db.candidateUser.findUnique({
    where: {
      id: payload.sub,
    },
    include: {
      profile: true,
    },
  });

  if (!candidate) {
    return null;
  }

  return {
    candidate,
    payload,
    token,
  };
}
