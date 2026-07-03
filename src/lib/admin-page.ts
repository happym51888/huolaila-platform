import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAdminUserByToken } from "@/lib/auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/constants";

export async function requireAdminPageSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    redirect("/login");
  }

  const session = await getAdminUserByToken(token);
  if (!session) {
    redirect("/login");
  }

  return session;
}
