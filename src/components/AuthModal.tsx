import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { X, User, Store, ShieldCheck, Mail, Lock, Phone, MapPin, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    login,
    signup,
  } = useMarketplace();

  // Form states
  const [activeTab, setActiveTab] = useState<'customer_login' | 'customer_signup' | 'store_owner' | 'admin'>('customer_login');

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Customer Signup fields
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [address, setAddress] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync state when opened
  React.useEffect(() => {
    if (authModalTab === 'signup') setActiveTab('customer_signup');
    else if (authModalTab === 'store_owner') setActiveTab('store_owner');
    else if (authModalTab === 'admin') setActiveTab('admin');
    else setActiveTab('customer_login');

    setErrorMsg(null);
    setSuccessMsg(null);
  }, [authModalTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    let targetRole: 'customer' | 'store_owner' | 'admin' = 'customer';
    if (activeTab === 'store_owner') targetRole = 'store_owner';
    if (activeTab === 'admin') targetRole = 'admin';

    const res = login(email, password, targetRole);
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setSuccessMsg(res.message);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName || !mobile || !signupEmail || !address || !signupPassword) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }

    const res = signup({
      fullName,
      mobile,
      email: signupEmail,
      address,
      password: signupPassword,
      role: 'customer',
    });

    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setSuccessMsg('Account created successfully! Logged in as resident.');
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
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Role selector tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 text-xs font-extrabold text-slate-600">
            <button
              onClick={() => setActiveTab('customer_login')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                activeTab === 'customer_login' || activeTab === 'customer_signup'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Resident
            </button>
            <button
              onClick={() => setActiveTab('store_owner')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                activeTab === 'store_owner' ? 'bg-white text-amber-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Store Owner
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-2 rounded-xl transition-all ${
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
                  {activeTab === 'customer_login' && 'Resident Login'}
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
                {activeTab === 'admin' && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                    <p className="font-extrabold flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-rose-600" /> Authorized Admin Credentials:
                    </p>
                    <p className="text-[11px] font-medium text-slate-700">Email: <strong>satyam443355@gmail.com</strong></p>
                    <p className="text-[11px] font-medium text-slate-700">Password: <strong>Satyam@123</strong></p>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('satyam443355@gmail.com');
                        setPassword('Satyam@123');
                      }}
                      className="mt-1 text-[10px] font-bold text-rose-700 underline hover:text-rose-900"
                    >
                      Click to autofill Admin credentials
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeTab === 'admin' ? 'satyam443355@gmail.com' : 'e.g. resident@society.com'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" /> Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-2.5 rounded-xl text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'admin'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : activeTab === 'store_owner'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <span>Login to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {activeTab === 'customer_login' && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-500 font-medium">
                    New resident in society?{' '}
                    <button
                      onClick={() => setActiveTab('customer_signup')}
                      className="text-emerald-700 font-extrabold hover:underline"
                    >
                      Register Account
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
                <h3 className="text-xl font-extrabold text-slate-900">Resident Registration</h3>
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
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Anish Gupta"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
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
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-emerald-600" /> Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="anish@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
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
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Block C, Flat 104"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" /> Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Complete Resident Sign Up</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500 font-medium">
                  Already registered?{' '}
                  <button
                    onClick={() => setActiveTab('customer_login')}
                    className="text-emerald-700 font-extrabold hover:underline"
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
