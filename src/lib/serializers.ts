import {
  ApplicationStatus,
  CandidateGender,
  EducationLevel,
  EmploymentMode,
  GenderRequirement,
  SalaryUnit,
  SettlementCycle,
  type Application,
  type CandidateProfile,
  type Conversation,
  type Job,
  type Message,
} from "@prisma/client";

import {
  applicationStatusLabelMap,
  auditStatusLabelMap,
  educationLevelLabelMap,
  employmentModeLabelMap,
  formatSalary,
  genderRequirementLabelMap,
  settlementCycleLabelMap,
} from "@/lib/constants";
import { getMatchTag, calculateJobMatch } from "@/lib/match";

export function toCandidateGender(value: string | null) {
  if (value === "") {
    return CandidateGender.MALE;
  }

  if (value === "") {
    return CandidateGender.FEMALE;
  }

  return null;
}

export function toEducationLevel(value: string | null) {
  switch (value) {
    case "初中":
      return EducationLevel.PRIMARY_MIDDLE;
    case "高中/中专":
      return EducationLevel.HIGH_VOCATIONAL;
    case "大专":
      return EducationLevel.COLLEGE;
    case "本科":
      return EducationLevel.BACHELOR;
    default:
      return null;
  }
}

export function toEmploymentMode(value: string | null) {
  switch (value) {
    case "长期":
      return EmploymentMode.FULL_TIME;
    case "短期":
      return EmploymentMode.SHORT_TERM;
    case "临时":
      return EmploymentMode.TEMPORARY;
    case "兼职":
      return EmploymentMode.PART_TIME;
    default:
      return null;
  }
}

export function serializeMiniappJob(
  job: Job & {
    company: { name: string };
    createdBy?: { name: string; phone: string | null; wechatId: string | null };
  },
  profile: CandidateProfile | null,
) {
  const match = calculateJobMatch(job, profile);

  return {
    id: job.id,
    title: job.title,
    company: job.company.name,
    industry: job.industry,
    district: job.district,
    location: job.location,
    mode: employmentModeLabelMap[job.employmentMode],
    salaryText: formatSalary({
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryUnit: job.salaryUnit,
    }),
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryUnit: job.salaryUnit,
    settlement: settlementCycleLabelMap[job.settlementCycle],
    ageMin: job.ageMin,
    ageMax: job.ageMax,
    genderRequirement: genderRequirementLabelMap[job.genderRequirement],
    education: job.educationRequirement ? educationLevelLabelMap[job.educationRequirement] : "不限",
    experience: job.experienceRequirement || "不限",
    certificates: Array.isArray(job.certificateRequirements) ? job.certificateRequirements : [],
    meals: job.meals || "待沟",
    accommodation: job.accommodation || "待沟",
    shifts: job.shifts || "待沟",
    benefits: Array.isArray(job.benefits) ? job.benefits : [],
    headcount: job.headcount,
    remainingCount: job.remainingCount,
    deadline: job.deadline.toISOString(),
    description: job.description,
    highlight: job.highlight || "",
    recruiterName: job.createdBy?.name || "顾问",
    recruiterPhone: job.createdBy?.phone || "",
    recruiterWeChat: job.createdBy?.wechatId || "",
    matchScore: match.score,
    matchTag: getMatchTag(match.score),
    reasons: match.reasons,
    auditStatus: auditStatusLabelMap[job.auditStatus],
  };
}

export function serializeMiniappApplication(
  application: Application & { job: Job & { company: { name: string } } },
) {
  return {
    id: application.id,
    status: applicationStatusLabelMap[application.status],
    note: application.note || "",
    appliedAt: application.appliedAt.toISOString(),
    onboardedAt: application.onboardedAt?.toISOString() || null,
    job: serializeMiniappJob(application.job, null),
  };
}

export function serializeConversation(
  conversation: Conversation & {
    recruiter: { name: string };
    job: Job | null;
    messages: Message[];
  },
) {
  return {
    id: conversation.id,
    title: conversation.job?.title || "岗位咨询",
    counterpart: conversation.recruiter.name,
    updatedAt: conversation.lastMessageAt?.toISOString() || conversation.updatedAt.toISOString(),
    messages:
      conversation.messages?.map((message) => ({
        id: message.id,
        from:
          message.senderType === "CANDIDATE"
            ? "user"
            : message.senderType === "ADMIN"
              ? "recruiter"
              : "system",
        content: message.content,
        time: message.createdAt.toISOString(),
      })) || [],
  };
}

export function toGenderRequirement(value: string | null) {
  if (value === "") {
    return GenderRequirement.MALE;
  }

  if (value === "") {
    return GenderRequirement.FEMALE;
  }

  return GenderRequirement.ANY;
}

export function toSalaryUnit(value: SalaryUnit | string | null | undefined) {
  if (value === "DAY") {
    return SalaryUnit.DAY;
  }
  if (value === "HOUR") {
    return SalaryUnit.HOUR;
  }
  return SalaryUnit.MONTH;
}

export function toSettlementCycle(value: SettlementCycle | string | null | undefined) {
  if (value === "WEEKLY") {
    return SettlementCycle.WEEKLY;
  }
  if (value === "DAILY") {
    return SettlementCycle.DAILY;
  }
  if (value === "HOURLY") {
    return SettlementCycle.HOURLY;
  }
  return SettlementCycle.MONTHLY;
}

export function toApplicationStatusLabel(status: ApplicationStatus) {
  return applicationStatusLabelMap[status];
}
