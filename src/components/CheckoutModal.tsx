import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { safeToLower } from '../lib/storage';
import { GmailConnectButton } from './GmailConnectButton';
import { X, MapPin, Phone, User, QrCode, CreditCard, Banknote, Clock, ArrowRight, ShieldCheck, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    currentUser,
    getCartStore,
    getCartSubtotal,
    getCartDiscount,
    getCartDeliveryFee,
    getCartTotal,
    placeOrder,
  } = useMarketplace();

  const [deliveryAddress, setDeliveryAddress] = useState(
    currentUser?.address || 'Tower 4, Flat 602, Manokamna Apartments'
  );
  const [mobile, setMobile] = useState(currentUser?.mobile || '+91 98111 22334');
  const [fullName, setFullName] = useState(currentUser?.fullName || 'Rahul Verma');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('cod');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Sync profile details whenever checkout opens or user changes
  React.useEffect(() => {
    if (isCheckoutOpen && currentUser) {
      if (currentUser.fullName) setFullName(currentUser.fullName);
      if (currentUser.mobile) setMobile(currentUser.mobile);
      if (currentUser.address) setDeliveryAddress(currentUser.address);
    }
  }, [isCheckoutOpen, currentUser]);

  if (!isCheckoutOpen) return null;

  const store = getCartStore();
  const subtotal = getCartSubtotal();
  const discount = getCartDiscount();
  const deliveryFee = getCartDeliveryFee();
  const total = getCartTotal();

  const shopkeeperUpiId =
    store?.upiId ||
    (store?.name ? `${safeToLower(store.name).replace(/[^a-z0-9]/g, '')}@okaxis` : 'shopkeeper@upi');

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(shopkeeperUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handlePlaceOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!mobile.trim()) {
      setErrorMsg('Please enter your mobile number.');
      return;
    }
    if (!deliveryAddress.trim()) {
      setErrorMsg('Please enter your complete society address (Tower & Flat number).');
      return;
    }

    try {
      const res = placeOrder(deliveryAddress, 'cod', notes);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (err) {
          // fallback
        }
      }
    } catch (err: any) {
      console.error('Order placement error:', err);
      setErrorMsg(err?.message || 'Failed to place order. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-slate-800 my-8"
        >
          {/* Close button */}
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Doorstep Delivery Checkout</h3>
              {store && <p className="text-xs text-emerald-700 font-semibold">{store.name}</p>}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl mb-4">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handlePlaceOrderSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600" /> Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> Mobile Number
              </label>
              <input
                type="text"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Complete Flat Address (Society Tower)
              </label>
              <input
                type="text"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="e.g. Tower 4, Flat 602"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
              />
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-2.5 uppercase tracking-wider">
                Doorstep Payment Method
              </label>
              <div className="p-4 bg-emerald-50/80 border-2 border-emerald-600 rounded-2xl text-xs text-emerald-950 flex items-center gap-3">
                <Banknote className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-black text-sm">PAY After Delivery</p>
                  <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                    Pay cash or online directly to the society runner upon successful doorstep delivery at your flat.
                  </p>
                </div>
              </div>
            </div>

            {/* Note for runner */}
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

            {/* Gmail Receipt Notification Status */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                <p className="font-bold">Email Order Receipt</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Directly sent to customer & shop owner via Gmail API</p>
              </div>
              <GmailConnectButton compact />
            </div>

            {/* Total Summary */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-black text-slate-900 text-sm">₹{total}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Estimated Doorstep Delivery: 15-20 Mins</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Confirm & Place Doorstep Order (₹{total})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
