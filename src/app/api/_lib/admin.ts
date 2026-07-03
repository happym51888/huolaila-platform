import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/constants";
import { getAdminUserByToken, parseBearerToken } from "@/lib/auth";

export async function requireAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  return getAdminUserByToken(token);
}

export async function requireAdminSessionFromRequest(request: NextRequest) {
  const bearerToken = parseBearerToken(request.headers.get("authorization"));
  if (bearerToken) {
    return getAdminUserByToken(bearerToken);
  }

  return requireAdminSession();
}
