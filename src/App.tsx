import React, { useState, useEffect, useMemo } from 'react';
import { Toaster } from 'sonner';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { safeLocalStorage, safeToLower } from './lib/storage';
import { User } from './types';
import { motion } from 'motion/react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { HeroBanner } from './components/HeroBanner';
import { StoreCard } from './components/StoreCard';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { DeliveryReceiptEmailModal } from './components/DeliveryReceiptEmailModal';
import { AuthModal } from './components/AuthModal';
import { BottomNav } from './components/BottomNav';
import { ScrollToTop } from './components/ScrollToTop';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { StoreOwnerDashboard } from './components/storeOwner/StoreOwnerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StoreGridSkeleton } from './components/skeletons/StoreCardSkeleton';
import { ProductGridSkeleton } from './components/skeletons/ProductCardSkeleton';
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
  AlertCircle,
  Home,
  ArrowLeft,
  Star,
  MessageSquare,
  X,
  Camera,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = (str1 || '').toLowerCase().trim();
  const s2 = (str2 || '').toLowerCase().trim();
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;
  if (s2.includes(s1) || s1.includes(s2)) return 0.85;

  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  let maxWordScore = 0;

  for (const w1 of words1) {
    if (w1.length < 2) continue;
    for (const w2 of words2) {
      if (w2.length < 2) continue;
      if (w2.includes(w1) || w1.includes(w2)) {
        maxWordScore = Math.max(maxWordScore, 0.8);
      }
      const dist = getLevenshteinDistance(w1, w2);
      const maxLen = Math.max(w1.length, w2.length);
      const sim = 1 - dist / maxLen;
      if (sim > maxWordScore) {
        maxWordScore = sim;
      }
    }
  }

  const fullDist = getLevenshteinDistance(s1, s2);
  const fullMaxLen = Math.max(s1.length, s2.length);
  const fullSim = 1 - fullDist / fullMaxLen;

  return Math.max(maxWordScore, fullSim);
}

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
    isLoadingStores,
    isLoadingProducts,
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    isCheckoutOpen,
    getCartTotal,
  } = useMarketplace();

  // Mode: 'landing' (Initial brief homepage) or 'app' (Main interactive marketplace)
  const [viewMode, setViewMode] = useState<'landing' | 'app'>(() => {
    const savedUser = safeLocalStorage.getJSON<User | null>('sm_current_user', null);
    return savedUser ? 'app' : 'landing';
  });

  // App View
  const [activeView, setActiveView] = useState<'home' | 'stores' | 'orders' | 'profile' | 'dashboard'>(() => {
    const savedUser = safeLocalStorage.getJSON<User | null>('sm_current_user', null);
    if (savedUser && (savedUser.role === 'store_owner' || savedUser.role === 'admin')) {
      return 'dashboard';
    }
    return 'home';
  });

  // Recent searches state
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    return safeLocalStorage.getJSON<string[]>('sm_recent_searches', []);
  });

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Sync recent searches to localStorage
  useEffect(() => {
    safeLocalStorage.setItem('sm_recent_searches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Helper to add query to recent searches
  const handleAddSearchQuery = (query: string) => {
    const trimmed = (query || '').trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = (prev || []).filter((item) => safeToLower(item) !== safeToLower(trimmed));
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

  const prevRoleRef = React.useRef<string | null>(null);
  const prevUserRef = React.useRef<string | null>(null);

  // If user logs in or switches role to store owner or admin, auto switch to dashboard ONCE
  useEffect(() => {
    const currentUserId = currentUser?.id || null;
    const roleChanged = prevRoleRef.current !== null && prevRoleRef.current !== currentRole;
    const userJustLoggedIn = prevUserRef.current === null && currentUserId !== null;

    if (roleChanged || userJustLoggedIn) {
      if (currentUser && (currentRole === 'store_owner' || currentRole === 'admin')) {
        setViewMode('app');
        setActiveView('dashboard');
      }
    } else if (!currentUser && prevUserRef.current !== null) {
      setActiveView('home');
    }

    prevRoleRef.current = currentRole;
    prevUserRef.current = currentUserId;
  }, [currentUser, currentRole]);

  // Restrict Admin and Store Owner from accessing customer personal views and navigation
  useEffect(() => {
    if (currentRole === 'admin' && (activeView === 'orders' || activeView === 'profile')) {
      setActiveView('dashboard');
    }
    if (currentRole === 'store_owner' && (activeView === 'home' || activeView === 'stores' || activeView === 'orders' || activeView === 'profile')) {
      setActiveView('dashboard');
    }
  }, [currentRole, activeView]);

  const activeStores = (stores || []).filter(
    (s) => s.status === 'active' || (currentUser?.role === 'store_owner' && currentUser?.storeId === s.id) || currentUser?.role === 'admin'
  );
  const activeStoreIds = new Set(activeStores.map((s) => s.id));

  // Direct exact substring matching products
  const directMatchingProducts = (products || []).filter((p) => {
    if (!p) return false;
    if (!activeStoreIds.has(p.storeId)) return false;
    const query = safeToLower(searchQuery).trim();
    const matchesSearch =
      !query ||
      safeToLower(p.name).includes(query) ||
      safeToLower(p.category).includes(query) ||
      safeToLower(p.description).includes(query);

    const selCat = selectedCategory || 'All';
    const matchesCategory =
      selCat === 'All' || safeToLower(p.category) === safeToLower(selCat);

    const matchesStore = !selectedStoreId || p.storeId === selectedStoreId;

    return matchesSearch && matchesCategory && matchesStore;
  });

  const hasSearchQuery = Boolean(searchQuery.trim());
  const isExactMatchFound = directMatchingProducts.length > 0 || !hasSearchQuery;

  // Related fuzzy matching products when exact match is not found
  const relatedMatchingProducts = useMemo(() => {
    if (isExactMatchFound || !hasSearchQuery) return [];
    const query = searchQuery.trim();

    const candidates = (products || []).filter((p) => {
      if (!p) return false;
      if (!activeStoreIds.has(p.storeId)) return false;
      const matchesStore = !selectedStoreId || p.storeId === selectedStoreId;
      return matchesStore;
    });

    const scored = candidates.map((p) => {
      const nameScore = calculateSimilarity(query, p.name);
      const catScore = calculateSimilarity(query, p.category) * 0.9;
      const descScore = calculateSimilarity(query, p.description) * 0.7;
      const maxScore = Math.max(nameScore, catScore, descScore);
      return { product: p, score: maxScore };
    });

    const matches = scored
      .filter((item) => item.score >= 0.25)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product);

    if (matches.length === 0) {
      return candidates;
    }

    return matches;
  }, [products, searchQuery, isExactMatchFound, hasSearchQuery, activeStoreIds, selectedStoreId]);

  const filteredProducts = isExactMatchFound ? directMatchingProducts : relatedMatchingProducts;

  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  // LANDING PAGE VIEW
  if (viewMode === 'landing' && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors">
        <Header
          activeView={activeView}
          setActiveView={(view) => {
            setViewMode('app');
            setActiveView(view);
          }}
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white pb-20 md:pb-8 transition-colors">
      {/* Top Header */}
      <Header
        activeView={activeView}
        setActiveView={(view) => {
          setViewMode('app');
          setActiveView(view);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* VIEW: HOME */}
        {activeView === 'home' && (
          <>
            {!currentUser ? (
              <div className="py-20 px-4 max-w-xl mx-auto text-center space-y-6 bg-white border border-slate-200 rounded-3xl shadow-sm my-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center shadow-xs">
                  <UserCheck className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">Resident Customer Login Required</h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Please log in or register to browse society shops, explore daily essentials, and place orders inside Manokamna Apartments.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition-all"
                  >
                    Customer Login
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-xs transition-all"
                  >
                    Register Customer
                  </button>
                </div>
              </div>
            ) : currentUser.isBanned ? (
              <div className="py-20 px-4 max-w-xl mx-auto text-center space-y-6 bg-white border border-slate-200 rounded-3xl shadow-sm my-8">
                <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-2xl mx-auto flex items-center justify-center shadow-xs">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-rose-600">Account Banned</h2>
                  <p className="text-sm font-bold text-slate-700">You have been banned from our society marketplace.</p>
                  <p className="text-xs text-slate-500 font-medium">
                    You are unable to place orders or browse stores. Please contact the society admin for more information.
                  </p>
                </div>
              </div>
            ) : !selectedStore ? (
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
                  {isLoadingStores ? (
                    <StoreGridSkeleton count={4} />
                  ) : activeStores.length === 0 ? (
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
                      {activeStores.map((store) => (
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
                      </div>
                    </div>
                  </div>
                </div>

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
                      {/* Related Results Banner when exact match is missing */}
                      {!isExactMatchFound && hasSearchQuery && (
                        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 shadow-2xs">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-amber-100/80 text-amber-800 shrink-0 mt-0.5">
                              <Sparkles className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <h4 className="font-black text-xs sm:text-sm text-amber-950 flex items-center gap-1.5 flex-wrap">
                                <span>No exact match found for</span>
                                <span className="bg-amber-200/90 text-amber-950 px-2.5 py-0.5 rounded-lg font-mono font-black text-xs shadow-2xs">
                                  "{searchQuery}"
                                </span>
                              </h4>
                              <p className="text-xs text-amber-800 font-bold mt-1">
                                ✨ Related results to your search:
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setSearchQuery('')}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-extrabold text-xs transition-colors shrink-0 self-end sm:self-auto shadow-3xs"
                          >
                            Clear Search
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                          <ShoppingBag className="w-5 h-5 text-emerald-600" />
                          <span>
                            {!isExactMatchFound && hasSearchQuery ? 'Related Products' : 'Products Available'} ({isLoadingProducts ? '...' : filteredProducts.length})
                          </span>
                        </h3>
                      </div>

                      {isLoadingProducts ? (
                        <ProductGridSkeleton count={10} />
                      ) : filteredProducts.length === 0 ? (
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
                    Customer Login
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs"
                  >
                    Register Customer
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
          <>
            {!currentUser ? (
              <div className="py-20 px-4 max-w-xl mx-auto text-center space-y-6 bg-white border border-slate-200 rounded-3xl shadow-sm my-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center shadow-xs">
                  <UserCheck className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">Resident Customer Login Required</h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Please log in or register to browse all society shops.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition-all"
                  >
                    Customer Login
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-xs transition-all"
                  >
                    Register Customer
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">All Society Outlets</h2>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Browse stores operating inside Manokamna Apartments (Blocks A, B, C & Clubhouse)
                  </p>
                </div>

                {isLoadingStores ? (
                  <StoreGridSkeleton count={6} />
                ) : activeStores.length === 0 ? (
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
                    {activeStores.map((store) => (
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
          </>
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
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pt-12 pb-8 text-xs text-slate-500 dark:text-slate-400">
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

      {/* Floating Scroll To Top Button */}
      <ScrollToTop />

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && !isCartDrawerOpen && !isCheckoutOpen && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-6 z-40 max-w-[92vw]">
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 sm:px-5 py-3 rounded-2xl shadow-2xl border border-emerald-400/40 flex items-center gap-2.5 sm:gap-3 text-xs transition-all hover:scale-105"
          >
            <div className="flex items-center gap-2">
              <span className="bg-emerald-800/90 px-2.5 py-1 rounded-xl text-[11px] font-black">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} {cart.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'Item' : 'Items'}
              </span>
              <span className="font-black text-sm">₹{getCartTotal()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white font-black border-l border-emerald-500/80 pl-3">
              <span>View Cart & Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
}

export default function App() {
  return (
    <MarketplaceProvider>
      <Toaster position="top-center" richColors />
      <MarketplaceApp />
    </MarketplaceProvider>
  );
}
