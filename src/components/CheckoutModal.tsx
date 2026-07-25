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
              <label className="block text-xs font-black text-slate-700 mb-2.5 uppercase tracking-wider">
                Select Doorstep Payment Option
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3.5 rounded-2xl border-2 text-center text-xs font-black transition-all flex flex-col items-center gap-2 ${
                    paymentMethod === 'upi'
                      ? 'bg-emerald-50/80 border-emerald-600 text-emerald-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  <span>Direct UPI / Online</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3.5 rounded-2xl border-2 text-center text-xs font-black transition-all flex flex-col items-center gap-2 ${
                    paymentMethod === 'cod'
                      ? 'bg-emerald-50/80 border-emerald-600 text-emerald-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <span>Pay Cash on Delivery</span>
                </button>
              </div>

              {/* Shopkeeper Direct UPI Details & Automated Apps */}
              {paymentMethod === 'upi' && store && (
                <div className="mt-3.5 p-4 bg-emerald-50/90 border border-emerald-200 rounded-3xl text-xs space-y-3 shadow-xs">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                        Direct Payee UPI ID
                      </span>
                      <span className="font-black text-slate-950 text-sm select-all">
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
                          <span>Copy ID</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Direct Mobile UPI App Click-to-Pay (Auto pre-fills UPI ID and Amount) */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                      Pay via UPI App on this Phone
                    </span>
                    <a
                      href={`upi://pay?pa=${shopkeeperUpiId}&pn=${encodeURIComponent(store.name)}&am=${total}&cu=INR&tn=${encodeURIComponent(`Order from Society Marketplace`)}`}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95 text-center decoration-none"
                    >
                      <span>⚡ Open Google Pay / PhonePe / Paytm</span>
                    </a>
                    
                    {/* Visual indicators for popular apps */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      <a
                        href={`upi://pay?pa=${shopkeeperUpiId}&pn=${encodeURIComponent(store.name)}&am=${total}&cu=INR`}
                        className="py-1.5 bg-white border border-slate-200 hover:border-emerald-500 rounded-lg text-[10px] font-bold text-center block text-slate-700 active:scale-95"
                      >
                        GPay
                      </a>
                      <a
                        href={`upi://pay?pa=${shopkeeperUpiId}&pn=${encodeURIComponent(store.name)}&am=${total}&cu=INR`}
                        className="py-1.5 bg-white border border-slate-200 hover:border-emerald-500 rounded-lg text-[10px] font-bold text-center block text-slate-700 active:scale-95"
                      >
                        PhonePe
                      </a>
                      <a
                        href={`upi://pay?pa=${shopkeeperUpiId}&pn=${encodeURIComponent(store.name)}&am=${total}&cu=INR`}
                        className="py-1.5 bg-white border border-slate-200 hover:border-emerald-500 rounded-lg text-[10px] font-bold text-center block text-slate-700 active:scale-95"
                      >
                        Paytm
                      </a>
                      <a
                        href={`upi://pay?pa=${shopkeeperUpiId}&pn=${encodeURIComponent(store.name)}&am=${total}&cu=INR`}
                        className="py-1.5 bg-white border border-slate-200 hover:border-emerald-500 rounded-lg text-[10px] font-bold text-center block text-slate-700 active:scale-95"
                      >
                        BHIM
                      </a>
                    </div>
                  </div>

                  {/* QR Code fallback for PC/Desktop */}
                  <div className="pt-2 border-t border-emerald-100/50">
                    <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block mb-2">
                      Or Scan QR Code (For Desktop / Laptop Users)
                    </span>
                    <div className="p-2.5 bg-white rounded-2xl border border-emerald-100 flex items-center gap-3.5">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                            `upi://pay?pa=${shopkeeperUpiId}&pn=${encodeURIComponent(store.name)}&am=${total}&cu=INR&tn=SocietyMarketplace`
                          )}`}
                          alt="Shopkeeper UPI QR Code"
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-[11px] text-slate-600 leading-relaxed">
                        <p className="font-extrabold text-slate-900">Direct Online Payment to {store.ownerName}</p>
                        <p className="text-[10px] text-emerald-700 mt-0.5 font-medium">
                          The UPI ID & amount <strong className="font-black text-slate-950 text-xs">₹{total}</strong> will load automatically when you tap or scan!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* COD Details */}
              {paymentMethod === 'cod' && (
                <div className="mt-3.5 p-4 bg-slate-50 border border-slate-200 rounded-3xl text-xs text-slate-700 flex items-start gap-3">
                  <Banknote className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-slate-900">Cash On Delivery Selected</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-relaxed">
                      You can pay cash directly to the doorstep runner upon order delivery at your flat.
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
