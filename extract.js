
const fs = require('fs');
const html = fs.readFileSync('c:/Users/ADMIN/AppData/Local/Packages/5319275A.WhatsAppDesktop_cv1g1gvanyjgm/LocalState/sessions/4E3910462FE1D12A83FE1829F1816FA502040758/transfers/2026-26/ARIVA_Packages.html', 'utf8');
const match = html.match(/data:image\/png;base64,([^"']+)/);
if(match) {
  fs.writeFileSync('c:/Users/ADMIN/josh/ARIVA-kosam/extracted.png', Buffer.from(match[1], 'base64'));
  console.log('Extracted to extracted.png');
} else {
  console.log('No base64 image found');
}
