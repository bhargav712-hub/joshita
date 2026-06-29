const fs = require('fs');
const html = fs.readFileSync('c:/Users/ADMIN/AppData/Local/Packages/5319275A.WhatsAppDesktop_cv1g1gvanyjgm/LocalState/sessions/4E3910462FE1D12A83FE1829F1816FA502040758/transfers/2026-25/ARIVA_The_Menu.html', 'utf8');
const text = html.replace(/<[^>]+>/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/&middot;/g, '·').replace(/&mdash;/g, '—').replace(/&#8377;/g, '₹').replace(/&amp;/g, '&');
console.log(text);
