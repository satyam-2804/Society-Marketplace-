import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { X, CheckCircle2, Clock, MapPin, Truck, Share2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderConfirmationModalProps {
  onTrackOrderClick?: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({ onTrackOrderClick }) => {
  const { isOrderSuccessOpen, setIsOrderSuccessOpen, lastPlacedOrder, setActiveOrderTrackId } =
    useMarketplace();

  // 20 minute countdown
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(20 * 60);

  useEffect(() => {
    if (!isOrderSuccessOpen) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOrderSuccessOpen]);

  if (!isOrderSuccessOpen || !lastPlacedOrder) return null;

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // WhatsApp share link generator
  const shareOrderWhatsApp = () => {
    const itemsText = lastPlacedOrder.items
      .map((i) => `• ${i.productName} (${i.unit}) x${i.quantity} - ₹${i.price * i.quantity}`)
      .join('\n');

    const text = `🛍️ *SOCIETY MARKETPLACE ORDER #${lastPlacedOrder.id}*\n
*Store:* ${lastPlacedOrder.storeName}\n
*Items:*\n${itemsText}\n
*Total Amount:* ₹${lastPlacedOrder.totalAmount} (${lastPlacedOrder.paymentMethod.toUpperCase()})\n
*Delivery Address:* ${lastPlacedOrder.deliveryAddress}\n
*Resident:* ${lastPlacedOrder.customerName} (${lastPlacedOrder.customerMobile})\n
⚡ Doorstep delivery estimated in ~20 minutes!`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-slate-800 my-8 text-center"
        >
          {/* Close button */}
          <button
            onClick={() => setIsOrderSuccessOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon Header */}
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <h3 className="text-2xl font-black text-slate-900">Order Placed Successfully!</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Order #{lastPlacedOrder.id} sent to store owner</p>

          {/* Live Delivery Countdown */}
          <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" /> Doorstep Delivery Timer
            </p>
            <div className="text-3xl font-black text-emerald-800 font-mono my-1 tracking-widest">
              {formattedTime}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">Society runner is packing and delivering to your flat</p>
          </div>

          {/* Order Details Summary */}
          <div className="mt-6 bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-bold">Store:</span>
              <span className="font-extrabold text-slate-900">{lastPlacedOrder.storeName}</span>
            </div>

            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-bold">Deliver To:</span>
              <span className="font-extrabold text-slate-900">{lastPlacedOrder.deliveryAddress}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Total Paid:</span>
              <span className="font-black text-emerald-700 text-sm">₹{lastPlacedOrder.totalAmount}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 space-y-2.5">
            <button
              onClick={() => {
                setIsOrderSuccessOpen(false);
                setActiveOrderTrackId(lastPlacedOrder.id);
                if (onTrackOrderClick) onTrackOrderClick();
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4" />
              <span>Track Live Runner Delivery</span>
            </button>

            <button
              onClick={shareOrderWhatsApp}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs border border-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>Share Order Details on WhatsApp</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
