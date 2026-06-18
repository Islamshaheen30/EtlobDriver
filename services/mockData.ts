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
  rating: 4.8,
  totalRatings: 234,
  totalDeliveries: 1247,
  totalDistance: 3892,
  joinedDate: new Date('2023-06-15'),
  isOnline: true,
  streakDays: 7,
  vehicleType: 'bicycle',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  availableBalance: 380,
  pendingBalance: 145,
};

export const mockPendingOrders: Order[] = [
  {
    id: 'ord-001',
    orderNumber: '48291',
    customerName: 'Sara Mohamed',
    customerPhone: '+20 111 234 5678',
    restaurantName: 'Koshary El Tahrir',
    restaurantAddress: '12 Tahrir Square, Cairo',
    restaurantLat: 30.0444,
    restaurantLng: 31.2357,
    deliveryAddress: '45 Zamalek St, Cairo',
    deliveryLat: 30.065,
    deliveryLng: 31.219,
    items: 3,
    distance: 2.4,
    estimatedTime: 18,
    earnings: 22,
    tip: 5,
    paymentMethod: 'cod',
    status: 'pending',
    createdAt: new Date(),
  },
  {
    id: 'ord-002',
    orderNumber: '48295',
    customerName: 'Karim Ali',
    customerPhone: '+20 100 987 6543',
    restaurantName: 'Pizza Roma',
    restaurantAddress: '8 Mohandessin, Giza',
    restaurantLat: 30.059,
    restaurantLng: 31.2,
    deliveryAddress: '23 Agouza Bridge, Giza',
    deliveryLat: 30.063,
    deliveryLng: 31.208,
    items: 2,
    distance: 1.8,
    estimatedTime: 14,
    earnings: 18,
    tip: 0,
    paymentMethod: 'online',
    status: 'pending',
    createdAt: new Date(),
  },
  {
    id: 'ord-003',
    orderNumber: '48302',
    customerName: 'Nour Khaled',
    customerPhone: '+20 122 345 6789',
    restaurantName: 'Falafel El Malak',
    restaurantAddress: '5 Dokki St, Giza',
    restaurantLat: 30.037,
    restaurantLng: 31.212,
    deliveryAddress: '17 Morad St, Giza',
    deliveryLat: 30.031,
    deliveryLng: 31.218,
    items: 4,
    distance: 3.1,
    estimatedTime: 22,
    earnings: 28,
    tip: 8,
    paymentMethod: 'cod',
    status: 'pending',
    createdAt: new Date(),
  },
];

export const mockEarningsHistory: EarningRecord[] = [
  {
    id: 'e-1',
    date: new Date(),
    orders: 8,
    basePay: 144,
    tips: 35,
    bonus: 20,
    total: 199,
    distance: 28.4,
  },
  {
    id: 'e-2',
    date: new Date(Date.now() - 86400000),
    orders: 6,
    basePay: 108,
    tips: 20,
    bonus: 0,
    total: 128,
    distance: 21.2,
  },
  {
    id: 'e-3',
    date: new Date(Date.now() - 172800000),
    orders: 10,
    basePay: 180,
    tips: 55,
    bonus: 30,
    total: 265,
    distance: 35.6,
  },
  {
    id: 'e-4',
    date: new Date(Date.now() - 259200000),
    orders: 5,
    basePay: 90,
    tips: 15,
    bonus: 0,
    total: 105,
    distance: 18.1,
  },
  {
    id: 'e-5',
    date: new Date(Date.now() - 345600000),
    orders: 9,
    basePay: 162,
    tips: 40,
    bonus: 20,
    total: 222,
    distance: 31.8,
  },
  {
    id: 'e-6',
    date: new Date(Date.now() - 432000000),
    orders: 7,
    basePay: 126,
    tips: 30,
    bonus: 0,
    total: 156,
    distance: 24.5,
  },
  {
    id: 'e-7',
    date: new Date(Date.now() - 518400000),
    orders: 11,
    basePay: 198,
    tips: 60,
    bonus: 50,
    total: 308,
    distance: 38.9,
  },
];

export const mockDeliveredOrders: Order[] = [
  {
    id: 'del-001',
    orderNumber: '48180',
    customerName: 'Laila Fathy',
    customerPhone: '+20 100 111 2222',
    restaurantName: 'Burger House',
    restaurantAddress: '3 Nasr City, Cairo',
    restaurantLat: 30.065,
    restaurantLng: 31.34,
    deliveryAddress: '88 Abbas El Akkad, Cairo',
    deliveryLat: 30.071,
    deliveryLng: 31.351,
    items: 2,
    distance: 2.1,
    estimatedTime: 16,
    earnings: 20,
    tip: 10,
    paymentMethod: 'online',
    status: 'delivered',
    createdAt: new Date(Date.now() - 7200000),
    deliveredAt: new Date(Date.now() - 6000000),
    rating: 5,
  },
  {
    id: 'del-002',
    orderNumber: '48175',
    customerName: 'Omar Sherif',
    customerPhone: '+20 111 333 4444',
    restaurantName: 'Shawarma Palace',
    restaurantAddress: '10 Heliopolis, Cairo',
    restaurantLat: 30.088,
    restaurantLng: 31.322,
    deliveryAddress: '22 Merghany St, Cairo',
    deliveryLat: 30.082,
    deliveryLng: 31.328,
    items: 3,
    distance: 1.5,
    estimatedTime: 12,
    earnings: 16,
    tip: 5,
    paymentMethod: 'cod',
    status: 'delivered',
    createdAt: new Date(Date.now() - 10800000),
    deliveredAt: new Date(Date.now() - 9600000),
    rating: 4,
  },
];
