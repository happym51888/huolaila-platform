import Link from "next/link";

import { ConversationPanel } from "@/components/admin/conversation-panel";
import { db } from "@/lib/db";
import { requireAdminPageSession } from "@/lib/admin-page";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) {
  const session = await requireAdminPageSession();
  const params = await searchParams;

  const conversations = await db.conversation.findMany({
    where:
      session.admin.role === "SUPER_ADMIN"
        ? undefined
        : {
            recruiterId: session.admin.id,
          },
    include: {
      candidate: {
        include: {
          profile: true,
        },
      },
      recruiter: true,
      job: true,
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      lastMessageAt: "desc",
    },
  });

  const current =
    conversations.find((item) => item.id === params.id) || conversations[0] || null;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.75fr,1.25fr]">
      <section className="rounded-[2rem] bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-teal-600">消息中心</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">顾问会话列表</h2>
        <div className="mt-6 space-y-3">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              className={`block rounded-2xl border px-4 py-4 ${
                current?.id === conversation.id
                  ? "border-teal-500 bg-teal-50"
                  : "border-slate-200 bg-slate-50"
              }`}
              href={`/dashboard/messages?id=${conversation.id}`}
            >
              <p className="font-medium text-slate-900">
                {conversation.candidate.profile?.realName || conversation.candidate.wechatNickname || "未填"}
              </p>
              <p className="mt-1 text-sm text-slate-500">{conversation.job?.title || "岗位咨询"}</p>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                {conversation.messages[conversation.messages.length - 1]?.content || "暂无消息"}
              </p>
            </Link>
          ))}
          {conversations.length === 0 ? (
            <p className="text-sm text-slate-500">暂时没有求职者会话</p>
          ) : null}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-sm">
        {current ? (
          <>
            <p className="text-sm text-slate-500">
              {current.job?.title || "岗位咨询"} ·{" "}
              {current.candidate.profile?.realName || current.candidate.wechatNickname || "未填"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">会话详情</h2>
            <div className="mt-6">
              <ConversationPanel
                conversationId={current.id}
                initialMessages={current.messages.map((message) => ({
                  id: message.id,
                  from:
                    message.senderType === "ADMIN"
                      ? "admin"
                      : message.senderType === "CANDIDATE"
                        ? "candidate"
                        : "system",
                  content: message.content,
                  time: message.createdAt.toISOString(),
                }))}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500">选择一个会话即可查看与回复消息</p>
        )}
      </section>
    </div>
  );
}
