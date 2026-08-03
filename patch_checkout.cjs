const fs = require('fs');
let code = fs.readFileSync('src/components/CheckoutModal.tsx', 'utf8');

code = code.replace(/    if \(\!isGmailLinked\) \{\s*setErrorMsg\('Please connect your Gmail account before placing the order so we can send the order details to the shopkeeper.'\);\s*return;\s*\}/g, '');

const gmailSection = `            {/* Gmail Connect Section */}
            {!isGmailLinked && (
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800 flex flex-col gap-2">
                <div className="text-[11px] text-slate-700 dark:text-slate-300">
                  <p className="font-bold text-rose-800 dark:text-rose-400 mb-0.5">Required: Connect Gmail</p>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
                    You must connect your Gmail to send the order details directly to the shopkeeper's email.
                  </p>
                </div>
                <GmailConnectButton compact />
              </div>
            )}
            
            {isGmailLinked && (
              <div className="py-2 border-y border-slate-100 dark:border-slate-800">
                <GmailConnectButton compact />
              </div>
            )}`;
code = code.replace(gmailSection, '');

fs.writeFileSync('src/components/CheckoutModal.tsx', code);
console.log("CheckoutModal patched");
