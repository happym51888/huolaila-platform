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
    ['profile.idCardEncrypted " "已加密存" : ""', 'profile.idCardEncrypted ? "已加密存" : ""'],
    ['profile.education === "PRIMARY_MIDDLE"\n                " "初中"', 'profile.education === "PRIMARY_MIDDLE"\n                ? "初中"']
]);

replaceInFile('src/app/dashboard/applications/page.tsx', [
    ['application.candidate.profile".realName', 'application.candidate.profile?.realName'],
    ['未填写姓"}', '未填写姓名"}']
]);

replaceInFile('src/app/dashboard/messages/page.tsx', [
    ['current".id === conversation.id\n                  " "border-teal-500 bg-teal-50"\n                  : "border-slate-200 bg-slate-50"', 'current?.id === conversation.id\n                  ? "border-teal-500 bg-teal-50"\n                  : "border-slate-200 bg-slate-50"']
]);

replaceInFile('src/app/dashboard/page.tsx', [
    ['今天继续把岗位和报名跑起"/h2>', '今天继续把岗位和报名跑起来</h2>'],
    ['您当前看到的是可上线版后台骨架，已经接了数据库模型、认证、审核流、报名流和通知接口"', '您当前看到的是可上线版后台骨架，已经接了数据库模型、认证、审核流、报名流和通知接口。']
]);

replaceInFile('src/components/admin/job-form.tsx', [
    ['job " `/api/admin/jobs/${job.id}` : "/api/admin/jobs"', 'job ? `/api/admin/jobs/${job.id}` : "/api/admin/jobs"'],
    ['job " "PATCH" : "POST"', 'job ? "PATCH" : "POST"']
]);

replaceInFile('src/lib/notifications.ts', [
    ['result.skipped " result.reason : undefined', 'result.skipped ? result.reason : undefined']
]);

replaceInFile('src/lib/serializers.ts', [
    ['job.createdBy".name', 'job.createdBy?.name'],
    ['job.createdBy".phone', 'job.createdBy?.phone'],
    ['job.createdBy".wechatId', 'job.createdBy?.wechatId']
]);

replaceInFile('src/lib/wechat.ts', [
    ['page": string;', 'page?: string;']
]);
