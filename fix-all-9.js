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
    ['{status === "ONBOARDED" " (', '{status === "ONBOARDED" ? (']
]);

replaceInFile('src/components/admin/conversation-panel.tsx', [
    ['message.from === "admin"\n                " "ml-auto bg-teal-600 text-white"\n                : message.from === "candidate"\n                  " "bg-white text-slate-800"\n                  : "bg-slate-100 text-slate-500"', 'message.from === "admin"\n                ? "ml-auto bg-teal-600 text-white"\n                : message.from === "candidate"\n                  ? "bg-white text-slate-800"\n                  : "bg-slate-100 text-slate-500"']
]);

replaceInFile('src/components/admin/job-form.tsx', [
    ['defaultValue={job".employmentMode}', 'defaultValue={job?.employmentMode}']
]);

replaceInFile('src/lib/serializers.ts', [
    ['conversation.messages".map((message) => ({', 'conversation.messages?.map((message) => ({']
]);
