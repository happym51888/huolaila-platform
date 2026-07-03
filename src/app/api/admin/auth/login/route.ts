import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

import { created } from "@/app/api/_lib/response";
import { internalError, unauthorized, validationError } from "@/app/api/_lib/errors";
import { parseBody } from "@/app/api/_lib/validation";
import { createAdminSession, verifyPassword } from "@/lib/auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/constants";
import { db } from "@/lib/db";
import { adminLoginSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const { data, error } = await parseBody(request, adminLoginSchema);
    if (error) {
      return validationError(error);
    }

    const admin = await db.adminUser.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!admin || !admin.isActive) {
      return unauthorized("账号不存在或已停");
    }

    const isValidPassword = await verifyPassword(data.password, admin.passwordHash);
    if (!isValidPassword) {
      return unauthorized("邮箱或密码错");
    }

    const session = await createAdminSession({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: session.expiresAt,
    });

    return created({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });
  } catch (error) {
    console.error("POST /api/admin/auth/login", error);
    if (error instanceof Error && /P1001|Can't reach database server|Can't reach database/.test(error.message)) {
      return internalError("数据库未连接，请先启动 PostgreSQL");
    }
    return internalError();
  }
}
