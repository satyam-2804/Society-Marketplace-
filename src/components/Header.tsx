import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { RoleSwapper } from './RoleSwapper';
import {
  Building2,
  Search,
  ShoppingBag,
  Bell,
  User as UserIcon,
  MapPin,
  Clock,
  Sparkles,
  LogOut,
  Truck,
  ShieldCheck,
  Store,
  Sun,
  Moon,
  Smartphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  onOpenOrders?: () => void;
  activeView: 'home' | 'stores' | 'orders' | 'profile' | 'dashboard';
  setActiveView: (view: 'home' | 'stores' | 'orders' | 'profile' | 'dashboard') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenOrders,
  activeView,
  setActiveView,
}) => {
  const {
    currentUser,
    currentRole,
    cart,
    notifications,
    searchQuery,
    setSearchQuery,
    setIsCartDrawerOpen,
    openAuthModal,
    logout,
    orders,
    setActiveOrderTrackId,
    markNotificationAsRead,
    themeMode,
    setThemeMode,
    isAdminTester,
  } = useMarketplace();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotifs = notifications.filter((n) => !n.isRead && (n.userId === 'all' || n.userId === currentUser?.id));

  // Check active active orders
  const activeOrder = orders.find(
    (o) =>
      (o.customerId === currentUser?.id || currentRole === 'guest') &&
      o.status !== 'delivered' &&
      o.status !== 'rejected' &&
      o.status !== 'cancelled'
  );

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-slate-200 shadow-sm transition-all">
      {/* Top Banner Notice */}
      <div className="bg-emerald-600 px-4 py-1.5 text-center text-[11px] sm:text-xs text-white font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
        <span className="truncate">
          <strong className="font-bold">Manokamna Apartments Society Marketplace:</strong> Guaranteed doorstep delivery within 20 minutes from inside shops!
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-1.5 sm:gap-3">
          {/* Brand Logo & Location */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setActiveView('home')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform shrink-0">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <span className="text-sm sm:text-lg font-black tracking-tight flex items-center gap-1 font-sans">
                  <span className="text-slate-900 dark:text-emerald-300 font-extrabold">Society</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">Marketplace</span>
                </span>
                <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-500 font-medium -mt-0.5">
                  <MapPin className="w-2.5 h-2.5 text-emerald-600" />
                  <span className="truncate max-w-[130px] sm:max-w-none">Manokamna Apartments</span>
                </span>
              </div>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick Role Swapper */}
            {isAdminTester && <RoleSwapper />}

            {/* Active Order Tracker Button if exists */}
            {activeOrder && (
              <button
                onClick={() => {
                  setActiveOrderTrackId(activeOrder.id);
                  if (onOpenOrders) onOpenOrders();
                  else setActiveView('orders');
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors shrink-0"
              >
                <Truck className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                <span>Track Order #{activeOrder.id}</span>
              </button>
            )}

            {/* Admin / Store Owner Dashboard Shortcut */}
            {(currentRole === 'admin' || currentRole === 'store_owner') && (
              <button
                onClick={() => setActiveView('dashboard')}
                className={`hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 ${
                  currentRole === 'admin'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
              >
                {currentRole === 'admin' ? <ShieldCheck className="w-4 h-4 text-rose-600" /> : <Store className="w-4 h-4 text-amber-600" />}
                <span>{currentRole === 'admin' ? 'Admin Panel' : 'Store Portal'}</span>
              </button>
            )}

            {/* System / Phone Theme Toggle Button */}
            <button
              onClick={() => {
                if (themeMode === 'system') setThemeMode('light');
                else if (themeMode === 'light') setThemeMode('dark');
                else setThemeMode('system');
              }}
              title={`Theme: ${themeMode === 'system' ? 'Synced with Phone Theme' : themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}`}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0"
              aria-label="Toggle theme mode"
            >
              {themeMode === 'system' ? (
                <>
                  <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="hidden xl:inline text-[11px]">Phone Theme</span>
                </>
              ) : themeMode === 'dark' ? (
                <>
                  <Moon className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="hidden xl:inline text-[11px]">Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="hidden xl:inline text-[11px]">Light Mode</span>
                </>
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 sm:p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors relative flex items-center justify-center"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              <AnimatePresence>
                {isNotifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 text-slate-800"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h4 className="text-sm font-bold flex items-center gap-2 text-slate-900">
                          <Bell className="w-4 h-4 text-emerald-600" /> Notifications
                        </h4>
                        <span className="text-xs text-slate-500 font-medium">{notifications.length} total</span>
                      </div>

                      {typeof window !== 'undefined' && 'Notification' in window && notifPermission === 'default' && (
                        <div className="my-2 p-2.5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex flex-col gap-1.5 items-start text-xs text-emerald-800">
                          <p className="font-bold flex items-center gap-1.5 text-slate-900">
                            <Smartphone className="w-4 h-4 text-emerald-600 animate-bounce" /> Enable Blinkit-style Alerts?
                          </p>
                          <p className="text-[10px] text-emerald-700/90 font-medium leading-relaxed">
                            Get instant status updates for order accepted, out-for-delivery, and delivered on your screen!
                          </p>
                          <button
                            onClick={async () => {
                              const res = await Notification.requestPermission();
                              setNotifPermission(res);
                              if (res === 'granted') {
                                new Notification("🎉 Push Notifications Enabled!", {
                                  body: "You will now get instant Blinkit-style notifications for your orders!",
                                  icon: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80",
                                });
                              }
                            }}
                            className="w-full text-center px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors text-[10px] shadow-sm shadow-emerald-600/10 cursor-pointer"
                          >
                            Turn On Notifications
                          </button>
                        </div>
                      )}

                      <div className="max-h-80 overflow-y-auto space-y-2 mt-3 pr-1">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-6">No notifications yet</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => markNotificationAsRead(n.id)}
                              className={`p-3 rounded-xl border transition-colors cursor-pointer text-xs ${
                                !n.isRead
                                  ? 'bg-emerald-50/70 border-emerald-200 text-slate-800'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-semibold text-slate-900 text-xs">{n.title}</p>
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="mt-1 text-slate-600 leading-relaxed text-[11px]">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Shopping Cart Drawer Trigger */}
            {currentRole !== 'admin' && (
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative p-2 sm:px-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-1 sm:gap-1.5 shrink-0"
              >
                <ShoppingBag className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span className="hidden sm:inline text-xs font-extrabold">Cart</span>
                {cartItemsCount > 0 && (
                  <span className="bg-white text-emerald-700 text-[11px] font-black px-1.5 sm:px-2 py-0.5 rounded-full ml-0.5 shadow-xs shrink-0">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            )}

            {/* User Auth / Profile Dropdown */}
            {currentUser ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors shrink-0"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={currentUser.fullName}
                    className="w-7 h-7 rounded-lg object-cover ring-2 ring-emerald-500/40"
                  />
                  <span className="hidden md:inline text-xs font-semibold text-slate-800 truncate max-w-[100px]">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-slate-800"
                      >
                        <div className="p-3 border-b border-slate-100">
                          <p className="font-bold text-sm text-slate-900">{currentUser.fullName}</p>
                          <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                          <p className="text-[11px] text-emerald-700 font-medium mt-1">{currentUser.address}</p>
                        </div>
                        <div className="py-1 space-y-0.5">
                          {currentRole !== 'admin' && (
                            <>
                              <button
                                onClick={() => {
                                  setActiveView('profile');
                                  setIsProfileOpen(false);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 text-slate-700 font-medium"
                              >
                                <UserIcon className="w-4 h-4 text-emerald-600" />
                                <span>My Profile & Address</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActiveView('orders');
                                  setIsProfileOpen(false);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-slate-50 text-slate-700 font-medium"
                              >
                                <Clock className="w-4 h-4 text-emerald-600" />
                                <span>My Order History</span>
                              </button>
                            </>
                          )}

                          {(currentUser.role === 'admin' || currentUser.role === 'store_owner') && (
                            <button
                              onClick={() => {
                                setActiveView('dashboard');
                                setIsProfileOpen(false);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-amber-50 text-amber-800 font-semibold"
                            >
                              <ShieldCheck className="w-4 h-4 text-amber-600" />
                              <span>{currentUser.role === 'admin' ? 'Admin Dashboard' : 'Store Dashboard'}</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              logout();
                              setIsProfileOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs hover:bg-rose-50 text-rose-600 font-semibold"
                          >
                            <LogOut className="w-4 h-4 text-rose-600" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
