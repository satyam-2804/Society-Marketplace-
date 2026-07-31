import React, { useState } from 'react';
import { Product, Store } from '../types';
import { useMarketplace } from '../context/MarketplaceContext';
import { Plus, Minus } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  store?: Store;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, store }) => {
  const { cart, addToCart, updateCartQuantity, clearCart, stores } = useMarketplace();
  const [addedNotice, setAddedNotice] = useState(false);

  const productStore = store || stores.find((s) => s.id === product.storeId);
  const cartItem = cart.find((i) => i.product.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleAdd = () => {
    const res = addToCart(product, 1);
    if (!res.success) {
      if (res.message.includes('Your cart contains items from')) {
        if (window.confirm(`${res.message}\n\nWould you like to clear your current cart and start an order from this shop?`)) {
          clearCart();
          addToCart(product, 1);
          setAddedNotice(true);
          setTimeout(() => setAddedNotice(false), 1500);
        }
      } else {
        alert(res.message);
      }
    } else {
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 1500);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 transition-all overflow-hidden flex flex-col justify-between shadow-xs"
    >
      {/* Discount Badge */}
      {discountPercent && (
        <div className="absolute top-3 left-3 z-10 bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-xs">
          {discountPercent}% OFF
        </div>
      )}

      {/* Image & Stock Overlay */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-50 flex items-center justify-center p-2">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500 ${
            !product.isAvailable || product.stock === 0 ? 'grayscale opacity-50' : ''
          }`}
        />

        {/* Stock Status Badge */}
        {(!product.isAvailable || product.stock === 0) && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1 rounded-full bg-white text-rose-700 font-extrabold text-xs shadow-md">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Store Tag */}
          {productStore && (
            <p className="text-[10px] text-emerald-700 font-bold tracking-wide uppercase truncate mb-1">
              {productStore.name} ({productStore.blockLocation})
            </p>
          )}

          <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
            {product.name}
          </h4>

          <p className="text-[11px] text-slate-500 font-medium">{product.unit}</p>

          <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Stock Indicator */}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="flex items-center justify-end text-xs pt-1">
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              Only {product.stock} left
            </span>
          </div>
        )}

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              {product.originalPrice && product.originalPrice > product.price ? (
                <>
                  <span className="text-xs text-slate-400 line-through font-medium">
                    ₹{product.originalPrice}
                  </span>
                  <span className="text-base sm:text-lg font-black text-emerald-600">
                    ₹{product.price}
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    ({discountPercent}% OFF)
                  </span>
                </>
              ) : (
                <span className="text-base sm:text-lg font-black text-slate-900">₹{product.price}</span>
              )}
            </div>
          </div>

          {/* Add or Quantity Controls */}
          {quantityInCart > 0 ? (
            <div className="flex items-center gap-1.5 bg-emerald-600 text-white font-bold px-1.5 py-1 rounded-xl shadow-xs">
              <button
                onClick={() => updateCartQuantity(product.id, quantityInCart - 1)}
                className="p-1 rounded-lg hover:bg-emerald-700 text-white transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black min-w-[18px] text-center">{quantityInCart}</span>
              <button
                onClick={() => updateCartQuantity(product.id, quantityInCart + 1)}
                className="p-1 rounded-lg hover:bg-emerald-700 text-white transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              disabled={!product.isAvailable || product.stock === 0}
              onClick={handleAdd}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                !product.isAvailable || product.stock === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-600 hover:text-white active:scale-95 shadow-xs'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{addedNotice ? 'Added!' : 'ADD'}</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
