import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { UserRole } from '../types';
import { ShieldCheck, Store, User, ChevronDown, Check, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const RoleSwapper: React.FC = () => {
  const { currentRole, currentUser, switchRoleQuick, stores } = useMarketplace();
  const [isOpen, setIsOpen] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin', color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100', icon: ShieldCheck };
      case 'store_owner':
        return { label: 'Store Owner', color: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100', icon: Store };
      case 'customer':
        return { label: 'Customer', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100', icon: User };
      default:
        return { label: 'Guest', color: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200', icon: User };
    }
  };

  const currentBadge = getRoleBadge(currentRole);
  const Icon = currentBadge.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shadow-sm active:scale-95 shrink-0 ${currentBadge.color}`}
        title="Quick Role Tester for Reviewers"
      >
        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse shrink-0" />
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden xs:inline">{currentBadge.label}</span>
        {currentUser && currentRole === 'store_owner' && (
          <span className="hidden md:inline text-slate-500 opacity-90 font-normal">
            ({stores.find((s) => s.id === currentUser.storeId)?.name || 'Store'})
          </span>
        )}
        <ChevronDown className="w-3 h-3 opacity-60 ml-0.5 shrink-0" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-64 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 text-slate-800"
            >
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Switch Access Role</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">Quick Access</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Test app as Admin, Store Owner or Resident</p>
              </div>

              <div className="space-y-1">
                {/* Admin */}
                <button
                  onClick={() => {
                    switchRoleQuick('admin');
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                    currentRole === 'admin'
                      ? 'bg-rose-50 text-rose-800 font-semibold border border-rose-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    <div>
                      <p className="font-semibold">Society Admin</p>
                      <p className="text-[10px] text-slate-500">Full control & management</p>
                    </div>
                  </div>
                  {currentRole === 'admin' && <Check className="w-3.5 h-3.5 text-rose-600" />}
                </button>

                {/* Store Owners */}
                <div className="pt-1 border-t border-slate-100">
                  <p className="px-3 py-1 text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                    Store Owners
                  </p>
                  {stores.length === 0 ? (
                    <p className="px-3 py-1 text-[11px] text-slate-400 italic">No stores registered yet</p>
                  ) : (
                    stores.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          switchRoleQuick('store_owner', s.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-left transition-colors ${
                          currentRole === 'store_owner' && currentUser?.storeId === s.id
                            ? 'bg-amber-50 text-amber-800 font-semibold border border-amber-200'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Store className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">{s.name}</span>
                        </div>
                        {currentRole === 'store_owner' && currentUser?.storeId === s.id && (
                          <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>

                {/* Resident Customer */}
                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      switchRoleQuick('customer');
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                      currentRole === 'customer'
                        ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="font-semibold">Resident Customer</p>
                        <p className="text-[10px] text-slate-500">Tower 4, Apt 602 (Rahul)</p>
                      </div>
                    </div>
                    {currentRole === 'customer' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                </div>

                {/* Guest */}
                <button
                  onClick={() => {
                    switchRoleQuick('guest');
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-left transition-colors ${
                    currentRole === 'guest' ? 'bg-slate-100 text-slate-800 font-semibold' : 'hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  <span>Browse as Guest Visitor</span>
                  {currentRole === 'guest' && <Check className="w-3.5 h-3.5 text-slate-600" />}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
