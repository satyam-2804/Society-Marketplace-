import React, { useState, useEffect, useRef } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ProductGridSkeleton } from '../skeletons/ProductCardSkeleton';
import { GmailConnectButton } from '../GmailConnectButton';
import { Product, OrderStatus } from '../../types';
import { safeToLower } from '../../lib/storage';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Store as StoreIcon,
  Package,
  Clock,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  DollarSign,
  Tag,
  AlertCircle,
  Phone,
  MapPin,
  Truck,
  PlusCircle,
  Sparkles,
  QrCode,
  Check,
  Copy,
  Percent,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { motion } from 'motion/react';

interface ImageUploaderProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  imageUrl,
  onImageChange,
  label = "Image",
  placeholder = "Upload image"
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>(
    imageUrl && imageUrl.startsWith('data:') ? 'upload' : 'url'
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageChange(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">{label}</label>
        <div className="flex bg-slate-100 rounded-lg p-0.5 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setUploadMode('upload')}
            className={`px-2.5 py-1 rounded-md transition-colors ${uploadMode === 'upload' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('url')}
            className={`px-2.5 py-1 rounded-md transition-colors ${uploadMode === 'url' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Image URL
          </button>
        </div>
      </div>

      {uploadMode === 'upload' ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[120px] ${
            dragActive
              ? 'border-amber-500 bg-amber-50/30'
              : imageUrl
              ? 'border-slate-300 bg-slate-50/50 hover:bg-slate-100/50'
              : 'border-slate-200 bg-slate-50/30 hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          {imageUrl ? (
            <div className="relative group w-full flex flex-col items-center gap-2">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs"
              />
              <div className="text-[10px] text-slate-500 font-bold group-hover:text-amber-600">
                Drag & drop or click to replace image
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-1">
              <Upload className="w-5 h-5 text-slate-400" />
              <p className="text-[11px] font-bold text-slate-700">{placeholder}</p>
              <p className="text-[9px] text-slate-400 font-medium">Supports PNG, JPG, GIF</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          <input
            type="url"
            value={imageUrl && imageUrl.startsWith('data:') ? '' : imageUrl}
            onChange={(e) => onImageChange(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-600 outline-none font-semibold placeholder:font-medium placeholder:text-slate-400"
          />
          {imageUrl && !imageUrl.startsWith('data:') && (
            <div className="flex items-center gap-2 mt-1 bg-slate-50/60 p-1.5 rounded-lg border border-slate-100">
              <img src={imageUrl} alt="Preview" className="w-8 h-8 rounded-lg object-cover border border-slate-200 shadow-3xs" />
              <span className="text-[10px] text-slate-400 font-semibold truncate max-w-xs">{imageUrl}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const StoreOwnerDashboard: React.FC = () => {
  const {
    currentUser,
    stores,
    products,
    orders,
    addProduct,
    editProduct,
    deleteProduct,
    toggleProductStock,
    updateStoreDetails,
    updateOrderStatus,
    registerStoreForCurrentUser,
    registerFcmToken,
    isLoadingProducts,
    isLoadingStores,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'analytics' | 'settings'>('orders');
  const [orderFilterTab, setOrderFilterTab] = useState<'all' | 'pending' | 'in_progress' | 'delivered_today' | 'delivered'>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [performanceTimeline, setPerformanceTimeline] = useState<'7days' | '30days' | 'lifetime'>('7days');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const handleStatusUpdate = (orderId: string, status: any, note: string) => {
    setUpdatingOrderId(orderId);
    updateOrderStatus(orderId, status, note);
    setTimeout(() => {
      setUpdatingOrderId(null);
    }, 400);
  };

  // New Store Registration Form state (when store doesn't exist)
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreCategory, setNewStoreCategory] = useState('Grocery');
  const [newStoreLocation, setNewStoreLocation] = useState('Block A, Shop #01');
  const [newStorePhone, setNewStorePhone] = useState(currentUser?.mobile || '');
  const [newStoreOpen, setNewStoreOpen] = useState('08:00 AM');
  const [newStoreClose, setNewStoreClose] = useState('10:00 PM');
  const [newStoreMinOrder, setNewStoreMinOrder] = useState('50');
  const [newStoreImage, setNewStoreImage] = useState('https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80');

  // Product modal form states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Groceries & Daily Essentials');
  const [price, setPrice] = useState('');
  const [giveDiscount, setGiveDiscount] = useState(false);
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('20');
  const [unit, setUnit] = useState('1 kg');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  // Store Timings & Offers states
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [newOffer, setNewOffer] = useState('');
  const [pushEnabled, setPushEnabled] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  // Get Store owned by this user with fallback to name and mobile matching
  const store = (stores || []).find(
    (s) =>
      s &&
      (s.ownerId === currentUser?.id ||
       s.id === currentUser?.storeId ||
       (s.ownerName && currentUser?.fullName && safeToLower(s.ownerName).trim() === safeToLower(currentUser.fullName).trim()) ||
       (s.ownerPhone && currentUser?.mobile && s.ownerPhone.replace(/\D/g, '') === currentUser.mobile.replace(/\D/g, '')))
  );

  // If stores are currently loading from cloud Firestore, show loading indicator
  if (isLoadingStores) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-bold text-slate-800">Connecting to Cloud & Synchronizing Your Shop...</p>
        <p className="text-xs text-slate-500 mt-1">Please wait a moment while your registered store details are fetched.</p>
      </div>
    );
  }

  // If user has no store created yet, show "Register Store" onboarding
  if (!store) {
    const handleRegisterStore = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newStoreName || !newStoreLocation) return;
      registerStoreForCurrentUser({
        name: newStoreName,
        category: newStoreCategory,
        blockLocation: newStoreLocation,
        ownerPhone: newStorePhone,
        openingTime: newStoreOpen,
        closingTime: newStoreClose,
        minOrderAmount: parseFloat(newStoreMinOrder) || 50,
        deliveryTimeMinutes: 15,
        image: newStoreImage,
      });
    };

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <StoreIcon className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Register Your Society Outlet</h2>
              <p className="text-xs text-slate-500 font-medium">Add your shop to Manokamna Apartments Society Marketplace</p>
            </div>
          </div>

          <form onSubmit={handleRegisterStore} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store / Shop Name *</label>
              <input
                type="text"
                required
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                placeholder="e.g., Manokamna Fresh Bakery & Dairy"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Category / Purpose *</label>
                <input
                  type="text"
                  required
                  value={newStoreCategory}
                  onChange={(e) => setNewStoreCategory(e.target.value)}
                  placeholder="e.g. Stationery, Grocery, Pharmacy, Hardware, Bakery..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Block & Shop Location *</label>
                <input
                  type="text"
                  required
                  value={newStoreLocation}
                  onChange={(e) => setNewStoreLocation(e.target.value)}
                  placeholder="e.g., Block B, Shop #02"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Owner Contact Phone</label>
                <input
                  type="text"
                  value={newStorePhone}
                  onChange={(e) => setNewStorePhone(e.target.value)}
                  placeholder="+91 98000 00000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Opening Time</label>
                <input
                  type="text"
                  value={newStoreOpen}
                  onChange={(e) => setNewStoreOpen(e.target.value)}
                  placeholder="07:00 AM"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Closing Time</label>
                <input
                  type="text"
                  value={newStoreClose}
                  onChange={(e) => setNewStoreClose(e.target.value)}
                  placeholder="10:00 PM"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>
            </div>

            <div>
              <ImageUploader
                imageUrl={newStoreImage}
                onImageChange={setNewStoreImage}
                label="Store Banner Photo / Logo"
                placeholder="Drag & drop or click to upload banner image"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Create My Society Store Now</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filter products and orders belonging STRICTLY to this store
  const storeProducts = products.filter((p) => p.storeId === store.id);
  const storeOrders = orders.filter((o) => o.storeId === store.id);

  // Sales analytics for this store
  const totalStoreSales = storeOrders
    .filter((o) => o.status !== 'rejected' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = storeOrders.filter((o) => o.status === 'pending');
  const inProgressOrders = storeOrders.filter(
    (o) => o.status === 'accepted' || o.status === 'preparing' || o.status === 'out_for_delivery'
  );
  const allDeliveredOrders = storeOrders.filter((o) => o.status === 'delivered');

  const prevPendingCountRef = useRef(pendingOrders.length);

  const playOrderRingtoneSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Phone order notification ringtone (two cycles of E5-G#5-B5-E6)
      const ringNotes = [
        { freq: 659.25, start: 0, duration: 0.15 },    // E5
        { freq: 830.61, start: 0.15, duration: 0.15 },  // G#5
        { freq: 987.77, start: 0.30, duration: 0.15 },  // B5
        { freq: 1318.51, start: 0.45, duration: 0.35 }, // E6
        { freq: 659.25, start: 0.90, duration: 0.15 },  // E5
        { freq: 830.61, start: 1.05, duration: 0.15 },  // G#5
        { freq: 987.77, start: 1.20, duration: 0.15 },  // B5
        { freq: 1318.51, start: 1.35, duration: 0.40 }, // E6
      ];

      ringNotes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.start);
        gain.gain.setValueAtTime(0.5, ctx.currentTime + note.start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.start + note.duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + note.start);
        osc.stop(ctx.currentTime + note.start + note.duration);
      });
    } catch (err) {
      console.warn("Audio chime playback error:", err);
    }
  };

  const requestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          setPushEnabled(true);
          if (currentUser?.id) {
            registerFcmToken(currentUser.id);
          }
          playOrderRingtoneSound();
          const testNotif = new Notification(`🔔 Phone Order Alerts Activated - ${store.name}`, {
            body: `Permission granted! You will now receive instant phone notifications with sound whenever a customer places an order!`,
            icon: store.image || '/icon-192.png',
            badge: '/icon-192.png',
            requireInteraction: true,
            tag: 'order-alert-setup',
            vibrate: [300, 100, 300, 100, 400],
          } as any);
          testNotif.onclick = () => {
            window.focus();
            testNotif.close();
          };
        } else if (perm === 'denied') {
          alert("Notification permission was denied. Please allow notifications in your device/site settings to receive instant order alerts on your phone.");
        }
      } catch (err) {
        console.error("Push permission error:", err);
      }
    } else {
      alert("Browser/Device notification API is not supported on this browser.");
    }
  };

  useEffect(() => {
    if (currentUser?.id && !currentUser.fcmToken && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      registerFcmToken(currentUser.id);
    }
  }, [currentUser?.id, currentUser?.fcmToken]);

  useEffect(() => {
    if (pendingOrders.length > prevPendingCountRef.current) {
      const latestOrder = pendingOrders[0];

      // Trigger Web Push Notification for phone notification panel
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const notifTitle = `🚨 New Customer Order Received! (${store.name})`;
        const notifBody = latestOrder
          ? `Order Amount: ₹${latestOrder.totalAmount} • Customer: ${latestOrder.customerName}\nAddress: ${latestOrder.deliveryAddress}\nTap to view and accept order!`
          : `You received a new order for ${store.name}. Tap to view and accept immediately!`;

        try {
          const orderNotif = new Notification(notifTitle, {
            body: notifBody,
            icon: store.image || '/icon-192.png',
            badge: '/icon-192.png',
            requireInteraction: true,
            renotify: true,
            tag: `store-order-${latestOrder?.id || Date.now()}`,
            vibrate: [300, 100, 300, 100, 500],
          } as any);

          orderNotif.onclick = () => {
            window.focus();
            orderNotif.close();
          };
        } catch (e) {
          console.error("Order notification error:", e);
        }
      }

      // Play phone ringtone sound
      playOrderRingtoneSound();
    }
    prevPendingCountRef.current = pendingOrders.length;
  }, [pendingOrders.length, store.name, store.image]);

  // Today's delivered orders calculation
  const todayDateStr = new Date().toDateString();
  const deliveredTodayOrders = storeOrders.filter(
    (o) => o.status === 'delivered' && new Date(o.createdAt).toDateString() === todayDateStr
  );
  const deliveredTodayCount = deliveredTodayOrders.length;
  const deliveredTodayRevenue = deliveredTodayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Performance chart data for Recharts (7 days, 30 days, lifetime)
  const chartData = React.useMemo(() => {
    const daysMap: { [key: string]: { date: string; revenue: number; ordersCount: number; timestamp: number } } = {};
    let daysCount = 7;
    if (performanceTimeline === '30days') daysCount = 30;
    if (performanceTimeline === 'lifetime') {
      let earliest = Date.now();
      storeOrders.forEach((o) => {
        if (o.status === 'delivered') {
          const t = new Date(o.createdAt).getTime();
          if (t < earliest) earliest = t;
        }
      });
      const diffDays = Math.ceil((Date.now() - earliest) / (1000 * 60 * 60 * 24));
      daysCount = Math.max(14, Math.min(diffDays || 14, 90));
    }

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      const fullDateKey = d.toDateString();
      daysMap[fullDateKey] = { date: dateStr, revenue: 0, ordersCount: 0, timestamp: new Date(fullDateKey).getTime() };
    }

    storeOrders.forEach((o) => {
      if (o.status === 'delivered') {
        const oDate = new Date(o.createdAt);
        const oDateKey = oDate.toDateString();
        if (daysMap[oDateKey]) {
          daysMap[oDateKey].revenue += o.totalAmount;
          daysMap[oDateKey].ordersCount += 1;
        } else if (performanceTimeline === 'lifetime') {
          const dateStr = oDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
          daysMap[oDateKey] = { date: dateStr, revenue: o.totalAmount, ordersCount: 1, timestamp: oDate.setHours(0,0,0,0) };
        }
      }
    });

    const list = Object.values(daysMap);
    list.sort((a, b) => a.timestamp - b.timestamp);
    return list;
  }, [storeOrders, performanceTimeline]);

  // Filtered orders list based on selected filter tab and search query
  const filteredStoreOrders = storeOrders.filter((o) => {
    // Filter tab
    if (orderFilterTab === 'pending' && o.status !== 'pending') return false;
    if (
      orderFilterTab === 'in_progress' &&
      o.status !== 'accepted' &&
      o.status !== 'preparing' &&
      o.status !== 'out_for_delivery'
    )
      return false;
    if (
      orderFilterTab === 'delivered_today' &&
      !(o.status === 'delivered' && new Date(o.createdAt).toDateString() === todayDateStr)
    )
      return false;
    if (orderFilterTab === 'delivered' && o.status !== 'delivered') return false;

    // Search query
    if (safeToLower(orderSearchQuery).trim()) {
      const q = safeToLower(orderSearchQuery);
      const matchId = safeToLower(o.id).includes(q);
      const matchCustomer = safeToLower(o.customerName).includes(q);
      const matchPhone = safeToLower(o.customerMobile).includes(q);
      const matchAddress = safeToLower(o.deliveryAddress).includes(q);
      return matchId || matchCustomer || matchPhone || matchAddress;
    }

    return true;
  });

  const openAddProductModal = () => {
    setEditingProductId(null);
    setName('');
    setCategory(store?.category || 'Groceries & Daily Essentials');
    setPrice('');
    setOriginalPrice('');
    setGiveDiscount(false);
    setStock('25');
    setUnit('1 pack');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (p: Product) => {
    setEditingProductId(p.id);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price.toString());
    if (p.originalPrice && p.originalPrice > p.price) {
      setGiveDiscount(true);
      setOriginalPrice(p.originalPrice.toString());
    } else {
      setGiveDiscount(false);
      setOriginalPrice('');
    }
    setStock(p.stock.toString());
    setUnit(p.unit);
    setDescription(p.description);
    setImage(p.image);
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !unit || !store) return;

    const priceNum = parseFloat(price);
    const mrpNum = giveDiscount && originalPrice ? parseFloat(originalPrice) : undefined;

    if (editingProductId) {
      editProduct(editingProductId, {
        name,
        category,
        price: priceNum,
        originalPrice: mrpNum && mrpNum > priceNum ? mrpNum : undefined,
        stock: parseInt(stock, 10) || 0,
        unit,
        description,
        image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      });
    } else {
      addProduct({
        storeId: store.id,
        name,
        category,
        price: priceNum,
        originalPrice: mrpNum && mrpNum > priceNum ? mrpNum : undefined,
        stock: parseInt(stock, 10) || 0,
        unit,
        description,
        image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
      });
    }

    setIsProductModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Store Status Pending Banner if awaiting Admin approval */}
      {store.status === 'pending' && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 mb-6 text-amber-900 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-sm text-amber-900">⏳ Store Approval Pending Admin Authorization</h4>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              Basic shop details for <strong>"{store.name}"</strong> have been submitted to Society Admin (<strong>satyam443355@gmail.com</strong>).
              Once Admin confirms and approves your store application, your store will be live for customers to order!
            </p>
          </div>
        </div>
      )}

      {/* Prominent Phone & System Order Notifications Banner */}
      {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && store.status !== 'pending' && (
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 text-white rounded-3xl p-5 mb-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-emerald-500/50">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 text-2xl shadow-inner">
              🔔
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                Enable Instant Phone & Lockscreen Order Notifications
              </h4>
              <p className="text-xs text-emerald-100 mt-1 leading-relaxed max-w-2xl font-medium">
                Allow notification permission to receive live order popups directly in your phone's notification panel with sound alerts as soon as a customer places an order!
              </p>
            </div>
          </div>
          <button
            onClick={requestPushPermission}
            className="shrink-0 px-5 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs transition-all shadow-sm flex items-center gap-2 border border-white/80 active:scale-95"
          >
            <span>Allow Phone Notifications 🔔</span>
          </button>
        </div>
      )}

      {/* Store Owner Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={store.image}
            alt={store.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-500/30"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900">{store.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  store.status === 'pending'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : store.isOpen
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {store.status === 'pending' ? '⏳ PENDING ADMIN APPROVAL' : store.isOpen ? 'OPEN FOR ORDERS' : 'CLOSED'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" /> {store.blockLocation}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-amber-600" /> {store.ownerPhone}
              </span>
            </p>
          </div>
        </div>

        {store.status !== 'pending' && (
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <button
              onClick={requestPushPermission}
              className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 ${
                pushEnabled
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 animate-pulse'
              }`}
              title="Click to enable instant Web Push order notifications"
            >
              <span>{pushEnabled ? '🔔 Push Alerts Active' : '🔔 Enable Push Alerts'}</span>
            </button>
            <button
              onClick={() => updateStoreDetails(store.id, { isOpen: !store.isOpen })}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                store.isOpen
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {store.isOpen ? 'Temporarily Pause Orders' : 'Re-open Store'}
            </button>
            <button
              onClick={openAddProductModal}
              className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        )}
      </div>

      {store.status === 'pending' ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center max-w-2xl mx-auto shadow-sm mt-4">
          <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4 stroke-[1.8]" />
          <h3 className="text-lg font-black text-slate-900">Your Store Registration is Under Verification</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            In order to ensure maximum safety, trust, and verify residency inside <strong>Manokamna Apartments</strong>, all physical & home outlets are strictly verified by our Society Admin (<strong>satyam443355@gmail.com</strong>) before going live.
          </p>
          <div className="mt-6 bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700">🔒 Locked Features awaiting Approval:</h4>
            <ul className="text-[11px] text-slate-500 space-y-1.5 list-disc list-inside">
              <li>Add custom products and set stock levels</li>
              <li>Configure direct-to-bank UPI payment keys</li>
              <li>Receive real-time 20-minute delivery orders from residents</li>
              <li>Toggle shop open/close status</li>
            </ul>
          </div>
          <p className="text-[11px] text-amber-700 font-semibold mt-6 bg-amber-50 py-2 px-3 rounded-xl inline-block">
            🔔 An approval request has been sent to satyam443355@gmail.com. Please contact the society office for faster activation!
          </p>
        </div>
      ) : (
        <>
          {/* Overview Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                <span>Delivered Today</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-700">{deliveredTodayCount} <span className="text-xs font-normal text-slate-500">orders</span></p>
              <p className="text-[10px] text-emerald-800 font-bold mt-1">₹{deliveredTodayRevenue} earned today</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                <span>Pending Action</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-amber-600">{pendingOrders.length} <span className="text-xs font-normal text-slate-500">orders</span></p>
              <p className="text-[10px] text-slate-500 mt-1">Acceptance required</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                <span>In Progress</span>
                <Truck className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-indigo-700">{inProgressOrders.length} <span className="text-xs font-normal text-slate-500">orders</span></p>
              <p className="text-[10px] text-slate-500 mt-1">Preparing / Out for delivery</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                <span>Total Lifetime Sales</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">₹{totalStoreSales.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-slate-500 mt-1">{storeOrders.length} total orders received</p>
            </div>
          </div>

          {/* Daily Revenue & Total Orders Delivered Performance Chart */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>
                    Sales & Delivery Performance ({performanceTimeline === '7days' ? 'Last 7 Days' : performanceTimeline === '30days' ? 'Last 30 Days' : 'Lifetime'})
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track daily revenue (₹) and delivered orders count with graphical analytics
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Timeline Selector */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPerformanceTimeline('7days')}
                    className={`px-3 py-1 rounded-lg transition-all ${performanceTimeline === '7days' ? 'bg-white text-emerald-700 shadow-3xs font-extrabold' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setPerformanceTimeline('30days')}
                    className={`px-3 py-1 rounded-lg transition-all ${performanceTimeline === '30days' ? 'bg-white text-emerald-700 shadow-3xs font-extrabold' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setPerformanceTimeline('lifetime')}
                    className={`px-3 py-1 rounded-lg transition-all ${performanceTimeline === 'lifetime' ? 'bg-white text-emerald-700 shadow-3xs font-extrabold' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Lifetime
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-md bg-emerald-600"></div>
                    <span className="text-slate-600">Revenue (₹)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-md bg-amber-500"></div>
                    <span className="text-slate-600">Orders</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphical Summary Mini-Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Period Revenue</span>
                <p className="text-base font-black text-emerald-700 mt-0.5">
                  ₹{chartData.reduce((s, d) => s + d.revenue, 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Delivered Orders</span>
                <p className="text-base font-black text-amber-600 mt-0.5">
                  {chartData.reduce((s, d) => s + d.ordersCount, 0)} orders
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Daily Average</span>
                <p className="text-base font-black text-slate-900 mt-0.5">
                  ₹{chartData.length > 0 ? Math.round(chartData.reduce((s, d) => s + d.revenue, 0) / chartData.length).toLocaleString('en-IN') : 0} <span className="text-xs font-normal text-slate-500">/ day</span>
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis yAxisId="left" stroke="#059669" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#d97706" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', fontSize: '12px', fontWeight: 'bold', padding: '12px 16px' }}
                    formatter={(value: any, name: string) => [
                      name === 'revenue' ? `₹${value.toLocaleString('en-IN')}` : `${value} orders`,
                      name === 'revenue' ? 'Daily Revenue' : 'Delivered Orders'
                    ]}
                  />
                  <Bar yAxisId="left" dataKey="revenue" fill="#059669" radius={[8, 8, 0, 0]} barSize={performanceTimeline === '30days' ? 14 : 26} name="revenue" opacity={0.85} />
                  <Line yAxisId="right" type="monotone" dataKey="ordersCount" stroke="#d97706" strokeWidth={3} dot={{ r: 5, fill: '#d97706', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 7, stroke: '#d97706', strokeWidth: 2, fill: '#ffffff' }} name="ordersCount" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
                activeTab === 'orders' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Incoming Resident Orders
              {pendingOrders.length > 0 && (
                <span className="ml-2 bg-white text-amber-800 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {pendingOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'products' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Manage Product Inventory ({storeProducts.length})
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'settings' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Shop Settings & Offers
            </button>
          </div>

          {/* TAB 1: Incoming Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Today's Fulfillment Summary Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-5 shadow-sm border border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-white">Today's Order Fulfillment Summary</h3>
                      <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Delivered Today
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 font-medium">
                      You have delivered <strong className="text-emerald-400 font-black text-sm">{deliveredTodayCount}</strong> order{deliveredTodayCount === 1 ? '' : 's'} today generating <strong className="text-emerald-400 font-black text-sm">₹{deliveredTodayRevenue}</strong> in total revenue today.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs bg-white/10 px-3.5 py-2 rounded-xl font-bold border border-white/10 shrink-0">
                  <span className="text-slate-300">Total Lifetime Delivered:</span>
                  <span className="text-amber-300 font-black">{allDeliveredOrders.length} orders</span>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-bold">
                  <button
                    onClick={() => setOrderFilterTab('all')}
                    className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                      orderFilterTab === 'all'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({storeOrders.length})
                  </button>
                  <button
                    onClick={() => setOrderFilterTab('pending')}
                    className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
                      orderFilterTab === 'pending'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <span>Pending Action</span>
                    {pendingOrders.length > 0 && (
                      <span className="bg-amber-800 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                        {pendingOrders.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setOrderFilterTab('in_progress')}
                    className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                      orderFilterTab === 'in_progress'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
                    }`}
                  >
                    In Progress ({inProgressOrders.length})
                  </button>
                  <button
                    onClick={() => setOrderFilterTab('delivered_today')}
                    className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1 ${
                      orderFilterTab === 'delivered_today'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <span>Delivered Today ({deliveredTodayCount})</span>
                  </button>
                  <button
                    onClick={() => setOrderFilterTab('delivered')}
                    className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                      orderFilterTab === 'delivered'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All Delivered ({allDeliveredOrders.length})
                  </button>
                </div>

                {/* Search Box */}
                <div className="relative shrink-0 md:w-64">
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search resident, order #..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  {orderSearchQuery && (
                    <button
                      onClick={() => setOrderSearchQuery('')}
                      className="absolute right-2 top-2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Filtered Orders List */}
              <div className="space-y-4">
                {filteredStoreOrders.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-bold text-sm text-slate-700">No orders match your filter</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {orderSearchQuery ? `No order matched "${orderSearchQuery}"` : 'Try switching filter tabs above.'}
                    </p>
                  </div>
                ) : (
                  filteredStoreOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-300 transition-colors"
                    >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-slate-900 font-mono">#{order.id}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize ${
                        order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-800 font-bold">
                    Resident: {order.customerName} ({order.customerMobile})
                  </p>
                  <p className="text-xs text-slate-500 font-medium">{order.deliveryAddress}</p>

                  {/* Item List */}
                  <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-slate-700">
                        <span>
                          {item.quantity}x <strong>{item.productName}</strong> ({item.unit})
                        </span>
                        <span className="font-semibold text-slate-900">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 flex flex-col md:items-end gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <p className="text-lg font-black text-emerald-700">₹{order.totalAmount}</p>

                  {/* Actions depending on status */}
                  {order.status === 'pending' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        disabled={updatingOrderId === order.id}
                        onClick={() => handleStatusUpdate(order.id, 'accepted', 'Accepted by Store Owner')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {updatingOrderId === order.id ? 'Accepting...' : 'Accept Order ✅'}
                      </button>
                      <button
                        disabled={updatingOrderId === order.id}
                        onClick={() => handleStatusUpdate(order.id, 'rejected', 'Declined by Store Owner')}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs border border-rose-200 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {updatingOrderId === order.id ? 'Updating...' : 'Reject & Refund ❌'}
                      </button>
                    </div>
                  )}

                  {(order.status === 'accepted' || order.status === 'preparing') && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        disabled={updatingOrderId === order.id}
                        onClick={() => handleStatusUpdate(order.id, 'out_for_delivery', 'Runner heading to flat')}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {updatingOrderId === order.id ? 'Updating...' : 'Out for Delivery 🛵'}
                      </button>
                      <button
                        disabled={updatingOrderId === order.id}
                        onClick={() => handleStatusUpdate(order.id, 'delivered', 'Handed over at doorstep')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {updatingOrderId === order.id ? 'Updating...' : 'Mark Delivered 🎉'}
                      </button>
                    </div>
                  )}

                  {order.status === 'out_for_delivery' && (
                    <button
                      disabled={updatingOrderId === order.id}
                      onClick={() => handleStatusUpdate(order.id, 'delivered', 'Handed over at doorstep')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {updatingOrderId === order.id ? 'Updating...' : 'Mark Order Delivered 🎉'}
                    </button>
                  )}

                  {order.status === 'delivered' && (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-extrabold flex items-center gap-1">
                      ✅ Delivered & Receipt Emailed
                    </span>
                  )}

                  {order.status === 'rejected' && (
                    <span className="px-3 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-extrabold">
                      ❌ Rejected ({order.paymentStatus === 'refunded' ? 'Refunded' : 'Not Paid'})
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      )}

      {/* TAB 2: Products Management */}
      {activeTab === 'products' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-500">Products in your shop catalogue</p>
            <button
              onClick={openAddProductModal}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add New Item
            </button>
          </div>

          {isLoadingProducts ? (
            <ProductGridSkeleton count={6} />
          ) : storeProducts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-sm text-slate-700">No products added yet</p>
              <p className="text-xs text-slate-500 mt-1">Click "Add New Item" above to add products to your store!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {storeProducts.map((p) => (
                <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex gap-3">
                  <img src={p.image} alt={p.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 truncate">{p.name}</h4>
                      <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <span>{p.unit}</span>
                        <span>•</span>
                        <strong className={p.stock > 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                          Stock: {p.stock} units
                        </strong>
                      </p>
                      <p className="text-sm font-black text-emerald-700 mt-1">₹{p.price}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => toggleProductStock(p.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.isAvailable ? 'In Stock' : 'Out of Stock'}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditProductModal(p)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Store Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-2xl shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 mb-4">Store Timings & Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={store.name}
                  onChange={(e) => updateStoreDetails(store.id, { name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Category / Purpose</label>
                <input
                  type="text"
                  value={store.category || ''}
                  onChange={(e) => updateStoreDetails(store.id, { category: e.target.value })}
                  placeholder="e.g. Stationery, Grocery, Pharmacy, Hardware, Electronics..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-amber-600"
                />
              </div>

              <div>
                <ImageUploader
                  imageUrl={store.image}
                  onImageChange={(url) => updateStoreDetails(store.id, { image: url })}
                  label="Store Logo / Icon"
                  placeholder="Drag & drop or click to upload store icon/logo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Opening Time</label>
                  <input
                    type="text"
                    value={store.openingTime}
                    onChange={(e) => updateStoreDetails(store.id, { openingTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Closing Time</label>
                  <input
                    type="text"
                    value={store.closingTime}
                    onChange={(e) => updateStoreDetails(store.id, { closingTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Custom Delivery Fee per Order (₹)</label>
                  <p className="text-[10px] text-slate-500 mb-1">Standard delivery charge applied to orders from your shop.</p>
                  <input
                    type="number"
                    min="0"
                    value={store.deliveryFee !== undefined ? store.deliveryFee : 15}
                    onChange={(e) => updateStoreDetails(store.id, { deliveryFee: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Free Delivery Minimum Order Threshold (₹)</label>
                  <p className="text-[10px] text-slate-500 mb-1">Orders ≥ this amount get FREE delivery. Set 0 for no free delivery.</p>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 199"
                    value={store.freeDeliveryThreshold !== undefined ? store.freeDeliveryThreshold : 199}
                    onChange={(e) => updateStoreDetails(store.id, { freeDeliveryThreshold: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-amber-600"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <GmailConnectButton />
        </div>
      )}
        </>
      )}

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-xl">
            <h3 className="font-bold text-base text-slate-900 mb-4">
              {editingProductId ? 'Edit Product Item' : 'Add Product to Shop'}
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amul Butter 500g"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-600 outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide product details (e.g. ingredients, freshness, packaging, brand details)"
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-600 outline-none resize-none font-semibold placeholder:font-medium placeholder:text-slate-400"
                />
              </div>

              {/* Price & Discount Input Section */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-amber-600" />
                    Price & Discount Option
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !giveDiscount;
                      setGiveDiscount(next);
                      if (!next) {
                        setOriginalPrice('');
                      }
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all border ${
                      giveDiscount
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {giveDiscount ? '✓ Discount Enabled' : '+ Give Discount'}
                  </button>
                </div>

                {giveDiscount ? (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Product MRP (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          value={originalPrice}
                          onChange={(e) => setOriginalPrice(e.target.value)}
                          placeholder="e.g. 100"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-amber-600 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-emerald-800 mb-1">
                          Discounted Price (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="e.g. 80"
                          className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-black text-emerald-900 focus:border-emerald-600 outline-none"
                        />
                      </div>
                    </div>

                    {/* Auto-Calculated Discount Display */}
                    {parseFloat(originalPrice) > 0 &&
                    parseFloat(price) > 0 &&
                    parseFloat(originalPrice) > parseFloat(price) ? (
                      <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-extrabold text-emerald-950 flex items-center justify-between shadow-2xs">
                        <span className="flex items-center gap-1">
                          <Percent className="w-3.5 h-3.5 text-emerald-700" />
                          System Calculated Discount:
                        </span>
                        <span className="bg-emerald-700 text-white px-2.5 py-0.5 rounded-md text-xs font-black">
                          {Math.round(
                            ((parseFloat(originalPrice) - parseFloat(price)) /
                              parseFloat(originalPrice)) *
                              100
                          )}% OFF
                        </span>
                      </div>
                    ) : parseFloat(originalPrice) <= parseFloat(price) && parseFloat(originalPrice) > 0 ? (
                      <p className="text-[11px] text-rose-600 font-bold">
                        ⚠️ Discounted price must be lower than MRP (₹{originalPrice}).
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">
                        Enter MRP and Discounted Price above to calculate discount percentage automatically.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g. 100"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-amber-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Unit / Weight *</label>
                      <input
                        type="text"
                        required
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="1 kg or 500 ml"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-amber-600 outline-none"
                      />
                    </div>
                  </div>
                )}

                {giveDiscount && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Unit / Weight *</label>
                    <input
                      type="text"
                      required
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="1 kg or 500 ml"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-amber-600 outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity (Units) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-amber-600 outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Stock decreases automatically as orders are placed. Becomes out of stock when 0.
                </p>
              </div>

              <ImageUploader
                imageUrl={image}
                onImageChange={setImage}
                label="Product Image"
                placeholder="Drag & drop or click to upload product picture"
              />

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
