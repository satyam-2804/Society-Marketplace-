import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Store,
  Product,
  Order,
  CartItem,
  Coupon,
  Banner,
  AppNotification,
  OrderStatus,
  Review,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_STORES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_COUPONS,
  INITIAL_BANNERS,
  INITIAL_NOTIFICATIONS,
  DEMO_STORES,
  DEMO_PRODUCTS,
  INITIAL_REVIEWS,
} from '../data/initialData';

interface MarketplaceContextType {
  currentUser: User | null;
  currentRole: UserRole;
  users: User[];
  stores: Store[];
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  coupons: Coupon[];
  banners: Banner[];
  notifications: AppNotification[];
  activeCoupon: Coupon | null;
  searchQuery: string;
  selectedCategory: string;
  selectedStoreId: string | null;
  isAdminTester: boolean;
  
  // Navigation / Modal States
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup' | 'store_owner' | 'admin';
  isCartDrawerOpen: boolean;
  isCheckoutOpen: boolean;
  isOrderSuccessOpen: boolean;
  lastPlacedOrder: Order | null;
  activeOrderTrackId: string | null;
  deliveredEmailOrder: Order | null;
  setDeliveredEmailOrder: (order: Order | null) => void;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;
  setSelectedStoreId: (storeId: string | null) => void;
  openAuthModal: (tab?: 'login' | 'signup' | 'store_owner' | 'admin') => void;
  closeAuthModal: () => void;
  setIsCartDrawerOpen: (isOpen: boolean) => void;
  setIsCheckoutOpen: (isOpen: boolean) => void;
  setIsOrderSuccessOpen: (isOpen: boolean) => void;
  setActiveOrderTrackId: (orderId: string | null) => void;

  // Auth
  login: (email: string, pass: string, targetRole?: UserRole) => { success: boolean; message: string };
  signup: (userData: { fullName: string; email: string; mobile: string; address: string; password?: string }) => { success: boolean; message: string };
  signupStoreOwner: (ownerData: {
    fullName: string;
    email: string;
    mobile: string;
    password?: string;
    storeName: string;
    storeCategory: string;
    blockLocation: string;
  }) => { success: boolean; message: string };
  logout: () => void;
  switchRoleQuick: (role: UserRole, storeId?: string) => void;
  updateUserProfile: (data: Partial<User>) => void;

  // Shopping Cart
  addToCart: (product: Product, quantity?: number) => { success: boolean; message: string };
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  getCartSubtotal: () => number;
  getCartDiscount: () => number;
  getCartDeliveryFee: () => number;
  getCartTotal: () => number;
  getCartStore: () => Store | null;

  // Order Management
  placeOrder: (
    deliveryAddress: string,
    paymentMethod: 'cod' | 'upi' | 'card',
    notes?: string
  ) => { success: boolean; orderId?: string; message: string };
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;

  // Store Owner Registration & Creation
  registerStoreForCurrentUser: (storeDetails: {
    name: string;
    category: string;
    blockLocation: string;
    ownerPhone: string;
    openingTime?: string;
    closingTime?: string;
    minOrderAmount?: number;
    deliveryTimeMinutes?: number;
    image?: string;
  }) => { success: boolean; message: string };
  loadDemoStores: () => void;
  clearAllStores: () => void;

  // Store Owner CRUD
  addProduct: (productData: Omit<Product, 'id' | 'rating' | 'reviewsCount'>) => void;
  editProduct: (productId: string, productData: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  toggleProductStock: (productId: string) => void;
  updateStoreDetails: (storeId: string, data: Partial<Store>) => void;

  // Admin CRUD
  themeMode: 'system' | 'light' | 'dark';
  setThemeMode: (mode: 'system' | 'light' | 'dark') => void;
  addStore: (storeData: Omit<Store, 'id' | 'rating' | 'reviewsCount' | 'totalSales'>) => void;
  toggleStoreStatus: (storeId: string, status: 'active' | 'suspended') => void;
  approveStore: (storeId: string) => void;
  rejectStore: (storeId: string) => void;
  approveStoreOwner: (userId: string) => void;
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  toggleCoupon: (couponId: string) => void;
  addBanner: (banner: Omit<Banner, 'id'>) => void;
  broadcastNotification: (title: string, message: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  toggleBanUser: (userId: string) => void;
  deleteStore: (storeId: string) => void;

  // Rating & Review System
  reviews: Review[];
  addReview: (reviewData: Omit<Review, 'id' | 'createdAt'>) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or defaults
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('sm_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const adminOnly = parsed.filter((u: User) => u.role === 'admin' || u.id === 'user_admin');
          return adminOnly.length > 0 ? adminOnly : INITIAL_USERS;
        }
      } catch (e) {}
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sm_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return currentUser ? currentUser.role : 'guest';
  });

  const [stores, setStores] = useState<Store[]>(() => {
    return INITIAL_STORES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    return INITIAL_ORDERS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('sm_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('sm_coupons');
    const loaded: Coupon[] = saved ? JSON.parse(saved) : INITIAL_COUPONS;
    // Ensure PREETU and WELCOME5 always exist
    const hasPreetu = loaded.some((c) => c.code === 'PREETU');
    const hasWelcome5 = loaded.some((c) => c.code === 'WELCOME5');

    const updated = [...loaded];
    if (!hasPreetu) {
      updated.push({
        id: 'c_preetu',
        code: 'PREETU',
        discountType: 'percentage',
        discountValue: 100,
        minOrder: 0,
        validTill: '2028-12-31',
        isActive: true,
        description: '100% OFF on entire order',
      });
    }
    if (!hasWelcome5) {
      updated.push({
        id: 'c_welcome5',
        code: 'WELCOME5',
        discountType: 'percentage',
        discountValue: 5,
        minOrder: 0,
        validTill: '2028-12-31',
        isActive: true,
        description: '5% OFF on order',
      });
    }
    return updated;
  });

  const [banners, setBanners] = useState<Banner[]>(() => {
    return INITIAL_BANNERS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('sm_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    return INITIAL_REVIEWS;
  });

  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | 'store_owner' | 'admin'>('login');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [activeOrderTrackId, setActiveOrderTrackId] = useState<string | null>(null);
  const [deliveredEmailOrder, setDeliveredEmailOrder] = useState<Order | null>(null);

  const [isAdminTester, setIsAdminTester] = useState<boolean>(() => {
    return localStorage.getItem('isAdminTester') === 'true';
  });

  const [isStateLoadedFromCloud, setIsStateLoadedFromCloud] = useState(false);

  // Cloud Backend Sync across devices & phones
  useEffect(() => {
    fetch('/api/state')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          if (Array.isArray(data.users) && data.users.length > 0) setUsers(data.users);
          if (Array.isArray(data.stores)) setStores(data.stores);
          if (Array.isArray(data.products)) setProducts(data.products);
          if (Array.isArray(data.orders)) setOrders(data.orders);
          if (Array.isArray(data.notifications)) setNotifications(data.notifications);
          if (Array.isArray(data.reviews)) setReviews(data.reviews);
          if (Array.isArray(data.coupons)) setCoupons(data.coupons);
          if (Array.isArray(data.banners)) setBanners(data.banners);
        }
        setIsStateLoadedFromCloud(true);
      })
      .catch((err) => {
        console.error("Cloud state fetch error:", err);
        setIsStateLoadedFromCloud(true);
      });

    const interval = setInterval(() => {
      fetch('/api/state')
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data === 'object') {
            if (Array.isArray(data.users)) setUsers(data.users);
            if (Array.isArray(data.stores)) setStores(data.stores);
            if (Array.isArray(data.products)) setProducts(data.products);
            if (Array.isArray(data.orders)) setOrders(data.orders);
            if (Array.isArray(data.notifications)) setNotifications(data.notifications);
            if (Array.isArray(data.reviews)) setReviews(data.reviews);
            if (Array.isArray(data.coupons)) setCoupons(data.coupons);
            if (Array.isArray(data.banners)) setBanners(data.banners);
          }
        })
        .catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isStateLoadedFromCloud) return;

    const payload = {
      users,
      stores,
      products,
      orders,
      coupons,
      banners,
      notifications,
      reviews,
    };
    fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }, [isStateLoadedFromCloud, users, stores, products, orders, coupons, banners, notifications, reviews]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('sm_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('sm_current_user', JSON.stringify(currentUser));
    setCurrentRole(currentUser ? currentUser.role : 'guest');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sm_stores', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem('sm_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sm_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('sm_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('sm_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('sm_banners', JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    localStorage.setItem('sm_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('sm_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Theme State (System Auto / Light / Dark)
  const [themeMode, setThemeModeState] = useState<'system' | 'light' | 'dark'>(() => {
    return (localStorage.getItem('sm_theme') as 'system' | 'light' | 'dark') || 'system';
  });

  const setThemeMode = (mode: 'system' | 'light' | 'dark') => {
    setThemeModeState(mode);
    localStorage.setItem('sm_theme', mode);
  };

  useEffect(() => {
    const applyTheme = () => {
      const isDark =
        themeMode === 'dark' ||
        (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      if (themeMode === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener?.('change', handleMediaChange);
    return () => mediaQuery.removeEventListener?.('change', handleMediaChange);
  }, [themeMode]);

  // Auth functions
  const openAuthModal = (tab: 'login' | 'signup' | 'store_owner' | 'admin' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = (email: string, pass: string, targetRole?: UserRole) => {
    const formattedEmail = email.trim().toLowerCase();

    // STRICT Admin check for satyam443355@gmail.com
    if (targetRole === 'admin' || formattedEmail === 'satyam443355@gmail.com') {
      if (formattedEmail !== 'satyam443355@gmail.com' || pass !== 'Satyam@123') {
        return {
          success: false,
          message: 'Invalid login credentials.',
        };
      }

      let adminUser = users.find((u) => u.email.toLowerCase() === 'satyam443355@gmail.com');
      if (!adminUser) {
        adminUser = {
          id: 'user_admin',
          fullName: 'Satyam (Society Admin)',
          email: 'satyam443355@gmail.com',
          mobile: '+91 98765 43210',
          address: 'Society Management Office, Manokamna Apartments',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          createdAt: new Date().toISOString(),
          isApproved: true,
        };
        setUsers((prev) => [adminUser!, ...prev]);
      }

      setCurrentUser(adminUser);
      setCurrentRole('admin');
      setIsAuthModalOpen(false);
      setIsAdminTester(true);
      localStorage.setItem('isAdminTester', 'true');
      return { success: true, message: 'Welcome back, Satyam (Society Admin)!' };
    }

    const foundUser = users.find((u) => u.email.toLowerCase() === formattedEmail);

    if (!foundUser) {
      return { success: false, message: 'No account found with this email. Please Sign Up.' };
    }

    if (foundUser.isBanned) {
      return { success: false, message: 'This user account has been banned by the Admin.' };
    }

    if (targetRole && targetRole !== 'customer' && foundUser.role !== targetRole && foundUser.role !== 'admin') {
      return { success: false, message: `Account exists but is not registered as a ${targetRole.replace('_', ' ')}.` };
    }

    setCurrentUser(foundUser);
    setCurrentRole(foundUser.role);
    setIsAuthModalOpen(false);
    setIsAdminTester(false);
    localStorage.removeItem('isAdminTester');
    return { success: true, message: `Welcome back, ${foundUser.fullName}!` };
  };

  const signup = (userData: { fullName: string; email: string; mobile: string; address: string; password?: string }) => {
    const formattedEmail = userData.email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === formattedEmail);
    if (existing) {
      return { success: false, message: 'An account with this email already exists. Please login instead.' };
    }

    const newUser: User = {
      id: 'user_' + Date.now(),
      fullName: userData.fullName.trim(),
      email: formattedEmail,
      mobile: userData.mobile.trim(),
      address: userData.address.trim(),
      role: 'customer',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.fullName)}`,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setCurrentRole('customer');
    setIsAuthModalOpen(false);
    return { success: true, message: 'Account created successfully! Welcome to Society Marketplace.' };
  };

  const signupStoreOwner = (ownerData: {
    fullName: string;
    email: string;
    mobile: string;
    password?: string;
    storeName: string;
    storeCategory: string;
    blockLocation: string;
  }) => {
    const formattedEmail = ownerData.email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === formattedEmail);
    if (existing) {
      return { success: false, message: 'An account with this email already exists. Please login instead.' };
    }

    const storeId = 'store_' + Date.now();
    const userId = 'user_' + Date.now();

    const newUser: User = {
      id: userId,
      fullName: ownerData.fullName.trim(),
      email: formattedEmail,
      mobile: ownerData.mobile.trim(),
      address: ownerData.blockLocation.trim(),
      role: 'store_owner',
      storeId,
      isApproved: false,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(ownerData.fullName)}`,
      createdAt: new Date().toISOString(),
    };

    const newStore: Store = {
      id: storeId,
      name: ownerData.storeName.trim(),
      category: ownerData.storeCategory,
      ownerId: userId,
      ownerName: ownerData.fullName.trim(),
      ownerPhone: ownerData.mobile.trim(),
      blockLocation: ownerData.blockLocation.trim(),
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
      rating: 5.0,
      reviewsCount: 1,
      isOpen: true,
      openingTime: '08:00 AM',
      closingTime: '10:00 PM',
      status: 'pending',
      deliveryTimeMinutes: 15,
      minOrderAmount: 50,
      totalSales: 0,
    };

    setUsers((prev) => [...prev, newUser]);
    setStores((prev) => [newStore, ...prev]);
    setCurrentUser(newUser);
    setCurrentRole('store_owner');
    setIsAuthModalOpen(false);

    // Notify Admin (satyam443355@gmail.com)
    const notif: AppNotification = {
      id: 'notif_store_pending_' + Date.now(),
      userId: 'user_admin',
      title: 'New Store Approval Request 🏪',
      message: `Store "${newStore.name}" registered by ${newUser.fullName} is awaiting your Admin approval.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'announcement',
    };
    setNotifications((prev) => [notif, ...prev]);

    return {
      success: true,
      message: `Account created! Store "${newStore.name}" submitted to Society Admin (satyam443355@gmail.com) for approval.`,
    };
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole('guest');
    setCart([]);
    setActiveCoupon(null);
    setIsAdminTester(false);
    localStorage.removeItem('isAdminTester');
  };

  const switchRoleQuick = (role: UserRole, storeId?: string) => {
    if (role === 'guest') {
      setCurrentUser(null);
      setCurrentRole('guest');
      return;
    }

    let targetUser = users.find((u) => u.role === role && (!storeId || u.storeId === storeId));
    if (!targetUser) {
      if (role === 'admin') {
        targetUser = users.find((u) => u.role === 'admin') || INITIAL_USERS[0];
      } else if (role === 'store_owner') {
        targetUser = users.find((u) => u.role === 'store_owner' && u.storeId === (storeId || 'store_1')) || INITIAL_USERS[1];
      } else {
        targetUser = users.find((u) => u.role === 'customer') || INITIAL_USERS[5];
      }
    }

    setCurrentUser(targetUser);
    setCurrentRole(targetUser.role);
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
  };

  // Shopping Cart logic
  const getCartStore = (): Store | null => {
    if (cart.length === 0) return null;
    const firstStoreId = cart[0].product.storeId;
    return stores.find((s) => s.id === firstStoreId) || null;
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    if (cart.length > 0) {
      const currentCartStoreId = cart[0].product.storeId;
      if (currentCartStoreId !== product.storeId) {
        const currentStore = stores.find((s) => s.id === currentCartStoreId);
        const newStore = stores.find((s) => s.id === product.storeId);
        return {
          success: false,
          message: `Your cart contains items from "${currentStore?.name || 'another store'}". Complete or clear that order first to add items from "${newStore?.name}".`,
        };
      }
    }

    if (product.stock < quantity) {
      return { success: false, message: `Only ${product.stock} items available in stock.` };
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex].quantity = Math.min(newQty, product.stock);
        return updated;
      } else {
        return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
      }
    });

    return { success: true, message: `Added ${product.name} to cart!` };
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const clamped = Math.min(quantity, item.product.stock);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setActiveCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const formatted = code.trim().toUpperCase();
    if (!formatted) {
      return { success: false, message: 'Please enter a coupon code.' };
    }

    let couponToApply: Coupon | null = null;

    if (formatted === 'PREETU') {
      couponToApply = {
        id: 'c_preetu',
        code: 'PREETU',
        discountType: 'percentage',
        discountValue: 100,
        minOrder: 0,
        validTill: '2028-12-31',
        isActive: true,
        description: '100% OFF on entire order',
      };
    } else if (formatted === 'WELCOME5') {
      const userEmail = currentUser?.email?.toLowerCase();
      const userId = currentUser?.id;

      const alreadyUsed = orders.some((ord) => {
        const matchesUser =
          (userId && ord.customerId === userId) ||
          (userEmail && ord.customerEmail?.toLowerCase() === userEmail);
        return matchesUser && ord.couponCode === 'WELCOME5';
      });

      if (alreadyUsed) {
        return {
          success: false,
          message: 'WELCOME5 code can only be used 1 time per resident. You have already used this coupon.',
        };
      }

      couponToApply = {
        id: 'c_welcome5',
        code: 'WELCOME5',
        discountType: 'percentage',
        discountValue: 5,
        minOrder: 0,
        validTill: '2028-12-31',
        isActive: true,
        description: '5% OFF on order',
      };
    } else {
      const found = coupons.find((c) => c.code === formatted && c.isActive);
      if (found) {
        couponToApply = found;
      }
    }

    if (!couponToApply) {
      return { success: false, message: 'Invalid or expired coupon code.' };
    }

    const subtotal = getCartSubtotal();
    if (subtotal < couponToApply.minOrder) {
      return {
        success: false,
        message: `Minimum order amount for ${couponToApply.code} is ₹${couponToApply.minOrder}.`,
      };
    }

    setActiveCoupon(couponToApply);
    if (couponToApply.code === 'PREETU') {
      return { success: true, message: "Secret coupon 'PREETU' applied! 100% Discount on cart!" };
    }
    return { success: true, message: `Coupon '${couponToApply.code}' applied! (5% OFF)` };
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
  };

  const getCartSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const getCartDiscount = () => {
    const subtotal = getCartSubtotal();
    if (!activeCoupon) return 0;
    if (activeCoupon.discountType === 'fixed') {
      return Math.min(activeCoupon.discountValue, subtotal);
    } else {
      return Math.round((subtotal * activeCoupon.discountValue) / 100);
    }
  };

  const getCartDeliveryFee = () => {
    const subtotal = getCartSubtotal();
    if (subtotal === 0) return 0;
    const store = getCartStore();
    if (activeCoupon?.code === 'FREEDEL' || activeCoupon?.code === 'PREETU' || subtotal >= 199) return 0;
    return store ? 15 : 20;
  };

  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    const discount = getCartDiscount();
    const delivery = getCartDeliveryFee();
    return Math.max(0, subtotal - discount + delivery);
  };

  // Place order
  const placeOrder = (
    deliveryAddress: string,
    paymentMethod: 'cod' | 'upi' | 'card',
    notes?: string
  ) => {
    if (cart.length === 0) {
      return { success: false, message: 'Your cart is empty!' };
    }

    const store = getCartStore();
    if (!store) {
      return { success: false, message: 'Store information not found.' };
    }

    const userToUse = currentUser || {
      id: 'cust_' + Date.now(),
      fullName: 'Guest Resident',
      email: 'guest@societymarket.com',
      mobile: '+91 98000 00000',
      address: deliveryAddress,
      role: 'customer' as UserRole,
      createdAt: new Date().toISOString(),
    };

    const subtotal = getCartSubtotal();
    const discount = getCartDiscount();
    const deliveryFee = getCartDeliveryFee();
    const totalAmount = getCartTotal();

    const newOrderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const eta = new Date(now.getTime() + 20 * 60 * 1000); // 20 minutes from now

    const newOrder: Order = {
      id: newOrderId,
      customerId: userToUse.id,
      customerName: userToUse.fullName,
      customerEmail: userToUse.email,
      customerMobile: userToUse.mobile,
      deliveryAddress,
      storeId: store.id,
      storeName: store.name,
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
        unit: item.product.unit,
      })),
      subtotal,
      deliveryFee,
      discount,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      status: 'pending',
      couponCode: activeCoupon?.code,
      notes,
      createdAt: now.toISOString(),
      estimatedDeliveryTime: eta.toISOString(),
      statusHistory: [
        {
          status: 'pending',
          timestamp: now.toISOString(),
          note: 'Order placed by customer',
        },
      ],
    };

    // Deduct stock
    setProducts((prev) =>
      prev.map((p) => {
        const inCart = cart.find((c) => c.product.id === p.id);
        if (inCart) {
          return { ...p, stock: Math.max(0, p.stock - inCart.quantity) };
        }
        return p;
      })
    );

    // Update store sales
    setStores((prev) =>
      prev.map((s) => (s.id === store.id ? { ...s, totalSales: (s.totalSales || 0) + totalAmount } : s))
    );

    // Add Order
    setOrders((prev) => [newOrder, ...prev]);

    // Push notification for Customer
    const custNotification: AppNotification = {
      id: 'notif_' + Date.now(),
      userId: userToUse.id,
      title: 'Order Placed Successfully! 🚀',
      message: `Your order #${newOrderId} from ${store.name} (₹${totalAmount}) has been sent to the store. Awaiting shopkeeper acceptance.`,
      timestamp: now.toISOString(),
      isRead: false,
      type: 'order',
    };

    // Push notification for Store Owner
    const storeNotification: AppNotification = {
      id: 'notif_' + (Date.now() + 1),
      userId: store.ownerId || 'all',
      title: `🚨 New Order #${newOrderId} Received!`,
      message: `Resident ${userToUse.fullName} placed an order for ₹${totalAmount} at ${store.name}. Please Accept or Decline in Store Portal.`,
      timestamp: now.toISOString(),
      isRead: false,
      type: 'order',
    };

    setNotifications((prev) => [custNotification, storeNotification, ...prev]);

    setLastPlacedOrder(newOrder);
    setActiveOrderTrackId(newOrderId);
    clearCart();
    setIsCheckoutOpen(false);
    setIsOrderSuccessOpen(true);

    return { success: true, orderId: newOrderId, message: 'Order placed successfully!' };
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    const timestamp = new Date().toISOString();
    let updatedOrderObj: Order | null = null;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updatedHistory = [...o.statusHistory, { status, timestamp, note }];
          let newPaymentStatus = o.paymentStatus;

          if (status === 'delivered') {
            newPaymentStatus = 'paid';
          } else if (status === 'rejected' || status === 'cancelled') {
            if (o.paymentStatus === 'paid') {
              newPaymentStatus = 'refunded';
            }
          }

          const updated = {
            ...o,
            status,
            paymentStatus: newPaymentStatus,
            statusHistory: updatedHistory,
          };
          updatedOrderObj = updated;
          return updated;
        }
        return o;
      })
    );

    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      const store = stores.find((s) => s.id === targetOrder.storeId);
      const storeOwnerId = store?.ownerId || 'all';

      if (status === 'accepted') {
        const cNotif: AppNotification = {
          id: 'notif_' + Date.now(),
          userId: targetOrder.customerId,
          title: `Order #${orderId} Accepted! ✅`,
          message: `${targetOrder.storeName} accepted your order. Packing items now!`,
          timestamp,
          isRead: false,
          type: 'order',
        };
        const sNotif: AppNotification = {
          id: 'notif_' + (Date.now() + 1),
          userId: storeOwnerId,
          title: `Order #${orderId} Accepted`,
          message: `You accepted order #${orderId} for resident ${targetOrder.customerName}.`,
          timestamp,
          isRead: false,
          type: 'order',
        };
        setNotifications((prev) => [cNotif, sNotif, ...prev]);
      } else if (status === 'rejected' || status === 'cancelled') {
        // Restore stock
        setProducts((prev) =>
          prev.map((p) => {
            const itemInOrder = targetOrder.items.find((it) => it.productId === p.id);
            if (itemInOrder) {
              return { ...p, stock: p.stock + itemInOrder.quantity };
            }
            return p;
          })
        );

        const isPaid = targetOrder.paymentStatus === 'paid';
        const refundMsg = isPaid ? ` Amount ₹${targetOrder.totalAmount} has been refunded to your original payment source.` : '';

        const cNotif: AppNotification = {
          id: 'notif_' + Date.now(),
          userId: targetOrder.customerId,
          title: `Order #${orderId} Declined/Rejected ❌`,
          message: `Your order was declined by ${targetOrder.storeName}.${refundMsg}`,
          timestamp,
          isRead: false,
          type: 'order',
        };
        const sNotif: AppNotification = {
          id: 'notif_' + (Date.now() + 1),
          userId: storeOwnerId,
          title: `Order #${orderId} Rejected`,
          message: `Order #${orderId} declined.${isPaid ? ' Payment of ₹' + targetOrder.totalAmount + ' refunded.' : ''}`,
          timestamp,
          isRead: false,
          type: 'order',
        };
        setNotifications((prev) => [cNotif, sNotif, ...prev]);
      } else if (status === 'out_for_delivery') {
        const cNotif: AppNotification = {
          id: 'notif_' + Date.now(),
          userId: targetOrder.customerId,
          title: `Out for Delivery! 🛵`,
          message: `Your order #${orderId} from ${targetOrder.storeName} is out for delivery! Society runner is heading to your flat.`,
          timestamp,
          isRead: false,
          type: 'order',
        };
        const sNotif: AppNotification = {
          id: 'notif_' + (Date.now() + 1),
          userId: storeOwnerId,
          title: `Order #${orderId} Out for Delivery`,
          message: `Order #${orderId} handed over to delivery runner.`,
          timestamp,
          isRead: false,
          type: 'order',
        };
        setNotifications((prev) => [cNotif, sNotif, ...prev]);
      } else if (status === 'delivered') {
        const cNotif: AppNotification = {
          id: 'notif_' + Date.now(),
          userId: targetOrder.customerId,
          title: `Order Delivered! 🎉`,
          message: `Order #${orderId} from ${targetOrder.storeName} delivered to your doorstep. Thank you for shopping with us! Check your email receipt.`,
          timestamp,
          isRead: false,
          type: 'order',
        };
        const sNotif: AppNotification = {
          id: 'notif_' + (Date.now() + 1),
          userId: storeOwnerId,
          title: `Order #${orderId} Delivered`,
          message: `Order #${orderId} delivered successfully to ${targetOrder.customerName}.`,
          timestamp,
          isRead: false,
          type: 'order',
        };
        setNotifications((prev) => [cNotif, sNotif, ...prev]);

        // Open Delivered Confirmation Email Receipt Modal
        if (updatedOrderObj) {
          setDeliveredEmailOrder(updatedOrderObj);
        } else {
          setDeliveredEmailOrder({ ...targetOrder, status: 'delivered', paymentStatus: 'paid' });
        }
      } else {
        const cNotif: AppNotification = {
          id: 'notif_' + Date.now(),
          userId: targetOrder.customerId,
          title: `Order #${orderId} Status Updated`,
          message: `Status: ${status.replace('_', ' ')}. ${note || ''}`,
          timestamp,
          isRead: false,
          type: 'order',
        };
        setNotifications((prev) => [cNotif, ...prev]);
      }
    }
  };

  // Store Registration by Store Owners
  const registerStoreForCurrentUser = (storeDetails: {
    name: string;
    category: string;
    blockLocation: string;
    ownerPhone: string;
    openingTime?: string;
    closingTime?: string;
    minOrderAmount?: number;
    deliveryTimeMinutes?: number;
    image?: string;
  }) => {
    if (!currentUser) {
      return { success: false, message: 'You must be logged in to register a store.' };
    }

    const newStoreId = 'store_' + Date.now();
    const newStore: Store = {
      id: newStoreId,
      name: storeDetails.name.trim(),
      category: storeDetails.category,
      ownerId: currentUser.id,
      ownerName: currentUser.fullName,
      ownerPhone: storeDetails.ownerPhone.trim() || currentUser.mobile,
      blockLocation: storeDetails.blockLocation.trim(),
      image:
        storeDetails.image ||
        'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
      rating: 5.0,
      reviewsCount: 1,
      isOpen: true,
      openingTime: storeDetails.openingTime || '08:00 AM',
      closingTime: storeDetails.closingTime || '10:00 PM',
      status: 'pending', // Pending approval by Admin (Satyam)
      deliveryTimeMinutes: storeDetails.deliveryTimeMinutes || 15,
      minOrderAmount: storeDetails.minOrderAmount || 50,
      totalSales: 0,
    };

    setStores((prev) => [newStore, ...prev]);

    const updatedUser: User = {
      ...currentUser,
      role: 'store_owner',
      storeId: newStoreId,
      isApproved: false, // Requires admin approval
    };
    setCurrentUser(updatedUser);
    setCurrentRole('store_owner');
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    // Notify Admin (satyam443355@gmail.com)
    const notif: AppNotification = {
      id: 'notif_store_pending_' + Date.now(),
      userId: 'user_admin',
      title: 'New Store Approval Request 🏪',
      message: `Store "${newStore.name}" registered by ${currentUser.fullName} is awaiting your Admin approval.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'announcement',
    };
    setNotifications((prev) => [notif, ...prev]);

    return {
      success: true,
      message: `Store "${newStore.name}" registered! Approval request sent to Society Admin (satyam443355@gmail.com).`,
    };
  };

  const loadDemoStores = () => {
    setStores(DEMO_STORES);
    setProducts(DEMO_PRODUCTS);
  };

  const clearAllStores = () => {
    setStores([]);
    setProducts([]);
  };

  // Store Owner CRUD
  const addProduct = (data: Omit<Product, 'id' | 'rating' | 'reviewsCount'>) => {
    const newProd: Product = {
      ...data,
      id: 'prod_' + Date.now(),
      rating: 5.0,
      reviewsCount: 1,
    };
    setProducts((prev) => [newProd, ...prev]);
  };

  const editProduct = (productId: string, data: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...data } : p)));
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const toggleProductStock = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isAvailable: !p.isAvailable } : p))
    );
  };

  const updateStoreDetails = (storeId: string, data: Partial<Store>) => {
    setStores((prev) => prev.map((s) => (s.id === storeId ? { ...s, ...data } : s)));
  };

  // Admin CRUD
  const addStore = (storeData: Omit<Store, 'id' | 'rating' | 'reviewsCount' | 'totalSales'>) => {
    const newStore: Store = {
      ...storeData,
      id: 'store_' + Date.now(),
      rating: 5.0,
      reviewsCount: 0,
      totalSales: 0,
    };
    setStores((prev) => [...prev, newStore]);
  };

  const toggleStoreStatus = (storeId: string, status: 'active' | 'suspended') => {
    setStores((prev) => prev.map((s) => (s.id === storeId ? { ...s, status } : s)));
  };

  const approveStore = (storeId: string) => {
    const targetStore = stores.find((s) => s.id === storeId);
    setStores((prev) => prev.map((s) => (s.id === storeId ? { ...s, status: 'active' } : s)));

    if (targetStore) {
      // Approve user if pending
      setUsers((prev) =>
        prev.map((u) => (u.id === targetStore.ownerId ? { ...u, isApproved: true } : u))
      );

      // Send notification to owner
      const notif: AppNotification = {
        id: 'notif_store_approved_' + Date.now(),
        userId: targetStore.ownerId,
        title: 'Store Registration Approved! 🎉',
        message: `Your store "${targetStore.name}" has been approved by Society Admin (Satyam). It is now LIVE for residents!`,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'announcement',
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const rejectStore = (storeId: string) => {
    const targetStore = stores.find((s) => s.id === storeId);
    setStores((prev) => prev.map((s) => (s.id === storeId ? { ...s, status: 'suspended' } : s)));

    if (targetStore) {
      const notif: AppNotification = {
        id: 'notif_store_rejected_' + Date.now(),
        userId: targetStore.ownerId,
        title: 'Store Registration Request Updated ⚠️',
        message: `Your store registration for "${targetStore.name}" was declined or suspended by Society Admin.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'announcement',
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const approveStoreOwner = (userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isApproved: true } : u)));
  };

  const addCoupon = (coupon: Omit<Coupon, 'id'>) => {
    const newCoupon: Coupon = { ...coupon, id: 'coupon_' + Date.now() };
    setCoupons((prev) => [newCoupon, ...prev]);
  };

  const toggleCoupon = (couponId: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === couponId ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const addBanner = (banner: Omit<Banner, 'id'>) => {
    const newBanner: Banner = { ...banner, id: 'banner_' + Date.now() };
    setBanners((prev) => [newBanner, ...prev]);
  };

  const broadcastNotification = (title: string, message: string) => {
    const notif: AppNotification = {
      id: 'notif_broadcast_' + Date.now(),
      userId: 'all',
      title,
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'announcement',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const toggleBanUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const isBanned = !u.isBanned;
          if (isBanned && currentUser?.id === userId) {
            setTimeout(() => logout(), 0);
          }
          return { ...u, isBanned };
        }
        return u;
      })
    );
  };

  const deleteStore = (storeId: string) => {
    setStores((prev) => prev.filter((s) => s.id !== storeId));
    setProducts((prev) => prev.filter((p) => p.storeId !== storeId));
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...reviewData,
      id: 'rev_' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    // Calculate updated ratings
    if (reviewData.productId) {
      setProducts((prevProducts) =>
        prevProducts.map((prod) => {
          if (prod.id === reviewData.productId) {
            const currentProductReviews = [newReview, ...reviews].filter((r) => r.productId === prod.id);
            const totalRatingSum = currentProductReviews.reduce((sum, r) => sum + r.rating, 0);
            const newCount = currentProductReviews.length;
            const newRating = Number((totalRatingSum / newCount).toFixed(1));
            return {
              ...prod,
              rating: newRating,
              reviewsCount: newCount,
            };
          }
          return prod;
        })
      );
    }

    if (reviewData.storeId) {
      setStores((prevStores) =>
        prevStores.map((st) => {
          if (st.id === reviewData.storeId) {
            const currentStoreReviews = [newReview, ...reviews].filter((r) => r.storeId === st.id);
            const totalRatingSum = currentStoreReviews.reduce((sum, r) => sum + r.rating, 0);
            const newCount = currentStoreReviews.length;
            const newRating = Number((totalRatingSum / newCount).toFixed(1));
            return {
              ...st,
              rating: newRating,
              reviewsCount: newCount,
            };
          }
          return st;
        })
      );
    }

    setReviews((prev) => [newReview, ...prev]);
  };

  return (
    <MarketplaceContext.Provider
      value={{
        currentUser,
        currentRole,
        users,
        stores,
        products,
        orders,
        cart,
        coupons,
        banners,
        notifications,
        reviews,
        addReview,
        activeCoupon,
        searchQuery,
        selectedCategory,
        selectedStoreId,
        isAdminTester,
        isAuthModalOpen,
        authModalTab,
        isCartDrawerOpen,
        isCheckoutOpen,
        isOrderSuccessOpen,
        lastPlacedOrder,
        activeOrderTrackId,
        deliveredEmailOrder,
        setDeliveredEmailOrder,

        setSearchQuery,
        setSelectedCategory,
        setSelectedStoreId,
        openAuthModal,
        closeAuthModal,
        setIsCartDrawerOpen,
        setIsCheckoutOpen,
        setIsOrderSuccessOpen,
        setActiveOrderTrackId,

        login,
        signup,
        signupStoreOwner,
        logout,
        switchRoleQuick,
        updateUserProfile,

        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        getCartSubtotal,
        getCartDiscount,
        getCartDeliveryFee,
        getCartTotal,
        getCartStore,

        placeOrder,
        updateOrderStatus,

        registerStoreForCurrentUser,
        loadDemoStores,
        clearAllStores,

        addProduct,
        editProduct,
        deleteProduct,
        toggleProductStock,
        updateStoreDetails,

        themeMode,
        setThemeMode,

        addStore,
        toggleStoreStatus,
        approveStore,
        rejectStore,
        approveStoreOwner,
        addCoupon,
        toggleCoupon,
        addBanner,
        broadcastNotification,
        markNotificationAsRead,
        toggleBanUser,
        deleteStore,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
