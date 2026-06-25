export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'heading_to_pickup'
  | 'arrived_pickup'
  | 'picked_up'
  | 'delivering'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'online';

export interface AdminConfig {
  max_simultaneous_orders: number;
  proof_photo_required: boolean;
}

export const mockAdminConfig: AdminConfig = {
  max_simultaneous_orders: 2,
  proof_photo_required: true,
};

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantLat: number;
  restaurantLng: number;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  items: number;
  distance: number;
  estimatedTime: number;
  earnings: number;
  tip: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: Date;
  acceptedAt?: Date;
  deliveredAt?: Date;
  rating?: number;
  proofPhotoUri?: string;
}

export interface EarningRecord {
  id: string;
  date: Date;
  orders: number;
  basePay: number;
  tips: number;
  bonus: number;
  total: number;
  distance: number;
}

export interface DriverProfile {
  id: string;
  name: string;
  nameAr: string;
  phone: string;
  rating: number;
  totalRatings: number;
  totalDeliveries: number;
  totalDistance: number;
  joinedDate: Date;
  isOnline: boolean;
  streakDays: number;
  vehicleType: string;
  avatarUrl: string;
  availableBalance: number;
  pendingBalance: number;
}

export const mockDriver: DriverProfile = {
  id: 'driver-001',
  name: 'Ahmed Hassan',
  nameAr: 'أحمد حسن',
  phone: '+20 100 123 4567',
  rating: 0,
  totalRatings: 0,
  totalDeliveries: 0,
  totalDistance: 0,
  joinedDate: new Date(),
  isOnline: false,
  streakDays: 0,
  vehicleType: 'motorcycle',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  availableBalance: 0,
  pendingBalance: 0,
};

export const mockPendingOrders: Order[] = [];
export const mockEarningsHistory: EarningRecord[] = [];
export const mockDeliveredOrders: Order[] = [];
