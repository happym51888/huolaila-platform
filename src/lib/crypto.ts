import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

import { env } from "@/lib/env";

const key = Buffer.from(env.FIELD_ENCRYPTION_KEY, "base64");

if (key.length !== 32) {
  throw new Error("FIELD_ENCRYPTION_KEY must decode to 32 bytes");
}

export function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export function encryptText(plainText: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(".");
}

export function decryptText(payload: string) {
  const [ivBase64, tagBase64, encryptedBase64] = payload.split(".");
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivBase64, "base64"));
  decipher.setAuthTag(Buffer.from(tagBase64, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedBase64, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export function maskPhone(phone: string | null) {
  if (!phone || phone.length < 7) {
    return phone || "";
  }

  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

export function maskIdCard(idCard: string | null) {
  if (!idCard || idCard.length < 8) {
    return idCard || "";
  }

  return `${idCard.slice(0, 4)}********${idCard.slice(-4)}`;
}
