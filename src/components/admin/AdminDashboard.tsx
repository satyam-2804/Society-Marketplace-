import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Store, User, Order } from '../../types';
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
} from 'lucide-react';
import { motion } from 'motion/react';

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
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<
    'analytics' | 'stores' | 'users' | 'orders' | 'marketing'
  >('stores');

  // Filter pending stores
  const pendingStores = stores.filter((s) => s.status === 'pending');

  // New store form state
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeCategory, setStoreCategory] = useState('Groceries & Daily Essentials');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [blockLocation, setBlockLocation] = useState('Block A, Shop #05');
  const [storeImage, setStoreImage] = useState('');

  // Announcement broadcast state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // New Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponVal, setCouponVal] = useState('50');

  // Total Metrics
  const totalRevenue = orders
    .filter((o) => o.status !== 'rejected' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalOrders = orders.length;
  const totalStores = stores.length;
  const totalCustomers = users.filter((u) => u.role === 'customer').length;
  const totalStoreOwners = users.filter((u) => u.role === 'store_owner').length;

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

    setIsAddStoreOpen(false);
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMsg) return;
    broadcastNotification(notifTitle, notifMsg);
    setNotifTitle('');
    setNotifMsg('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-800">
      {/* Admin Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Society Admin Control Panel</h1>
            <p className="text-xs text-slate-500 font-medium">Managing Manokamna Apartments Digital Marketplace</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsAddStoreOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Shop</span>
          </button>
        </div>
      </div>

      {/* Admin Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-emerald-700 font-medium mt-1">Platform sales volume</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalOrders}</p>
          <p className="text-[10px] text-slate-500 mt-1">Deliveries processed</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>Registered Stores</span>
            <StoreIcon className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalStores}</p>
          <p className="text-[10px] text-slate-500 mt-1">Active society outlets</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>Resident Users</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{users.length}</p>
          <p className="text-[10px] text-slate-500 mt-1">{totalCustomers} Residents, {totalStoreOwners} Owners</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'analytics' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Analytics & Overview
        </button>

        <button
          onClick={() => setActiveTab('stores')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'stores' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Registered Stores ({stores.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Society Residents & Owners ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('marketing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'marketing' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Broadcasts & Coupons
        </button>
      </div>

      {/* TAB 1: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Society Store Performance</h3>
            {stores.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No stores registered yet.</p>
            ) : (
              <div className="space-y-3">
                {stores.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={s.image} alt={s.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-slate-900">{s.name}</p>
                        <p className="text-[11px] text-slate-500">{s.blockLocation} • Owner: {s.ownerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-emerald-700">₹{(s.totalSales || 0).toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-slate-400">Total Sales</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Stores Management */}
      {activeTab === 'stores' && (
        <div className="space-y-6">
          {/* Pending Approval Requests Section */}
          {pendingStores.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
                <h3 className="font-extrabold text-sm text-amber-900">
                  Pending Store Registration Requests ({pendingStores.length})
                </h3>
              </div>
              <p className="text-xs text-amber-800 mb-4">
                Store owners have registered their outlets and require your permission before going live in Manokamna Apartments.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pendingStores.map((s) => (
                  <div key={s.id} className="bg-white border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-xs">
                    <img src={s.image} alt={s.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{s.name}</h4>
                      <p className="text-xs text-slate-500">{s.category}</p>
                      <p className="text-xs font-semibold text-slate-700 mt-1">
                        Owner: {s.ownerName} ({s.ownerPhone})
                      </p>
                      <p className="text-xs text-slate-500">{s.blockLocation}</p>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => approveStore(s.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve & Launch
                        </button>
                        <button
                          onClick={() => rejectStore(s.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold"
                        >
                          Decline Request
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500">Manage all registered society shops</p>
            <button
              onClick={() => setIsAddStoreOpen(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Store Directly
            </button>
          </div>

          {stores.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              <StoreIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-sm text-slate-700">No stores registered</p>
              <p className="text-xs text-slate-500 mt-1">When store owners register or when you add a store, it will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stores.map((s) => (
                <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-start gap-4">
                  <img src={s.image} alt={s.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{s.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        s.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{s.category}</p>
                    <p className="text-xs text-slate-700 font-medium mt-1">{s.blockLocation} • Owner: {s.ownerName}</p>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {s.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => approveStore(s.id)}
                            className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectStore(s.id)}
                            className="text-xs font-bold px-3 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleStoreStatus(s.id, s.status === 'active' ? 'suspended' : 'active')}
                          className={`text-xs font-bold px-3 py-1 rounded-lg ${s.status === 'active' ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                        >
                          {s.status === 'active' ? 'Suspend Store' : 'Activate Store'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Users */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="font-bold text-base text-slate-900 mb-4">Society Residents & Store Owners</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Address / Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <img src={u.avatar} alt={u.fullName} className="w-7 h-7 rounded-full object-cover" />
                      <span>{u.fullName}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.role === 'admin' ? 'bg-rose-100 text-rose-800' : u.role === 'store_owner' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{u.email}<br />{u.mobile}</td>
                    <td className="p-3 text-slate-600">{u.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Broadcasts & Marketing */}
      {activeTab === 'marketing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="font-bold text-base text-slate-900 mb-3 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-rose-600" /> Broadcast Society Notice
            </h3>
            <p className="text-xs text-slate-500 mb-4">Send a push notification to all society residents instantly.</p>

            {broadcastSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl mb-4">
                Announcement broadcasted successfully!
              </div>
            )}

            <form onSubmit={handleBroadcast} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g. Society Fest Offers Open!"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-rose-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notice Message</label>
                <textarea
                  required
                  rows={3}
                  value={notifMsg}
                  onChange={(e) => setNotifMsg(e.target.value)}
                  placeholder="Write message details for residents..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-rose-600 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs"
              >
                Send Broadcast to All Residents
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Store Modal */}
      {isAddStoreOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-xl">
            <h3 className="font-bold text-base text-slate-900 mb-4">Add New Society Store</h3>

            <form onSubmit={handleAddStoreSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Name *</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Manokamna Pharmacy"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Dr. Vikram"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Block Location</label>
                  <input
                    type="text"
                    value={blockLocation}
                    onChange={(e) => setBlockLocation(e.target.value)}
                    placeholder="Block C, Shop #01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddStoreOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs"
                >
                  Create Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
