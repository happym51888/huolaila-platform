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

replaceInFile('src/app/api/admin/conversations/route.ts', [
    ['item.messages[item.messages.length - 1]".content', 'item.messages[item.messages.length - 1]?.content']
]);

replaceInFile('src/app/api/admin/dashboard/route.ts', [
    ['" { status: ApplicationStatus.ONBOARDED }', '? { status: ApplicationStatus.ONBOARDED }']
]);

replaceInFile('src/app/api/admin/jobs/[id]/route.ts', [
    ['" "PENDING"', '? "PENDING"'],
    ['" "DRAFT"', '? "DRAFT"']
]);

replaceInFile('src/app/api/miniapp/profile/route.ts', [
    ['" {', '? {']
]);

replaceInFile('src/app/dashboard/applications/page.tsx', [
    ['" undefined', '? undefined']
]);

replaceInFile('src/app/dashboard/jobs/[id]/page.tsx', [
    ['" job.certificateRequirements.map(String)', '? job.certificateRequirements.map(String)']
]);

replaceInFile('src/app/dashboard/jobs/new/page.tsx', [
    ['发布一个新的招聘岗"/h2>', '发布一个新的招聘岗位</h2>']
]);

replaceInFile('src/app/dashboard/jobs/page.tsx', [
    ['" undefined', '? undefined']
]);

replaceInFile('src/app/dashboard/layout.tsx', [
    ['" {', '? {']
]);

replaceInFile('src/app/dashboard/messages/page.tsx', [
    ['" undefined', '? undefined']
]);

replaceInFile('src/app/dashboard/page.tsx', [
    ['" {', '? {']
]);

replaceInFile('src/app/dashboard/reviews/page.tsx', [
    ['待审核岗"/h2>', '待审核岗位</h2>']
]);

replaceInFile('src/components/admin/login-form.tsx', [
    ['{error " <p className="text-sm text-rose-600">{error}</p> : null}', '{error ? <p className="text-sm text-rose-600">{error}</p> : null}']
]);

replaceInFile('src/lib/crypto.ts', [
    ['idCard": string | null', 'idCard: string | null']
]);

replaceInFile('src/lib/db.ts', [
    ['" ["warn", "error"] : ["error"],', '? ["warn", "error"] : ["error"],']
]);

replaceInFile('src/lib/notifications.ts', [
    ['recruiterPhone": string | null;', 'recruiterPhone: string | null;']
]);

replaceInFile('src/lib/serializers.ts', [
    ['job.educationRequirement " educationLevelLabelMap[job.educationRequirement] : "不限",', 'job.educationRequirement ? educationLevelLabelMap[job.educationRequirement] : "不限",'],
    ['Array.isArray(job.certificateRequirements) " job.certificateRequirements : [],', 'Array.isArray(job.certificateRequirements) ? job.certificateRequirements : [],']
]);

replaceInFile('src/lib/wechat.ts', [
    ['code": string', 'code: string']
]);
