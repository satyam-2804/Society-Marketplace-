import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { X, Trash2, Plus, Minus, Tag, Clock, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CartDrawer: React.FC = () => {
  const {
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    activeCoupon,
    coupons,
    getCartSubtotal,
    getCartDiscount,
    getCartDeliveryFee,
    getCartTotal,
    getCartStore,
    setIsCheckoutOpen,
  } = useMarketplace();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isCartDrawerOpen) return null;

  const store = getCartStore();
  const subtotal = getCartSubtotal();
  const discount = getCartDiscount();
  const deliveryFee = getCartDeliveryFee();
  const total = getCartTotal();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponMsg(null);
    if (!couponCode.trim()) return;

    const res = applyCoupon(couponCode);
    if (res.success) {
      setCouponMsg({ type: 'success', text: res.message });
      setCouponCode('');
    } else {
      setCouponMsg({ type: 'error', text: res.message });
    }
  };

  const handleProceedCheckout = () => {
    setIsCartDrawerOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartDrawerOpen(false)}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full sm:w-[420px] max-w-md h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between text-slate-800 overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Your Cart</h3>
                  {store && <p className="text-xs text-emerald-700 font-semibold">{store.name}</p>}
                </div>
              </div>
              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Your cart is currently empty</p>
                  <p className="text-xs text-slate-500">Explore society stores and add daily items!</p>
                </div>
              ) : (
                <>
                  {store && (() => {
                    const threshold = store.freeDeliveryThreshold !== undefined ? store.freeDeliveryThreshold : 199;
                    if (threshold > 0) {
                      const remaining = threshold - subtotal;
                      const progress = Math.min(100, Math.round((subtotal / threshold) * 100));
                      return (
                        <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl text-xs shadow-3xs">
                          {remaining > 0 ? (
                            <div>
                              <div className="flex justify-between font-bold text-emerald-900 mb-1.5">
                                <span>Add <strong className="text-emerald-700">₹{remaining}</strong> more for FREE Delivery</span>
                                <span className="text-[10px] text-emerald-700 font-extrabold">{progress}%</span>
                              </div>
                              <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-emerald-800 font-extrabold">
                              <span className="text-base">🎉</span>
                              <span>You unlocked FREE Delivery from {store.name}!</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold pb-2 border-b border-slate-100">
                    <span>{cart.length} Product(s)</span>
                    <button onClick={clearCart} className="text-rose-600 hover:underline">
                      Clear Cart
                    </button>
                  </div>

                  <div className="space-y-3">
                    {cart.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 truncate">{product.name}</h4>
                          <p className="text-[11px] text-slate-500">{product.unit}</p>
                          <p className="text-xs font-black text-emerald-700 mt-1">₹{product.price * quantity}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 text-slate-800">
                            <button
                              onClick={() => updateCartQuantity(product.id, quantity - 1)}
                              className="p-1 hover:text-rose-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(product.id, quantity + 1)}
                              className="p-1 hover:text-emerald-600"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Section */}
                  <div className="pt-4 border-t border-slate-100 space-y-2.5">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-emerald-600" /> Apply Society Coupon
                    </p>

                    {activeCoupon ? (
                      <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                        <span className="font-extrabold text-emerald-800">
                          Code '{activeCoupon.code}' Applied!
                        </span>
                        <button onClick={removeCoupon} className="text-rose-600 font-bold hover:underline">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="ENTER PROMO CODE"
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none uppercase font-mono font-bold placeholder:text-slate-400 focus:border-emerald-500"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all"
                          >
                            Apply
                          </button>
                        </div>
                      </form>
                    )}

                    {couponMsg && (
                      <p
                        className={`text-[11px] font-semibold ${
                          couponMsg.type === 'success' ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {couponMsg.text}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer Summary & Checkout Button */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3 shrink-0">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-slate-900">₹{subtotal}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Coupon Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Inside-Society Delivery Fee</span>
                    <span className="font-semibold text-slate-900">
                      {deliveryFee === 0 ? <strong className="text-emerald-700 font-bold">FREE</strong> : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                    <span>To Pay</span>
                    <span className="text-emerald-700 font-black text-base">₹{total}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Doorstep delivery guaranteed in ~20 mins</span>
                </div>

                <button
                  onClick={handleProceedCheckout}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout (₹{total})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
