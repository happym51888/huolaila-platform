import { z } from "zod";

const booleanString = z
  .string()
  .optional()
  .transform((value) => value === "true");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_MINIAPP_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_ENABLE_MOCK_FALLBACK: booleanString,
  DATABASE_URL: z.string().min(1),
  ADMIN_AUTH_SECRET: z.string().min(32),
  MINIAPP_AUTH_SECRET: z.string().min(32),
  FIELD_ENCRYPTION_KEY: z.string().min(20),
  WECHAT_MINIAPP_APP_ID: z.string().optional(),
  WECHAT_MINIAPP_APP_SECRET: z.string().optional(),
  WECHAT_MINIAPP_SUBSCRIBE_TEMPLATE_APPLICATION: z.string().optional(),
  WECHAT_MINIAPP_SUBSCRIBE_TEMPLATE_STATUS: z.string().optional(),
  WECHAT_MINIAPP_SUBSCRIBE_TEMPLATE_CHAT: z.string().optional(),
  WECHAT_MINIAPP_PAGE_PATH: z.string().default("pages/index/index"),
  TENCENT_SMS_SECRET_ID: z.string().optional(),
  TENCENT_SMS_SECRET_KEY: z.string().optional(),
  TENCENT_SMS_APP_ID: z.string().optional(),
  TENCENT_SMS_SIGN_NAME: z.string().optional(),
  TENCENT_SMS_TEMPLATE_APPLICATION: z.string().optional(),
  DEFAULT_ADMIN_EMAIL: z.string().email(),
  DEFAULT_ADMIN_PASSWORD: z.string().min(8),
  DEFAULT_COMMISSION_AMOUNT: z.coerce.number().int().positive().default(800),
  ALLOW_DEV_WECHAT_BYPASS: booleanString,
  RECRUIT_ADMIN_OPENIDS: z.string().optional(),
  RECRUIT_ADMIN_UNIONIDS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;

export function isWechatConfigured() {
  return Boolean(env.WECHAT_MINIAPP_APP_ID && env.WECHAT_MINIAPP_APP_SECRET);
}

export function isTencentSmsConfigured() {
  return Boolean(
    env.TENCENT_SMS_SECRET_ID &&
      env.TENCENT_SMS_SECRET_KEY &&
      env.TENCENT_SMS_APP_ID &&
      env.TENCENT_SMS_SIGN_NAME &&
      env.TENCENT_SMS_TEMPLATE_APPLICATION,
  );
}
