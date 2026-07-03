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
    ['item.lastMessageAt".toISOString()', 'item.lastMessageAt?.toISOString()']
]);

replaceInFile('src/app/api/miniapp/profile/route.ts', [
    ['profile.gender === "MALE" " "" : profile.gender === "FEMALE" " "" : ""', 'profile.gender === "MALE" ? "男" : profile.gender === "FEMALE" ? "女" : ""']
]);

replaceInFile('src/app/dashboard/applications/page.tsx', [
    ['跟进报名到入职的全过"/h2>', '跟进报名到入职的全过程</h2>']
]);

replaceInFile('src/app/dashboard/jobs/[id]/page.tsx', [
    ['" job.benefits.map(String) : [],', '? job.benefits.map(String) : [],']
]);

replaceInFile('src/app/dashboard/messages/page.tsx', [
    ['{ id": string }', '{ id: string }']
]);

replaceInFile('src/app/dashboard/page.tsx', [
    ['" undefined', '? undefined']
]);

replaceInFile('src/app/dashboard/reviews/page.tsx', [
    ['{jobs.length === 0 " (', '{jobs.length === 0 ? ('],
    ['当前没有待审核岗位"', '当前没有待审核岗位']
]);

replaceInFile('src/components/admin/job-form.tsx', [
    ['job": JobFormValue | null;', 'job: JobFormValue | null;']
]);

replaceInFile('src/components/admin/login-form.tsx', [
    ['{pending " "登录.." : "登录后台"}', '{pending ? "登录.." : "登录后台"}']
]);

replaceInFile('src/lib/crypto.ts', [
    ['idCard "" ""', 'idCard || ""']
]);

replaceInFile('src/lib/notifications.ts', [
    ['result.skipped " NotificationStatus.FAILED : NotificationStatus.SENT', 'result.skipped ? NotificationStatus.FAILED : NotificationStatus.SENT']
]);

replaceInFile('src/lib/serializers.ts', [
    ['Array.isArray(job.benefits) " job.benefits : []', 'Array.isArray(job.benefits) ? job.benefits : []']
]);

replaceInFile('src/lib/wechat.ts', [
    ['unionid": string;', 'unionid?: string;']
]);
