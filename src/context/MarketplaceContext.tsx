import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, onSnapshot, deleteDoc, getDocFromServer } from 'firebase/firestore';
import {
  isGmailConnected,
  sendEmailViaGmail,
  connectGmailAccount,
  disconnectGmail,
  getConnectedGmailEmail,
} from '../lib/gmailService';
import { generateStoreOwnerOrderHtml, generateCustomerReceiptHtml, generateCustomerStatusUpdateHtml } from '../lib/emailTemplates';

function cleanObject(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  }
  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      cleaned[key] = cleanObject(val);
    }
  }
  return cleaned;
}

let hasQuotaError = false;

const safeSetDoc = (docRef: any, data: any, options?: any) => {
  if (hasQuotaError) return Promise.resolve();
  const cleanedData = cleanObject(data);
  const promise = options ? setDoc(docRef, cleanedData, options) : setDoc(docRef, cleanedData);
  return promise.catch((err) => {
    if (err?.message?.includes('Quota exceeded') || err?.code === 'resource-exhausted') {
      if (!hasQuotaError) {
        hasQuotaError = true;
        console.warn('Firestore quota exceeded. Running in high-performance local storage fallback mode.');
      }
    } else {
      console.warn('safeSetDoc warning:', err);
    }
  });
};

const safeDeleteDoc = (docRef: any) => {
  if (hasQuotaError) return Promise.resolve();
  return deleteDoc(docRef).catch((err) => {
    if (err?.message?.includes('Quota exceeded') || err?.code === 'resource-exhausted') {
      if (!hasQuotaError) {
        hasQuotaError = true;
        console.warn('Firestore quota exceeded. Running in high-performance local storage fallback mode.');
      }
    } else {
      console.warn('safeDeleteDoc warning:', err);
    }
  });
};

import { safeLocalStorage, safeToLower } from '../lib/storage';

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
  
  // Loading States for Skeletons
  isLoadingStores: boolean;
  isLoadingProducts: boolean;
  isInitialLoading: boolean;
  
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
    categories?: string[];
  }) => { success: boolean; message: string };
  logout: () => void;
  switchRoleQuick: (role: UserRole, storeId?: string) => void;
  updateUserProfile: (data: Partial<User>) => void;

  // Shopping Cart
  addToCart: (product: Product, quantity?: number) => { success: boolean; message: string };
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  quickReorder: (order: Order) => { success: boolean; message: string; count: number };
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
    categories?: string[];
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
  registerFcmToken: (userId: string) => Promise<void>;
  toggleBanUser: (userId: string) => void;
  deleteStore: (storeId: string) => void;

  // Rating & Review System
  reviews: Review[];
  addReview: (reviewData: Omit<Review, 'id' | 'createdAt'>) => void;

  // Gmail OAuth Integration
  isGmailLinked: boolean;
  connectedGmail: string | null;
  connectGmail: () => Promise<{ success: boolean; message: string }>;
  disconnectGmailAccount: () => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or defaults
  const [users, setUsers] = useState<User[]>(() => {
    const saved = safeLocalStorage.getJSON<User[]>('sm_users', []);
    if (Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = safeLocalStorage.getJSON<User | null>('sm_current_user', null);
    return saved;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return currentUser ? currentUser.role : 'guest';
  });

  const [stores, setStores] = useState<Store[]>(() => {
    const saved = safeLocalStorage.getJSON<Store[]>('sm_stores', []);
    if (Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    return INITIAL_STORES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = safeLocalStorage.getJSON<Product[]>('sm_products', []);
    if (Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = safeLocalStorage.getJSON<Order[]>('sm_orders', []);
    if (Array.isArray(saved)) {
      return saved;
    }
    return INITIAL_ORDERS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    return safeLocalStorage.getJSON<CartItem[]>('sm_cart', []);
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const loaded = safeLocalStorage.getJSON<Coupon[]>('sm_coupons', INITIAL_COUPONS);
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
    const saved = safeLocalStorage.getJSON<Banner[]>('sm_banners', []);
    if (Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    return INITIAL_BANNERS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    return safeLocalStorage.getJSON<AppNotification[]>('sm_notifications', INITIAL_NOTIFICATIONS);
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = safeLocalStorage.getJSON<Review[]>('sm_reviews', []);
    if (Array.isArray(saved)) {
      return saved;
    }
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
    return safeLocalStorage.getItem('isAdminTester') === 'true';
  });

  const [isStateLoadedFromCloud, setIsStateLoadedFromCloud] = useState(false);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Firestore Realtime Sync across devices
  useEffect(() => {
    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount >= 4) {
        setIsStateLoadedFromCloud(true);
      }
    };

    // 1. Users snapshot listener
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const cloudList: User[] = [];
      snapshot.forEach((docSnap) => {
        cloudList.push({ id: docSnap.id, ...docSnap.data() } as User);
      });
      if (snapshot.empty) {
        INITIAL_USERS.forEach((u) => {
          safeSetDoc(doc(db, 'users', u.id), u);
        });
        setUsers(INITIAL_USERS);
      } else {
        setUsers(cloudList);
      }
      checkLoaded();
    }, (err) => {
      if (err?.message?.includes('Quota exceeded') || err?.code === 'resource-exhausted') {
        hasQuotaError = true;
      } else {
        console.warn("Firestore users sync notice:", err?.message);
      }
      checkLoaded();
    });

    // 2. Stores snapshot listener
    const unsubscribeStores = onSnapshot(collection(db, 'stores'), (snapshot) => {
      const cloudList: Store[] = [];
      snapshot.forEach((docSnap) => {
        cloudList.push({ id: docSnap.id, ...docSnap.data() } as Store);
      });
      if (snapshot.empty) {
        INITIAL_STORES.forEach((s) => {
          safeSetDoc(doc(db, 'stores', s.id), s);
        });
        setStores(INITIAL_STORES);
      } else {
        setStores(cloudList);
      }
      setIsLoadingStores(false);
      checkLoaded();
    }, (err) => {
      if (err?.message?.includes('Quota exceeded') || err?.code === 'resource-exhausted') {
        hasQuotaError = true;
      } else {
        console.warn("Firestore stores sync notice:", err?.message);
      }
      setIsLoadingStores(false);
      checkLoaded();
    });

    // 3. Products snapshot listener
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const cloudList: Product[] = [];
      snapshot.forEach((docSnap) => {
        cloudList.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });
      if (snapshot.empty) {
        INITIAL_PRODUCTS.forEach((p) => {
          safeSetDoc(doc(db, 'products', p.id), p);
        });
        setProducts(INITIAL_PRODUCTS);
      } else {
        setProducts(cloudList);
      }
      setIsLoadingProducts(false);
      checkLoaded();
    }, (err) => {
      if (err?.message?.includes('Quota exceeded') || err?.code === 'resource-exhausted') {
        hasQuotaError = true;
      } else {
        console.warn("Firestore products sync notice:", err?.message);
      }
      setIsLoadingProducts(false);
      checkLoaded();
    });

    // 4. Orders snapshot listener
    const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const cloudList: Order[] = [];
      snapshot.forEach((docSnap) => {
        cloudList.push({ id: docSnap.id, ...docSnap.data() } as Order);
      });
      cloudList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(cloudList);
      checkLoaded();
    }, (err) => {
      if (err?.message?.includes('Quota exceeded') || err?.code === 'resource-exhausted') {
        hasQuotaError = true;
      } else {
        console.warn("Firestore orders sync notice:", err?.message);
      }
      checkLoaded();
    });

    // 5. Coupons snapshot listener
    const unsubscribeCoupons = onSnapshot(collection(db, 'coupons'), (snapshot) => {
      const list: Coupon[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Coupon);
      });
      if (snapshot.empty) {
        INITIAL_COUPONS.forEach((c) => {
          safeSetDoc(doc(db, 'coupons', c.id), c);
        });
      } else {
        setCoupons(list);
      }
    }, (err) => {
      if (!err?.message?.includes('Quota exceeded') && err?.code !== 'resource-exhausted') {
        console.warn("Firestore coupons sync notice:", err?.message);
      }
    });

    // 6. Banners snapshot listener
    const unsubscribeBanners = onSnapshot(collection(db, 'banners'), (snapshot) => {
      const list: Banner[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Banner);
      });
      if (snapshot.empty) {
        INITIAL_BANNERS.forEach((b) => {
          safeSetDoc(doc(db, 'banners', b.id), b);
        });
      } else {
        setBanners(list);
      }
    }, (err) => {
      if (!err?.message?.includes('Quota exceeded') && err?.code !== 'resource-exhausted') {
        console.warn("Firestore banners sync notice:", err?.message);
      }
    });

    // 7. Notifications snapshot listener
    const unsubscribeNotifications = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const list: AppNotification[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as AppNotification);
      });
      if (snapshot.empty) {
        INITIAL_NOTIFICATIONS.forEach((n) => {
          safeSetDoc(doc(db, 'notifications', n.id), n);
        });
      } else {
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setNotifications(list);
      }
    }, (err) => {
      if (!err?.message?.includes('Quota exceeded') && err?.code !== 'resource-exhausted') {
        console.warn("Firestore notifications sync notice:", err?.message);
      }
    });

    // 8. Reviews snapshot listener
    const unsubscribeReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const list: Review[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Review);
      });
      setReviews(list);
    }, (err) => {
      if (!err?.message?.includes('Quota exceeded') && err?.code !== 'resource-exhausted') {
        console.warn("Firestore reviews sync notice:", err?.message);
      }
    });

    return () => {
      unsubscribeUsers();
      unsubscribeStores();
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeCoupons();
      unsubscribeBanners();
      unsubscribeNotifications();
      unsubscribeReviews();
    };
  }, []);

  // Sync local currentUser with Firestore users array whenever cloud users update
  useEffect(() => {
    if (!currentUser) {
      const savedRaw = safeLocalStorage.getItem('sm_current_user');
      if (savedRaw) {
        try {
          const savedObj = JSON.parse(savedRaw);
          if (savedObj && savedObj.id) {
            setCurrentUser(savedObj);
          }
        } catch (e) {
          console.error("Error parsing saved user:", e);
        }
      }
    } else if (users.length > 0) {
      const cloudUser = (users || []).find(
        (u) => u && (u.id === currentUser.id || (u.email && currentUser?.email && safeToLower(u.email) === safeToLower(currentUser.email)))
      );
      if (cloudUser) {
        const isDifferent =
          cloudUser.role !== currentUser.role ||
          cloudUser.email !== currentUser.email ||
          cloudUser.fullName !== currentUser.fullName ||
          cloudUser.mobile !== currentUser.mobile ||
          cloudUser.address !== currentUser.address ||
          cloudUser.storeId !== currentUser.storeId ||
          cloudUser.fcmToken !== currentUser.fcmToken ||
          cloudUser.isBanned !== currentUser.isBanned;

        if (isDifferent) {
          setCurrentUser(cloudUser);
        }
      }
    }
  }, [users, currentUser?.id]);

  // Sync to LocalStorage
  useEffect(() => {
    safeLocalStorage.setItem('sm_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    safeLocalStorage.setItem('sm_current_user', JSON.stringify(currentUser));
    setCurrentRole(currentUser ? currentUser.role : 'guest');
  }, [currentUser]);

  useEffect(() => {
    safeLocalStorage.setItem('sm_stores', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    safeLocalStorage.setItem('sm_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    safeLocalStorage.setItem('sm_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    safeLocalStorage.setItem('sm_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    safeLocalStorage.setItem('sm_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    safeLocalStorage.setItem('sm_banners', JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    safeLocalStorage.setItem('sm_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    safeLocalStorage.setItem('sm_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Theme State (System Auto / Light / Dark)
  const [themeMode, setThemeModeState] = useState<'system' | 'light' | 'dark'>(() => {
    return (safeLocalStorage.getItem('sm_theme') as 'system' | 'light' | 'dark') || 'system';
  });

  const setThemeMode = (mode: 'system' | 'light' | 'dark') => {
    setThemeModeState(mode);
    safeLocalStorage.setItem('sm_theme', mode);
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

  // Gmail OAuth Integration State
  const [isGmailLinked, setIsGmailLinked] = useState<boolean>(() => isGmailConnected());
  const [connectedGmail, setConnectedGmail] = useState<string | null>(() => getConnectedGmailEmail());

  const connectGmail = async () => {
    try {
      const res = await connectGmailAccount();
      setIsGmailLinked(true);
      setConnectedGmail(res.user.email || 'Linked Google Account');
      return { success: true, message: `Successfully connected Gmail account (${res.user.email})!` };
    } catch (err: any) {
      console.error('Failed to link Gmail:', err);
      return { success: false, message: err?.message || 'Failed to connect Gmail account.' };
    }
  };

  const disconnectGmailAccount = () => {
    disconnectGmail();
    setIsGmailLinked(false);
    setConnectedGmail(null);
  };

  // Auth functions
  const openAuthModal = (tab: 'login' | 'signup' | 'store_owner' | 'admin' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = (email: string, pass: string, targetRole?: UserRole) => {
    const cleanInput = safeToLower(email).trim();
    const cleanDigits = cleanInput.replace(/\D/g, '');

    // STRICT Admin check for satyam443355@gmail.com
    if (targetRole === 'admin' || cleanInput === 'satyam443355@gmail.com') {
      if (cleanInput !== 'satyam443355@gmail.com' || pass !== 'Satyam@123') {
        return {
          success: false,
          message: 'Invalid login credentials.',
        };
      }

      let adminUser = (users || []).find((u) => u && safeToLower(u.email) === 'satyam443355@gmail.com');
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
      safeSetDoc(doc(db, 'users', adminUser.id), adminUser);
      safeLocalStorage.setItem('sm_current_user', JSON.stringify(adminUser));
      setIsAuthModalOpen(false);
      setIsAdminTester(true);
      safeLocalStorage.setItem('isAdminTester', 'true');
      return { success: true, message: 'Welcome back, Satyam (Society Admin)!' };
    }

    const foundUser = (users || []).find((u) => {
      if (!u) return false;
      const uEmail = safeToLower(u.email).trim();
      const uMobileDigits = (u.mobile || '').replace(/\D/g, '');
      const uStore = stores.find((s) => s && (s.ownerId === u.id || s.id === u.storeId));
      const uStoreName = safeToLower(uStore?.name).trim();

      const matchEmail = uEmail === cleanInput;
      const matchMobile = cleanDigits.length >= 7 && uMobileDigits.includes(cleanDigits);
      const matchStoreName = uStoreName && cleanInput.length >= 3 && uStoreName.includes(cleanInput);

      return matchEmail || matchMobile || matchStoreName;
    });

    if (!foundUser) {
      return { success: false, message: 'No account found matching this Email, Mobile Number, or Store Name. Please Sign Up.' };
    }

    if (foundUser.isBanned) {
      return { success: false, message: 'This user account has been banned by the Admin.' };
    }

    if (targetRole && targetRole !== 'customer' && foundUser.role !== targetRole && foundUser.role !== 'admin') {
      return { success: false, message: `Account exists but is not registered as a ${targetRole.replace('_', ' ')}.` };
    }

    setCurrentUser(foundUser);
    setCurrentRole(foundUser.role);
    safeSetDoc(doc(db, 'users', foundUser.id), foundUser);
    safeLocalStorage.setItem('sm_current_user', JSON.stringify(foundUser));
    setIsAuthModalOpen(false);
    setIsAdminTester(false);
    safeLocalStorage.removeItem('isAdminTester');
    return { success: true, message: `Welcome back, ${foundUser.fullName}!` };
  };

  const signup = (userData: { fullName: string; email: string; mobile: string; address: string; password?: string }) => {
    const formattedEmail = safeToLower(userData?.email).trim();
    const existing = (users || []).find((u) => u && safeToLower(u.email) === formattedEmail);
    if (existing) {
      return { success: false, message: 'An account with this email already exists. Please login instead.' };
    }

    const newUser: User = {
      id: 'user_' + Date.now(),
      fullName: (userData?.fullName || '').trim(),
      email: formattedEmail,
      mobile: (userData?.mobile || '').trim(),
      address: (userData?.address || '').trim(),
      role: 'customer',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData?.fullName || 'user')}`,
      createdAt: new Date().toISOString(),
    };

    safeSetDoc(doc(db, 'users', newUser.id), newUser);
    setCurrentUser(newUser);
    setCurrentRole('customer');
    safeLocalStorage.setItem('sm_current_user', JSON.stringify(newUser));
    setIsAuthModalOpen(false);
    return { success: true, message: 'Account created successfully! Welcome to Society Marketplace.' };
  };

  const createStarterProductsForStore = (
    storeId: string,
    storeName: string,
    category: string
  ): Product[] => {
    const lowerCat = safeToLower(category);
    const now = Date.now();

    if (lowerCat.includes('grocery') || lowerCat.includes('essentials') || lowerCat.includes('supermarket')) {
      return [
        {
          id: `prod_${now}_1`,
          storeId,
          name: 'Fresh Toned Cow Milk',
          category: 'Dairy & Milk',
          price: 66,
          originalPrice: 70,
          stock: 50,
          unit: '1 Litre',
          description: 'Pure, pasteurized fresh toned milk delivered daily.',
          image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          rating: 5.0,
          reviewsCount: 1,
        },
        {
          id: `prod_${now}_2`,
          storeId,
          name: 'Whole Wheat Whole-grain Bread',
          category: 'Bakery',
          price: 45,
          originalPrice: 50,
          stock: 30,
          unit: '400 g',
          description: 'Freshly baked soft whole wheat brown bread loaf.',
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          rating: 5.0,
          reviewsCount: 1,
        },
        {
          id: `prod_${now}_3`,
          storeId,
          name: 'Farm Fresh Organic Eggs',
          category: 'Dairy & Eggs',
          price: 90,
          originalPrice: 100,
          stock: 40,
          unit: '12 pcs',
          description: 'Nutritious farm fresh brown eggs packed with protein.',
          image: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          rating: 5.0,
          reviewsCount: 1,
        },
        {
          id: `prod_${now}_4`,
          storeId,
          name: 'Refined Sunflower Cooking Oil',
          category: 'Cooking Essentials',
          price: 155,
          originalPrice: 175,
          stock: 25,
          unit: '1 Litre Pouch',
          description: 'Light and healthy refined sunflower oil for daily cooking.',
          image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          rating: 5.0,
          reviewsCount: 1,
        },
      ];
    }

    if (lowerCat.includes('bakery') || lowerCat.includes('cake') || lowerCat.includes('sweet')) {
      return [
        {
          id: `prod_${now}_1`,
          storeId,
          name: 'Classic Butter Croissants',
          category: 'Pastries & Breads',
          price: 120,
          originalPrice: 140,
          stock: 20,
          unit: 'Pack of 2',
          description: 'Flaky, buttery gold-baked French croissants.',
          image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          rating: 5.0,
          reviewsCount: 1,
        },
        {
          id: `prod_${now}_2`,
          storeId,
          name: 'Rich Dark Chocolate Brownie',
          category: 'Desserts',
          price: 85,
          originalPrice: 100,
          stock: 25,
          unit: '1 Slice',
          description: 'Dense fudgy chocolate brownie topped with walnuts.',
          image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          rating: 5.0,
          reviewsCount: 1,
        },
        {
          id: `prod_${now}_3`,
          storeId,
          name: 'Fresh Fruit Cream Sponge Cake',
          category: 'Cakes',
          price: 490,
          originalPrice: 550,
          stock: 10,
          unit: '500 g',
          description: 'Soft vanilla sponge layered with fresh seasonal fruits and cream.',
          image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          rating: 5.0,
          reviewsCount: 1,
        },
      ];
    }

    if (lowerCat.includes('stationery') || lowerCat.includes('book') || lowerCat.includes('office')) {
      return [
        {
          id: `prod_${now}_1`,
          storeId,
          name: 'A4 Printing & Xeroxing Paper',
          category: 'Office Supplies',
          price: 290,
          originalPrice: 320,
          stock: 30,
          unit: '500 Sheets Ream',
          description: '75 GSM bright white paper ream for home and office printing.',
          image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          rating: 5.0,
          reviewsCount: 1,
        },
        {
          id: `prod_${now}_2`,
          storeId,
          name: 'Smooth Gel Pen Set',
          category: 'Pens & Markers',
          price: 80,
          originalPrice: 100,
          stock: 50,
          unit: 'Pack of 5 (Blue)',
          description: 'Waterproof quick-dry gel ink pens for comfortable writing.',
          image: 'https://images.unsplash.com/photo-1585336261026-8f5786372960?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          rating: 5.0,
          reviewsCount: 1,
        },
        {
          id: `prod_${now}_3`,
          storeId,
          name: 'Executive Hardbound Diary',
          category: 'Notebooks',
          price: 180,
          originalPrice: 220,
          stock: 20,
          unit: '1 Notebook (200 Pages)',
          description: 'Premium ruled paper notebook with leatherette hard cover.',
          image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          rating: 5.0,
          reviewsCount: 1,
        },
      ];
    }

    if (lowerCat.includes('pharmacy') || lowerCat.includes('medicine') || lowerCat.includes('health')) {
      return [
        {
          id: `prod_${now}_1`,
          storeId,
          name: 'Paracetamol 650mg Relief Tablets',
          category: 'OTC Medicines',
          price: 32,
          originalPrice: 35,
          stock: 100,
          unit: 'Strip of 15 Tablets',
          description: 'Fast acting fever and body pain relief tablets.',
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          rating: 5.0,
          reviewsCount: 1,
        },
        {
          id: `prod_${now}_2`,
          storeId,
          name: 'Antiseptic Liquid Disinfectant',
          category: 'First Aid',
          price: 75,
          originalPrice: 85,
          stock: 40,
          unit: '100 ml Bottle',
          description: 'First aid antiseptic for cuts, grazes, and personal hygiene.',
          image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          rating: 5.0,
          reviewsCount: 1,
        },
        {
          id: `prod_${now}_3`,
          storeId,
          name: 'Vitamin C + Zinc Immunity Chewables',
          category: 'Supplements',
          price: 110,
          originalPrice: 130,
          stock: 35,
          unit: 'Strip of 15',
          description: 'Daily immunity booster chewable orange tablets.',
          image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          rating: 5.0,
          reviewsCount: 1,
        },
      ];
    }

    // Generic fallback catalog
    return [
      {
        id: `prod_${now}_1`,
        storeId,
        name: `${storeName} Essential Item 1`,
        category: category || 'General',
        price: 120,
        originalPrice: 150,
        stock: 50,
        unit: '1 unit',
        description: 'High quality essential product freshly stocked at our society store.',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        rating: 5.0,
        reviewsCount: 1,
      },
      {
        id: `prod_${now}_2`,
        storeId,
        name: `${storeName} Daily Pack 2`,
        category: category || 'General',
        price: 85,
        originalPrice: 100,
        stock: 35,
        unit: '1 pack',
        description: 'Popular daily staple item available for instant doorstep delivery.',
        image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        rating: 5.0,
        reviewsCount: 1,
      },
      {
        id: `prod_${now}_3`,
        storeId,
        name: `${storeName} Value Set`,
        category: category || 'General',
        price: 199,
        originalPrice: 250,
        stock: 25,
        unit: '1 set',
        description: 'Special value pack curated for society residents.',
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        rating: 5.0,
        reviewsCount: 1,
      },
    ];
  };

  const signupStoreOwner = (ownerData: {
    fullName: string;
    email: string;
    mobile: string;
    password?: string;
    storeName: string;
    storeCategory: string;
    blockLocation: string;
    categories?: string[];
  }) => {
    const formattedEmail = safeToLower(ownerData?.email).trim();
    const existing = (users || []).find((u) => u && safeToLower(u.email) === formattedEmail);
    if (existing) {
      return { success: false, message: 'An account with this email already exists. Please login instead.' };
    }

    const storeId = 'store_' + Date.now();
    const userId = 'user_' + Date.now();

    const catList = ownerData.categories && ownerData.categories.length > 0
      ? ownerData.categories
      : ownerData.storeCategory
        ? ownerData.storeCategory.split(',').map((c) => c.trim()).filter(Boolean)
        : ['General'];

    const newUser: User = {
      id: userId,
      fullName: ownerData.fullName.trim(),
      email: formattedEmail,
      mobile: ownerData.mobile.trim(),
      address: ownerData.blockLocation.trim(),
      role: 'store_owner',
      storeId,
      isApproved: true,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(ownerData.fullName)}`,
      createdAt: new Date().toISOString(),
    };

    const newStore: Store = {
      id: storeId,
      name: ownerData.storeName.trim(),
      category: ownerData.storeCategory.trim(),
      categories: catList,
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
      status: 'active',
      deliveryTimeMinutes: 15,
      minOrderAmount: 50,
      totalSales: 0,
    };

    // 1. Optimistically update local React state
    setCurrentUser(newUser);
    setCurrentRole('store_owner');
    setUsers((prev) => [...prev.filter((u) => u.id !== userId), newUser]);
    setStores((prev) => [...prev.filter((s) => s.id !== storeId), newStore]);
    setIsAuthModalOpen(false);

    // 2. Persist User & Store to Firestore in real-time
    safeSetDoc(doc(db, 'users', newUser.id), newUser);
    safeSetDoc(doc(db, 'stores', newStore.id), newStore);

    // 3. Generate & Persist Default Product Catalog for this new store in real-time
    const initialProducts = createStarterProductsForStore(newStore.id, newStore.name, newStore.category);
    initialProducts.forEach((prod) => {
      safeSetDoc(doc(db, 'products', prod.id), prod);
    });
    setProducts((prev) => [...prev.filter((p) => !initialProducts.some((ip) => ip.id === p.id)), ...initialProducts]);

    // 4. Data-fetching listener verification: fetch created store from Firestore server immediately
    getDocFromServer(doc(db, 'stores', newStore.id))
      .then((docSnap) => {
        if (docSnap.exists()) {
          const cloudStore = { id: docSnap.id, ...docSnap.data() } as Store;
          setStores((prev) => [...prev.filter((s) => s.id !== cloudStore.id), cloudStore]);
          console.log(`✅ Store "${cloudStore.name}" verified and persisted in Firestore!`);
        }
      })
      .catch((err) => console.warn('Direct store fetch verification note:', err));

    // Save to LocalStorage
    safeLocalStorage.setItem('sm_current_user', JSON.stringify(newUser));

    // Notify Admin (satyam443355@gmail.com)
    const notif: AppNotification = {
      id: 'notif_store_pending_' + Date.now(),
      userId: 'user_admin',
      title: 'New Store Registered 🏪',
      message: `Store "${newStore.name}" (${newStore.category}) registered by ${newUser.fullName} is now LIVE on Society Marketplace.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'announcement',
    };
    safeSetDoc(doc(db, 'notifications', notif.id), notif);

    return {
      success: true,
      message: `Account and store created! "${newStore.name}" product catalog initialized and ready.`,
    };
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole('guest');
    setCart([]);
    setActiveCoupon(null);
    setIsAdminTester(false);
    safeLocalStorage.removeItem('isAdminTester');
    safeLocalStorage.removeItem('sm_current_user');
  };

  const switchRoleQuick = (role: UserRole, storeId?: string) => {
    if (role === 'guest') {
      setCurrentUser(null);
      setCurrentRole('guest');
      safeLocalStorage.removeItem('sm_current_user');
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

    if (targetUser) {
      setCurrentUser(targetUser);
      setCurrentRole(targetUser.role);
      safeSetDoc(doc(db, 'users', targetUser.id), targetUser);
      safeLocalStorage.setItem('sm_current_user', JSON.stringify(targetUser));
    }
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    safeSetDoc(doc(db, 'users', currentUser.id), data, { merge: true });
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

  const quickReorder = (order: Order) => {
    if (!order || !order.items || order.items.length === 0) {
      return { success: false, message: 'No items in this order to reorder.', count: 0 };
    }

    const reorderedCartItems: CartItem[] = order.items.map((item) => {
      let prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        prod = {
          id: item.productId || `prod_${Date.now()}_${Math.random()}`,
          storeId: order.storeId,
          name: item.productName || (item as any).product?.name || 'Item',
          category: 'General',
          price: item.price,
          stock: 99,
          unit: item.unit || '1 unit',
          description: item.productName || 'Reordered item',
          image: item.image || '/placeholder.png',
          isAvailable: true,
          rating: 5,
          reviewsCount: 1,
        };
      }
      return {
        product: prod,
        quantity: item.quantity || 1,
      };
    });

    setCart((prevCart) => {
      if (prevCart.length > 0 && prevCart[0].product.storeId !== order.storeId) {
        return reorderedCartItems;
      }

      const merged = [...prevCart];
      reorderedCartItems.forEach((newItem) => {
        const existingIdx = merged.findIndex((c) => c.product.id === newItem.product.id);
        if (existingIdx > -1) {
          merged[existingIdx].quantity += newItem.quantity;
        } else {
          merged.push(newItem);
        }
      });
      return merged;
    });

    setIsCartDrawerOpen(true);
    const orderIdLabel = order.id.startsWith('ORD-') ? order.id : `ORD-${order.id}`;
    return {
      success: true,
      message: `Items from Order #${orderIdLabel} added to your cart!`,
      count: order.items.length,
    };
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
      const userEmail = safeToLower(currentUser?.email);
      const userId = currentUser?.id;

      const alreadyUsed = (orders || []).some((ord) => {
        if (!ord) return false;
        const matchesUser =
          (userId && ord.customerId === userId) ||
          (userEmail && safeToLower(ord.customerEmail) === userEmail);
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

    if (activeCoupon?.code === 'FREEDEL' || activeCoupon?.code === 'PREETU') return 0;

    if (store) {
      const threshold = store.freeDeliveryThreshold !== undefined ? store.freeDeliveryThreshold : 199;
      if (threshold > 0 && subtotal >= threshold) {
        return 0;
      }
      return store.deliveryFee !== undefined ? store.deliveryFee : 15;
    }

    if (subtotal >= 199) return 0;
    return 20;
  };

  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    const discount = getCartDiscount();
    const delivery = getCartDeliveryFee();
    return Math.max(0, subtotal - discount + delivery);
  };

  const sendOrderEmail = async (order: Order, ownerEmail: string) => {
    try {
      if (isGmailConnected()) {
        const html = generateStoreOwnerOrderHtml(order);
        const gmailRes = await sendEmailViaGmail({
          to: ownerEmail,
          subject: `🚨 New Order #${order.id} Received at ${order.storeName}!`,
          htmlBody: html,
        });
        if (gmailRes.success) {
          console.log('✅ Sent order email via Gmail API to shopkeeper:', ownerEmail);
          return;
        }
      }
    } catch (gErr) {
      console.warn('Gmail API sendOrderEmail error, using backend mailer fallback:', gErr);
    }

    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toEmail: ownerEmail,
          orderId: order.id,
          customerName: order.customerName,
          customerMobile: order.customerMobile,
          deliveryAddress: order.deliveryAddress,
          items: order.items,
          totalAmount: order.totalAmount,
          storeName: order.storeName,
        }),
      });
    } catch (err) {
      console.error("Failed to send order email:", err);
    }
  };

  const sendCustomerReceiptEmail = async (order: Order) => {
    try {
      if (isGmailConnected()) {
        const html = generateCustomerReceiptHtml(order);
        const gmailRes = await sendEmailViaGmail({
          to: order.customerEmail,
          subject: `✅ Order Confirmed! #${order.id} from ${order.storeName}`,
          htmlBody: html,
        });
        if (gmailRes.success) {
          console.log('✅ Sent customer receipt email via Gmail API to:', order.customerEmail);
          return;
        }
      }
    } catch (gErr) {
      console.warn('Gmail API sendCustomerReceiptEmail error, using backend mailer fallback:', gErr);
    }

    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toEmail: order.customerEmail,
          orderId: order.id,
          customerName: order.customerName,
          customerMobile: order.customerMobile,
          deliveryAddress: order.deliveryAddress,
          items: order.items,
          totalAmount: order.totalAmount,
          storeName: order.storeName,
          customerReceipt: true,
        }),
      });
    } catch (err) {
      console.error("Failed to send customer receipt email:", err);
    }
  };

  const sendStatusEmail = async (order: Order, status: string) => {
    try {
      if (isGmailConnected() && order.customerEmail) {
        const html = generateCustomerStatusUpdateHtml(order, status);
        const isDelivered = status.toLowerCase() === 'delivered';
        const subject = isDelivered
          ? `🎉 Order Delivered! Thank You from ${order.storeName}`
          : `🔔 Order #${order.id} Status Update: ${status.replace('_', ' ').toUpperCase()}`;

        const gmailRes = await sendEmailViaGmail({
          to: order.customerEmail,
          subject,
          htmlBody: html,
        });
        if (gmailRes.success) {
          console.log('✅ Sent status update email via Gmail API to:', order.customerEmail);
          return;
        }
      }
    } catch (gErr) {
      console.warn('Gmail API sendStatusEmail error, falling back to backend:', gErr);
    }

    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toEmail: order.customerEmail,
          orderId: order.id,
          customerName: order.customerName,
          customerMobile: order.customerMobile,
          deliveryAddress: order.deliveryAddress,
          items: order.items,
          totalAmount: order.totalAmount,
          storeName: order.storeName,
          statusUpdate: true,
          status,
        }),
      });
    } catch (err) {
      console.error("Failed to send status update email:", err);
    }
  };

  const sendPushNotification = async (userId: string, title: string, message: string, fcmToken?: string) => {
    try {
      await fetch('/api/send-fcm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          title,
          message,
          fcmToken,
        }),
      });
    } catch (err) {
      console.error("Failed to trigger FCM push notification:", err);
    }
  };

  const registerFcmToken = async (userId: string) => {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      
      const { messaging } = await import('../lib/firebase');
      const { getToken } = await import('firebase/messaging');

      const simToken = 'fcm_simulated_' + userId;

      if (!messaging) {
        if (currentUser?.fcmToken === simToken) return;
        await safeSetDoc(doc(db, 'users', userId), { fcmToken: simToken }, { merge: true });
        return;
      }

      if (Notification.permission === 'granted') {
        try {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          const token = await getToken(messaging, {
            serviceWorkerRegistration: registration,
            vapidKey: 'BDbCOo0n3vX-G8fFmbyDozh9D21415RmsG_43fN-G06ZclFvF0oUOn4H3gM-r1XqR_8-76YxW7O2_F7vK7o_9xQ',
          });

          if (token) {
            if (currentUser?.fcmToken === token) return;
            await safeSetDoc(doc(db, 'users', userId), { fcmToken: token }, { merge: true });
            console.log("FCM Token registered successfully:", token);
          } else {
            throw new Error("Empty token received");
          }
        } catch (tokenErr) {
          console.warn("FCM getToken failed, utilizing simulated FCM token:", tokenErr);
          if (currentUser?.fcmToken === simToken) return;
          await safeSetDoc(doc(db, 'users', userId), { fcmToken: simToken }, { merge: true });
        }
      } else {
        if (currentUser?.fcmToken === simToken) return;
        await safeSetDoc(doc(db, 'users', userId), { fcmToken: simToken }, { merge: true });
      }
    } catch (err) {
      console.warn("FCM integration error:", err);
    }
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

    // Deduct stock in Firestore
    cart.forEach((item) => {
      const p = products.find((prod) => prod.id === item.product.id);
      if (p) {
        const newStock = Math.max(0, p.stock - item.quantity);
        const updateData: Partial<Product> = {
          stock: newStock,
          isAvailable: newStock > 0 ? p.isAvailable : false,
        };
        safeSetDoc(doc(db, 'products', p.id), updateData, { merge: true });
      }
    });

    // Update store sales in Firestore
    safeSetDoc(doc(db, 'stores', store.id), { totalSales: (store.totalSales || 0) + totalAmount }, { merge: true });

    // Add Order in Firestore
    safeSetDoc(doc(db, 'orders', newOrder.id), newOrder);

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

    safeSetDoc(doc(db, 'notifications', custNotification.id), custNotification);
    safeSetDoc(doc(db, 'notifications', storeNotification.id), storeNotification);

    // Send email alert to shopkeeper & receipt to customer
    const storeOwner = users.find((u) => u.id === store.ownerId);
    const ownerEmail = storeOwner?.email || 'satyam443355@gmail.com';
    sendOrderEmail(newOrder, ownerEmail);
    sendCustomerReceiptEmail(newOrder);

    // Send FCM push notification to shopkeeper
    sendPushNotification(
      store.ownerId,
      `🚨 New Order #${newOrderId} Placed!`,
      `You received a new order of ₹${totalAmount} from ${userToUse.fullName}. Please accept or decline in your dashboard.`
    );

    setOrders((prev) => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);
    setActiveOrderTrackId(newOrderId);
    clearCart();
    setIsCheckoutOpen(false);
    setIsOrderSuccessOpen(true);

    return { success: true, orderId: newOrderId, message: 'Order placed successfully!' };
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    const timestamp = new Date().toISOString();
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const updatedHistory = [...(targetOrder.statusHistory || []), { status, timestamp, note }];
    let newPaymentStatus = targetOrder.paymentStatus;

    if (status === 'delivered') {
      newPaymentStatus = 'paid';
    } else if (status === 'rejected' || status === 'cancelled') {
      if (targetOrder.paymentStatus === 'paid') {
        newPaymentStatus = 'refunded';
      }
    }

    const updatedOrderFields = {
      status,
      paymentStatus: newPaymentStatus,
      statusHistory: updatedHistory,
    };

    // 1. Optimistically update local React state IMMEDIATELY for single-click instant feedback
    setOrders((prevOrders) =>
      prevOrders.map((o) => (o.id === orderId ? { ...o, ...updatedOrderFields } : o))
    );

    // 2. Persist to cloud Firestore so customer and store owner see real-time status updates across devices
    safeSetDoc(doc(db, 'orders', orderId), updatedOrderFields, { merge: true });

    // Send order status update email to customer
    sendStatusEmail({ ...targetOrder, ...updatedOrderFields }, status);

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
      safeSetDoc(doc(db, 'notifications', cNotif.id), cNotif);
      safeSetDoc(doc(db, 'notifications', sNotif.id), sNotif);

      // Trigger FCM Push to Customer
      sendPushNotification(
        targetOrder.customerId,
        `Order #${orderId} Accepted! ✅`,
        `${targetOrder.storeName} accepted your order. Packing items now!`
      );
    } else if (status === 'rejected' || status === 'cancelled') {
      // Restore stock
      targetOrder.items.forEach((it) => {
        const p = products.find((prod) => prod.id === it.productId);
        if (p) {
          safeSetDoc(doc(db, 'products', p.id), { stock: p.stock + it.quantity }, { merge: true });
        }
      });

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
      safeSetDoc(doc(db, 'notifications', cNotif.id), cNotif);
      safeSetDoc(doc(db, 'notifications', sNotif.id), sNotif);

      // Trigger FCM Push to Customer
      sendPushNotification(
        targetOrder.customerId,
        `Order #${orderId} Declined/Rejected ❌`,
        `Your order was declined by ${targetOrder.storeName}.${refundMsg}`
      );
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
      safeSetDoc(doc(db, 'notifications', cNotif.id), cNotif);
      safeSetDoc(doc(db, 'notifications', sNotif.id), sNotif);

      // Trigger FCM Push to Customer
      sendPushNotification(
        targetOrder.customerId,
        `Out for Delivery! 🛵`,
        `Your order #${orderId} from ${targetOrder.storeName} is out for delivery! Society runner is heading to your flat.`
      );
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
      safeSetDoc(doc(db, 'notifications', cNotif.id), cNotif);
      safeSetDoc(doc(db, 'notifications', sNotif.id), sNotif);

      // Open Delivered Confirmation Email Receipt Modal
      setDeliveredEmailOrder({
        ...targetOrder,
        ...updatedOrderFields,
      });

      // Trigger FCM Push to Customer
      sendPushNotification(
        targetOrder.customerId,
        `Order Delivered! 🎉`,
        `Order #${orderId} from ${targetOrder.storeName} delivered to your doorstep. Thank you for shopping with us!`
      );
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
      safeSetDoc(doc(db, 'notifications', cNotif.id), cNotif);

      // Trigger FCM Push to Customer
      sendPushNotification(
        targetOrder.customerId,
        `Order #${orderId} Status Updated`,
        `Status: ${status.replace('_', ' ')}. ${note || ''}`
      );
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
    categories?: string[];
  }) => {
    if (!currentUser) {
      return { success: false, message: 'You must be logged in to register a store.' };
    }

    const newStoreId = 'store_' + Date.now();
    const catList = storeDetails.categories && storeDetails.categories.length > 0
      ? storeDetails.categories
      : storeDetails.category
        ? storeDetails.category.split(',').map((c) => c.trim()).filter(Boolean)
        : ['General'];

    const newStore: Store = {
      id: newStoreId,
      name: storeDetails.name.trim(),
      category: storeDetails.category.trim(),
      categories: catList,
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
      status: 'pending', // Pending Admin approval
      deliveryTimeMinutes: storeDetails.deliveryTimeMinutes || 15,
      minOrderAmount: storeDetails.minOrderAmount || 50,
      totalSales: 0,
    };

    const updatedUser: User = {
      ...currentUser,
      role: 'store_owner',
      storeId: newStoreId,
      isApproved: false, // Requires Admin approval
    };

    // 1. Optimistically update local state immediately
    setCurrentUser(updatedUser);
    setCurrentRole('store_owner');
    setUsers((prev) => [...prev.filter((u) => u.id !== currentUser.id), updatedUser]);
    setStores((prev) => [...prev.filter((s) => s.id !== newStoreId), newStore]);

    // 2. Persist Store & User to Firestore in real-time
    safeSetDoc(doc(db, 'stores', newStore.id), newStore);
    safeSetDoc(doc(db, 'users', currentUser.id), updatedUser);

    // 3. Generate & Persist Default Product Catalog for this new store in real-time
    const initialProducts = createStarterProductsForStore(newStore.id, newStore.name, newStore.category);
    initialProducts.forEach((prod) => {
      safeSetDoc(doc(db, 'products', prod.id), prod);
    });
    setProducts((prev) => [...prev.filter((p) => !initialProducts.some((ip) => ip.id === p.id)), ...initialProducts]);

    // 4. Data-fetching listener verification: fetch created store from Firestore server immediately
    getDocFromServer(doc(db, 'stores', newStore.id))
      .then((docSnap) => {
        if (docSnap.exists()) {
          const cloudStore = { id: docSnap.id, ...docSnap.data() } as Store;
          setStores((prev) => [...prev.filter((s) => s.id !== cloudStore.id), cloudStore]);
          console.log(`✅ Store "${cloudStore.name}" verified and persisted in Firestore!`);
        }
      })
      .catch((err) => console.warn('Direct store fetch verification note:', err));

    // Save to LocalStorage
    safeLocalStorage.setItem('sm_current_user', JSON.stringify(updatedUser));

    // Notify Admin (satyam443355@gmail.com)
    const notif: AppNotification = {
      id: 'notif_store_pending_' + Date.now(),
      userId: 'user_admin',
      title: 'New Store Registered 🏪',
      message: `Store "${newStore.name}" (${newStore.category}) registered by ${currentUser.fullName} is now LIVE on Society Marketplace.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'announcement',
    };
    safeSetDoc(doc(db, 'notifications', notif.id), notif);

    return {
      success: true,
      message: `Store "${newStore.name}" registered! Product catalog initialized and active.`,
    };
  };

  const loadDemoStores = () => {
    DEMO_STORES.forEach((s) => {
      safeSetDoc(doc(db, 'stores', s.id), s);
    });
    DEMO_PRODUCTS.forEach((p) => {
      safeSetDoc(doc(db, 'products', p.id), p);
    });
  };

  const clearAllStores = () => {
    stores.forEach((s) => {
      safeDeleteDoc(doc(db, 'stores', s.id));
    });
    products.forEach((p) => {
      safeDeleteDoc(doc(db, 'products', p.id));
    });
  };

  // Store Owner CRUD
  const addProduct = (data: Omit<Product, 'id' | 'rating' | 'reviewsCount'>) => {
    const id = 'prod_' + Date.now();
    const isAvail = (data.stock ?? 1) > 0 ? (data.isAvailable ?? true) : false;
    const newProd: Product = {
      ...data,
      isAvailable: isAvail,
      id,
      rating: 5.0,
      reviewsCount: 1,
    };
    setProducts((prev) => [...prev.filter((p) => p.id !== id), newProd]);
    safeSetDoc(doc(db, 'products', id), newProd).catch((err) =>
      console.error('Error adding product to Firestore:', err)
    );
  };

  const editProduct = (productId: string, data: Partial<Product>) => {
    const updateData = { ...data };
    if (updateData.stock !== undefined && updateData.stock <= 0) {
      updateData.isAvailable = false;
    }
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updateData } : p)));
    safeSetDoc(doc(db, 'products', productId), updateData, { merge: true }).catch((err) =>
      console.error(`Error editing product ${productId} in Firestore:`, err)
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    safeDeleteDoc(doc(db, 'products', productId));
  };

  const toggleProductStock = (productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (p) {
      const updated = { isAvailable: !p.isAvailable };
      setProducts((prev) => prev.map((prod) => (prod.id === productId ? { ...prod, ...updated } : prod)));
      safeSetDoc(doc(db, 'products', productId), updated, { merge: true }).catch((err) =>
        console.error(`Error toggling product stock for ${productId}:`, err)
      );
    }
  };

  const updateStoreDetails = (storeId: string, data: Partial<Store>) => {
    setStores((prevStores) =>
      prevStores.map((s) => (s.id === storeId ? { ...s, ...data } : s))
    );
    safeSetDoc(doc(db, 'stores', storeId), data, { merge: true }).catch((err) =>
      console.error(`Error updating store ${storeId} in Firestore:`, err)
    );
  };

  // Admin CRUD
  const addStore = (storeData: Omit<Store, 'id' | 'rating' | 'reviewsCount' | 'totalSales'>) => {
    const id = 'store_' + Date.now();
    const catList = storeData.categories && storeData.categories.length > 0
      ? storeData.categories
      : storeData.category
        ? storeData.category.split(',').map((c) => c.trim()).filter(Boolean)
        : ['General'];

    const newStore: Store = {
      ...storeData,
      id,
      categories: catList,
      rating: 5.0,
      reviewsCount: 0,
      totalSales: 0,
    };

    setStores((prev) => [...prev.filter((s) => s.id !== id), newStore]);
    safeSetDoc(doc(db, 'stores', id), newStore);

    // Initial products catalog for admin created store
    const initialProducts = createStarterProductsForStore(newStore.id, newStore.name, newStore.category);
    initialProducts.forEach((prod) => {
      safeSetDoc(doc(db, 'products', prod.id), prod);
    });
    setProducts((prev) => [...prev.filter((p) => !initialProducts.some((ip) => ip.id === p.id)), ...initialProducts]);

    getDocFromServer(doc(db, 'stores', id))
      .then((docSnap) => {
        if (docSnap.exists()) {
          const cloudStore = { id: docSnap.id, ...docSnap.data() } as Store;
          setStores((prev) => [...prev.filter((s) => s.id !== cloudStore.id), cloudStore]);
        }
      })
      .catch((err) => console.warn('Admin store verification note:', err));
  };

  const toggleStoreStatus = (storeId: string, status: 'active' | 'suspended') => {
    safeSetDoc(doc(db, 'stores', storeId), { status }, { merge: true });
  };

  const approveStore = (storeId: string) => {
    const targetStore = stores.find((s) => s.id === storeId);
    if (targetStore) {
      safeSetDoc(doc(db, 'stores', storeId), { status: 'active' }, { merge: true });
      safeSetDoc(doc(db, 'users', targetStore.ownerId), { isApproved: true }, { merge: true });

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
      safeSetDoc(doc(db, 'notifications', notif.id), notif);
    }
  };

  const rejectStore = (storeId: string) => {
    const targetStore = stores.find((s) => s.id === storeId);
    if (targetStore) {
      safeSetDoc(doc(db, 'stores', storeId), { status: 'suspended' }, { merge: true });

      const notif: AppNotification = {
        id: 'notif_store_rejected_' + Date.now(),
        userId: targetStore.ownerId,
        title: 'Store Registration Request Updated ⚠️',
        message: `Your store registration for "${targetStore.name}" was declined or suspended by Society Admin.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'announcement',
      };
      safeSetDoc(doc(db, 'notifications', notif.id), notif);
    }
  };

  const approveStoreOwner = (userId: string) => {
    safeSetDoc(doc(db, 'users', userId), { isApproved: true }, { merge: true });
  };

  const addCoupon = (coupon: Omit<Coupon, 'id'>) => {
    const id = 'coupon_' + Date.now();
    const newCoupon: Coupon = { ...coupon, id };
    safeSetDoc(doc(db, 'coupons', id), newCoupon);
  };

  const toggleCoupon = (couponId: string) => {
    const c = coupons.find((coupon) => coupon.id === couponId);
    if (c) {
      safeSetDoc(doc(db, 'coupons', couponId), { isActive: !c.isActive }, { merge: true });
    }
  };

  const addBanner = (banner: Omit<Banner, 'id'>) => {
    const id = 'banner_' + Date.now();
    const newBanner: Banner = { ...banner, id };
    safeSetDoc(doc(db, 'banners', id), newBanner);
  };

  const broadcastNotification = (title: string, message: string) => {
    const id = 'notif_broadcast_' + Date.now();
    const notif: AppNotification = {
      id,
      userId: 'all',
      title,
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'announcement',
    };
    safeSetDoc(doc(db, 'notifications', id), notif);
  };

  const markNotificationAsRead = (id: string) => {
    safeSetDoc(doc(db, 'notifications', id), { isRead: true }, { merge: true });
  };

  const toggleBanUser = (userId: string) => {
    const u = users.find((user) => user.id === userId);
    if (u) {
      const isBanned = !u.isBanned;
      safeSetDoc(doc(db, 'users', userId), { isBanned }, { merge: true });
      if (isBanned && currentUser?.id === userId) {
        setTimeout(() => logout(), 0);
      }
    }
  };

  const deleteStore = (storeId: string) => {
    safeDeleteDoc(doc(db, 'stores', storeId));
    products.forEach((p) => {
      if (p.storeId === storeId) {
        safeDeleteDoc(doc(db, 'products', p.id));
      }
    });
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const id = 'rev_' + Date.now();
    const newReview: Review = {
      ...reviewData,
      id,
      createdAt: new Date().toISOString(),
    };

    safeSetDoc(doc(db, 'reviews', id), newReview);

    // Calculate updated ratings
    if (reviewData.productId) {
      const prod = products.find((p) => p.id === reviewData.productId);
      if (prod) {
        const currentProductReviews = [newReview, ...reviews].filter((r) => r.productId === prod.id);
        const totalRatingSum = currentProductReviews.reduce((sum, r) => sum + r.rating, 0);
        const newCount = currentProductReviews.length;
        const newRating = Number((totalRatingSum / newCount).toFixed(1));
        safeSetDoc(doc(db, 'products', prod.id), { rating: newRating, reviewsCount: newCount }, { merge: true });
      }
    }

    if (reviewData.storeId) {
      const st = stores.find((s) => s.id === reviewData.storeId);
      if (st) {
        const currentStoreReviews = [newReview, ...reviews].filter((r) => r.storeId === st.id);
        const totalRatingSum = currentStoreReviews.reduce((sum, r) => sum + r.rating, 0);
        const newCount = currentStoreReviews.length;
        const newRating = Number((totalRatingSum / newCount).toFixed(1));
        safeSetDoc(doc(db, 'stores', st.id), { rating: newRating, reviewsCount: newCount }, { merge: true });
      }
    }
  };

  // Native Browser Notifications trigger
  const [lastNotifiedId, setLastNotifiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser || notifications.length === 0) return;

    // Get the most recent unread notification for this user (strictly personalized)
    const myUnread = notifications.filter(
      (n) => n.userId === currentUser.id && !n.isRead
    );

    if (myUnread.length === 0) return;

    const latest = myUnread[0]; // notifications are already sorted desc by timestamp
    
    // Check if we already notified about this ID
    if (latest.id === lastNotifiedId) return;

    // Check if the notification is fresh (created in the last 15 seconds) to avoid spamming historical alerts on boot
    const ageMs = Date.now() - new Date(latest.timestamp).getTime();
    if (ageMs > 15000) return;

    setLastNotifiedId(latest.id);

    // Play sound chime
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const notes = [
          { freq: 659.25, start: 0, duration: 0.16 },    // E5
          { freq: 830.61, start: 0.16, duration: 0.16 },  // G#5
          { freq: 1046.50, start: 0.32, duration: 0.22 }, // C6
          { freq: 1318.51, start: 0.56, duration: 0.35 }, // E6
        ];
        notes.forEach((note) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.start);
          gain.gain.setValueAtTime(0.4, ctx.currentTime + note.start);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.start + note.duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + note.start);
          osc.stop(ctx.currentTime + note.start + note.duration);
        });
      }
    } catch (e) {
      console.warn("Chime sound playback error:", e);
    }

    // Trigger Native Phone / Browser Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const title = latest.title;
        const options: any = {
          body: latest.message,
          icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
          badge: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
          silent: false,
          vibrate: [300, 100, 300, 100, 400],
          requireInteraction: true,
          renotify: true,
          tag: latest.id,
        };
        const notif = new Notification(title, options);
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (err) {
        console.error("Failed to trigger native notification:", err);
      }
    }
  }, [notifications, currentUser, lastNotifiedId]);

  useEffect(() => {
    if (currentUser?.id && !currentUser.fcmToken) {
      registerFcmToken(currentUser.id);
    }
  }, [currentUser?.id, currentUser?.fcmToken]);

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
        isLoadingStores,
        isLoadingProducts,
        isInitialLoading: isLoadingStores || isLoadingProducts,
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
        quickReorder,
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
        registerFcmToken,
        toggleBanUser,
        deleteStore,

        isGmailLinked,
        connectedGmail,
        connectGmail,
        disconnectGmailAccount,
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
