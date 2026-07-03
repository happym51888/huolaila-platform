const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/messages/page.tsx', 'utf8');
c = c.replace(/暂时没有求职者会.*<\/p>/, '暂时没有求职者会话</p>');
fs.writeFileSync('src/app/dashboard/messages/page.tsx', c, 'utf8');