import { env, isTencentSmsConfigured } from "@/lib/env";

function normalizePhoneNumber(phoneNumber: string) {
  if (phoneNumber.startsWith("+")) {
    return phoneNumber;
  }

  return `+86${phoneNumber}`;
}

export async function sendSmsTemplate(input: {
  phoneNumber: string;
  templateId: string;
  templateParams: string[];
}) {
  if (!isTencentSmsConfigured()) {
    return {
      skipped: true,
      reason: "TENCENT_SMS_NOT_CONFIGURED",
    };
  }

  const appId = env.TENCENT_SMS_APP_ID ?? "";
  const signName = env.TENCENT_SMS_SIGN_NAME ?? "";
  const secretId = env.TENCENT_SMS_SECRET_ID ?? "";
  const secretKey = env.TENCENT_SMS_SECRET_KEY ?? "";

  const sdk = await import("tencentcloud-sdk-nodejs");
  const SmsClient = sdk.default.sms.v20210111.Client;

  const client = new SmsClient({
    credential: {
      secretId,
      secretKey,
    },
    region: "ap-guangzhou",
    profile: {
      httpProfile: {
        endpoint: "sms.tencentcloudapi.com",
      },
    },
  });

  const result = await client.SendSms({
    SmsSdkAppId: appId,
    SignName: signName,
    TemplateId: input.templateId,
    TemplateParamSet: input.templateParams,
    PhoneNumberSet: [normalizePhoneNumber(input.phoneNumber)],
  });

  const status = result.SendStatusSet?.[0];

  if (!status || status.Code !== "Ok") {
    throw new Error(status?.Message || "SMS_SEND_FAILED");
  }

  return {
    skipped: false,
    serialNo: status.SerialNo,
  };
}
