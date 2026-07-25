import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
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
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('upi');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!isCheckoutOpen) return null;

  const store = getCartStore();
  const subtotal = getCartSubtotal();
  const discount = getCartDiscount();
  const deliveryFee = getCartDeliveryFee();
  const total = getCartTotal();

  const shopkeeperUpiId =
    store?.upiId ||
    (store?.name ? `${store.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis` : 'shopkeeper@upi');

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(shopkeeperUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handlePlaceOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!deliveryAddress.trim()) {
      setErrorMsg('Please enter your complete society address (Tower & Flat number).');
      return;
    }

    const res = placeOrder(deliveryAddress, paymentMethod, notes);
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
              <label className="block text-xs font-bold text-slate-700 mb-2">Payment Option</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-center text-xs font-extrabold transition-all flex flex-col items-center gap-1 ${
                    paymentMethod === 'upi'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-xl border text-center text-xs font-extrabold transition-all flex flex-col items-center gap-1 ${
                    paymentMethod === 'cod'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Cash on Delivery</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-center text-xs font-extrabold transition-all flex flex-col items-center gap-1 ${
                    paymentMethod === 'card'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Card / NetBanking</span>
                </button>
              </div>

              {/* Shopkeeper Direct UPI Details */}
              {paymentMethod === 'upi' && store && (
                <div className="mt-3 p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-xs space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                        Shopkeeper Direct UPI ID
                      </span>
                      <span className="font-black text-slate-900 text-sm select-all">
                        {shopkeeperUpiId}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1 shrink-0"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy UPI ID</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-emerald-100 flex items-center gap-3">
                    <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                          `upi://pay?pa=${shopkeeperUpiId}&pn=${encodeURIComponent(store.name)}&am=${total}&cu=INR`
                        )}`}
                        alt="Shopkeeper UPI QR Code"
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-[11px] text-slate-600">
                      <p className="font-extrabold text-slate-900">Direct Payment to {store.ownerName}</p>
                      <p className="text-[10px] text-emerald-700 mt-0.5 font-medium leading-relaxed">
                        Scan or pay via GPay / PhonePe / Paytm / BHIM. Payment goes directly to shopkeeper's account.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* COD Details */}
              {paymentMethod === 'cod' && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 flex items-center gap-2.5">
                  <Banknote className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-extrabold text-slate-900">Cash On Delivery (COD) Selected</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Pay cash directly to the doorstep runner upon order delivery at your flat.
                    </p>
                  </div>
                </div>
              )}
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

            {/* Total Summary */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
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
