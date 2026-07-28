import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { X, User, Store, ShieldCheck, Mail, Lock, Phone, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    login,
    signup,
    signupStoreOwner,
  } = useMarketplace();

  // Form states
  const [activeTab, setActiveTab] = useState<'customer_login' | 'customer_signup' | 'store_owner' | 'store_owner_signup' | 'admin'>('customer_login');
  const [isLoading, setIsLoading] = useState(false);

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Customer Signup fields
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [address, setAddress] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Store Owner Registration specific fields
  const [storeName, setStoreName] = useState('');
  const [storeCategory, setStoreCategory] = useState('Groceries & Daily Essentials');
  const [blockLocation, setBlockLocation] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync state when opened
  React.useEffect(() => {
    if (authModalTab === 'signup') setActiveTab('customer_signup');
    else if (authModalTab === 'store_owner') setActiveTab('store_owner');
    else if (authModalTab === 'admin') setActiveTab('admin');
    else setActiveTab('customer_login');

    setEmail('');
    setPassword('');
    setFullName('');
    setMobile('');
    setSignupEmail('');
    setAddress('');
    setSignupPassword('');
    setStoreName('');
    setStoreCategory('Groceries & Daily Essentials');
    setBlockLocation('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(false);
  }, [authModalTab, isAuthModalOpen]);

  // Reset fields when activeTab changes
  React.useEffect(() => {
    setEmail('');
    setPassword('');
    setFullName('');
    setMobile('');
    setSignupEmail('');
    setAddress('');
    setSignupPassword('');
    setStoreName('');
    setStoreCategory('Groceries & Daily Essentials');
    setBlockLocation('');
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [activeTab]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    let targetRole: 'customer' | 'store_owner' | 'admin' = 'customer';
    if (activeTab === 'store_owner') targetRole = 'store_owner';
    if (activeTab === 'admin') targetRole = 'admin';

    // Simulate authenticating delay to prevent double submissions and show spinner properly
    await new Promise((resolve) => setTimeout(resolve, 800));

    const res = login(email, password, targetRole);
    if (!res.success) {
      setErrorMsg(res.message);
      setIsLoading(false);
    } else {
      setSuccessMsg(res.message);
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName || !mobile || !signupEmail || !address || !signupPassword) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }

    setIsLoading(true);
    // Simulate authenticating delay to prevent double submissions and show spinner properly
    await new Promise((resolve) => setTimeout(resolve, 800));

    const res = signup({
      fullName,
      mobile,
      email: signupEmail,
      address,
      password: signupPassword,
    });

    if (!res.success) {
      setErrorMsg(res.message);
      setIsLoading(false);
    } else {
      setSuccessMsg('Account created successfully! Logged in as resident.');
      setIsLoading(false);
    }
  };

  const handleStoreOwnerSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName || !mobile || !signupEmail || !signupPassword || !storeName || !storeCategory || !blockLocation) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const res = signupStoreOwner({
      fullName,
      email: signupEmail,
      mobile,
      password: signupPassword,
      storeName,
      storeCategory,
      blockLocation,
    });

    if (!res.success) {
      setErrorMsg(res.message);
      setIsLoading(false);
    } else {
      setSuccessMsg(res.message);
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-slate-800 my-8"
        >
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            disabled={isLoading}
            className={`absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Role selector tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 text-xs font-extrabold text-slate-600">
            <button
              onClick={() => !isLoading && setActiveTab('customer_login')}
              disabled={isLoading}
              className={`flex-1 py-2 rounded-xl transition-all ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                activeTab === 'customer_login' || activeTab === 'customer_signup'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => !isLoading && setActiveTab('store_owner')}
              disabled={isLoading}
              className={`flex-1 py-2 rounded-xl transition-all ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                activeTab === 'store_owner' || activeTab === 'store_owner_signup' ? 'bg-white text-amber-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Store Owner
            </button>
            <button
              onClick={() => !isLoading && setActiveTab('admin')}
              disabled={isLoading}
              className={`flex-1 py-2 rounded-xl transition-all ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                activeTab === 'admin' ? 'bg-white text-rose-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Admin
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl mb-4">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl mb-4">
              {successMsg}
            </div>
          )}

          {/* Form Content */}
          {(activeTab === 'customer_login' || activeTab === 'store_owner' || activeTab === 'admin') && (
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-extrabold text-slate-900">
                  {activeTab === 'customer_login' && 'Customer Login'}
                  {activeTab === 'store_owner' && 'Store Owner Portal'}
                  {activeTab === 'admin' && 'Society Admin Portal'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {activeTab === 'customer_login' && 'Enter your credentials to access doorstep marketplace'}
                  {activeTab === 'store_owner' && 'Manage your society store, items, and resident orders'}
                  {activeTab === 'admin' && 'Oversee society shops, notices, and approval controls'}
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3">


                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    {activeTab === 'admin'
                      ? 'Admin Email Address'
                      : activeTab === 'store_owner'
                      ? 'Email, Mobile Number, or Store Name'
                      : 'Email Address or Mobile Number'}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      activeTab === 'admin'
                        ? 'e.g. admin@society.com'
                        : activeTab === 'store_owner'
                        ? 'e.g. 9876543210 or owner@email.com or Store Name'
                        : 'e.g. customer@email.com or 9876543210'
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-600 disabled:opacity-60 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" /> Password
                  </label>
                  <input
                    type="password"
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none disabled:opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2.5 rounded-xl text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                    isLoading
                      ? 'bg-slate-400 cursor-not-allowed opacity-80'
                      : activeTab === 'admin'
                      ? 'bg-rose-600 hover:bg-rose-700 active:scale-95'
                      : activeTab === 'store_owner'
                      ? 'bg-amber-600 hover:bg-amber-700 active:scale-95'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Login to Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {activeTab === 'customer_login' && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-500 font-medium">
                    New customer in society?{' '}
                    <button
                      onClick={() => !isLoading && setActiveTab('customer_signup')}
                      disabled={isLoading}
                      className={`text-emerald-700 font-extrabold hover:underline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Register Account
                    </button>
                  </p>
                </div>
              )}

              {activeTab === 'store_owner' && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-500 font-medium">
                    New store owner?{' '}
                    <button
                      type="button"
                      onClick={() => !isLoading && setActiveTab('store_owner_signup')}
                      disabled={isLoading}
                      className={`text-amber-700 font-extrabold hover:underline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Register your store
                    </button>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Customer Signup Form */}
          {activeTab === 'customer_signup' && (
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-extrabold text-slate-900">Customer Registration</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Register for 20-min society doorstep deliveries</p>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-600" /> Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Anish Gupta"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none disabled:opacity-60"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" /> Mobile *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={isLoading}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-emerald-600" /> Email *
                    </label>
                    <input
                      type="email"
                      required
                      disabled={isLoading}
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="anish@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Tower & Flat Address *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Block C, Flat 104"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" /> Password *
                  </label>
                  <input
                    type="password"
                    required
                    disabled={isLoading}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none disabled:opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2.5 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                    isLoading
                      ? 'bg-slate-400 cursor-not-allowed opacity-80'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Customer Sign Up</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500 font-medium">
                  Already registered?{' '}
                  <button
                    onClick={() => !isLoading && setActiveTab('customer_login')}
                    disabled={isLoading}
                    className={`text-emerald-700 font-extrabold hover:underline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Login here
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Store Owner Signup Form */}
          {activeTab === 'store_owner_signup' && (
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-extrabold text-slate-900">Register Store Owner</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Submit your store for Society Admin approval</p>
              </div>

              <form onSubmit={handleStoreOwnerSignupSubmit} className="space-y-3">
                {/* Store Details Section Header */}
                <div className="border-b border-slate-100 pb-1.5 mb-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-600 flex items-center gap-1">
                    <Store className="w-3 h-3" /> Store Details
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Store / Shop Name *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={isLoading}
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Daily Fresh Groceries"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Store Category / Purpose *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={isLoading}
                      value={storeCategory}
                      onChange={(e) => setStoreCategory(e.target.value)}
                      placeholder="e.g. Stationery, Grocery, Pharmacy, Hardware, Bakery..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none disabled:opacity-60 focus:bg-white focus:border-emerald-600 font-semibold"
                    />
                    <p className="text-[10px] text-slate-500 font-medium mt-1">
                      Specify what your store is for (e.g. Stationery, Grocery, Hardware, Mobile Services).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Block & Shop Location *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={isLoading}
                      value={blockLocation}
                      onChange={(e) => setBlockLocation(e.target.value)}
                      placeholder="e.g. Block A, Shop #02"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Personal / Account Details Section Header */}
                <div className="border-b border-slate-100 pb-1.5 pt-2 mb-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-600 flex items-center gap-1">
                    <User className="w-3 h-3" /> Account Owner Details
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-600" /> Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Satish Kumar"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none disabled:opacity-60"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-amber-600" /> Mobile *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={isLoading}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+91 98765 11111"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-amber-600" /> Email *
                    </label>
                    <input
                      type="email"
                      required
                      disabled={isLoading}
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="satish@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-600" /> Choose Password *
                  </label>
                  <input
                    type="password"
                    required
                    disabled={isLoading}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none disabled:opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2.5 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                    isLoading
                      ? 'bg-slate-400 cursor-not-allowed opacity-80'
                      : 'bg-amber-600 hover:bg-amber-700 active:scale-95'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting for Approval...</span>
                    </>
                  ) : (
                    <>
                      <span>Register & Submit Store</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500 font-medium">
                  Already registered?{' '}
                  <button
                    onClick={() => !isLoading && setActiveTab('store_owner')}
                    disabled={isLoading}
                    className={`text-amber-700 font-extrabold hover:underline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Login here
                  </button>
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
