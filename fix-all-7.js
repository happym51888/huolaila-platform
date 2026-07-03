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

replaceInFile('src/app/dashboard/applications/page.tsx', [
    ['{applications.length === 0 " (', '{applications.length === 0 ? ('],
    ['目前还没有报名记录"', '目前还没有报名记录']
]);

replaceInFile('src/app/dashboard/messages/page.tsx', [
    ['{current " (', '{current ? (']
]);

replaceInFile('src/app/dashboard/page.tsx', [
    ['最近报"/h3>', '最近报名</h3>']
]);

replaceInFile('src/components/admin/job-form.tsx', [
    ['defaultValue={job".title}', 'defaultValue={job?.title}'],
    ['defaultValue={job".companyId}', 'defaultValue={job?.companyId}']
]);

replaceInFile('src/lib/notifications.ts', [
    ['error instanceof Error " error.message : "WECHAT_SUBSCRIBE_SEND_FAILED"', 'error instanceof Error ? error.message : "WECHAT_SUBSCRIBE_SEND_FAILED"']
]);

replaceInFile('src/lib/serializers.ts', [
    ['messages": Message[];', 'messages: Message[];']
]);
