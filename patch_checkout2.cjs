const fs = require('fs');
let code = fs.readFileSync('src/components/CheckoutModal.tsx', 'utf8');

if (!code.includes('GmailConnectButton')) {
  code = code.replace("import { useMarketplace } from '../context/MarketplaceContext';", "import { useMarketplace } from '../context/MarketplaceContext';\nimport { GmailConnectButton } from './GmailConnectButton';");
}

const checkTarget = `    setErrorMsg(null);
`;
const checkReplacement = `    setErrorMsg(null);
    if (!isGmailLinked) {
      setErrorMsg('Please connect your Gmail account before placing the order so we can send the order details to the shopkeeper.');
      return;
    }
`;
if (code.includes(checkTarget) && !code.includes('if (!isGmailLinked)')) {
  code = code.replace(checkTarget, checkReplacement);
}

const uiTarget = `            {/* Note for runner */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Instruction for Runner (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Leave at flat door / Don't ring bell"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
              />
            </div>`;
const uiReplacement = `            {/* Note for runner */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Instruction for Runner (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Leave at flat door / Don't ring bell"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
              />
            </div>

            {/* Gmail Connect Section */}
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
if (code.includes(uiTarget) && !code.includes('Required: Connect Gmail')) {
  code = code.replace(uiTarget, uiReplacement);
}

fs.writeFileSync('src/components/CheckoutModal.tsx', code);
console.log("CheckoutModal patched again");
