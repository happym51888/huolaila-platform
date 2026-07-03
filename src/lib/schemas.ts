import {
  ApplicationStatus,
  AuditStatus,
  EducationLevel,
  EmploymentMode,
  GenderRequirement,
  SalaryUnit,
  SettlementCycle,
} from "@prisma/client";
import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const miniappLoginSchema = z.object({
  code: z.string().min(1),
  nickname: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  phone: z.string().optional(),
});

export const miniappProfileSchema = z.object({
  realName: z.string().min(1).max(50),
  gender: z.enum(["", ""]).optional(),
  age: z.coerce.number().int().min(16).max(55).optional(),
  phone: z.string().min(11).max(20),
  wechatId: z.string().optional(),
  idCard: z.string().min(8).max(25).optional(),
  education: z.enum(["初中", "高中/中专", "大专", "本科"]).optional(),
  currentDistrict: z.string().min(1),
  expectedIndustry: z.string().optional(),
  expectedMode: z.enum(["长期", "短期", "临时", "兼职"]).optional(),
  expectedSalaryMin: z.coerce.number().int().positive().optional(),
  expectedDistricts: z.array(z.string()).optional(),
  workExperience: z.string().optional(),
  certificates: z.array(z.string()).optional(),
  accommodationNeeded: z.boolean().optional(),
});

export const createApplicationSchema = z.object({
  jobId: z.string().min(1),
  note: z.string().max(300).optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(500),
});

export const jobListQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  district: z.string().optional(),
  industry: z.string().optional(),
  employmentMode: z.nativeEnum(EmploymentMode).optional(),
  auditStatus: z.nativeEnum(AuditStatus).optional(),
});

export const createJobSchema = z.object({
  title: z.string().min(1).max(80),
  industry: z.string().min(1).max(50),
  district: z.string().min(1).max(50),
  location: z.string().min(1).max(120),
  employmentMode: z.nativeEnum(EmploymentMode),
  salaryMin: z.coerce.number().int().positive(),
  salaryMax: z.coerce.number().int().positive(),
  salaryUnit: z.nativeEnum(SalaryUnit),
  settlementCycle: z.nativeEnum(SettlementCycle),
  ageMin: z.coerce.number().int().min(16).max(60),
  ageMax: z.coerce.number().int().min(16).max(60),
  genderRequirement: z.nativeEnum(GenderRequirement),
  educationRequirement: z.nativeEnum(EducationLevel).nullable().optional(),
  experienceRequirement: z.string().optional(),
  certificateRequirements: z.array(z.string()).default([]),
  meals: z.string().optional(),
  accommodation: z.string().optional(),
  shifts: z.string().optional(),
  benefits: z.array(z.string()).default([]),
  headcount: z.coerce.number().int().positive(),
  remainingCount: z.coerce.number().int().positive().optional(),
  deadline: z.string().datetime(),
  description: z.string().min(10),
  highlight: z.string().optional(),
  companyId: z.string().min(1),
  submitForReview: z.boolean().optional(),
});

export const updateJobSchema = createJobSchema.partial();

export const reviewJobSchema = z.object({
  auditStatus: z.enum([AuditStatus.APPROVED, AuditStatus.REJECTED, AuditStatus.OFFLINE]),
  reviewNote: z.string().max(300).optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum([
    ApplicationStatus.REVIEWED,
    ApplicationStatus.INTERVIEWING,
    ApplicationStatus.ONBOARDED,
    ApplicationStatus.REJECTED,
  ]),
  note: z.string().max(300).optional(),
  commissionAmount: z.coerce.number().int().positive().optional(),
});

export const miniappRecruitCreateJobSchema = z.object({
  title: z.string().min(1).max(80),
  company: z.string().min(1).max(80),
  industry: z.string().min(1).max(50),
  district: z.string().min(1).max(50),
  location: z.string().min(1).max(150),
  mode: z.enum(["长期工", "短期工", "临时工", "兼职"]),
  salaryMin: z.coerce.number().int().positive(),
  salaryMax: z.coerce.number().int().positive(),
  settlement: z.string().min(1).max(30).default("月结"),
  headcount: z.coerce.number().int().positive().default(10),
  accommodation: z.string().optional(),
  meals: z.string().optional(),
  highlight: z.string().optional(),
  description: z.string().min(6).max(1200),
});

export const miniappRecruitReviewSchema = z.object({
  action: z.enum(["approve", "reject"]),
  note: z.string().max(300).optional(),
});

export type MiniappProfileInput = z.infer<typeof miniappProfileSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
