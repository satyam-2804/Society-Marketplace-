const fs = require('fs');
let code = fs.readFileSync('src/components/customer/CustomerDashboard.tsx', 'utf8');

const gmailImport = "import { GmailConnectButton } from '../GmailConnectButton';\n";
code = code.replace(gmailImport, '');

const gmailSection = `          {/* Gmail API Email Receipts Card */}
          <GmailConnectButton />`;
code = code.replace(gmailSection, '');

fs.writeFileSync('src/components/customer/CustomerDashboard.tsx', code);
console.log("CustomerDashboard patched");
