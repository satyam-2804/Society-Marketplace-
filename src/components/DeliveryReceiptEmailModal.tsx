import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Mail, CheckCircle2, ShoppingBag, MapPin, X, Heart, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DeliveryReceiptEmailModal: React.FC = () => {
  const { deliveredEmailOrder, setDeliveredEmailOrder } = useMarketplace();

  if (!deliveredEmailOrder) return null;

  const order = deliveredEmailOrder;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-800 my-8"
        >
          {/* Email Client Header Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 sm:p-6 relative">
            <button
              onClick={() => setDeliveredEmailOrder(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close Receipt"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
                <Mail className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/40 text-emerald-100 text-[10px] font-extrabold uppercase tracking-wider mb-1 border border-white/20">
                  Automated Delivery Confirmation Email
                </span>
                <h3 className="text-lg sm:text-xl font-black leading-snug">Order Delivered & Receipt</h3>
              </div>
            </div>
          </div>

          {/* Email Envelope Body */}
          <div className="p-5 sm:p-6 space-y-5">
            {/* Metadata Bar */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs space-y-1.5 font-medium">
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-400 font-bold">From:</span>
                <span className="font-extrabold text-slate-900">{order.storeName} &lt;orders@manokamnamarket.com&gt;</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-400 font-bold">To:</span>
                <span className="font-bold text-slate-800">{order.customerEmail} ({order.customerName})</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-400 font-bold">Date:</span>
                <span className="text-slate-600">{new Date(order.createdAt).toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Status Alert Badge */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-emerald-900 text-sm">Order #{order.id} Delivered Successfully!</h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Items handed over at <strong>{order.deliveryAddress}</strong>. Payment Status:{' '}
                  <span className="font-extrabold uppercase text-emerald-700">{order.paymentStatus}</span> ({order.paymentMethod.toUpperCase()}).
                </p>
              </div>
            </div>

            {/* Itemized Order Table */}
            <div>
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Delivered Items Breakdown</span>
              </h5>

              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <th className="p-3">Item</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">
                          {item.productName} <span className="text-[11px] text-slate-400 font-normal">({item.unit})</span>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-700">{item.quantity}</td>
                        <td className="p-3 text-right text-slate-600">₹{item.price}</td>
                        <td className="p-3 text-right font-black text-slate-900">₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Calculations */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Doorstep Delivery Fee</span>
                <span className="font-bold text-slate-900">{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount ({order.couponCode})</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                <span>Total Amount Paid</span>
                <span className="text-emerald-700 text-base">₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Thank You Note Card */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
                <Heart className="w-4 h-4 text-amber-600 fill-amber-600" />
                <span>A Thank You Note from {order.storeName}</span>
              </div>
              <p className="text-xs text-amber-900/90 leading-relaxed font-medium italic">
                "Dear {order.customerName}, thank you so much for ordering with us today! We are honored to serve the resident community of Manokamna Apartments with fresh items and speedy doorstep delivery. Hope you enjoyed our service! Have a wonderful day!"
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2 gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Receipt</span>
              </button>

              <button
                onClick={() => setDeliveredEmailOrder(null)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all"
              >
                Done / Close Receipt
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
