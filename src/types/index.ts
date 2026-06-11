export type UserRole = 'WHOLESALER' | 'RETAILER' | 'ADMIN';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'DISPUTED' | 'CANCELLED' | 'COMPLETED';
export type PaymentType = 'FULL' | 'PARTIAL';
export type RFQStatus = 'OPEN' | 'QUOTED' | 'CLOSED' | 'CANCELLED';
export type QuoteStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface User {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  role: UserRole;
  businessName: string | null;
  businessType: string | null;
  category: string | null;
  city: string | null;
  address: string | null;
  avatar: string | null;
  isVerified: boolean;
  isSuspended: boolean;
  suspensionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  priceTiers: string;
  moq: number;
  stock: number;
  images: string;
  isActive: boolean;
  wholesalerId: string;
  wholesaler?: User;
  createdAt: string;
  updatedAt: string;
}

export interface RFQ {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  deadline: string | null;
  budget: number | null;
  status: RFQStatus;
  retailerId: string;
  retailer?: User;
  quotes?: Quote[];
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  price: number;
  quantity: number;
  description: string;
  deliveryTime: string;
  status: QuoteStatus;
  rfqId: string;
  wholesalerId: string;
  wholesaler?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  depositAmount: number;
  depositPercent: number;
  lockedAmount: number;
  releasedAmount: number;
  commissionRate: number;
  commissionAmount: number;
  paymentType: PaymentType;
  notes: string | null;
  buyerId: string;
  sellerId: string;
  buyer?: User;
  seller?: User;
  items?: OrderItem[];
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  orderId: string;
}

export interface Payment {
  id: string;
  amount: number;
  type: string;
  status: PaymentStatus;
  method: string;
  transactionRef: string | null;
  userId: string;
  orderId: string;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  orderId: string | null;
  isActive: boolean;
  participants?: ChatParticipant[];
  messages?: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatParticipant {
  id: string;
  userId: string;
  chatRoomId: string;
  lastReadAt: string | null;
  user?: User;
}

export interface Message {
  id: string;
  content: string;
  isRead: boolean;
  isFlagged: boolean;
  flagReason: string | null;
  chatRoomId: string;
  senderId: string;
  receiverId: string;
  sender?: User;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  userId: string;
  createdAt: string;
}

export type AppView =
  | 'landing'
  | 'marketplace'
  | 'rfq-board'
  | 'dashboard'
  | 'orders'
  | 'chat'
  | 'profile'
  | 'admin'
  | 'product-detail'
  | 'rfq-detail'
  | 'order-detail';

export interface DashboardTab {
  id: string;
  label: string;
  icon: string;
  view: AppView;
}

export const CATEGORIES = [
  'Electronics',
  'Clothing & Textiles',
  'Food & Beverages',
  'Construction Materials',
  'Automotive Parts',
  'Home & Garden',
  'Health & Beauty',
  'Sports & Outdoors',
  'Stationery & Office',
  'Agriculture',
  'Machinery & Equipment',
  'Chemicals',
] as const;

export const PRODUCT_CATEGORIES = CATEGORIES;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  DISPUTED: 'Disputed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'text-yellow-400',
  PROCESSING: 'text-blue-400',
  SHIPPED: 'text-purple-400',
  DELIVERED: 'text-green-400',
  DISPUTED: 'text-red-400',
  CANCELLED: 'text-gray-400',
  COMPLETED: 'text-neon-cyan',
};
