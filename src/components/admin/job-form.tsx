"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CompanyOption = {
  id: string;
  name: string;
};

type JobFormValue = {
  id: string;
  auditStatus: string;
  title: string;
  industry: string;
  district: string;
  location: string;
  employmentMode: string;
  salaryMin: number;
  salaryMax: number;
  salaryUnit: string;
  settlementCycle: string;
  ageMin: number;
  ageMax: number;
  genderRequirement: string;
  educationRequirement: string | null;
  experienceRequirement: string | null;
  certificateRequirements: string[];
  meals: string | null;
  accommodation: string | null;
  shifts: string | null;
  benefits: string[];
  headcount: number;
  remainingCount: number;
  deadline: string;
  description: string;
  highlight: string | null;
  companyId: string;
};

const employmentModes = [
  { value: "FULL_TIME", label: "长期" },
  { value: "SHORT_TERM", label: "短期" },
  { value: "TEMPORARY", label: "临时" },
  { value: "PART_TIME", label: "兼职" },
];

const settlementCycles = [
  { value: "MONTHLY", label: "月结" },
  { value: "WEEKLY", label: "周结" },
  { value: "DAILY", label: "日结" },
  { value: "HOURLY", label: "时结" },
];

const genderRequirements = [
  { value: "ANY", label: "不限" },
  { value: "MALE", label: "" },
  { value: "FEMALE", label: "" },
];

const educationLevels = [
  { value: "", label: "不限" },
  { value: "PRIMARY_MIDDLE", label: "初中" },
  { value: "HIGH_VOCATIONAL", label: "高中/中专" },
  { value: "COLLEGE", label: "大专" },
  { value: "BACHELOR", label: "本科" },
];

function toList(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(/["、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function JobForm({
  companies,
  job,
}: {
  companies: CompanyOption[];
  job: JobFormValue | null;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      title: String(formData.get("title") || ""),
      companyId: String(formData.get("companyId") || ""),
      industry: String(formData.get("industry") || ""),
      district: String(formData.get("district") || ""),
      location: String(formData.get("location") || ""),
      employmentMode: String(formData.get("employmentMode") || "FULL_TIME"),
      salaryMin: Number(formData.get("salaryMin") || 0),
      salaryMax: Number(formData.get("salaryMax") || 0),
      salaryUnit: String(formData.get("salaryUnit") || "MONTH"),
      settlementCycle: String(formData.get("settlementCycle") || "MONTHLY"),
      ageMin: Number(formData.get("ageMin") || 16),
      ageMax: Number(formData.get("ageMax") || 55),
      genderRequirement: String(formData.get("genderRequirement") || "ANY"),
      educationRequirement: String(formData.get("educationRequirement") || "") || null,
      experienceRequirement: String(formData.get("experienceRequirement") || ""),
      certificateRequirements: toList(formData.get("certificateRequirements")),
      meals: String(formData.get("meals") || ""),
      accommodation: String(formData.get("accommodation") || ""),
      shifts: String(formData.get("shifts") || ""),
      benefits: toList(formData.get("benefits")),
      headcount: Number(formData.get("headcount") || 1),
      remainingCount: Number(formData.get("remainingCount") || 1),
      deadline: new Date(String(formData.get("deadline") || "")).toISOString(),
      description: String(formData.get("description") || ""),
      highlight: String(formData.get("highlight") || ""),
      submitForReview: formData.get("submitForReview") === "on",
    };

    const response = await fetch(job ? `/api/admin/jobs/${job.id}` : "/api/admin/jobs", {
      method: job ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setPending(false);
      setError(data?.error?.message || "保存失败，请稍后再试");
      return;
    }

    router.push("/dashboard/jobs");
    router.refresh();
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="title" label="岗位名称" defaultValue={job?.title} required />
        <Select
          defaultValue={job?.companyId}
          label="用工企业"
          name="companyId"
          options={companies.map((item) => ({ value: item.id, label: item.name }))}
          required
        />
        <Input name="industry" label="行业" defaultValue={job?.industry} required />
        <Input name="district" label="区域" defaultValue={job?.district} required />
        <Input name="location" label="详细地址" defaultValue={job?.location} required />
        <Select
          defaultValue={job?.employmentMode}
          label="用工形式"
          name="employmentMode"
          options={employmentModes}
          required
        />
        <Input
          name="salaryMin"
          label="最低薪"
          defaultValue={job?.salaryMin}
          required
          type="number"
        />
        <Input
          name="salaryMax"
          label="最高薪"
          defaultValue={job?.salaryMax}
          required
          type="number"
        />
        <Select
          defaultValue={job?.salaryUnit || "MONTH"}
          label="薪资单位"
          name="salaryUnit"
          options={[
            { value: "MONTH", label: "" },
            { value: "DAY", label: "" },
            { value: "HOUR", label: "小时" },
          ]}
          required
        />
        <Select
          defaultValue={job?.settlementCycle || "MONTHLY"}
          label="结算周期"
          name="settlementCycle"
          options={settlementCycles}
          required
        />
        <Input name="ageMin" label="最低年龄" defaultValue={job?.ageMin} type="number" required />
        <Input name="ageMax" label="最高年龄" defaultValue={job?.ageMax} type="number" required />
        <Select
          defaultValue={job?.genderRequirement || "ANY"}
          label="性别要求"
          name="genderRequirement"
          options={genderRequirements}
          required
        />
        <Select
          defaultValue={job?.educationRequirement || ""}
          label="学历要求"
          name="educationRequirement"
          options={educationLevels}
        />
        <Input name="headcount" label="招聘人数" defaultValue={job?.headcount} type="number" required />
        <Input
          name="remainingCount"
          label="剩余名额"
          defaultValue={job?.remainingCount}
          type="number"
          required
        />
        <Input
          name="deadline"
          label="截止日期"
          defaultValue={job?.deadline?.slice(0, 10)}
          type="date"
          required
        />
        <Input name="meals" label="餐食说明" defaultValue={job?.meals || ""} />
        <Input name="accommodation" label="住宿说明" defaultValue={job?.accommodation || ""} />
        <Input name="shifts" label="班次说明" defaultValue={job?.shifts || ""} />
        <Input
          name="experienceRequirement"
          label="经验要求"
          defaultValue={job?.experienceRequirement || ""}
        />
      </div>

      <Textarea
        defaultValue={job?.certificateRequirements?.join(", ")}
        label="证书要求"
        name="certificateRequirements"
      />
      <Textarea defaultValue={job?.benefits?.join(", ")} label="福利标签" name="benefits" />
      <Textarea defaultValue={job?.highlight || ""} label="一句话亮点" name="highlight" />
      <Textarea defaultValue={job?.description} label="岗位描述" name="description" required rows={6} />

      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
        <input
          className="h-4 w-4 accent-teal-600"
          defaultChecked={job ? (job.auditStatus === "PENDING" || job.auditStatus === "APPROVED") : true}
          name="submitForReview"
          type="checkbox"
        />
        保存后提交审核
      </label>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="flex gap-3">
        <button
          className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={pending}
          type="submit"
        >
          {pending ? "保存.." : job ? "保存修改" : "新建岗位"}
        </button>
        <button
          className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-white"
          onClick={() => router.back()}
          type="button"
        >
          返回
        </button>
      </div>
    </form>
  );
}

function Input({
  label,
  name,
  required,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string | number | null;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500"
        defaultValue={defaultValue ?? ""}
        name={name}
        required={required ?? false}
        type={type}
      />
    </label>
  );
}

function Textarea({
  label,
  name,
  defaultValue,
  required,
  rows = 3,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <textarea
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500"
        defaultValue={defaultValue ?? ""}
        name={name}
        required={required ?? false}
        rows={rows ?? 3}
      />
    </label>
  );
}

function Select({
  label,
  name,
  options,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string | null;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <select
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500"
        defaultValue={(defaultValue ?? options[0]?.value) ?? ""}
        name={name}
        required={required ?? false}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
