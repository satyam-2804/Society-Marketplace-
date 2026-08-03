import React, { useState, useRef } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { safeLocalStorage } from '../../lib/storage';
import {
  User as UserIcon,
  ShoppingBag,
  MapPin,
  Clock,
  Phone,
  Mail,
  Edit2,
  CheckCircle2,
  Truck,
  Camera,
  Upload,
  Sparkles,
  ShieldCheck,
  Building2,
  ArrowRight,
  Bell,
  Smartphone,
  Check,
  RotateCcw,
} from 'lucide-react';

interface CustomerDashboardProps {
  activeTab?: 'profile' | 'orders';
  onSwitchTab?: (tab: 'profile' | 'orders') => void;
  onGoHome?: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  activeTab = 'profile',
  onSwitchTab,
  onGoHome,
}) => {
  const {
    currentUser,
    orders,
    updateUserProfile,
    setActiveOrderTrackId,
    openAuthModal,
    quickReorder,
  } = useMarketplace();

  const [internalTab, setInternalTab] = useState<'profile' | 'orders'>(activeTab);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState(currentUser?.address || '');
  const [newMobile, setNewMobile] = useState(currentUser?.mobile || '');
  const [newName, setNewName] = useState(currentUser?.fullName || '');
  const [avatarSuccessMsg, setAvatarSuccessMsg] = useState<string | null>(null);
  const [reorderNotice, setReorderNotice] = useState<string | null>(null);

  const [isPushEnabled, setIsPushEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = safeLocalStorage.getItem('push_notifications_enabled');
    if (stored !== null) return stored === 'true';
    return 'Notification' in window && Notification.permission === 'granted';
  });

  const handleTogglePush = async (enable: boolean) => {
    if (enable) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          const res = await Notification.requestPermission();
          if (res === 'granted') {
            setIsPushEnabled(true);
            safeLocalStorage.setItem('push_notifications_enabled', 'true');
            new Notification("🎉 Push Notifications Enabled!", {
              body: "You will now receive instant live order status alerts on your screen!",
            });
          } else {
            alert("Notification permission was denied. Please allow notifications in site settings.");
            setIsPushEnabled(false);
            safeLocalStorage.setItem('push_notifications_enabled', 'false');
          }
        } else if (Notification.permission === 'granted') {
          setIsPushEnabled(true);
          safeLocalStorage.setItem('push_notifications_enabled', 'true');
          new Notification("🎉 Push Notifications Active!", {
            body: "Order update push notifications are enabled.",
          });
        } else {
          alert("Notification permission is blocked by browser settings. Please enable notifications for this site in your address bar.");
          setIsPushEnabled(false);
          safeLocalStorage.setItem('push_notifications_enabled', 'false');
        }
      } else {
        alert("Push notifications are not supported in your browser.");
      }
    } else {
      setIsPushEnabled(false);
      safeLocalStorage.setItem('push_notifications_enabled', 'false');
    }
  };

  // Sync internalTab when prop activeTab changes
  React.useEffect(() => {
    setInternalTab(activeTab);
  }, [activeTab]);

  const handleTabChange = (tab: 'profile' | 'orders') => {
    setInternalTab(tab);
    if (onSwitchTab) {
      onSwitchTab(tab);
    }
  };

  if (!currentUser) {
    return (
      <div className="py-16 text-center space-y-4 bg-white border border-slate-200 rounded-3xl p-8 max-w-md mx-auto my-8 shadow-xs">
        <UserIcon className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Resident Account Required</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Please log in or sign up as a society resident to view your order history and update your profile details.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const userOrders = orders.filter((o) => o.customerId === currentUser.id);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      fullName: newName.trim() || currentUser.fullName,
      address: newAddress.trim() || currentUser.address,
      mobile: newMobile.trim() || currentUser.mobile,
    });
    setIsEditingAddress(false);
    setAvatarSuccessMsg('Profile details updated successfully! ✅');
    setTimeout(() => setAvatarSuccessMsg(null), 3000);
  };

  // Handle uploading photo from gallery
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Selected photo is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateUserProfile({ avatar: dataUrl });
        setAvatarSuccessMsg('Profile photo updated from gallery! 📸✨');
        setTimeout(() => setAvatarSuccessMsg(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const currentTab = onSwitchTab ? activeTab : internalTab;

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Section Nav Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabChange('profile')}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${
              currentTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => handleTabChange('orders')}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${
              currentTab === 'orders'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>My Orders ({userOrders.length})</span>
          </button>
        </div>

        {avatarSuccessMsg && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 animate-pulse hidden sm:inline-block">
            {avatarSuccessMsg}
          </span>
        )}
      </div>

      {avatarSuccessMsg && (
        <div className="sm:hidden text-xs font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-center">
          {avatarSuccessMsg}
        </div>
      )}

      {/* Hidden File Input for Device Gallery Photo Selection */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFileChange}
      />

      {/* ==================== TAB 1: PROFILE VIEW ==================== */}
      {currentTab === 'profile' && (
        <div className="space-y-6">
          {/* Main Resident Profile Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {/* Avatar with Camera Icon Overlay */}
                <div
                  className="relative group cursor-pointer shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to change profile picture from gallery"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.fullName}
                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-500/30 shadow-md group-hover:opacity-90 transition-all"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl shadow-md border-2 border-white transition-transform active:scale-95 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-black text-slate-900">{currentUser.fullName}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
                      Society Resident
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-emerald-600" /> {currentUser.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" /> {currentUser.mobile}
                    </span>
                  </p>
                  <p className="text-xs text-slate-700 font-bold mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Flat/Tower: {currentUser.address}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 sm:flex-none px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Change Profile Pic</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Address & Profile Details Edit Form */}
            {isEditingAddress && (
              <form onSubmit={handleSaveProfile} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit2 className="w-4 h-4 text-emerald-600" /> Update Resident Contact & Address
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-600 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile Number</label>
                    <input
                      type="text"
                      required
                      value={newMobile}
                      onChange={(e) => setNewMobile(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-600 font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Flat / Tower Address (Manokamna Apartments)</label>
                  <input
                    type="text"
                    required
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-600 font-semibold"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all active:scale-95">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="px-3 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* In-App Push Notification Opt-in Settings Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-emerald-600 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    Enable Order Updates Push Notifications
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-xl leading-relaxed">
                    Receive instant Blinkit-style delivery push notifications on your phone or desktop when shopkeepers accept, prepare, and deliver your order!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
                  isPushEnabled
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {isPushEnabled ? 'Push Active ✓' : 'Push Off'}
                </span>

                <button
                  onClick={() => handleTogglePush(!isPushEnabled)}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isPushEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={isPushEnabled}
                  title="Toggle Order Updates Push Notifications"
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isPushEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {isPushEnabled && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
                <span className="text-slate-500 text-[11px]">
                  Browser Status: <strong className="text-emerald-700 capitalize font-bold">{typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'Not supported'}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                      new Notification("🔔 Test Order Push Alert", {
                        body: "Your order update push notification system is working perfectly!",
                        icon: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80",
                      });
                    } else {
                      handleTogglePush(true);
                    }
                  }}
                  className="text-emerald-700 hover:text-emerald-800 font-extrabold text-[11px] underline flex items-center gap-1 cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Send Test Notification</span>
                </button>
              </div>
            )}
          </div>



          {/* Additional Account Information Banner */}
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-3xl p-6 shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-sm text-white">Manokamna Apartments Verified Resident</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              As a registered resident, your orders are priority dispatched directly from inside society gate shops. You receive 20-minute delivery straight to Tower / Flat: <strong className="text-emerald-300 underline">{currentUser.address}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: ORDERS VIEW ==================== */}
      {currentTab === 'orders' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" /> My Society Order History ({userOrders.length})
            </h3>
          </div>

          {reorderNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between animate-fade-in shadow-2xs">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {reorderNotice}
              </span>
              <button
                type="button"
                onClick={() => setReorderNotice(null)}
                className="text-emerald-700 hover:text-emerald-950 font-black text-xs px-2 py-0.5 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {userOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-4">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <div>
                <p className="font-black text-base text-slate-800 uppercase tracking-wide">no orders placed by you</p>
                <p className="text-xs text-slate-500 mt-1">Explore our society marketplace outlets to place your first order!</p>
              </div>
              <button
                type="button"
                onClick={onGoHome}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 inline-flex items-center gap-1.5 uppercase tracking-wider"
              >
                <span>continue shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {userOrders.map((o) => (
                <div key={o.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-200 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-xs text-slate-900">#{o.id}</span>
                      <span className="text-xs font-extrabold text-emerald-800">• {o.storeName}</span>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full capitalize border border-emerald-200">
                        {o.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      {new Date(o.createdAt).toLocaleDateString()} at {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {o.items.length} item(s)
                    </p>
                    <div className="text-[11px] text-slate-600 mt-1.5 flex flex-wrap gap-1">
                      {o.items.map((item, idx) => (
                        <span key={idx} className="bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-[10px]">
                          {item.productName || (item as any).product?.name} ({item.quantity}x)
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto flex-wrap">
                    <span className="font-black text-slate-900 text-base mr-1">₹{o.totalAmount}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const res = quickReorder(o);
                        if (res.success) {
                          setReorderNotice(res.message);
                          setTimeout(() => setReorderNotice(null), 5000);
                        }
                      }}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                      title="Reorder all items from this order into your cart"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Quick Reorder
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveOrderTrackId(o.id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <Truck className="w-3.5 h-3.5" /> Track Runner
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

