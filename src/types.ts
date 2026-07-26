export type UserRole = 'customer' | 'store_owner' | 'admin' | 'guest';

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  address: string;
  role: UserRole;
  storeId?: string; // If store owner
  avatar?: string;
  createdAt: string;
  isApproved?: boolean; // For store owners or users
  isBanned?: boolean; // Banned state for customers/users
  fcmToken?: string; // FCM Cloud Messaging registration token
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  unit: string; // e.g. "1 kg", "500 ml", "1 pack", "10 tablets"
  description: string;
  image: string;
  isAvailable: boolean;
  rating: number;
  reviewsCount: number;
}

export interface Store {
  id: string;
  name: string;
  category: string;
  categories?: string[];
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  blockLocation: string; // e.g. "Block A, Shop #02"
  image: string;
  bannerImage?: string;
  rating: number;
  reviewsCount: number;
  isOpen: boolean;
  openingTime: string; // "07:00 AM"
  closingTime: string; // "10:00 PM"
  status: 'active' | 'suspended' | 'pending';
  deliveryTimeMinutes: number; // e.g., 15-20 mins
  minOrderAmount: number;
  deliveryFee?: number; // Custom delivery fee set by store owner
  upiId?: string; // Shopkeeper UPI ID for direct online payments (e.g. shopkeeper@upi)
  totalSales?: number;
  offers?: string[];
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered' | 'rejected' | 'cancelled';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  deliveryAddress: string;
  storeId: string;
  storeName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'upi' | 'card';
  paymentStatus: 'pending' | 'paid';
  status: OrderStatus;
  couponCode?: string;
  notes?: string;
  createdAt: string;
  estimatedDeliveryTime: string; // ISO String or text e.g. "20 mins"
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  validTill: string;
  isActive: boolean;
  description: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  tag: string;
  targetCategory?: string;
  storeId?: string;
  isActive: boolean;
}

export interface AppNotification {
  id: string;
  userId: string; // 'all' or specific user
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'order' | 'promo' | 'announcement';
}

export interface Review {
  id: string;
  storeId?: string;
  productId?: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalStores: number;
  todaySales: number;
  monthlySales: number;
}
