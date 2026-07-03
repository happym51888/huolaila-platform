import {
  ApplicationStatus,
  AuditStatus,
  EducationLevel,
  EmploymentMode,
  GenderRequirement,
  SalaryUnit,
  SettlementCycle,
} from "@prisma/client";

export const ADMIN_SESSION_COOKIE = "hl_admin_session";
export const MINIAPP_AUTH_HEADER = "authorization";
export const MINIAPP_PAGE_PATH = "pages/index/index";

export const DISTRICT_OPTIONS = [
  "市南",
  "市北",
  "李沧",
  "崂山",
  "城阳",
  "黄岛",
  "即墨",
  "胶州",
];

export const INDUSTRY_OPTIONS = [
  "制造业",
  "物流仓储",
  "餐饮服务",
  "建筑工程",
  "商超零售",
  "行政服务",
];

export const employmentModeLabelMap: Record<EmploymentMode, string> = {
  FULL_TIME: "长期",
  SHORT_TERM: "短期",
  TEMPORARY: "临时",
  PART_TIME: "兼职",
};

export const salaryUnitLabelMap: Record<SalaryUnit, string> = {
  MONTH: "",
  DAY: "",
  HOUR: "小时",
};

export const settlementCycleLabelMap: Record<SettlementCycle, string> = {
  MONTHLY: "月结",
  WEEKLY: "周结",
  DAILY: "日结",
  HOURLY: "时结",
};

export const educationLevelLabelMap: Record<EducationLevel, string> = {
  PRIMARY_MIDDLE: "初中",
  HIGH_VOCATIONAL: "高中/中专",
  COLLEGE: "大专",
  BACHELOR: "本科",
};

export const genderRequirementLabelMap: Record<GenderRequirement, string> = {
  MALE: "",
  FEMALE: "",
  ANY: "不限",
};

export const auditStatusLabelMap: Record<AuditStatus, string> = {
  DRAFT: "草稿",
  PENDING: "待审",
  APPROVED: "已上",
  REJECTED: "已驳",
  OFFLINE: "已下",
};

export const applicationStatusLabelMap: Record<ApplicationStatus, string> = {
  APPLIED: "已报",
  REVIEWED: "已查",
  INTERVIEWING: "面试",
  ONBOARDED: "已入",
  REJECTED: "未通过",
};

export function formatSalary({
  salaryMin,
  salaryMax,
  salaryUnit,
}: {
  salaryMin: number;
  salaryMax: number;
  salaryUnit: SalaryUnit;
}) {
  return `${salaryMin}-${salaryMax} "${salaryUnitLabelMap[salaryUnit]}`;
}
