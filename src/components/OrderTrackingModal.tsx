import React, { useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { OrderStatus } from '../types';
import { X, CheckCircle2, Truck, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'pending', label: 'Order Placed', desc: 'Sent to store owner' },
  { status: 'accepted', label: 'Order Accepted', desc: 'Store owner confirmed' },
  { status: 'preparing', label: 'Preparing & Packing', desc: 'Fresh items packed in shop' },
  { status: 'out_for_delivery', label: 'Out for Delivery', desc: 'Society runner on the way' },
  { status: 'delivered', label: 'Delivered', desc: 'Handed over at doorstep' },
];

export const OrderTrackingModal: React.FC = () => {
  const { activeOrderTrackId, setActiveOrderTrackId, orders, stores } = useMarketplace();

  useEffect(() => {
    if (activeOrderTrackId) {
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
          zIndex: 100,
        });
      } catch (e) {
        // ignore
      }
    }
  }, [activeOrderTrackId]);

  if (!activeOrderTrackId) return null;

  const order = orders.find((o) => o.id === activeOrderTrackId);
  if (!order) return null;

  const store = stores.find((s) => s.id === order.storeId);

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'accepted':
        return 1;
      case 'preparing':
        return 2;
      case 'out_for_delivery':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(order.status);

  const formattedOrderId = order.id.startsWith('ORD-') ? order.id : `ORD-${order.id}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-800 my-8"
        >
          {/* Close button */}
          <button
            onClick={() => setActiveOrderTrackId(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl font-bold border border-emerald-100 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Track Order #{formattedOrderId}</h3>
              <p className="text-xs text-slate-500 font-semibold">{order.storeName || store?.name || 'Society Shop'}</p>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="my-6 space-y-6 relative pl-6 border-l-2 border-slate-200 ml-3">
            {STATUS_STEPS.map((step, idx) => {
              const isDone = idx <= currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div key={step.status} className="relative flex items-start gap-3">
                  <div
                    className={`absolute -left-[33px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-600 border-2 border-emerald-600 text-white shadow-3xs'
                        : 'bg-white border-2 border-slate-300'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </div>

                  <div>
                    <h4
                      className={`text-xs font-black ${
                        isDone ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Store Contact Card */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs mt-6">
            <div>
              <p className="font-extrabold text-slate-900 text-sm">{store?.name || order.storeName}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{store?.blockLocation || 'B7/22 Pocket-1'}</p>
            </div>
            <a
              href={`tel:${store?.ownerPhone || '+919811122334'}`}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all"
            >
              <Phone className="w-3.5 h-3.5" /> Call Shop
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

