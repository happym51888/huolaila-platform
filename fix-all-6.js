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

replaceInFile('src/app/api/miniapp/profile/route.ts', [
    ['profile.education === "PRIMARY_MIDDLE"\n                " "初中"\n                : profile.education === "HIGH_VOCATIONAL"\n                  " "高中/中专"\n                  : profile.education === "COLLEGE"', 'profile.education === "PRIMARY_MIDDLE"\n                ? "初中"\n                : profile.education === "HIGH_VOCATIONAL"\n                  ? "高中/中专"\n                  : profile.education === "COLLEGE"']
]);

replaceInFile('src/app/dashboard/applications/page.tsx', [
    ['application.candidate.profile".workExperience', 'application.candidate.profile?.workExperience']
]);

replaceInFile('src/app/dashboard/messages/page.tsx', [
    ['{conversations.length === 0 " (', '{conversations.length === 0 ? (']
]);

replaceInFile('src/app/dashboard/page.tsx', [
    ['最近岗"/h3>', '最近岗位</h3>']
]);

replaceInFile('src/components/admin/job-form.tsx', [
    ['data".error".message', 'data?.error?.message']
]);

replaceInFile('src/lib/notifications.ts', [
    ['error instanceof Error " error.message : "SMS_SEND_FAILED"', 'error instanceof Error ? error.message : "SMS_SEND_FAILED"']
]);

replaceInFile('src/lib/serializers.ts', [
    ['application.onboardedAt".toISOString() "" null', 'application.onboardedAt?.toISOString() || null']
]);
