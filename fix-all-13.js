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

replaceInFile('src/components/admin/job-form.tsx', [
    ['defaultValue={job".settlementCycle || "MONTHLY"}', 'defaultValue={job?.settlementCycle || "MONTHLY"}']
]);

replaceInFile('src/lib/match.ts', [
    ['Array.isArray(profile.certificates) " profile.certificates : []', 'Array.isArray(profile.certificates) ? profile.certificates : []'],
    ['Array.isArray(job.certificateRequirements) " job.certificateRequirements : []', 'Array.isArray(job.certificateRequirements) ? job.certificateRequirements : []']
]);
