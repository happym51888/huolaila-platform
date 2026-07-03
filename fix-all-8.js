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

replaceInFile('src/app/dashboard/messages/page.tsx', [
    ['{conversations.length === 0 ? (\n            <p className="text-sm text-slate-500">暂时没有求职者会话</p>\n          ) : null}\n        </div>\n      </section>\n\n      <section className="rounded-[2rem] bg-white p-6 shadow-sm">\n        {current ? (', '{conversations.length === 0 ? (\n            <p className="text-sm text-slate-500">暂时没有求职者会话</p>\n          ) : null}\n        </div>\n      </section>\n\n      <section className="rounded-[2rem] bg-white p-6 shadow-sm">\n        {current ? (']
]);

replaceInFile('src/app/dashboard/page.tsx', [
    ['{application.candidate.profile".realName || application.candidate.wechatNickname || "未填"}', '{application.candidate.profile?.realName || application.candidate.wechatNickname || "未填"}']
]);

replaceInFile('src/components/admin/application-status-form.tsx', [
    ['status === "ONBOARDED" " Number(commissionAmount) : undefined', 'status === "ONBOARDED" ? Number(commissionAmount) : undefined']
]);

replaceInFile('src/components/admin/job-form.tsx', [
    ['defaultValue={job".industry}', 'defaultValue={job?.industry}'],
    ['defaultValue={job".district}', 'defaultValue={job?.district}'],
    ['defaultValue={job".location}', 'defaultValue={job?.location}']
]);

replaceInFile('src/lib/serializers.ts', [
    ['conversation.job".title', 'conversation.job?.title'],
    ['conversation.lastMessageAt".toISOString() "" conversation.updatedAt.toISOString()', 'conversation.lastMessageAt?.toISOString() || conversation.updatedAt.toISOString()']
]);

replaceInFile('src/lib/sms.ts', [
    ['result.SendStatusSet".[0];', 'result.SendStatusSet?.[0];'],
    ['status".Message', 'status?.Message']
]);
