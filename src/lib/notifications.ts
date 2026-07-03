import type { Prisma } from "@prisma/client";
import { NotificationChannel, NotificationStatus, type ApplicationStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendSmsTemplate } from "@/lib/sms";
import { sendSubscribeMessage } from "@/lib/wechat";

async function logNotification(input: {
  channel: NotificationChannel;
  status: NotificationStatus;
  templateKey: string;
  recipient: string;
  payload: Record<string, unknown>;
  candidateId?: string;
  applicationId?: string;
  errorMessage?: string;
}) {
  await db.notificationLog.create({
    data: {
      channel: input.channel,
      status: input.status,
      templateKey: input.templateKey,
      recipient: input.recipient,
      payload: input.payload as Prisma.InputJsonValue,
      candidateId: input.candidateId ?? null,
      applicationId: input.applicationId ?? null,
      errorMessage: input.errorMessage ?? null,
    },
  });
}

export async function notifyApplicationSubmitted(input: {
  applicationId: string;
  recruiterPhone: string | null;
  candidateName: string;
  jobTitle: string;
}) {
  if (!input.recruiterPhone) {
    return;
  }

  try {
    const result = await sendSmsTemplate({
      phoneNumber: input.recruiterPhone,
      templateId: env.TENCENT_SMS_TEMPLATE_APPLICATION || "",
      templateParams: [input.candidateName, input.jobTitle],
    });

    await logNotification({
      channel: NotificationChannel.SMS,
      status: result.skipped ? NotificationStatus.FAILED : NotificationStatus.SENT,
      templateKey: "APPLICATION_SUBMITTED_SMS",
      recipient: input.recruiterPhone,
      payload: {
        candidateName: input.candidateName,
        jobTitle: input.jobTitle,
        result,
      },
      applicationId: input.applicationId,
      errorMessage: result.skipped ? result.reason : undefined,
    });
  } catch (error) {
    await logNotification({
      channel: NotificationChannel.SMS,
      status: NotificationStatus.FAILED,
      templateKey: "APPLICATION_SUBMITTED_SMS",
      recipient: input.recruiterPhone,
      payload: {
        candidateName: input.candidateName,
        jobTitle: input.jobTitle,
      },
      applicationId: input.applicationId,
      errorMessage: error instanceof Error ? error.message : "SMS_SEND_FAILED",
    });
  }
}

export async function notifyApplicationStatusChanged(input: {
  applicationId: string;
  candidateId: string;
  openId: string;
  jobTitle: string;
  statusLabel: string;
  message: string;
}) {
  try {
    const result = await sendSubscribeMessage({
      openId: input.openId,
      templateId: env.WECHAT_MINIAPP_SUBSCRIBE_TEMPLATE_STATUS || "",
      data: {
        thing1: { value: input.jobTitle.slice(0, 20) },
        phrase2: { value: input.statusLabel.slice(0, 5) },
        thing3: { value: input.message.slice(0, 20) },
      },
    });

    await logNotification({
      channel: NotificationChannel.WECHAT_SUBSCRIBE,
      status: result.skipped ? NotificationStatus.FAILED : NotificationStatus.SENT,
      templateKey: "APPLICATION_STATUS_WECHAT",
      recipient: input.openId,
      payload: {
        jobTitle: input.jobTitle,
        statusLabel: input.statusLabel,
        message: input.message,
        result,
      },
      candidateId: input.candidateId,
      applicationId: input.applicationId,
      errorMessage: result.skipped ? result.reason : undefined,
    });
  } catch (error) {
    await logNotification({
      channel: NotificationChannel.WECHAT_SUBSCRIBE,
      status: NotificationStatus.FAILED,
      templateKey: "APPLICATION_STATUS_WECHAT",
      recipient: input.openId,
      payload: {
        jobTitle: input.jobTitle,
        statusLabel: input.statusLabel,
        message: input.message,
      },
      candidateId: input.candidateId,
      applicationId: input.applicationId,
      errorMessage: error instanceof Error ? error.message : "WECHAT_SUBSCRIBE_SEND_FAILED",
    });
  }
}

export async function notifyNewRecruiterMessage(input: {
  candidateId: string;
  openId: string;
  recruiterName: string;
  jobTitle: string;
  content: string;
}) {
  try {
    const result = await sendSubscribeMessage({
      openId: input.openId,
      templateId: env.WECHAT_MINIAPP_SUBSCRIBE_TEMPLATE_CHAT || "",
      data: {
        thing1: { value: input.recruiterName.slice(0, 20) },
        thing2: { value: input.jobTitle.slice(0, 20) },
        thing3: { value: input.content.slice(0, 20) },
      },
    });

    await logNotification({
      channel: NotificationChannel.WECHAT_SUBSCRIBE,
      status: result.skipped ? NotificationStatus.FAILED : NotificationStatus.SENT,
      templateKey: "CHAT_MESSAGE_WECHAT",
      recipient: input.openId,
      payload: input,
      candidateId: input.candidateId,
      errorMessage: result.skipped ? result.reason : undefined,
    });
  } catch (error) {
    await logNotification({
      channel: NotificationChannel.WECHAT_SUBSCRIBE,
      status: NotificationStatus.FAILED,
      templateKey: "CHAT_MESSAGE_WECHAT",
      recipient: input.openId,
      payload: input,
      candidateId: input.candidateId,
      errorMessage: error instanceof Error ? error.message : "WECHAT_SUBSCRIBE_SEND_FAILED",
    });
  }
}

export function shouldCreateCommission(status: ApplicationStatus) {
  return status === "ONBOARDED";
}
