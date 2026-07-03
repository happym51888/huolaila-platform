import { env, isWechatConfigured } from "@/lib/env";

type AccessTokenState = {
  token: string;
  expiresAt: number;
};

declare global {
  var wechatAccessTokenCache: AccessTokenState | undefined;
}

function getCache() {
  return global.wechatAccessTokenCache;
}

function setCache(value: AccessTokenState) {
  global.wechatAccessTokenCache = value;
}

export async function exchangeCodeForSession(code: string) {
  if (!isWechatConfigured()) {
    if (env.ALLOW_DEV_WECHAT_BYPASS && env.NODE_ENV !== "production") {
      const suffix = code || "dev";
      return {
        openid: `dev-openid-${suffix}`,
        unionid: null,
        session_key: `dev-session-${suffix}`,
      };
    }

    throw new Error("WECHAT_NOT_CONFIGURED");
  }

  if (!code) {
    throw new Error("WECHAT_CODE_REQUIRED");
  }

  const url = new URL("https://api.weixin.qq.com/sns/jscode2session");
  url.searchParams.set("appid", env.WECHAT_MINIAPP_APP_ID || "");
  url.searchParams.set("secret", env.WECHAT_MINIAPP_APP_SECRET || "");
  url.searchParams.set("js_code", code);
  url.searchParams.set("grant_type", "authorization_code");

  const response = await fetch(url.toString(), {
    cache: "no-store",
  });
  const data = await response.json();

  if (!response.ok || data.errcode) {
    throw new Error(data.errmsg || "WECHAT_CODE2SESSION_FAILED");
  }

  return data as {
    openid: string;
    unionid?: string;
    session_key: string;
  };
}

async function getAccessToken() {
  const cache = getCache();
  if (cache && cache.expiresAt > Date.now() + 60_000) {
    return cache.token;
  }

  if (!isWechatConfigured()) {
    throw new Error("WECHAT_NOT_CONFIGURED");
  }

  const url = new URL("https://api.weixin.qq.com/cgi-bin/token");
  url.searchParams.set("grant_type", "client_credential");
  url.searchParams.set("appid", env.WECHAT_MINIAPP_APP_ID || "");
  url.searchParams.set("secret", env.WECHAT_MINIAPP_APP_SECRET || "");

  const response = await fetch(url.toString(), {
    cache: "no-store",
  });
  const data = await response.json();

  if (!response.ok || data.errcode) {
    throw new Error(data.errmsg || "WECHAT_TOKEN_FAILED");
  }

  setCache({
    token: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in || 7200) * 1000,
  });

  return data.access_token as string;
}

export async function sendSubscribeMessage(input: {
  openId: string;
  templateId: string;
  page?: string;
  data: Record<string, { value: string }>;
}) {
  if (!isWechatConfigured()) {
    return {
      skipped: true,
      reason: "WECHAT_NOT_CONFIGURED",
    };
  }

  const accessToken = await getAccessToken();
  const response = await fetch(
    `https://api.weixin.qq.com/cgi-bin/message/subscribe/send"access_token=${accessToken}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        touser: input.openId,
        template_id: input.templateId,
        page: input.page || env.WECHAT_MINIAPP_PAGE_PATH,
        data: input.data,
      }),
    },
  );

  const result = await response.json();

  if (!response.ok || result.errcode) {
    throw new Error(result.errmsg || "WECHAT_SUBSCRIBE_SEND_FAILED");
  }

  return {
    skipped: false,
    messageId: result.msgid as string | undefined,
  };
}
