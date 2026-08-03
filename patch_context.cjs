const fs = require('fs');
let code = fs.readFileSync('src/context/MarketplaceContext.tsx', 'utf8');

code = code.replace(/    sendCustomerReceiptEmail\(newOrder\);/g, '    // sendCustomerReceiptEmail(newOrder);');
code = code.replace(/    sendStatusEmail\(\{ \.\.\.targetOrder, \.\.\.updatedOrderFields \}, status\);/g, '    // sendStatusEmail({ ...targetOrder, ...updatedOrderFields }, status);');

fs.writeFileSync('src/context/MarketplaceContext.tsx', code);
console.log("Context patched");
