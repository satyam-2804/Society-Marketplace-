const fs = require('fs');
let code = fs.readFileSync('src/context/MarketplaceContext.tsx', 'utf8');

const placeOrderTarget = `  const placeOrder = (
    deliveryAddress: string,
    paymentMethod: 'cod' | 'upi' | 'card',
    notes?: string
  ) => {
    if (cart.length === 0) {
      return { success: false, message: 'Your cart is empty!' };
    }`;

const placeOrderReplacement = `  const placeOrder = (
    deliveryAddress: string,
    paymentMethod: 'cod' | 'upi' | 'card',
    notes?: string
  ) => {
    if (currentUser?.isBanned) {
      return { success: false, message: 'Your account has been banned from the society marketplace. You cannot place orders.' };
    }

    if (cart.length === 0) {
      return { success: false, message: 'Your cart is empty!' };
    }`;

if (code.includes(placeOrderTarget)) {
  code = code.replace(placeOrderTarget, placeOrderReplacement);
  fs.writeFileSync('src/context/MarketplaceContext.tsx', code);
  console.log('MarketplaceContext placeOrder patched');
} else {
  console.log('Target not found in MarketplaceContext.tsx');
}
