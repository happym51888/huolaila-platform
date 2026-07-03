const fs = require('fs');

function replaceInFile(path, replacements) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    let original = content;
    for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }
    if (content !== original) {
        fs.writeFileSync(path, content, 'utf8');
        console.log('Fixed ' + path);
    }
}

replaceInFile('src/app/api/admin/applications/[id]/status/route.ts', [
    ['data.status === ApplicationStatus.ONBOARDED " new Date() : null', 'data.status === ApplicationStatus.ONBOARDED ? new Date() : null']
]);

replaceInFile('src/app/api/admin/applications/route.ts', [
    ['item.candidate.profile".realName', 'item.candidate.profile?.realName']
]);

replaceInFile('src/app/api/admin/conversations/[id]/messages/route.ts', [
    ['conversation.job".title', 'conversation.job?.title'],
    ['conversation.candidate.profile".realName', 'conversation.candidate.profile?.realName']
]);

replaceInFile('src/app/api/admin/conversations/route.ts', [
    ['" undefined', '? undefined']
]);

replaceInFile('src/app/api/admin/dashboard/route.ts', [
    ['" {}', '? {}']
]);

replaceInFile('src/app/api/admin/jobs/[id]/review/route.ts', [
    ['data.auditStatus === "APPROVED" " new Date() : null', 'data.auditStatus === "APPROVED" ? new Date() : null']
]);

replaceInFile('src/app/api/admin/jobs/[id]/route.ts', [
    ['data.educationRequirement "" undefined', 'data.educationRequirement || undefined']
]);

replaceInFile('src/app/api/admin/jobs/route.ts', [
    ['data.submitForReview " "PENDING" : "DRAFT"', 'data.submitForReview ? "PENDING" : "DRAFT"']
]);

replaceInFile('src/app/api/miniapp/applications/route.ts', [
    ['session.candidate.profile".realName', 'session.candidate.profile?.realName']
]);

replaceInFile('src/app/api/miniapp/auth/login/route.ts', [
    ['" undefined', '? undefined']
]);

replaceInFile('src/app/api/miniapp/conversations/[id]/messages/route.ts', [
    ['conversation.job".title', 'conversation.job?.title'],
    ['conversation.candidate.profile".realName', 'conversation.candidate.profile?.realName']
]);

replaceInFile('src/app/api/miniapp/conversations/route.ts', [
    ['item.job".title', 'item.job?.title'],
    ['item.candidate.profile".realName', 'item.candidate.profile?.realName']
]);

replaceInFile('src/app/api/miniapp/jobs/[id]/route.ts', [
    ['job.company".name', 'job.company?.name']
]);

replaceInFile('src/app/api/miniapp/jobs/route.ts', [
    ['item.company".name', 'item.company?.name']
]);

replaceInFile('src/app/api/miniapp/profile/route.ts', [
    ['" {}', '? {}']
]);

replaceInFile('src/app/dashboard/applications/page.tsx', [
    ['" {}', '? {}']
]);

replaceInFile('src/app/dashboard/jobs/[id]/page.tsx', [
    ['" {}', '? {}']
]);

replaceInFile('src/app/dashboard/jobs/new/page.tsx', [
    ['" {}', '? {}']
]);

replaceInFile('src/app/dashboard/jobs/page.tsx', [
    ['" {}', '? {}']
]);

replaceInFile('src/app/dashboard/layout.tsx', [
    ['" {}', '? {}']
]);

replaceInFile('src/app/dashboard/messages/page.tsx', [
    ['" {}', '? {}']
]);

replaceInFile('src/app/dashboard/page.tsx', [
    ['" {}', '? {}']
]);

replaceInFile('src/app/dashboard/reviews/page.tsx', [
    ['" {}', '? {}']
]);

replaceInFile('src/app/login/page.tsx', [
    ['活来了后"/p>', '活来了后台</p>'],
    ['1. 招聘顾问发布岗位并提交审核"/p>', '1. 招聘顾问发布岗位并提交审核</p>'],
    ['2. 超级管理员审核岗位后，小程序即可展示"/p>', '2. 超级管理员审核岗位后，小程序即可展示</p>'],
    ['3. 求职者报名后，系统短信提醒顾问，状态变化走微信通知"/p>', '3. 求职者报名后，系统短信提醒顾问，状态变化走微信通知</p>']
]);

replaceInFile('src/app/page.tsx', [
    ['活来"/p>', '活来了</p>'],
    ['劳务招聘后台、API 与小程序服务"            </h1>', '劳务招聘后台、API 与小程序服务</h1>']
]);

replaceInFile('src/lib/auth.ts', [
    ['session".adminUser".isActive', 'session.adminUser.isActive']
]);

replaceInFile('src/lib/db.ts', [
    ['prisma": PrismaClient;', 'prisma: PrismaClient;'],
    ['prismaPool": Pool;', 'prismaPool: Pool;']
]);

replaceInFile('src/lib/serializers.ts', [
    ['value": string | null', 'value: string | null']
]);
