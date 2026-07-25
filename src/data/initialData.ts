import { Store, Product, User, Coupon, Banner, Order, AppNotification, Review } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin',
    fullName: 'Satyam (Society Admin)',
    email: 'satyam443355@gmail.com',
    mobile: '+91 98765 43210',
    address: 'Society Management Office, Manokamna Apartments',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-01-01T00:00:00.000Z',
    isApproved: true,
  },
];

export const INITIAL_STORES: Store[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'c_preetu',
    code: 'PREETU',
    discountType: 'percentage',
    discountValue: 100,
    minOrder: 0,
    validTill: '2028-12-31',
    isActive: true,
    description: '100% OFF on entire order',
  },
  {
    id: 'c_welcome5',
    code: 'WELCOME5',
    discountType: 'percentage',
    discountValue: 5,
    minOrder: 0,
    validTill: '2028-12-31',
    isActive: true,
    description: '5% OFF on order',
  },
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'b1',
    title: 'Manokamna Apartments Society Marketplace',
    subtitle: 'Connecting society residents with verified inside-gate shops for 20-minute doorstep deliveries.',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1200&q=80',
    tag: 'SOCIETY EXCLUSIVE',
    isActive: true,
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    userId: 'all',
    title: 'Welcome to Manokamna Apartments Society Marketplace!',
    message: 'Store owners can register their shops and add products. Residents can browse and order for 20-minute doorstep delivery.',
    timestamp: new Date().toISOString(),
    isRead: false,
    type: 'announcement',
  },
];

// Sample demo data that can be loaded on-demand if needed
export const DEMO_STORES: Store[] = [];

export const DEMO_PRODUCTS: Product[] = [];

export const INITIAL_REVIEWS: Review[] = [];
