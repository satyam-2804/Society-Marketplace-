import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const HeroBanner: React.FC = () => {
  const { banners } = useMarketplace();
  const [currentSlide, setCurrentSlide] = useState(0);

  const activeBanners = banners.filter((b) => b.isActive);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const banner = activeBanners[currentSlide] || activeBanners[0];

  return (
    <div className="space-y-6">
      {/* Hero Carousel Banner */}
      {banner && (
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 group">
          <div className="relative h-60 sm:h-72 lg:h-80 w-full overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={banner.id}
                src={banner.image}
                alt={banner.title}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full object-cover brightness-[0.55] group-hover:scale-105 transition-transform duration-700"
              />
            </AnimatePresence>

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />

            {/* Banner Text Content */}
            <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-3 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{banner.tag}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-2 drop-shadow-md">
                {banner.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 font-normal line-clamp-2 mb-4 leading-relaxed">
                {banner.subtitle}
              </p>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-white bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-700 backdrop-blur-md font-medium w-fit">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Doorstep Delivery: ~20 Mins</span>
                </div>
              </div>
            </div>

            {/* Navigation Dots */}
            {activeBanners.length > 1 && (
              <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-10">
                {activeBanners.map((b, idx) => (
                  <button
                    key={b.id}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentSlide ? 'w-6 bg-emerald-500' : 'w-2 bg-slate-400 hover:bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
