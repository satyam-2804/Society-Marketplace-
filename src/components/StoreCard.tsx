import React from 'react';
import { Store } from '../types';
import { MapPin, Star, Clock, ShoppingBag, Tag } from 'lucide-react';
import { motion } from 'motion/react';

interface StoreCardProps {
  store: Store;
  isSelected: boolean;
  onSelect: (storeId: string) => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, isSelected, onSelect }) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(store.id)}
      className={`group relative rounded-2xl bg-white border transition-all cursor-pointer overflow-hidden shadow-xs ${
        isSelected
          ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md'
          : 'border-slate-200 hover:border-emerald-500'
      }`}
    >
      {/* Store Banner & Thumbnail */}
      <div className="relative h-32 w-full overflow-hidden bg-slate-100">
        <img
          src={store.image}
          alt={store.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {store.isOpen && store.status === 'active' ? (
            <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              OPEN NOW
            </span>
          ) : (
            <span className="bg-rose-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-xs">
              CLOSED
            </span>
          )}
        </div>

        {/* Location Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs border border-slate-200 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-800 flex items-center gap-1 shadow-xs">
          <MapPin className="w-3 h-3 text-emerald-600" />
          <span>{store.blockLocation}</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
              {store.name}
            </h4>
            <p className="text-xs text-slate-500 line-clamp-1 font-medium">{store.category}</p>
          </div>

          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-amber-800 text-xs font-extrabold shrink-0">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span>{store.rating || 5.0}</span>
          </div>
        </div>

        {/* Store Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100 font-medium">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{store.deliveryTimeMinutes || 15} mins delivery</span>
          </div>
          <div>
            <span>Min ₹{store.minOrderAmount || 50}</span>
          </div>
        </div>

        {/* Offers if any */}
        {store.offers && store.offers.length > 0 && (
          <div className="pt-1 flex items-center gap-1.5 text-[10px] text-emerald-800 font-semibold truncate bg-emerald-50 px-2 py-1 rounded-xl border border-emerald-100">
            <Tag className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">{store.offers[0]}</span>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(store.id);
          }}
          className={`w-full mt-2 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            isSelected
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{isSelected ? 'Viewing Products' : 'Explore Store'}</span>
        </button>
      </div>
    </motion.div>
  );
};
