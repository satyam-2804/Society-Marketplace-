import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Star, MessageSquare, Send, User, Calendar, Sparkles, Filter, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Review } from '../types';

interface StoreReviewsProps {
  storeId: string;
}

export const StoreReviews: React.FC<StoreReviewsProps> = ({ storeId }) => {
  const {
    reviews,
    addReview,
    currentUser,
    products,
    stores,
    openAuthModal,
  } = useMarketplace();

  // Find current store and its products
  const store = stores.find((s) => s.id === storeId);
  const storeProducts = products.filter((p) => p.storeId === storeId);

  // Filter reviews for this store and its products
  const productIds = storeProducts.map((p) => p.id);
  const relevantReviews = reviews.filter(
    (r) => r.storeId === storeId || (r.productId && productIds.includes(r.productId))
  );

  // States
  const [filterType, setFilterType] = useState<'all' | 'store' | 'products'>('all');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  const [targetType, setTargetType] = useState<'store' | 'product'>('store');
  const [selectedProductId, setSelectedProductId] = useState<string>(
    storeProducts[0]?.id || ''
  );
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!store) {
    return <div className="p-6 text-center text-slate-500">Store not found</div>;
  }

  // Calculate rating stats
  const totalCount = relevantReviews.length;
  const averageRating = totalCount > 0
    ? (relevantReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1)
    : '5.0';

  // Count stars breakdown
  const starsBreakdown = [5, 4, 3, 2, 1].map((starNum) => {
    const count = relevantReviews.filter((r) => r.rating === starNum).length;
    const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return { starNum, count, percentage };
  });

  // Filtered list
  const filteredReviews = relevantReviews.filter((r) => {
    if (filterType === 'store') return r.storeId === storeId && !r.productId;
    if (filterType === 'products') return !!r.productId;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal('login');
      return;
    }

    if (!comment.trim()) {
      alert('Please write a review comment.');
      return;
    }

    const reviewData = {
      userId: currentUser.id,
      userName: currentUser.fullName,
      rating,
      comment: comment.trim(),
      ...(targetType === 'store'
        ? { storeId }
        : { productId: selectedProductId }),
    };

    addReview(reviewData);
    setComment('');
    setRating(5);
    setSuccessMsg('Thank you! Your feedback has been verified and posted! 🎉');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        {/* Rating Score */}
        <div className="flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest mb-1">
            Overall Resident Score
          </span>
          <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {averageRating}
          </span>
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-5 h-5 ${
                  s <= Math.round(Number(averageRating))
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Based on {totalCount} reviews inside society
          </span>
        </div>

        {/* Stars Breakdown Progress Bars */}
        <div className="md:col-span-2 flex flex-col justify-center space-y-2">
          {starsBreakdown.map((b) => (
            <div key={b.starNum} className="flex items-center gap-3 text-xs">
              <span className="font-extrabold text-slate-700 w-3 text-right">{b.starNum}</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${b.percentage}%` }}
                  className="h-full bg-amber-400 rounded-full"
                />
              </div>
              <span className="font-semibold text-slate-500 w-10 text-right">
                {b.percentage}%
              </span>
              <span className="text-slate-400 w-8 text-left">({b.count})</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Write a Review Block */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
              Share Your Experience
            </h3>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-semibold rounded-xl text-center leading-relaxed">
              {successMsg}
            </div>
          )}

          {!currentUser ? (
            <div className="text-center p-6 space-y-3 bg-slate-50 rounded-2xl border border-slate-100">
              <User className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                Only registered residents can rate and review to ensure genuine inside-society trust.
              </p>
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-xs"
              >
                Sign In to Rate
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                  What are you reviewing?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetType('store')}
                    className={`py-1.5 px-3 rounded-xl border text-[11px] font-extrabold transition-all text-center ${
                      targetType === 'store'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Entire Shop
                  </button>
                  <button
                    type="button"
                    disabled={storeProducts.length === 0}
                    onClick={() => setTargetType('product')}
                    className={`py-1.5 px-3 rounded-xl border text-[11px] font-extrabold transition-all text-center disabled:opacity-50 ${
                      targetType === 'product'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    A Specific Product
                  </button>
                </div>
              </div>

              {/* Product drop down if product selected */}
              {targetType === 'product' && storeProducts.length > 0 && (
                <div>
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                    Select Product
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600"
                  >
                    {storeProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.unit})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Star Rating picker */}
              <div>
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                  Your Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 rounded-lg hover:bg-slate-50 transition-all active:scale-90 shrink-0"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= (hoverRating ?? rating)
                            ? 'fill-amber-400 text-amber-400 scale-105'
                            : 'text-slate-200'
                        } transition-transform`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-black text-slate-600 ml-2">
                    {rating === 5 ? 'Excellent! 🌟' : rating === 4 ? 'Very Good! 👍' : rating === 3 ? 'Good! Ok' : rating === 2 ? 'Needs Improvement' : 'Disappointed'}
                  </span>
                </div>
              </div>

              {/* Comment text area */}
              <div>
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                  Write Your Review
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    targetType === 'store'
                      ? 'Help other society residents by sharing details about delivery speed, shopkeeper behavior, or fresh stock...'
                      : 'How is the quality, packaging, and freshness of this specific product?'
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium outline-none placeholder:text-slate-400 focus:bg-white focus:border-emerald-600"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Verified Review</span>
              </button>
            </form>
          )}
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header Filter row */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-4 flex-wrap text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5 font-black text-slate-800">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Filter Reviews</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  filterType === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('store')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  filterType === 'store'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Shop Feedback
              </button>
              <button
                type="button"
                onClick={() => setFilterType('products')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  filterType === 'products'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Product Reviews
              </button>
            </div>
          </div>

          {/* List display */}
          {filteredReviews.length === 0 ? (
            <div className="py-12 bg-white border border-slate-200 rounded-3xl text-center text-slate-500 shadow-2xs p-6 space-y-3">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
              <div>
                <p className="font-extrabold text-sm text-slate-800">No matching reviews yet</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Be the first resident to write a verified review!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReviews.map((r) => {
                const isProductReview = !!r.productId;
                const reviewedProduct = isProductReview
                  ? products.find((p) => p.id === r.productId)
                  : null;

                return (
                  <div
                    key={r.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2.5 transition-colors hover:border-emerald-100"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <span>{r.userName}</span>
                            <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5 shrink-0">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Verified Resident
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>
                              {new Date(r.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 shrink-0 bg-slate-50 border border-slate-100 px-2 py-1 rounded-xl">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                        <span className="text-xs font-black text-slate-800">{r.rating}</span>
                      </div>
                    </div>

                    {/* Tag for Product Review if applicable */}
                    {isProductReview && reviewedProduct && (
                      <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-[10px] font-bold text-slate-700">
                        <ShoppingBag className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Product Reviewed: </span>
                        <strong className="text-slate-950 font-black">{reviewedProduct.name}</strong>
                        <span className="text-slate-400">({reviewedProduct.unit})</span>
                      </div>
                    )}

                    {/* Review text */}
                    <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                      "{r.comment}"
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
