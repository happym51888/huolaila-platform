import { cookies } from "next/headers";

import { noContent } from "@/app/api/_lib/response";
import { deleteAdminSession } from "@/lib/auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/constants";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (token) {
    await deleteAdminSession(token);
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE);
  return noContent();
}
