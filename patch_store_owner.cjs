const fs = require('fs');
let code = fs.readFileSync('src/components/storeOwner/StoreOwnerDashboard.tsx', 'utf8');

const gmailImport = "import { GmailConnectButton } from '../GmailConnectButton';\n";
code = code.replace(gmailImport, '');

const target = `<GmailConnectButton />`;
code = code.replace(target, '');

fs.writeFileSync('src/components/storeOwner/StoreOwnerDashboard.tsx', code);
console.log("StoreOwnerDashboard patched");
