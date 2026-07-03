import {
  CandidateGender,
  EducationLevel,
  EmploymentMode,
  GenderRequirement,
  type CandidateProfile,
  type Job,
} from "@prisma/client";

type MatchResult = {
  score: number;
  reasons: string[];
};

function educationRank(level: EducationLevel | null) {
  switch (level) {
    case EducationLevel.PRIMARY_MIDDLE:
      return 1;
    case EducationLevel.HIGH_VOCATIONAL:
      return 2;
    case EducationLevel.COLLEGE:
      return 3;
    case EducationLevel.BACHELOR:
      return 4;
    default:
      return 0;
  }
}

function includesText(text: string | null | undefined, target: string | null | undefined) {
  if (!text || !target) {
    return false;
  }

  return text.toLowerCase().includes(target.toLowerCase());
}

export function calculateJobMatch(
  job: Pick<
    Job,
    | "district"
    | "salaryMin"
    | "salaryMax"
    | "industry"
    | "employmentMode"
    | "ageMin"
    | "ageMax"
    | "genderRequirement"
    | "educationRequirement"
    | "accommodation"
    | "description"
    | "title"
    | "certificateRequirements"
  >,
  profile: CandidateProfile | null,
): MatchResult {
  if (!profile) {
    return {
      score: 60,
      reasons: ["完善资料后可获得更精准的岗位推荐"],
    };
  }

  let score = 20;
  const reasons: string[] = [];
  const certificates = Array.isArray(profile.certificates) ? profile.certificates : [];
  const requiredCertificates = Array.isArray(job.certificateRequirements) ? job.certificateRequirements : [];

  if (profile.age) {
    if (profile.age >= job.ageMin && profile.age <= job.ageMax) {
      score += 16;
      reasons.push(`年龄符合 ${job.ageMin}-${job.ageMax} 岁要求`);
    } else {
      score -= 20;
    }
  }

  if (
    job.genderRequirement === GenderRequirement.ANY ||
    !profile.gender ||
    (job.genderRequirement === GenderRequirement.MALE && profile.gender === CandidateGender.MALE) ||
    (job.genderRequirement === GenderRequirement.FEMALE && profile.gender === CandidateGender.FEMALE)
  ) {
    score += 6;
    reasons.push("性别要求匹配");
  }

  if (!job.educationRequirement || educationRank(profile.education) >= educationRank(job.educationRequirement)) {
    score += 10;
    reasons.push("学历要求符合");
  }

  if (profile.currentDistrict && profile.currentDistrict === job.district) {
    score += 18;
    reasons.push("岗位离当前所在区域更");
  } else if (
    Array.isArray(profile.expectedDistricts) &&
    profile.expectedDistricts.includes(job.district)
  ) {
    score += 14;
    reasons.push("符合期望工作区域");
  }

  if (profile.expectedSalaryMin) {
    if (job.salaryMin >= profile.expectedSalaryMin) {
      score += 16;
      reasons.push("薪资达到或超过期");
    } else if (job.salaryMax >= profile.expectedSalaryMin) {
      score += 10;
      reasons.push("薪资上限接近期望");
    }
  }

  if (profile.expectedIndustry) {
    if (
      profile.expectedIndustry === job.industry ||
      includesText(job.description, profile.expectedIndustry) ||
      includesText(job.title, profile.expectedIndustry)
    ) {
      score += 14;
      reasons.push("行业偏好匹配");
    }
  }

  if (profile.expectedMode && profile.expectedMode === job.employmentMode) {
    score += 10;
    reasons.push("用工形式符合偏好");
  }

  if (requiredCertificates.length === 0) {
    score += 6;
    reasons.push("无需额外证书，上岗门槛低");
  } else if (requiredCertificates.every((item) => certificates.includes(item))) {
    score += 12;
    reasons.push("您具备岗位所需证书");
  } else if (requiredCertificates.some((item) => certificates.includes(item))) {
    score += 6;
    reasons.push("您部分具备岗位所需证书");
  }

  if (profile.accommodationNeeded && includesText(job.accommodation, "宿舍")) {
    score += 6;
    reasons.push("提供住宿，更适合外地或远距离通勤");
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    reasons: reasons.slice(0, 3),
  };
}

export function getMatchTag(score: number) {
  if (score >= 85) {
    return "高匹";
  }

  if (score >= 70) {
    return "较匹";
  }

  return "可考虑";
}

export function toEmploymentModeLabel(mode: EmploymentMode) {
  switch (mode) {
    case EmploymentMode.FULL_TIME:
      return "长期";
    case EmploymentMode.SHORT_TERM:
      return "短期";
    case EmploymentMode.TEMPORARY:
      return "临时";
    case EmploymentMode.PART_TIME:
      return "兼职";
  }
}
