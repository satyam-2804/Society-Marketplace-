import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Home, Store, Clock, User, ShoppingBag, ShieldCheck } from 'lucide-react';

interface BottomNavProps {
  activeView: 'home' | 'stores' | 'orders' | 'profile' | 'dashboard';
  setActiveView: (view: 'home' | 'stores' | 'orders' | 'profile' | 'dashboard') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  const { cart, currentRole, setIsCartDrawerOpen } = useMarketplace();

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md px-2 py-2 shadow-lg">
      <div className={`flex items-center ${currentRole === 'store_owner' ? 'justify-center' : 'justify-around'}`}>
        {currentRole !== 'store_owner' && (
          <button
            onClick={() => setActiveView('home')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-colors ${
              activeView === 'home' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>
        )}

        {currentRole !== 'store_owner' && (
          <button
            onClick={() => setActiveView('stores')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-colors ${
              activeView === 'stores' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Store className="w-5 h-5" />
            <span>Shops</span>
          </button>
        )}

        {currentRole !== 'admin' && currentRole !== 'store_owner' && (
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                  {cartItemsCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </button>
        )}

        {currentRole !== 'admin' && currentRole !== 'store_owner' && (
          <button
            onClick={() => setActiveView('orders')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-colors ${
              activeView === 'orders' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>Orders</span>
          </button>
        )}

        {(currentRole === 'admin' || currentRole === 'store_owner') ? (
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-colors ${
              activeView === 'dashboard'
                ? currentRole === 'admin'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-amber-600 dark:text-amber-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {currentRole === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <Store className="w-5 h-5" />}
            <span>{currentRole === 'admin' ? 'Admin' : 'Store Portal'}</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveView('profile')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-colors ${
              activeView === 'profile' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </button>
        )}
      </div>
    </nav>
  );
};
