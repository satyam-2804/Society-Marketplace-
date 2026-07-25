import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  Building2,
  ShoppingBag,
  Store,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  PackageCheck,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onBrowseMarketplace: () => void;
  onOpenStorePortal: () => void;
  onOpenAdminPortal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onBrowseMarketplace,
  onOpenStorePortal,
  onOpenAdminPortal,
}) => {
  const { openAuthModal, stores, loadDemoStores, clearAllStores } = useMarketplace();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-emerald-50/30 border-b border-slate-200/80 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Top Pill Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Manokamna Apartments Residential Hyperlocal Platform</span>
            </span>
          </div>

          {/* Main Title */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              SOCIETY <span className="text-emerald-600">MARKETPLACE</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              The exclusive digital portal for <strong className="text-slate-900 font-semibold">Manokamna Apartments</strong>. Shop directly from resident-owned stores inside society premises or register your own outlet!
            </p>
          </div>

          {/* 3 Main Role Portals (Customer, Store Owner, Admin) */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Card 1: Customer / Resident */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Resident Portal</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">For Society Flat Owners & Tenants</p>
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  Browse items from society shops, order daily groceries, fresh veggies & essentials with 20-minute doorstep delivery.
                </p>
              </div>

              <div className="mt-6 space-y-2.5">
                <button
                  onClick={() => openAuthModal('login')}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Resident Login / Sign Up</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onBrowseMarketplace}
                  className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs border border-slate-200 transition-colors"
                >
                  Browse Shops as Guest ({stores.length} Active)
                </button>
              </div>
            </motion.div>

            {/* Card 2: Store Owners */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-500 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                  <Store className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Store Owner Portal</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">For Society Shop Owners</p>
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  Register your society shop, list products, set prices, manage inventory, and receive resident orders directly.
                </p>
              </div>

              <div className="mt-6 space-y-2.5">
                <button
                  onClick={onOpenStorePortal}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register Store / Login</span>
                </button>
                <button
                  onClick={() => openAuthModal('store_owner')}
                  className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs border border-slate-200 transition-colors"
                >
                  Store Owner Login
                </button>
              </div>
            </motion.div>

            {/* Card 3: Society Admin */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-500 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Society Admin</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">RWA & Management Committee</p>
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  Approve new shops, broadcast announcements to residents, manage coupons, and monitor society sales.
                </p>
              </div>

              <div className="mt-6 space-y-2.5">
                <button
                  onClick={onOpenAdminPortal}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Panel Login</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Quick Demo Data Controls for testing */}
          <div className="mt-10 max-w-xl mx-auto p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-slate-600">
                Current Registered Shops: <strong className="text-slate-900 font-bold">{stores.length}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {stores.length === 0 ? (
                <button
                  onClick={loadDemoStores}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-semibold text-[11px] transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Load Demo Stores</span>
                </button>
              ) : (
                <button
                  onClick={clearAllStores}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-lg font-semibold text-[11px] transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Clear All Stores</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-slate-900">Why Residents Love Society Marketplace</h2>
          <p className="text-xs text-slate-500 mt-1">Built specifically for inside-society convenience</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">20-Min Doorstep Guarantee</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Because shops are located inside society blocks, deliveries reach your flat door in under 20 minutes.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Inside-Gate Security</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Only verified resident shop owners and authorized society runners enter towers.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Direct Owner Stores</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Every shop is individually managed by society residents. Quality items, fair prices, and personal trust.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <p className="font-medium text-slate-700">Manokamna Apartments Society Marketplace &copy; 2026</p>
        <p className="mt-1 text-[11px]">Helpline: +91 8595946517 • Email: satyam443355@gmail.com</p>
      </footer>
    </div>
  );
};
