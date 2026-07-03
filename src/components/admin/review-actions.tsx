"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReviewActions({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(auditStatus: "APPROVED" | "REJECTED") {
    setPending(true);

    await fetch(`/api/admin/jobs/${jobId}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auditStatus,
        reviewNote: note,
      }),
    });

    router.refresh();
    setPending(false);
  }

  return (
    <div className="space-y-3">
      <textarea
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500"
        onChange={(event) => setNote(event.target.value)}
        placeholder="审核说明，例如：证书要求需要补"
        rows={3}
        value={note}
      />
      <div className="flex gap-3">
        <button
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:bg-slate-300"
          disabled={pending}
          onClick={() => submit("APPROVED")}
          type="button"
        >
          审核通过
        </button>
        <button
          className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white disabled:bg-slate-300"
          disabled={pending}
          onClick={() => submit("REJECTED")}
          type="button"
        >
          驳回
        </button>
      </div>
    </div>
  );
}
