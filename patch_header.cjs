const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

const target = `<div className="pt-1">
                            <GmailConnectButton compact />
                          </div>`;
const replacement = `<div className="pt-1">
                            {currentRole === 'admin' && <GmailConnectButton compact />}
                          </div>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/Header.tsx', code);
  console.log("Header patched");
} else {
  console.log("Header target not found");
}
