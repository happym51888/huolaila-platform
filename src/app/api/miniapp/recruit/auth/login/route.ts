import type { NextRequest } from "next/server";

import { created } from "@/app/api/_lib/response";
import { internalError, unauthorized, validationError } from "@/app/api/_lib/errors";
import { parseBody } from "@/app/api/_lib/validation";
import { createAdminSession, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminLoginSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const { data, error } = await parseBody(request, adminLoginSchema);
    if (error) {
      return validationError(error);
    }

    const admin = await db.adminUser.findUnique({
      where: { email: data.email },
    });
    if (!admin || !admin.isActive) {
      return unauthorized("账号不存在或已停用");
    }

    const isValidPassword = await verifyPassword(data.password, admin.passwordHash);
    if (!isValidPassword) {
      return unauthorized("邮箱或密码错误");
    }

    const session = await createAdminSession({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });

    return created({
      token: session.token,
      expiresAt: session.expiresAt.toISOString(),
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("POST /api/miniapp/recruit/auth/login", error);
    return internalError();
  }
}
