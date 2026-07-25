import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Product, OrderStatus } from '../../types';
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
} from 'lucide-react';
import { motion } from 'motion/react';

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
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'analytics' | 'settings'>('orders');

  // New Store Registration Form state (when store doesn't exist)
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreCategory, setNewStoreCategory] = useState('Groceries & Daily Essentials');
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

  // Shopkeeper UPI ID states
  const [storeUpiId, setStoreUpiId] = useState('');
  const [upiSavedNotice, setUpiSavedNotice] = useState(false);

  // Store Timings & Offers states
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [newOffer, setNewOffer] = useState('');

  // Get Store owned by this user
  const store = stores.find((s) => s.ownerId === currentUser?.id || s.id === currentUser?.storeId);

  React.useEffect(() => {
    if (store?.upiId) {
      setStoreUpiId(store.upiId);
    }
  }, [store?.upiId]);

  const handleSaveUpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    updateStoreDetails(store.id, { upiId: storeUpiId.trim() });
    setUpiSavedNotice(true);
    setTimeout(() => setUpiSavedNotice(false), 2500);
  };

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
                <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={newStoreCategory}
                  onChange={(e) => setNewStoreCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
                >
                  <option value="Groceries & Daily Essentials">Groceries & Daily Essentials</option>
                  <option value="Fresh Vegetables & Organic Fruits">Fresh Vegetables & Fruits</option>
                  <option value="Medicines & First Aid">Medicines & Pharmacy</option>
                  <option value="Bakery, Milk & Snacks">Bakery, Dairy & Snacks</option>
                  <option value="Home Services & Hardware">Home Services & Hardware</option>
                </select>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Banner Photo Image URL</label>
              <input
                type="url"
                value={newStoreImage}
                onChange={(e) => setNewStoreImage(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
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
              Once Admin confirms and approves your store application, you will be able to enter your <strong>Shopkeeper UPI ID</strong> so residents can pay online directly to your account!
            </p>
          </div>
        </div>
      )}

      {/* Direct UPI Payment Banner when store is active */}
      {store.status === 'active' && (
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">Direct Online Payments (Shopkeeper UPI ID)</h3>
                {store.upiId ? (
                  <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ✓ Active
                  </span>
                ) : (
                  <span className="bg-amber-500/30 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ⚠️ Setup Required
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {store.upiId
                  ? 'Your store is currently configured to receive direct UPI payments at: '
                  : 'Enter your shopkeeper UPI ID (GPay / PhonePe / Paytm) so customer payments go straight to your account:'}
                {store.upiId && <strong className="text-emerald-300 font-black underline ml-1">{store.upiId}</strong>}
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveUpi} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              required
              value={storeUpiId}
              onChange={(e) => setStoreUpiId(e.target.value)}
              placeholder="e.g. shopkeeper@upi"
              className="bg-slate-800/90 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-emerald-400 w-full sm:w-48 placeholder-slate-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-all shrink-0 active:scale-95"
            >
              {upiSavedNotice ? 'Saved! ✅' : 'Save UPI ID'}
            </button>
          </form>
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

        <div className="flex items-center gap-3 w-full md:w-auto">
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
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">₹{totalStoreSales.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-emerald-700 font-medium mt-1">From resident orders</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Pending Orders</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600">{pendingOrders.length}</p>
          <p className="text-[10px] text-slate-500 mt-1">Action required</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Products</span>
            <Package className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{storeProducts.length}</p>
          <p className="text-[10px] text-slate-500 mt-1">Active items listed</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Store Rating</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">★ {store.rating || 5.0}</p>
          <p className="text-[10px] text-slate-500 mt-1">{store.reviewsCount || 1} resident reviews</p>
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
        <div className="space-y-4">
          {storeOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-sm text-slate-700">No orders placed yet</p>
              <p className="text-xs text-slate-500 mt-1">Incoming resident orders will appear here in real-time.</p>
            </div>
          ) : (
            storeOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
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
                        onClick={() => updateOrderStatus(order.id, 'accepted', 'Accepted by Store Owner')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all"
                      >
                        Accept Order ✅
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'rejected', 'Declined by Store Owner')}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs border border-rose-200 active:scale-95 transition-all"
                      >
                        Reject & Refund ❌
                      </button>
                    </div>
                  )}

                  {(order.status === 'accepted' || order.status === 'preparing') && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => updateOrderStatus(order.id, 'out_for_delivery', 'Runner heading to flat')}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all"
                      >
                        Out for Delivery 🛵
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered', 'Handed over at doorstep')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all"
                      >
                        Mark Delivered 🎉
                      </button>
                    </div>
                  )}

                  {order.status === 'out_for_delivery' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered', 'Handed over at doorstep')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all"
                    >
                      Mark Order Delivered 🎉
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

          {storeProducts.length === 0 ? (
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
                      <p className="text-[11px] text-slate-500 font-medium">{p.unit}</p>
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
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h4 className="font-extrabold text-sm text-slate-900 mb-1 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-emerald-600" />
              Direct Online Customer Payments (UPI ID)
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              When residents choose UPI / Online Payment at checkout, money is transferred directly to your shopkeeper UPI address.
            </p>
            <form onSubmit={handleSaveUpi} className="flex items-center gap-2">
              <input
                type="text"
                value={storeUpiId}
                onChange={(e) => setStoreUpiId(e.target.value)}
                placeholder="e.g. shopkeeper@upi"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-900 outline-none focus:bg-white focus:border-emerald-600"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95"
              >
                {upiSavedNotice ? 'Saved! ✅' : 'Update UPI ID'}
              </button>
            </form>
          </div>
        </div>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-600 outline-none"
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-600 outline-none"
                />
              </div>

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
