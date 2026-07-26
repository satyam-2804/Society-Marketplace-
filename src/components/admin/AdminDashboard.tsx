import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Store, User, Order, Product, Coupon, Banner, AppNotification } from '../../types';
import {
  ShieldCheck,
  Store as StoreIcon,
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Plus,
  Trash2,
  Ban,
  CheckCircle2,
  Bell,
  Tag,
  Download,
  AlertTriangle,
  Search,
  Check,
  Megaphone,
  ArrowLeft,
  Edit,
  X,
  ChevronDown,
  ChevronUp,
  Sliders,
  Percent,
  Activity,
  Filter,
  Package,
  Clock,
  PlusCircle,
  FileText,
  Copy,
  RefreshCw,
  UserCheck,
  XCircle,
  Upload,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Reusable local ImageUploader component to support file upload for Store Logos and Product Images
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
              ? 'border-rose-500 bg-rose-50/30'
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
              <div className="text-[10px] text-slate-500 font-bold group-hover:text-rose-600">
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
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-rose-600 outline-none font-semibold placeholder:font-medium placeholder:text-slate-400"
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

export const AdminDashboard: React.FC = () => {
  const {
    stores,
    users,
    orders,
    products,
    coupons,
    banners,
    addStore,
    toggleStoreStatus,
    approveStore,
    rejectStore,
    approveStoreOwner,
    addCoupon,
    toggleCoupon,
    addBanner,
    broadcastNotification,
    toggleBanUser,
    deleteStore,
    addProduct,
    editProduct,
    deleteProduct,
    toggleProductStock,
    updateStoreDetails,
    updateOrderStatus,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<
    'analytics' | 'stores' | 'users' | 'orders' | 'marketing'
  >('analytics');

  // Search filter states
  const [searchUsers, setSearchUsers] = useState('');
  const [searchStores, setSearchStores] = useState('');
  const [searchOrders, setSearchOrders] = useState('');

  // Store Management Nested States
  const [selectedStoreForProducts, setSelectedStoreForProducts] = useState<Store | null>(null);
  const [isEditStoreOpen, setIsEditStoreOpen] = useState(false);
  const [storeBeingEdited, setStoreBeingEdited] = useState<Store | null>(null);

  // Store owner registration request
  const pendingStores = stores.filter((s) => s.status === 'pending');

  // New store form state
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeCategory, setStoreCategory] = useState('Groceries & Daily Essentials');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [blockLocation, setBlockLocation] = useState('Block A, Shop #05');
  const [storeImage, setStoreImage] = useState('');

  // New Product Modal Form State (Admin can control shopkeeper products)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [productBeingEdited, setProductBeingEdited] = useState<Product | null>(null);
  
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOriginalPrice, setProdOriginalPrice] = useState('');
  const [prodStock, setProdStock] = useState('50');
  const [prodUnit, setProdUnit] = useState('1 kg');
  const [prodCategory, setProdCategory] = useState('Fresh Vegetables');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodIsAvailable, setProdIsAvailable] = useState(true);

  // Announcement broadcast state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // New Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponVal, setCouponVal] = useState('10');
  const [couponMinOrder, setCouponMinOrder] = useState('199');
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponDesc, setCouponDesc] = useState('10% discount on order');

  // Expanded Order for "Who ordered what" details
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Total Metrics (Calculations)
  const successfulOrders = orders.filter((o) => o.status !== 'rejected' && o.status !== 'cancelled');
  const totalRevenue = successfulOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = orders.length;
  const totalStores = stores.length;
  const totalCustomers = users.filter((u) => u.role === 'customer').length;
  const totalStoreOwners = users.filter((u) => u.role === 'store_owner').length;

  const averageOrderValue = successfulOrders.length > 0 
    ? Math.round(totalRevenue / successfulOrders.length) 
    : 0;

  // Add store logic
  const handleAddStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !ownerName) return;

    addStore({
      name: storeName,
      category: storeCategory,
      ownerId: 'owner_' + Date.now(),
      ownerName,
      ownerPhone: ownerPhone || '+91 98000 00000',
      blockLocation,
      image:
        storeImage ||
        'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
      rating: 5.0,
      isOpen: true,
      openingTime: '07:00 AM',
      closingTime: '10:00 PM',
      status: 'active',
      deliveryTimeMinutes: 15,
      minOrderAmount: 99,
    });

    // Reset fields
    setStoreName('');
    setOwnerName('');
    setOwnerPhone('');
    setBlockLocation('Block A, Shop #05');
    setStoreImage('');
    setIsAddStoreOpen(false);
  };

  // Edit store logic
  const handleEditStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeBeingEdited) return;
    updateStoreDetails(storeBeingEdited.id, storeBeingEdited);
    setIsEditStoreOpen(false);
    setStoreBeingEdited(null);
  };

  // Terminate Store logic (completely delete store)
  const handleTerminateStore = (storeId: string, storeName: string) => {
    if (window.confirm(`Are you absolutely sure you want to permanently delete and terminate "${storeName}"? All products of this shop will be deleted, and the store owner will be deregistered.`)) {
      deleteStore(storeId);
      // Close products sub-view if it belonged to this store
      if (selectedStoreForProducts?.id === storeId) {
        setSelectedStoreForProducts(null);
      }
    }
  };

  // Broadcast Notice logic
  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMsg) return;
    broadcastNotification(notifTitle, notifMsg);
    setNotifTitle('');
    setNotifMsg('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  // Coupon Submit logic
  const handleAddCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    addCoupon({
      code: couponCode.trim().toUpperCase(),
      discountType: couponType,
      discountValue: Number(couponVal),
      minOrder: Number(couponMinOrder),
      validTill: '2028-12-31',
      isActive: true,
      description: couponDesc,
    });
    setCouponCode('');
    setCouponVal('10');
    setCouponMinOrder('199');
    setCouponDesc('10% discount on order');
  };

  // Product submission (Add/Edit on behalf of shopkeeper)
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !selectedStoreForProducts) return;

    const productData = {
      storeId: selectedStoreForProducts.id,
      name: prodName,
      price: Number(prodPrice),
      originalPrice: prodOriginalPrice ? Number(prodOriginalPrice) : undefined,
      stock: Number(prodStock),
      unit: prodUnit,
      category: prodCategory,
      description: prodDescription || 'Fresh, quality products delivered straight to your apartment unit.',
      image: prodImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      isAvailable: prodIsAvailable,
    };

    if (isEditProductOpen && productBeingEdited) {
      editProduct(productBeingEdited.id, productData);
    } else {
      addProduct(productData);
    }

    // Reset product form state
    setProdName('');
    setProdPrice('');
    setProdOriginalPrice('');
    setProdStock('50');
    setProdUnit('1 kg');
    setProdDescription('');
    setProdImage('');
    setProdIsAvailable(true);
    setIsAddProductOpen(false);
    setIsEditProductOpen(false);
    setProductBeingEdited(null);
  };

  const openAddProductModal = () => {
    setProdName('');
    setProdPrice('');
    setProdOriginalPrice('');
    setProdStock('100');
    setProdUnit('1 kg');
    setProdDescription('');
    setProdImage('');
    setProdIsAvailable(true);
    setIsAddProductOpen(true);
  };

  const openEditProductModal = (p: Product) => {
    setProductBeingEdited(p);
    setProdName(p.name);
    setProdPrice(p.price.toString());
    setProdOriginalPrice(p.originalPrice ? p.originalPrice.toString() : '');
    setProdStock(p.stock.toString());
    setProdUnit(p.unit);
    setProdCategory(p.category);
    setProdDescription(p.description);
    setProdImage(p.image);
    setProdIsAvailable(p.isAvailable);
    setIsEditProductOpen(true);
  };

  // Filtering data for displays
  const filteredUsers = (users || []).filter((u) => {
    const term = (searchUsers || '').toLowerCase();
    return (
      (u.fullName || '').toLowerCase().includes(term) ||
      (u.id || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.mobile || '').includes(term) ||
      (u.address || '').toLowerCase().includes(term)
    );
  });

  const filteredStores = (stores || []).filter((s) => {
    const term = (searchStores || '').toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(term) ||
      (s.id || '').toLowerCase().includes(term) ||
      (s.ownerName || '').toLowerCase().includes(term) ||
      (s.blockLocation || '').toLowerCase().includes(term) ||
      (s.category || '').toLowerCase().includes(term)
    );
  });

  const filteredOrders = (orders || []).filter((o) => {
    const term = (searchOrders || '').toLowerCase();
    return (
      (o.id || '').toLowerCase().includes(term) ||
      (o.customerName || '').toLowerCase().includes(term) ||
      (o.customerId || '').toLowerCase().includes(term) ||
      (o.storeName || '').toLowerCase().includes(term) ||
      (o.status || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-800">
      
      {/* Admin Header Panel */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-sm shrink-0">
            <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Super Admin Control Hub</h1>
              <span className="bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-rose-200 shadow-3xs">
                Admin Mode
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Society Marketplace Governance • Connected as <span className="text-rose-600 font-bold font-mono">satyam443355@gmail.com</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => setIsAddStoreOpen(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all hover:translate-y-[-1px] active:translate-y-[1px] flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Launch New Society Store</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Visual Blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* KPI 1: Sales Amount */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs hover:shadow-2xs transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span className="uppercase tracking-wider text-[10px]">Total Revenue</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span className="text-[10px] text-emerald-700 font-black uppercase tracking-wider">₹{averageOrderValue} Avg Order</span>
          </div>
        </div>

        {/* KPI 2: Total Orders */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs hover:shadow-2xs transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span className="uppercase tracking-wider text-[10px]">Total Orders</span>
            <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{totalOrdersCount}</p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-bold">
            <span className="text-emerald-600">{orders.filter(o => o.status === 'delivered').length} Delivered</span>
            <span>•</span>
            <span className="text-amber-600">{orders.filter(o => o.status === 'pending' || o.status === 'accepted').length} Processing</span>
          </div>
        </div>

        {/* KPI 3: Registered Stores */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs hover:shadow-2xs transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span className="uppercase tracking-wider text-[10px]">Active Outlets</span>
            <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
              <StoreIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{totalStores}</p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-bold">
            <span className="text-amber-600">{pendingStores.length} Awaiting Launch</span>
            <span>•</span>
            <span className="text-emerald-600">{stores.filter(s => s.status === 'active').length} Live</span>
          </div>
        </div>

        {/* KPI 4: Resident Users */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs hover:shadow-2xs transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span className="uppercase tracking-wider text-[10px]">Resident Directory</span>
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{users.length}</p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-bold">
            <span className="text-rose-600 font-black">{users.filter(u => u.isBanned).length} Banned IDs</span>
            <span>•</span>
            <span className="text-blue-600">{totalCustomers} Customers</span>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('analytics');
            setSelectedStoreForProducts(null);
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-rose-600 text-white shadow-sm font-black'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Analytics & Performance</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('stores');
            setSelectedStoreForProducts(null);
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'stores'
              ? 'bg-rose-600 text-white shadow-sm font-black'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <StoreIcon className="w-4 h-4" />
          <span>Store & Shopkeeper Control ({stores.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('users');
            setSelectedStoreForProducts(null);
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-rose-600 text-white shadow-sm font-black'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Residents & Ban List ({users.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('orders');
            setSelectedStoreForProducts(null);
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-rose-600 text-white shadow-sm font-black'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders Audit Log ({orders.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('marketing');
            setSelectedStoreForProducts(null);
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'marketing'
              ? 'bg-rose-600 text-white shadow-sm font-black'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Broadcasts & Coupons</span>
        </button>
      </div>

      {/* ==================== TAB 1: ANALYTICS ==================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Detailed Store Performance Cards (Detailed store-wise analytics separately) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Detailed Store-Wise Analytics</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Separate analysis of every shop's activity and inventory levels</p>
              </div>
              <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <StoreIcon className="w-3.5 h-3.5 text-slate-600" />
                <span>{stores.length} Shops Total</span>
              </div>
            </div>

            {stores.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <StoreIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold">No registered stores yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {stores.map((s) => {
                  const storeOrdersList = orders.filter((o) => o.storeId === s.id);
                  const storeSuccessfulOrders = storeOrdersList.filter((o) => o.status !== 'rejected' && o.status !== 'cancelled');
                  const storeTotalSales = storeSuccessfulOrders.reduce((sum, o) => sum + o.totalAmount, 0);
                  const storeProductsList = products.filter((p) => p.storeId === s.id);
                  const storePendingApprovalOrders = storeOrdersList.filter((o) => o.status === 'pending').length;

                  // Percentage of total platform sales
                  const shareOfSales = totalRevenue > 0 ? Math.round((storeTotalSales / totalRevenue) * 100) : 0;

                  return (
                    <div key={s.id} className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 transition-all">
                      <div>
                        {/* Store Identity */}
                        <div className="flex items-start gap-3 border-b border-slate-200/60 pb-3 mb-3">
                          <img src={s.image} alt={s.name} className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-sm text-slate-900 truncate">{s.name}</h4>
                            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{s.category}</p>
                            <span className="text-[9px] font-mono text-slate-400 block mt-0.5">ID: {s.id}</span>
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            s.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {s.status}
                          </span>
                        </div>

                        {/* Detailed Metrics */}
                        <div className="grid grid-cols-2 gap-3.5 mb-4">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total Sales</span>
                            <span className="font-black text-emerald-700 text-base">₹{storeTotalSales.toLocaleString('en-IN')}</span>
                            <span className="text-[9px] text-slate-400 block font-bold">{shareOfSales}% platform share</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total Orders</span>
                            <span className="font-black text-slate-900 text-base">{storeOrdersList.length} placed</span>
                            <span className="text-[9px] text-emerald-600 block font-bold">{storeSuccessfulOrders.length} delivered</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-bold">Catalog Size</span>
                            <span className="font-extrabold text-slate-800 text-sm">{storeProductsList.length} items</span>
                            <span className="text-[9px] text-slate-400 block font-semibold">In stock: {storeProductsList.filter(p => p.stock > 0).length}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-bold">Feedback</span>
                            <span className="font-extrabold text-slate-800 text-sm">★ {s.rating || '5.0'}</span>
                            <span className="text-[9px] text-slate-400 block font-semibold">{s.reviewsCount || 0} reviews</span>
                          </div>
                        </div>

                        {/* Visual sales share meter */}
                        <div className="mb-4">
                          <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase mb-1">
                            <span>Platform Revenue Share</span>
                            <span>{shareOfSales}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-rose-600 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${shareOfSales}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedStoreForProducts(s);
                            setActiveTab('stores');
                          }}
                          className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1"
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>Control Products</span>
                        </button>
                        <button
                          onClick={() => {
                            setSearchOrders(s.name);
                            setActiveTab('orders');
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                          title="View Orders"
                        >
                          Orders ({storeOrdersList.length})
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Platform Statistics summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              <h3 className="text-base font-black text-slate-900 tracking-tight mb-4">Payment Methods Usage</h3>
              <div className="space-y-3">
                {['cod', 'upi', 'card'].map((method) => {
                  const methodOrders = successfulOrders.filter(o => o.paymentMethod === method);
                  const methodAmount = methodOrders.reduce((sum, o) => sum + o.totalAmount, 0);
                  const share = totalRevenue > 0 ? Math.round((methodAmount / totalRevenue) * 100) : 0;
                  
                  return (
                    <div key={method} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-200/60 text-slate-700 flex items-center justify-center font-black uppercase text-xs">
                          {method}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-800 uppercase">{method === 'cod' ? 'Cash on Delivery (COD)' : method === 'upi' ? 'UPI Payments' : 'Credit/Debit Card'}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{methodOrders.length} successful orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-xs text-slate-900">₹{methodAmount.toLocaleString('en-IN')}</p>
                        <span className="text-[9px] bg-slate-200/80 text-slate-600 font-bold px-1.5 py-0.5 rounded-md">{share}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              <h3 className="text-base font-black text-slate-900 tracking-tight mb-4">Quick Governance Snapshot</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Total Registered Residents:</span>
                  <span className="font-extrabold text-slate-900">{totalCustomers} Units</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Total Registered Shopkeepers:</span>
                  <span className="font-extrabold text-slate-900">{totalStoreOwners} Owners</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Banned Resident ID Accounts:</span>
                  <span className="font-bold text-rose-600">{users.filter(u => u.isBanned).length} Banned</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Total Store Coupons Distributed:</span>
                  <span className="font-extrabold text-slate-900">{coupons.length} Active Codes</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-semibold">Pending Shop Approvals:</span>
                  <span className="font-bold text-amber-600">{pendingStores.length} Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: STORES & SHOPKEEPERS ==================== */}
      {activeTab === 'stores' && (
        <div className="space-y-6">
          {/* Subview for Store Products Management */}
          {selectedStoreForProducts ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              {/* Product Store Room Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedStoreForProducts(null)}
                    className="p-1.5 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 text-slate-500"
                    title="Back to Stores"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <img src={selectedStoreForProducts.image} alt={selectedStoreForProducts.name} className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200" />
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      Manage Products: {selectedStoreForProducts.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      Owner: {selectedStoreForProducts.ownerName} • Block: {selectedStoreForProducts.blockLocation}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={openAddProductModal}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                  <button
                    onClick={() => setSelectedStoreForProducts(null)}
                    className="px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl"
                  >
                    Back to Outlets
                  </button>
                </div>
              </div>

              {/* Products List of the Selected Store */}
              {products.filter(p => p.storeId === selectedStoreForProducts.id).length === 0 ? (
                <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold">This store has no products cataloged yet.</p>
                  <button
                    onClick={openAddProductModal}
                    className="text-xs text-rose-600 hover:underline font-bold mt-1"
                  >
                    Add the very first product now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products
                    .filter(p => p.storeId === selectedStoreForProducts.id)
                    .map((p) => (
                      <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3 hover:border-slate-300 transition-all">
                        <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200/60 shrink-0" />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="font-bold text-xs text-slate-900 truncate">{p.name}</h4>
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase shrink-0 ${p.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                {p.isAvailable ? 'In Stock' : 'Out of stock'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-semibold">{p.category} • {p.unit}</p>
                            <div className="flex items-baseline gap-1.5 mt-1">
                              <span className="text-sm font-black text-rose-600">₹{p.price}</span>
                              {p.originalPrice && (
                                <span className="text-[10px] text-slate-400 line-through">₹{p.originalPrice}</span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 font-medium">{p.description}</p>
                          </div>

                          <div className="pt-2 mt-2 border-t border-slate-200/40 flex items-center justify-between text-[11px] font-bold">
                            <span className="text-[10px] text-slate-500 font-bold">Qty: {p.stock} units</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => toggleProductStock(p.id)}
                                className={`px-2 py-1 rounded-md text-[10px] ${p.isAvailable ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                              >
                                {p.isAvailable ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => openEditProductModal(p)}
                                className="p-1 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-colors"
                                title="Edit Product"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to permanently delete "${p.name}"?`)) {
                                    deleteProduct(p.id);
                                  }
                                }}
                                className="p-1 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors"
                                title="Delete Product"
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
          ) : (
            <>
              {/* Pending Approvals Request Segment */}
              {pendingStores.length > 0 && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 shadow-3xs animate-in fade-in">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-700 stroke-[2.2]" />
                    <h3 className="font-black text-sm text-amber-900">
                      Pending Store Launch Registrations ({pendingStores.length})
                    </h3>
                  </div>
                  <p className="text-xs text-amber-800 mb-4 font-semibold">
                    New store owners have registered their outlets and require your permission before going live in Manokamna Apartments.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingStores.map((s) => (
                      <div key={s.id} className="bg-white border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-3xs">
                        <img src={s.image} alt={s.name} className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{s.name}</h4>
                          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{s.category}</p>
                          <p className="text-xs font-semibold text-slate-700 mt-1">
                            Owner: {s.ownerName} ({s.ownerPhone})
                          </p>
                          <p className="text-xs text-slate-400 font-semibold">{s.blockLocation}</p>

                          <div className="mt-3 flex items-center gap-2">
                            <button
                              onClick={() => approveStore(s.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-extrabold shadow-3xs flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve & Launch
                            </button>
                            <button
                              onClick={() => rejectStore(s.id)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-extrabold"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Registered Outlets Control Panel */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/60">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Society Outlets & Shopkeepers</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Suspend, configure, audit, or terminate store parameters</p>
                  </div>
                  
                  {/* Search box */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search store name, owner..."
                      value={searchStores}
                      onChange={(e) => setSearchStores(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold outline-none focus:bg-white focus:border-rose-600"
                    />
                  </div>
                </div>

                {filteredStores.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <StoreIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-sm">No registered shops found matching "{searchStores}"</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredStores.map((s) => (
                      <div key={s.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex items-start gap-4">
                            <img src={s.image} alt={s.name} className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="font-bold text-sm text-slate-900 truncate">{s.name}</h4>
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full capitalize tracking-wider ${
                                  s.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : s.status === 'pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {s.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-bold uppercase mt-0.5">{s.category}</p>
                              <p className="text-xs text-slate-700 font-semibold mt-1.5 flex items-center gap-1">
                                <span>Owner: {s.ownerName}</span>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-500">{s.ownerPhone}</span>
                              </p>
                              <p className="text-xs text-slate-400 font-semibold">{s.blockLocation}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 bg-white rounded-xl p-2.5 border border-slate-200/60 mt-4 text-center">
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Revenue</span>
                              <span className="font-black text-emerald-700 text-xs">₹{(s.totalSales || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Catalog</span>
                              <span className="font-black text-slate-800 text-xs">
                                {products.filter(p => p.storeId === s.id).length} items
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Delivery Time</span>
                              <span className="font-black text-slate-800 text-xs">{s.deliveryTimeMinutes} mins</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setSelectedStoreForProducts(s)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-extrabold rounded-lg shadow-3xs flex items-center gap-1"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Control Products</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setStoreBeingEdited(s);
                                setIsEditStoreOpen(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 hover:border-blue-200 border border-transparent rounded-lg transition-all"
                              title="Edit Store Settings"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {s.status === 'pending' ? (
                              <button
                                onClick={() => approveStore(s.id)}
                                className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                              >
                                Approve
                              </button>
                            ) : (
                              <button
                                onClick={() => toggleStoreStatus(s.id, s.status === 'active' ? 'suspended' : 'active')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                  s.status === 'active'
                                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                }`}
                              >
                                {s.status === 'active' ? 'Suspend' : 'Activate'}
                              </button>
                            )}

                            <button
                              onClick={() => handleTerminateStore(s.id, s.name)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 hover:border-rose-200 border border-transparent rounded-lg transition-all"
                              title="Terminate Store"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ==================== TAB 3: RESIDENTS & BAN CONTROL ==================== */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/60">
            <div>
              <h3 className="text-lg font-black text-slate-900">Residents Management & Fraud Control</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Audit customer transaction counts, inspect IDs, and execute bans</p>
            </div>

            {/* User Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Name, Customer ID, Unit..."
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold outline-none focus:bg-white focus:border-rose-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Resident ID</th>
                  <th className="p-4">Full Profile</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Society Unit / Address</th>
                  <th className="p-4 text-center">Orders Count</th>
                  <th className="p-4 text-right">Sum Spent</th>
                  <th className="p-4 text-center">Security Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const userOrdersList = orders.filter((o) => o.customerId === u.id);
                  const userSumSpent = userOrdersList
                    .filter((o) => o.status !== 'rejected' && o.status !== 'cancelled')
                    .reduce((sum, o) => sum + o.totalAmount, 0);

                  return (
                    <tr key={u.id} className={`hover:bg-slate-50/50 ${u.isBanned ? 'bg-rose-50/20' : ''}`}>
                      {/* Customer ID Column (Clearly displayed & copyable) */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold select-all" title="Resident account ID">
                            {u.id}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(u.id);
                              alert(`Resident ID copied: ${u.id}`);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded"
                            title="Copy ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Name Card */}
                      <td className="p-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <img src={u.avatar} alt={u.fullName} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                          <div>
                            <p className="font-black text-slate-900">{u.fullName}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{u.email} • {u.mobile}</p>
                          </div>
                        </div>
                      </td>

                      {/* User Role */}
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          u.role === 'admin' 
                            ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                            : u.role === 'store_owner' 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Unit No */}
                      <td className="p-4 text-slate-600 font-medium">{u.address}</td>

                      {/* Orders Quantity */}
                      <td className="p-4 text-center font-black text-slate-800">
                        {userOrdersList.length} orders
                      </td>

                      {/* Sum Spent */}
                      <td className="p-4 text-right font-black text-slate-900 text-xs">
                        ₹{userSumSpent.toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          u.isBanned 
                            ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {u.isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        {u.role !== 'admin' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => toggleBanUser(u.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all ${
                                u.isBanned
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              }`}
                            >
                              <Ban className="w-3 h-3" />
                              <span>{u.isBanned ? 'Lift Ban' : 'Ban ID'}</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold italic">System Owner</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: AUDIT ALL ORDERS ==================== */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/60">
            <div>
              <h3 className="text-lg font-black text-slate-900">Platform Orders Audit & Status Controls</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Inspect who ordered what, verify unit addresses, and override statuses</p>
            </div>

            {/* Orders Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ID, Customer, Store name..."
                value={searchOrders}
                onChange={(e) => setSearchOrders(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold outline-none focus:bg-white focus:border-rose-600"
              />
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-bold">No orders found matching "{searchOrders}"</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((o) => {
                const isExpanded = expandedOrderId === o.id;

                return (
                  <div key={o.id} className={`border rounded-2xl overflow-hidden transition-all ${
                    isExpanded 
                      ? 'border-rose-300 ring-2 ring-rose-500/10 shadow-md bg-white' 
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}>
                    {/* Collapsed Order Bar */}
                    <div
                      onClick={() => setExpandedOrderId(isExpanded ? null : o.id)}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                        <span className="font-mono font-black text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-xs">
                          {o.id}
                        </span>
                        <div className="font-semibold text-slate-500">
                          Store: <span className="font-bold text-slate-800">{o.storeName}</span>
                        </div>
                        <div className="font-semibold text-slate-500">
                          Customer: <span className="font-bold text-slate-800">{o.customerName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(o.createdAt).toLocaleDateString('en-IN')} {new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4">
                        <div className="text-right">
                          <p className="font-black text-sm text-slate-900">₹{o.totalAmount}</p>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{o.paymentMethod} • {o.paymentStatus}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            o.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : o.status === 'rejected' || o.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {o.status.replace('_', ' ')}
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable "Who Ordered What" Detailed Information Drawer */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-200 bg-white"
                        >
                          <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                            {/* Panel A: Customer & Store IDs */}
                            <div className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <div>
                                <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-1.5">Resident Details</h4>
                                <p className="font-bold text-slate-900 text-sm">{o.customerName}</p>
                                <div className="space-y-1 mt-1 text-slate-600 font-semibold">
                                  <p className="flex items-center gap-1.5">
                                    <span className="text-[10px] bg-slate-200 px-1 py-0.5 rounded font-mono font-bold">ID:</span>
                                    <span className="font-mono text-[10px] select-all font-bold">{o.customerId}</span>
                                  </p>
                                  <p>Unit: {o.deliveryAddress}</p>
                                  <p>Phone: {o.customerMobile}</p>
                                  <p>Email: {o.customerEmail}</p>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-slate-200/80">
                                <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-1">Outlet Details</h4>
                                <p className="font-bold text-slate-900">{o.storeName}</p>
                                <p className="text-slate-500 font-semibold">Store ID: <span className="font-mono text-[10px] font-bold">{o.storeId}</span></p>
                              </div>
                            </div>

                            {/* Panel B: "Who Ordered What" items table */}
                            <div className="lg:col-span-2 space-y-4">
                              <div>
                                <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-2">Ordered Catalog Items</h4>
                                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                                  {o.items.map((item, idx) => (
                                    <div key={idx} className="p-3 flex items-center justify-between gap-3 bg-slate-50/40">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <img src={item.image} alt={item.productName} className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200" />
                                        <div className="min-w-0">
                                          <p className="font-bold text-slate-800 truncate text-[12px]">{item.productName}</p>
                                          <p className="text-[10px] text-slate-400 font-semibold">Unit: {item.unit}</p>
                                        </div>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <p className="font-bold text-slate-900">₹{item.price} × {item.quantity}</p>
                                        <p className="font-black text-xs text-rose-600">₹{item.price * item.quantity}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Amount Summary */}
                              <div className="flex justify-between items-start pt-3 border-t border-slate-100">
                                <div className="space-y-1 text-slate-500 font-semibold">
                                  <p>Subtotal: <span className="font-bold text-slate-800">₹{o.subtotal}</span></p>
                                  <p>Discount Code {o.couponCode ? `(${o.couponCode})` : ''}: <span className="font-bold text-rose-600">-₹{o.discount}</span></p>
                                  <p>Delivery Service Fee: <span className="font-bold text-slate-800">₹{o.deliveryFee}</span></p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Grand Total Paid</span>
                                  <span className="text-lg font-black text-emerald-700">₹{o.totalAmount}</span>
                                </div>
                              </div>

                              {/* Status update override controls (The admin has all control to the website) */}
                              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                                <div className="flex items-center gap-1.5">
                                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                                  <span className="font-bold text-slate-700 text-[11px]">Override Order Status:</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {o.status !== 'delivered' && o.status !== 'rejected' && o.status !== 'cancelled' && (
                                    <>
                                      <button
                                        onClick={() => updateOrderStatus(o.id, 'accepted', 'Force-accepted by Society Admin')}
                                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-extrabold"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        onClick={() => updateOrderStatus(o.id, 'out_for_delivery', 'Force-runner dispatched by Admin')}
                                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-extrabold"
                                      >
                                        Dispatched
                                      </button>
                                      <button
                                        onClick={() => updateOrderStatus(o.id, 'delivered', 'Hand-delivered override by Admin')}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-extrabold"
                                      >
                                        Deliver
                                      </button>
                                    </>
                                  )}
                                  {o.status !== 'cancelled' && o.status !== 'rejected' && (
                                    <button
                                      onClick={() => updateOrderStatus(o.id, 'cancelled', 'Order cancelled by Society Admin')}
                                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[10px] font-extrabold"
                                    >
                                      Cancel Order
                                    </button>
                                  )}
                                  {o.status === 'cancelled' || o.status === 'rejected' || o.status === 'delivered' ? (
                                    <span className="text-[10px] text-slate-400 font-semibold italic">Audit locked</span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 5: BROADCASTS & MARKETING ==================== */}
      {activeTab === 'marketing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Broadcast Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-black text-base text-slate-900 mb-2 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-rose-600" /> Broadcast Society Notice
              </h3>
              <p className="text-xs text-slate-500 mb-4 font-semibold">Send a push notification notice to all society residents instantly on their top bar.</p>

              {broadcastSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl mb-4">
                  Announcement broadcasted successfully to all resident dash interfaces!
                </div>
              )}

              <form onSubmit={handleBroadcast} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notice Title *</label>
                  <input
                    type="text"
                    required
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    placeholder="e.g. Society Fest Offers Open!"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-rose-600 outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notice Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={notifMsg}
                    onChange={(e) => setNotifMsg(e.target.value)}
                    placeholder="Write message details for residents..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-rose-600 outline-none resize-none font-semibold placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all"
                >
                  Send Broadcast Notice
                </button>
              </form>
            </div>
          </div>

          {/* Coupon Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-black text-base text-slate-900 mb-2 flex items-center gap-2">
                <Tag className="w-5 h-5 text-rose-600" /> Coupon & Promo Generator
              </h3>
              <p className="text-xs text-slate-500 mb-4 font-semibold">Mint new promo codes for residents to use across any society outlet.</p>

              <form onSubmit={handleAddCouponSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Code *</label>
                    <input
                      type="text"
                      required
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="e.g. MONSOON20"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-rose-600 outline-none font-black tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Discount Type</label>
                    <select
                      value={couponType}
                      onChange={(e) => setCouponType(e.target.value as 'percentage' | 'fixed')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none font-bold"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Flat (₹)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Discount Value *</label>
                    <input
                      type="number"
                      required
                      value={couponVal}
                      onChange={(e) => setCouponVal(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-rose-600 outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Min Order (₹)</label>
                    <input
                      type="number"
                      value={couponMinOrder}
                      onChange={(e) => setCouponMinOrder(e.target.value)}
                      placeholder="e.g. 199"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-rose-600 outline-none font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Description</label>
                  <input
                    type="text"
                    required
                    value={couponDesc}
                    onChange={(e) => setCouponDesc(e.target.value)}
                    placeholder="e.g. 10% discount on order"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-rose-600 outline-none font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all"
                >
                  Create & Activate Promo Coupon
                </button>
              </form>
            </div>

            {/* Existing Coupons Listing */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-2">Existing Active Coupons</span>
              <div className="flex flex-wrap gap-2">
                {coupons.map((c) => (
                  <span 
                    key={c.id} 
                    onClick={() => toggleCoupon(c.id)}
                    className={`cursor-pointer text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border flex items-center gap-1 transition-all ${
                      c.isActive 
                        ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' 
                        : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                    }`}
                    title="Click to toggle active state"
                  >
                    <span>{c.code}</span>
                    <span className="text-[8px] font-normal font-sans italic">({c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`})</span>
                    {!c.isActive && <X className="w-2.5 h-2.5 ml-0.5" />}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL A: LAUNCH NEW STORE ==================== */}
      {isAddStoreOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-black text-base text-slate-900">Launch New Society Outlet</h3>
              <button onClick={() => setIsAddStoreOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStoreSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Name *</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Manokamna Pharmacy"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-rose-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category / Specialty Outlet *</label>
                <select
                  value={storeCategory}
                  onChange={(e) => setStoreCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-rose-600 font-bold"
                >
                  <option value="Groceries & Daily Essentials">Groceries & Daily Essentials</option>
                  <option value="Fresh Fruits & Vegetables">Fresh Fruits & Vegetables</option>
                  <option value="Bakery & Dairy Outlets">Bakery & Dairy Outlets</option>
                  <option value="Medicines & Wellness">Medicines & Wellness</option>
                  <option value="Household & Stationery">Household & Stationery</option>
                  <option value="Snacks & Beverages">Snacks & Beverages</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shopkeeper Name *</label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Dr. Vikram"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-rose-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Owner Contact Phone</label>
                  <input
                    type="text"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-rose-600 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Society Shop Location *</label>
                <input
                  type="text"
                  required
                  value={blockLocation}
                  onChange={(e) => setBlockLocation(e.target.value)}
                  placeholder="e.g. Block C, Shop #01"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-rose-600 font-semibold"
                />
              </div>

              {/* Upload image for new store icon/banner */}
              <ImageUploader
                imageUrl={storeImage}
                onImageChange={setStoreImage}
                label="Store Logo / Banner"
                placeholder="Drag & drop or click to upload store icon"
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStoreOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs"
                >
                  Approve & Launch Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL B: EDIT REGISTERED STORE SETTINGS ==================== */}
      {isEditStoreOpen && storeBeingEdited && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-black text-base text-slate-900">Configure Store: {storeBeingEdited.name}</h3>
              <button onClick={() => { setIsEditStoreOpen(false); setStoreBeingEdited(null); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditStoreSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Name *</label>
                <input
                  type="text"
                  required
                  value={storeBeingEdited.name}
                  onChange={(e) => setStoreBeingEdited({ ...storeBeingEdited, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none font-semibold focus:bg-white focus:border-rose-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shopkeeper Owner *</label>
                  <input
                    type="text"
                    required
                    value={storeBeingEdited.ownerName}
                    onChange={(e) => setStoreBeingEdited({ ...storeBeingEdited, ownerName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none font-semibold focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={storeBeingEdited.blockLocation}
                    onChange={(e) => setStoreBeingEdited({ ...storeBeingEdited, blockLocation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none font-semibold focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deliv Mins</label>
                  <input
                    type="number"
                    value={storeBeingEdited.deliveryTimeMinutes}
                    onChange={(e) => setStoreBeingEdited({ ...storeBeingEdited, deliveryTimeMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Order</label>
                  <input
                    type="number"
                    value={storeBeingEdited.minOrderAmount}
                    onChange={(e) => setStoreBeingEdited({ ...storeBeingEdited, minOrderAmount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Timings</label>
                  <input
                    type="text"
                    value={storeBeingEdited.openingTime}
                    onChange={(e) => setStoreBeingEdited({ ...storeBeingEdited, openingTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none font-bold"
                  />
                </div>
              </div>

              <ImageUploader
                imageUrl={storeBeingEdited.image}
                onImageChange={(url) => setStoreBeingEdited({ ...storeBeingEdited, image: url })}
                label="Store Logo"
                placeholder="Replace Store Logo"
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsEditStoreOpen(false); setStoreBeingEdited(null); }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-xs"
                >
                  Save Store Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL C: ADD / EDIT PRODUCT ==================== */}
      {(isAddProductOpen || isEditProductOpen) && selectedStoreForProducts && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-black text-base text-slate-900">
                {isEditProductOpen ? 'Configure Catalog Item' : 'Add Product to Shop'}
              </h3>
              <button 
                onClick={() => {
                  setIsAddProductOpen(false);
                  setIsEditProductOpen(false);
                  setProductBeingEdited(null);
                }} 
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Premium White Eggs 10pcs"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none font-semibold focus:bg-white focus:border-rose-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="80"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none font-bold focus:bg-white focus:border-rose-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Original Price / MRP (₹)</label>
                  <input
                    type="number"
                    value={prodOriginalPrice}
                    onChange={(e) => setProdOriginalPrice(e.target.value)}
                    placeholder="100"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none font-bold focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Qty *</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none font-bold focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Measuring Unit *</label>
                  <input
                    type="text"
                    required
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    placeholder="1 pack"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none font-semibold focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catalog Section</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-[11px] text-slate-900 outline-none font-bold"
                  >
                    <option value="Fresh Vegetables">Vegetables</option>
                    <option value="Fresh Fruits">Fruits</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Atta, Rice & Dals">Flours & Grains</option>
                    <option value="Masalas & Oil">Oils & Spices</option>
                    <option value="Bakery & Biscuits">Bakery & Breads</option>
                    <option value="OTC Medicines">OTC Medicines</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Chips & Crisps">Snacks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Description</label>
                <textarea
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Provide product details (e.g. freshness, packaging, brand)"
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none resize-none font-semibold focus:bg-white focus:border-rose-600"
                />
              </div>

              {/* Upload image for product */}
              <ImageUploader
                imageUrl={prodImage}
                onImageChange={setProdImage}
                label="Product Image"
                placeholder="Drag & drop or click to upload product icon"
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="prodIsAvail"
                  checked={prodIsAvailable}
                  onChange={(e) => setProdIsAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 accent-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="prodIsAvail" className="text-xs font-extrabold text-slate-700 select-none cursor-pointer">
                  Mark product as instantly available in store catalog
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddProductOpen(false);
                    setIsEditProductOpen(false);
                    setProductBeingEdited(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-xs"
                >
                  {isEditProductOpen ? 'Update Item' : 'Add Item to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
