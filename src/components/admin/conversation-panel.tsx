"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MessageItem = {
  id: string;
  from: string;
  content: string;
  time: string;
};

export function ConversationPanel({
  conversationId,
  initialMessages,
}: {
  conversationId: string;
  initialMessages: MessageItem[];
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);

  async function onSend() {
    if (!content.trim()) {
      return;
    }

    setPending(true);
    await fetch(`/api/admin/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
    setContent("");
    router.refresh();
    setPending(false);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {initialMessages.map((message) => (
          <div
            key={message.id}
            className={`max-w-xl rounded-2xl px-4 py-3 text-sm ${
              message.from === "admin"
                ? "ml-auto bg-teal-600 text-white"
                : message.from === "candidate"
                  ? "bg-white text-slate-800"
                  : "bg-slate-100 text-slate-500"
            }`}
          >
            <p>{message.content}</p>
            <p className="mt-2 text-xs opacity-70">{new Date(message.time).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <textarea
          className="min-h-24 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
          onChange={(event) => setContent(event.target.value)}
          placeholder="回复求职者，例如：明早9:30 到门店集合"
          rows={3}
          value={content}
        />
        <button
          className="self-end rounded-2xl bg-teal-600 px-4 py-3 text-sm font-medium text-white disabled:bg-slate-300"
          disabled={pending}
          onClick={onSend}
          type="button"
        >
          发送
        </button>
      </div>
    </div>
  );
}
