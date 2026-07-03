import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

import type { AdminRole, CandidateUser } from "@prisma/client";
import { sha256 } from "@/lib/crypto";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

const adminSecret = new TextEncoder().encode(env.ADMIN_AUTH_SECRET);
const miniappSecret = new TextEncoder().encode(env.MINIAPP_AUTH_SECRET);
const adminSessionLifetimeSeconds = 60 * 60 * 24 * 7;
const candidateTokenLifetimeSeconds = 60 * 60 * 24 * 30;

export type AdminJwtPayload = {
  sub: string;
  email: string;
  role: AdminRole;
  type: "admin";
};

export type CandidateJwtPayload = {
  sub: string;
  openId: string;
  type: "candidate";
};

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function createAdminSession(input: {
  id: string;
  email: string;
  role: AdminRole;
}) {
  const expiresAt = new Date(Date.now() + adminSessionLifetimeSeconds * 1000);
  const token = await new SignJWT({
    email: input.email,
    role: input.role,
    type: "admin",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.id)
    .setIssuedAt()
    .setExpirationTime(`${adminSessionLifetimeSeconds}s`)
    .sign(adminSecret);

  await db.adminSession.create({
    data: {
      adminUserId: input.id,
      tokenHash: sha256(token),
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
  };
}

export async function deleteAdminSession(token: string) {
  await db.adminSession.deleteMany({
    where: {
      tokenHash: sha256(token),
    },
  });
}

export async function getAdminUserByToken(token: string) {
  try {
    const verified = await jwtVerify(token, adminSecret);
    const session = await db.adminSession.findFirst({
      where: {
        tokenHash: sha256(token),
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        adminUser: true,
      },
    });

    if (!session || !session.adminUser.isActive) {
      return null;
    }

    return {
      admin: session.adminUser,
      payload: verified.payload as unknown as AdminJwtPayload,
    };
  } catch {
    return null;
  }
}

export async function createCandidateToken(candidate: CandidateUser) {
  const token = await new SignJWT({
    openId: candidate.openId,
    type: "candidate",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(candidate.id)
    .setIssuedAt()
    .setExpirationTime(`${candidateTokenLifetimeSeconds}s`)
    .sign(miniappSecret);

  return token;
}

export async function verifyCandidateToken(token: string) {
  try {
    const verified = await jwtVerify(token, miniappSecret);
    return verified.payload as unknown as CandidateJwtPayload;
  } catch {
    return null;
  }
}

export function parseBearerToken(value: string | null) {
  if (!value) {
    return null;
  }

  if (!value.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return value.slice(7);
}
