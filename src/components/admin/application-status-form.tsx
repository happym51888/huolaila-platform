"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const statusOptions = [
  { value: "REVIEWED", label: "已查" },
  { value: "INTERVIEWING", label: "面试" },
  { value: "ONBOARDED", label: "已入" },
  { value: "REJECTED", label: "未通过" },
];

export function ApplicationStatusForm({
  applicationId,
  defaultStatus,
}: {
  applicationId: string;
  defaultStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(defaultStatus);
  const [note, setNote] = useState("");
  const [commissionAmount, setCommissionAmount] = useState("800");
  const [pending, setPending] = useState(false);

  async function onSubmit() {
    setPending(true);

    await fetch(`/api/admin/applications/${applicationId}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        note,
        commissionAmount: status === "ONBOARDED" ? Number(commissionAmount) : undefined,
      }),
    });

    router.refresh();
    setPending(false);
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <select
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        onChange={(event) => setStatus(event.target.value)}
        value={status}
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <textarea
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        onChange={(event) => setNote(event.target.value)}
        placeholder="给求职者的备注"
        rows={3}
        value={note}
      />
      {status === "ONBOARDED" ? (
        <input
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          onChange={(event) => setCommissionAmount(event.target.value)}
          placeholder="佣金金额"
          type="number"
          value={commissionAmount}
        />
      ) : null}
      <button
        className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:bg-slate-300"
        disabled={pending}
        onClick={onSubmit}
        type="button"
      >
        {pending ? "保存.." : "更新状态"}
      </button>
    </div>
  );
}
