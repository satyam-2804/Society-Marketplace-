import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { OrderStatus } from '../types';
import { X, CheckCircle2, Truck, Store, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'pending', label: 'Order Placed', desc: 'Sent to store owner' },
  { status: 'accepted', label: 'Order Accepted', desc: 'Store owner confirmed' },
  { status: 'preparing', label: 'Preparing & Packing', desc: 'Fresh items packed in shop' },
  { status: 'out_for_delivery', label: 'Out for Delivery', desc: 'Society runner on the way' },
  { status: 'delivered', label: 'Delivered', desc: 'Handed over at doorstep' },
];

export const OrderTrackingModal: React.FC = () => {
  const { activeOrderTrackId, setActiveOrderTrackId, orders, stores } = useMarketplace();

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
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Track Order #{order.id}</h3>
              <p className="text-xs text-slate-500 font-semibold">{order.storeName}</p>
            </div>
          </div>

          {/* Stepper */}
          <div className="my-6 space-y-4 relative pl-4 border-l-2 border-slate-200 ml-2">
            {STATUS_STEPS.map((step, idx) => {
              const isDone = idx <= currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div key={step.status} className="relative flex items-start gap-3">
                  <div
                    className={`absolute -left-[23px] top-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-slate-300'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        isCurrent ? 'text-emerald-700 font-extrabold text-sm' : isDone ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contact Details */}
          {store && (
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900">{store.name}</p>
                <p className="text-[11px] text-slate-500">{store.blockLocation}</p>
              </div>
              <a
                href={`tel:${store.ownerPhone}`}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" /> Call Shop
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
