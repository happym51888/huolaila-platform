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

replaceInFile('src/components/admin/application-status-form.tsx', [
    ['{pending " "保存".." : "更新状"}', '{pending ? "保存.." : "更新状态"}']
]);

replaceInFile('src/components/admin/job-form.tsx', [
    ['defaultValue={job".salaryMin}', 'defaultValue={job?.salaryMin}']
]);

replaceInFile('src/lib/serializers.ts', [
    ['message.senderType === "CANDIDATE"\n              " "user"\n              : message.senderType === "ADMIN"\n                " "recruiter"\n                : "system"', 'message.senderType === "CANDIDATE"\n              ? "user"\n              : message.senderType === "ADMIN"\n                ? "recruiter"\n                : "system"']
]);
