import React, { useState, useEffect } from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { motion } from 'motion/react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { HeroBanner } from './components/HeroBanner';
import { StoreCard } from './components/StoreCard';
import { ProductCard } from './components/ProductCard';
import { StoreReviews } from './components/StoreReviews';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { DeliveryReceiptEmailModal } from './components/DeliveryReceiptEmailModal';
import { AuthModal } from './components/AuthModal';
import { BottomNav } from './components/BottomNav';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { StoreOwnerDashboard } from './components/storeOwner/StoreOwnerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import {
  Building2,
  Store as StoreIcon,
  ShoppingBag,
  Search,
  MapPin,
  Phone,
  Mail,
  Clock,
  UserCheck,
  Home,
  ArrowLeft,
  Star,
  MessageSquare,
  X,
  Camera,
} from 'lucide-react';

function MarketplaceApp() {
  const {
    stores,
    products,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    selectedStoreId,
    setSelectedStoreId,
    setSelectedCategory,
    currentRole,
    currentUser,
    openAuthModal,
    updateStoreDetails,
  } = useMarketplace();

  // Mode: 'landing' (Initial brief homepage) or 'app' (Main interactive marketplace)
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');

  // App View
  const [activeView, setActiveView] = useState<'home' | 'stores' | 'orders' | 'profile' | 'dashboard'>('home');

  // Sub-tab inside selected store: 'products' or 'reviews'
  const [storeTab, setStoreTab] = useState<'products' | 'reviews'>('products');

  // Recent searches state
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sm_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Sync recent searches to localStorage
  useEffect(() => {
    localStorage.setItem('sm_recent_searches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Helper to add query to recent searches
  const handleAddSearchQuery = (query: string) => {
    const trimmed = (query || '').trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = (prev || []).filter((item) => (typeof item === 'string' ? item : '').toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, 8);
    });
  };

  // Helper to remove individual query
  const handleRemoveRecentSearch = (queryToRemove: string) => {
    setRecentSearches((prev) => (prev || []).filter((item) => item !== queryToRemove));
  };

  // Helper to clear all recent searches
  const handleClearAllRecentSearches = () => {
    setRecentSearches([]);
  };

  // If user logs in as store owner or admin, auto switch to dashboard
  useEffect(() => {
    if (currentUser) {
      if (currentRole === 'store_owner' || currentRole === 'admin') {
        setViewMode('app');
        setActiveView('dashboard');
      }
    } else {
      setActiveView('home');
    }
  }, [currentUser, currentRole]);

  // Restrict Admin and Store Owner from accessing customer personal views (orders and profile)
  useEffect(() => {
    if (currentRole === 'admin' && (activeView === 'orders' || activeView === 'profile')) {
      setActiveView('dashboard');
    }
  }, [currentRole, activeView]);

  // Filter products based on search query, category, and store selection
  const filteredProducts = (products || []).filter((p) => {
    const query = searchQuery || '';
    const matchesSearch =
      !query.trim() ||
      (p.name || '').toLowerCase().includes(query.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(query.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(query.toLowerCase());

    const selCat = selectedCategory || 'All';
    const matchesCategory =
      selCat === 'All' || (p.category || '').toLowerCase() === selCat.toLowerCase();

    const matchesStore = !selectedStoreId || p.storeId === selectedStoreId;

    return matchesSearch && matchesCategory && matchesStore;
  });

  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  // LANDING PAGE VIEW
  if (viewMode === 'landing' && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
        <Header
          activeView={activeView}
          setActiveView={(view) => {
            setViewMode('app');
            setActiveView(view);
          }}
          onGoLanding={() => setViewMode('landing')}
        />
        <LandingPage
          onBrowseMarketplace={() => {
            setViewMode('app');
            setActiveView('home');
          }}
          onOpenStorePortal={() => {
            openAuthModal('store_owner');
            setViewMode('app');
            setActiveView('dashboard');
          }}
          onOpenAdminPortal={() => {
            openAuthModal('admin');
            setViewMode('app');
            setActiveView('dashboard');
          }}
        />
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-600 selection:text-white pb-20 md:pb-8">
      {/* Top Header */}
      <Header
        activeView={activeView}
        setActiveView={(view) => {
          setViewMode('app');
          setActiveView(view);
        }}
        onGoLanding={() => setViewMode('landing')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* VIEW: HOME */}
        {activeView === 'home' && (
          <>
            {!selectedStore ? (
              /* --- HOMEPAGE MODE: Shows Hero Banner & Available Stores --- */
              <>
                {/* Hero Banner Slider */}
                <HeroBanner />

                {/* Society Shops Section */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                        <StoreIcon className="w-5 h-5 text-emerald-600" />
                        <span>Society Shops in Manokamna Apartments</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Click on any shop below to view its products and search items
                      </p>
                    </div>
                  </div>

                  {/* Stores Grid */}
                  {stores.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 shadow-xs">
                      <StoreIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-sm text-slate-800">No stores registered yet</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Store owners in Manokamna Apartments can register their outlet to list products here!
                      </p>
                      <button
                        onClick={() => openAuthModal('store_owner')}
                        className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs"
                      >
                        Register Your Society Store
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {stores.map((store) => (
                        <StoreCard
                          key={store.id}
                          store={store}
                          isSelected={false}
                          onSelect={(id) => {
                            setSelectedStoreId(id);
                            setSearchQuery('');
                          }}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </>
            ) : (
              /* --- STORE VIEW MODE: Displays Store Header, Store Search Bar & Store Products --- */
              <div className="space-y-6">
                {/* Back Button & Store Banner Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedStoreId(null);
                        setSearchQuery('');
                        setStoreTab('products');
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-2 border border-slate-200"
                    >
                      <ArrowLeft className="w-4 h-4 text-emerald-600" />
                      <span>Back to All Society Shops</span>
                    </button>

                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      Doorstep Delivery: ~{selectedStore.deliveryTimeMinutes || 15} Mins
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-4">
                      <div className="relative group">
                        <img
                          src={selectedStore.image}
                          alt={selectedStore.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-emerald-500/30"
                        />
                        {currentUser && (currentUser.id === selectedStore.ownerId || currentUser.storeId === selectedStore.id) && (
                          <label className="absolute inset-0 bg-slate-950/65 rounded-2xl flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity border border-white/20">
                            <Camera className="w-5 h-5 text-slate-200" />
                            <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">Edit Icon</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0];
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result) {
                                      updateStoreDetails(selectedStore.id, { image: event.target.result as string });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900">{selectedStore.name}</h2>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                            {selectedStore.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {selectedStore.blockLocation}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" /> {selectedStore.ownerPhone} ({selectedStore.ownerName})
                          </span>
                        </p>
                        
                        {/* Rating Summary Row */}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs">
                          <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg text-amber-800 text-xs font-black shadow-3xs">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{selectedStore.rating || '5.0'}</span>
                          </span>
                          <span className="text-slate-500 font-semibold bg-slate-100 border border-slate-200/60 px-2 py-1 rounded-lg">
                            {selectedStore.reviewsCount || 0} Resident Reviews
                          </span>
                          <button
                            onClick={() => setStoreTab('reviews')}
                            className="text-emerald-700 hover:text-emerald-800 font-bold underline transition-all ml-1"
                          >
                            Read Reviews
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Store View Sub-Tabs (Products Catalog vs Reviews) */}
                <div className="flex items-center border-b border-slate-200 gap-6">
                  <button
                    onClick={() => setStoreTab('products')}
                    className={`pb-3 text-sm font-extrabold transition-all relative flex items-center gap-2 px-1 ${
                      storeTab === 'products'
                        ? 'text-emerald-600'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Products Catalog ({filteredProducts.length})</span>
                    {storeTab === 'products' && (
                      <motion.div
                        layoutId="activeStoreTabLine"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full"
                      />
                    )}
                  </button>

                  <button
                    onClick={() => setStoreTab('reviews')}
                    className={`pb-3 text-sm font-extrabold transition-all relative flex items-center gap-2 px-1 ${
                      storeTab === 'reviews'
                        ? 'text-emerald-600'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Resident Reviews & Ratings ({selectedStore.reviewsCount || 0})</span>
                    {storeTab === 'reviews' && (
                      <motion.div
                        layoutId="activeStoreTabLine"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full"
                      />
                    )}
                  </button>
                </div>

                {storeTab === 'products' ? (
                  <>
                    {/* Store Specific Search Bar */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Search Products in {selectedStore.name}:
                      </label>
                      <div className="relative w-full max-w-xl">
                        <div className="relative w-full bg-slate-50 border border-slate-200 rounded-2xl p-1 shadow-xs flex items-center gap-2 focus-within:bg-white focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition-all">
                          <Search className="w-5 h-5 text-emerald-600 ml-3 shrink-0 pointer-events-none" />
                          <input
                            type="text"
                            value={searchQuery}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => {
                              if (searchQuery.trim()) {
                                handleAddSearchQuery(searchQuery);
                              }
                              setTimeout(() => setIsSearchFocused(false), 200);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddSearchQuery(searchQuery);
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Type product name (e.g. Milk, Atta, Tomato, Oil)...`}
                            className="w-full bg-transparent text-slate-900 text-sm font-semibold outline-none placeholder:text-slate-400 py-1.5 px-1"
                            autoFocus
                          />
                          {searchQuery && (
                            <button
                              onClick={() => {
                                setSearchQuery('');
                                setIsSearchFocused(true);
                              }}
                              className="px-3 py-1 text-xs font-extrabold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-colors shrink-0"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {/* Recent Searches Dropdown List */}
                        {isSearchFocused && recentSearches.length > 0 && (
                          <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-1 duration-100">
                            <div className="px-4 py-1.5 flex items-center justify-between border-b border-slate-100 mb-1">
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>Recent Searches</span>
                              </span>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleClearAllRecentSearches();
                                }}
                                className="text-[10px] text-rose-600 hover:text-rose-700 font-extrabold uppercase tracking-wider bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-md transition-colors"
                              >
                                Clear All
                              </button>
                            </div>

                            <div className="max-h-60 overflow-y-auto">
                              {recentSearches.map((search, index) => (
                                <div
                                  key={index}
                                  className="group flex items-center justify-between px-4 py-2 hover:bg-slate-50 transition-colors cursor-pointer"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setSearchQuery(search);
                                    handleAddSearchQuery(search);
                                    setIsSearchFocused(false);
                                  }}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-emerald-600 transition-colors" />
                                    <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 truncate">
                                      {search}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleRemoveRecentSearch(search);
                                    }}
                                    className="p-1 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                                    title="Delete search"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Products Grid inside Selected Store */}
                    <section className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                          <ShoppingBag className="w-5 h-5 text-emerald-600" />
                          <span>Products Available ({filteredProducts.length})</span>
                        </h3>
                      </div>

                      {filteredProducts.length === 0 ? (
                        <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl space-y-3 p-8 shadow-xs">
                          <Search className="w-10 h-10 text-slate-300 mx-auto" />
                          <h4 className="text-base sm:text-lg font-black text-slate-900">
                            Nothing found with given keyword
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto font-medium">
                            No product in "{selectedStore.name}" matched "{searchQuery}". Please try another search term!
                          </p>
                          <button
                            onClick={() => setSearchQuery('')}
                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
                          >
                            Show All Products in {selectedStore.name}
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                          ))}
                        </div>
                      )}
                    </section>
                  </>
                ) : (
                  <StoreReviews storeId={selectedStore.id} />
                )}
              </div>
            )}

            {/* Sticky Prompt for non-logged-in visitors */}
            {!currentUser && (
              <div className="sticky bottom-4 z-30 my-6 p-4 rounded-3xl bg-white border border-emerald-200 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800 font-bold">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Welcome to Manokamna Apartments Society Marketplace</h4>
                    <p className="text-xs text-slate-500">
                      Sign in or register as resident or store owner to manage orders and express checkout!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200"
                  >
                    Resident Login
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs"
                  >
                    Register Resident
                  </button>
                  <button
                    onClick={() => openAuthModal('store_owner')}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs"
                  >
                    Store Owner Login
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* VIEW: STORES */}
        {activeView === 'stores' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">All Society Outlets</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Browse stores operating inside Manokamna Apartments (Blocks A, B, C & Clubhouse)
              </p>
            </div>

            {stores.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
                <StoreIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-sm text-slate-800">No stores registered yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Store owners in Manokamna Apartments can register their outlet to list products here!
                </p>
                <button
                  onClick={() => openAuthModal('store_owner')}
                  className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs"
                >
                  Register Your Society Store
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    isSelected={selectedStoreId === store.id}
                    onSelect={(id) => {
                      setSelectedStoreId(id);
                      setActiveView('home');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: ORDERS */}
        {activeView === 'orders' && (
          <CustomerDashboard
            activeTab="orders"
            onSwitchTab={(tab) => setActiveView(tab)}
            onGoHome={() => setActiveView('home')}
          />
        )}

        {/* VIEW: PROFILE */}
        {activeView === 'profile' && (
          <CustomerDashboard
            activeTab="profile"
            onSwitchTab={(tab) => setActiveView(tab)}
            onGoHome={() => setActiveView('home')}
          />
        )}

        {/* VIEW: DASHBOARD (Admin or Store Owner) */}
        {activeView === 'dashboard' && (
          <>
            {currentRole === 'admin' ? (
              <AdminDashboard />
            ) : currentRole === 'store_owner' ? (
              <StoreOwnerDashboard />
            ) : (
              <div className="py-12 text-center bg-white border border-slate-200 rounded-3xl p-6 shadow-xs max-w-md mx-auto">
                <p className="text-xs font-bold text-slate-700 mb-3">
                  You are currently logged in as a Resident. Switch to Store Owner or Admin to access controls.
                </p>
                <button
                  onClick={() => openAuthModal('store_owner')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs"
                >
                  Switch to Store Owner Login
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white pt-12 pb-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span className="text-base font-black text-slate-900 font-mono">SOCIETY MARKETPLACE</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Dedicated hyperlocal residential marketplace for Manokamna Apartments. Connecting residents directly with inside society shops for 20-minute doorstep deliveries.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">Help & Support</p>
              <ul className="space-y-1 text-slate-600">
                <li className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-600" /> Helpline: +91 8595946517</li>
                <li className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-emerald-600" /> satyam443355@gmail.com</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">Delivery Guarantee</p>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
                <p className="text-emerald-800 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" /> 20 Minutes Doorstep Arrival
                </p>
                <p className="text-slate-600">Directly from shops inside society gate to your apartment door.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-slate-500 gap-2">
            <p>© 2026 Society Marketplace • Manokamna Apartments</p>
            <button
              onClick={() => setViewMode('landing')}
              className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" /> Return to Main Landing Homepage
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals & Overlays */}
      <CartDrawer />
      <CheckoutModal />
      <OrderConfirmationModal onTrackOrderClick={() => setActiveView('orders')} />
      <OrderTrackingModal />
      <DeliveryReceiptEmailModal />
      <AuthModal />

      {/* Mobile Bottom Navigation */}
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
}

export default function App() {
  return (
    <MarketplaceProvider>
      <MarketplaceApp />
    </MarketplaceProvider>
  );
}
