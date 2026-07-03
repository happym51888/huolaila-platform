import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import {
  AdminRole,
  ApplicationStatus,
  AuditStatus,
  CandidateGender,
  EducationLevel,
  EmploymentMode,
  GenderRequirement,
  SalaryUnit,
  SettlementCycle,
  PrismaClient,
} from "@prisma/client";

import { encryptText } from "../src/lib/crypto";
import { env } from "../src/lib/env";
import { hashPassword } from "../src/lib/auth";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- same pg types mismatch as runtime db client
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

async function main() {
  await prisma.notificationLog.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.commissionRecord.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobFavorite.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.job.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.candidateUser.deleteMany();
  await prisma.adminSession.deleteMany();
  await prisma.hiringCompany.deleteMany();
  await prisma.adminUser.deleteMany();

  const passwordHash = await hashPassword(env.DEFAULT_ADMIN_PASSWORD);

  const [superAdmin, recruiter] = await Promise.all([
    prisma.adminUser.create({
      data: {
        email: env.DEFAULT_ADMIN_EMAIL,
        passwordHash,
        name: "系统管理员",
        phone: "13800000001",
        role: AdminRole.SUPER_ADMIN,
      },
    }),
    prisma.adminUser.create({
      data: {
        email: "recruiter@huolaila.local",
        passwordHash,
        name: "赵顾问",
        phone: "13800000002",
        wechatId: "huolaila_qd",
        role: AdminRole.RECRUITER,
      },
    }),
  ]);

  const companies = await Promise.all([
    prisma.hiringCompany.create({
      data: {
        name: "青岛新海电子科技有限公司",
        contactName: "王经理",
        contactPhone: "13900000011",
        district: "城阳区",
        location: "青岛市城阳区高新区火炬路 88 号",
      },
    }),
    prisma.hiringCompany.create({
      data: {
        name: "青岛港联智慧物流有限公司",
        contactName: "刘经理",
        contactPhone: "13900000012",
        district: "黄岛区",
        location: "青岛市黄岛区临港产业园",
      },
    }),
    prisma.hiringCompany.create({
      data: {
        name: "岛城味道餐饮管理有限公司",
        contactName: "陈店长",
        contactPhone: "13900000013",
        district: "市北区",
        location: "青岛市台东商圈",
      },
    }),
  ]);

  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: "城阳电子厂普工",
        industry: "制造业",
        district: "城阳区",
        location: "青岛市城阳区高新区火炬路 88 号",
        employmentMode: EmploymentMode.FULL_TIME,
        salaryMin: 5500,
        salaryMax: 6500,
        salaryUnit: SalaryUnit.MONTH,
        settlementCycle: SettlementCycle.MONTHLY,
        ageMin: 18,
        ageMax: 45,
        genderRequirement: GenderRequirement.ANY,
        educationRequirement: EducationLevel.PRIMARY_MIDDLE,
        experienceRequirement: "无需经验",
        certificateRequirements: [],
        meals: "包三餐",
        accommodation: "4 人间宿舍",
        shifts: "两班倒",
        benefits: ["包吃住", "五险", "加班补贴"],
        headcount: 50,
        remainingCount: 23,
        deadline: new Date("2026-03-31T00:00:00.000Z"),
        description: "主要负责电子元件装配、质检和包装，站坐结合，新手有师傅带。",
        highlight: "包吃住，新手可做，当周可安排宿舍",
        companyId: companies[0].id,
        createdById: recruiter.id,
        reviewedById: superAdmin.id,
        auditStatus: AuditStatus.APPROVED,
        publishedAt: new Date(),
      },
    }),
    prisma.job.create({
      data: {
        title: "黄岛叉车司机",
        industry: "物流仓储",
        district: "黄岛区",
        location: "青岛市黄岛区临港产业园",
        employmentMode: EmploymentMode.FULL_TIME,
        salaryMin: 7000,
        salaryMax: 8500,
        salaryUnit: SalaryUnit.MONTH,
        settlementCycle: SettlementCycle.MONTHLY,
        ageMin: 20,
        ageMax: 48,
        genderRequirement: GenderRequirement.ANY,
        educationRequirement: EducationLevel.PRIMARY_MIDDLE,
        experienceRequirement: "1 年以上叉车经验",
        certificateRequirements: ["叉车证"],
        meals: "包工作餐",
        accommodation: "2-4 人间宿舍",
        shifts: "两班倒，月休 4 天",
        benefits: ["证书对口", "包住", "高薪"],
        headcount: 16,
        remainingCount: 7,
        deadline: new Date("2026-03-30T00:00:00.000Z"),
        description: "负责成品托盘转运、装卸协助和库位管理，要求持证上岗。",
        highlight: "和证书高度匹配，适合想找稳定高薪岗位的人",
        companyId: companies[1].id,
        createdById: recruiter.id,
        reviewedById: superAdmin.id,
        auditStatus: AuditStatus.APPROVED,
        publishedAt: new Date(),
      },
    }),
    prisma.job.create({
      data: {
        title: "市北连锁餐饮服务员",
        industry: "餐饮服务",
        district: "市北区",
        location: "青岛市市北区台东商圈门店",
        employmentMode: EmploymentMode.FULL_TIME,
        salaryMin: 4500,
        salaryMax: 5200,
        salaryUnit: SalaryUnit.MONTH,
        settlementCycle: SettlementCycle.MONTHLY,
        ageMin: 18,
        ageMax: 38,
        genderRequirement: GenderRequirement.ANY,
        educationRequirement: EducationLevel.PRIMARY_MIDDLE,
        experienceRequirement: "有服务业经验优先",
        certificateRequirements: ["健康证"],
        meals: "包工作餐",
        accommodation: "无住宿",
        shifts: "早晚班轮换",
        benefits: ["包餐", "晋升快", "月休 4 天"],
        headcount: 18,
        remainingCount: 6,
        deadline: new Date("2026-03-26T00:00:00.000Z"),
        description: "负责前厅接待、点餐、传菜和简单卫生维护，门店氛围年轻。",
        highlight: "台东商圈门店，适合想做餐饮长期发展的求职者",
        companyId: companies[2].id,
        createdById: recruiter.id,
        auditStatus: AuditStatus.PENDING,
      },
    }),
  ]);

  const candidate = await prisma.candidateUser.create({
    data: {
      openId: "dev-openid-demo",
      sessionKey: "dev-session-demo",
      phone: "13800138000",
      wechatNickname: "张伟",
      avatarUrl: "",
      profile: {
        create: {
          realName: "张伟",
          gender: CandidateGender.MALE,
          age: 28,
          idCardEncrypted: encryptText("370202199801010011"),
          education: EducationLevel.HIGH_VOCATIONAL,
          currentDistrict: "黄岛区",
          expectedIndustry: "物流仓储",
          expectedMode: EmploymentMode.FULL_TIME,
          expectedSalaryMin: 6000,
          expectedDistricts: ["黄岛区", "胶州市"],
          workExperience: "做过仓库分拣、装卸和叉车辅助岗位，能接受加班和倒班。",
          certificates: ["叉车证"],
          accommodationNeeded: true,
          wechatId: "zw_qd",
          profileCompletedAt: new Date(),
        },
      },
    },
    include: {
      profile: true,
    },
  });

  const application = await prisma.application.create({
    data: {
      candidateId: candidate.id,
      jobId: jobs[1].id,
      status: ApplicationStatus.INTERVIEWING,
      note: "顾问已约明天上午 9:30 到黄岛门店集合。",
      reviewedById: recruiter.id,
      statusUpdatedAt: new Date(),
    },
  });

  const conversation = await prisma.conversation.create({
    data: {
      candidateId: candidate.id,
      jobId: jobs[1].id,
      recruiterId: recruiter.id,
      lastMessageAt: new Date(),
      messages: {
        create: [
          {
            senderType: "ADMIN",
            adminSenderId: recruiter.id,
            content: "您好，您报名的黄岛叉车司机岗位已经收到。",
          },
          {
            senderType: "CANDIDATE",
            candidateSenderId: candidate.id,
            content: "好的，请问现在还是月结吗？",
          },
          {
            senderType: "ADMIN",
            adminSenderId: recruiter.id,
            content: "是的，月结，做满一周后也可以申请预支。",
          },
        ],
      },
    },
  });

  await prisma.jobFavorite.createMany({
    data: [
      {
        candidateId: candidate.id,
        jobId: jobs[0].id,
      },
      {
        candidateId: candidate.id,
        jobId: jobs[1].id,
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        entityType: "job",
        entityId: jobs[0].id,
        action: "APPROVED",
        note: "岗位信息完整，审核通过。",
        jobId: jobs[0].id,
        actorId: superAdmin.id,
      },
      {
        entityType: "job",
        entityId: jobs[2].id,
        action: "CREATED",
        note: "岗位新建，等待审核。",
        jobId: jobs[2].id,
        actorId: recruiter.id,
      },
    ],
  });

  console.log("Seed complete", {
    adminEmail: env.DEFAULT_ADMIN_EMAIL,
    adminPassword: env.DEFAULT_ADMIN_PASSWORD,
    candidateId: candidate.id,
    applicationId: application.id,
    conversationId: conversation.id,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
