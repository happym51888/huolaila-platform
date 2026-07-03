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

replaceInFile('src/app/api/admin/conversations/[id]/messages/route.ts', [
    ['" "admin"', '? "admin"'],
    ['" "candidate"', '? "candidate"']
]);

replaceInFile('src/app/api/admin/conversations/route.ts', [
    ['item.job".title', 'item.job?.title'],
    ['item.candidate.profile".realName', 'item.candidate.profile?.realName']
]);

replaceInFile('src/app/api/admin/dashboard/route.ts', [
    ['" undefined', '? undefined']
]);

replaceInFile('src/app/api/admin/jobs/[id]/route.ts', [
    ['data.deadline " new Date(data.deadline) : undefined', 'data.deadline ? new Date(data.deadline) : undefined']
]);

replaceInFile('src/app/api/miniapp/auth/login/route.ts', [
    ['candidate.profile".profileCompletedAt', 'candidate.profile?.profileCompletedAt']
]);

replaceInFile('src/app/api/miniapp/conversations/[id]/messages/route.ts', [
    ['" "user"', '? "user"'],
    ['" "recruiter"', '? "recruiter"']
]);

replaceInFile('src/app/api/miniapp/conversations/route.ts', [
    ['lastMessage".content', 'lastMessage?.content'],
    ['item.lastMessageAt".toISOString()', 'item.lastMessageAt?.toISOString()']
]);

replaceInFile('src/app/api/miniapp/jobs/[id]/route.ts', [
    ['session".candidate.profile', 'session?.candidate.profile']
]);

replaceInFile('src/app/api/miniapp/jobs/route.ts', [
    ['session".candidate.profile', 'session?.candidate.profile']
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
    ['" {', '? {']
]);

replaceInFile('src/app/page.tsx', [
    ['默认管理员账"/p>', '默认管理员账号</p>'],
    ['本地开发请先启"PostgreSQL，再运行 Prisma 迁移"seed。后台默认地址"            <span className="px-1 text-white">http://localhost:3000</span>"          </p>', '本地开发请先启动 PostgreSQL，再运行 Prisma 迁移和 seed。后台默认地址 <span className="px-1 text-white">http://localhost:3000</span></p>']
]);

replaceInFile('src/components/admin/login-form.tsx', [
    ['payload".error".message', 'payload?.error?.message']
]);

replaceInFile('src/lib/crypto.ts', [
    ['phone": string | null', 'phone: string | null'],
    ['phone "" ""', 'phone || ""']
]);

replaceInFile('src/lib/db.ts', [
    ['globalForPrisma.prismaPool ""', 'globalForPrisma.prismaPool ??'],
    ['globalForPrisma.prisma ""', 'globalForPrisma.prisma ??']
]);

replaceInFile('src/lib/notifications.ts', [
    ['candidateId": string;', 'candidateId: string;'],
    ['applicationId": string;', 'applicationId: string;'],
    ['errorMessage": string;', 'errorMessage: string;']
]);

replaceInFile('src/lib/serializers.ts', [
    ['createdBy": { name: string; phone: string | null; wechatId: string | null };', 'createdBy: { name: string; phone: string | null; wechatId: string | null };'],
    ['profile": CandidateProfile | null,', 'profile: CandidateProfile | null,']
]);
