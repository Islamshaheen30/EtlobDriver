import React, { createContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import * as Location from 'expo-location';
import { Order, OrderStatus, mockPendingOrders, mockDeliveredOrders, mockDriver, mockAdminConfig, DriverProfile, AdminConfig } from '@/services/mockData';

export interface RiderLocation {
  latitude: number;
  longitude: number;
  heading?: number;
  timestamp: number;
}

interface OrderContextType {
  pendingOrders: Order[];
  activeOrders: Order[];
  /** First active order (legacy helper) */
  activeOrder: Order | null;
  deliveredOrders: Order[];
  driver: DriverProfile;
  adminConfig: AdminConfig;
  isOnline: boolean;
  riderLocation: RiderLocation | null;
  isLocationSharing: boolean;
  locationPermissionDenied: boolean;
  acceptOrder: (orderId: string) => void;
  declineOrder: (orderId: string) => void;
  updateOrderStatus: (status: OrderStatus, orderId?: string) => void;
  setOrderProofPhoto: (orderId: string, uri: string) => void;
  toggleOnlineStatus: () => void;
  updateDriverRating: (rating: number) => void;
  canAcceptOrder: () => boolean;
}

export const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [pendingOrders, setPendingOrders] = useState<Order[]>(mockPendingOrders);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>(mockDeliveredOrders);
  const [driver, setDriver] = useState<DriverProfile>(mockDriver);
  const [adminConfig] = useState<AdminConfig>(mockAdminConfig);
  const [isOnline, setIsOnline] = useState(true);
  const [riderLocation, setRiderLocation] = useState<RiderLocation | null>(null);
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  // Start/stop GPS based on whether there are active orders
  useEffect(() => {
    if (activeOrders.length > 0 && isOnline) {
      startLocationSharing();
    } else {
      stopLocationSharing();
    }
    return () => { stopLocationSharing(); };
  }, [activeOrders.length, isOnline]);

  const startLocationSharing = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationPermissionDenied(true);
        setIsLocationSharing(false);
        // Use mock location for demo
        setRiderLocation({ latitude: 30.0444, longitude: 31.2357, heading: 45, timestamp: Date.now() });
        return;
      }
      setLocationPermissionDenied(false);
      // Get initial position immediately
      const initial = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setRiderLocation({
        latitude: initial.coords.latitude,
        longitude: initial.coords.longitude,
        heading: initial.coords.heading ?? undefined,
        timestamp: initial.timestamp,
      });
      setIsLocationSharing(true);
      // Watch for updates
      locationSubscription.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
        (loc) => {
          setRiderLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            heading: loc.coords.heading ?? undefined,
            timestamp: loc.timestamp,
          });
        }
      );
    } catch {
      // Fallback to mock location on error
      setRiderLocation({ latitude: 30.0444, longitude: 31.2357, heading: 45, timestamp: Date.now() });
      setIsLocationSharing(true);
    }
  };

  const stopLocationSharing = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    setIsLocationSharing(false);
    setRiderLocation(null);
  };

  const canAcceptOrder = useCallback(() => {
    return activeOrders.length < adminConfig.max_simultaneous_orders;
  }, [activeOrders.length, adminConfig.max_simultaneous_orders]);

  const acceptOrder = useCallback((orderId: string) => {
    const order = pendingOrders.find((o) => o.id === orderId);
    if (!order) return;
    const accepted: Order = { ...order, status: 'accepted', acceptedAt: new Date() };
    setActiveOrders((prev) => [...prev, accepted]);
    setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));
  }, [pendingOrders]);

  const declineOrder = useCallback((orderId: string) => {
    setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));
  }, []);

  const updateOrderStatus = useCallback((status: OrderStatus, orderId?: string) => {
    const targetId = orderId ?? activeOrders[0]?.id;
    if (!targetId) return;

    if (status === 'delivered') {
      const order = activeOrders.find((o) => o.id === targetId);
      if (!order) return;
      const delivered: Order = { ...order, status: 'delivered', deliveredAt: new Date(), rating: 5 };
      setDeliveredOrders((prev) => [delivered, ...prev]);
      setActiveOrders((prev) => prev.filter((o) => o.id !== targetId));
      setDriver((prev) => ({
        ...prev,
        totalDeliveries: prev.totalDeliveries + 1,
        totalDistance: prev.totalDistance + order.distance,
        availableBalance: prev.availableBalance + order.earnings + order.tip,
      }));
    } else if (status === 'cancelled') {
      setActiveOrders((prev) => prev.filter((o) => o.id !== targetId));
    } else {
      setActiveOrders((prev) =>
        prev.map((o) => (o.id === targetId ? { ...o, status } : o))
      );
    }
  }, [activeOrders]);

  const setOrderProofPhoto = useCallback((orderId: string, uri: string) => {
    setActiveOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, proofPhotoUri: uri } : o))
    );
  }, []);

  const toggleOnlineStatus = useCallback(() => {
    setIsOnline((prev) => !prev);
    setDriver((prev) => ({ ...prev, isOnline: !prev.isOnline }));
  }, []);

  const updateDriverRating = useCallback((rating: number) => {
    setDriver((prev) => ({
      ...prev,
      rating: (prev.rating * prev.totalRatings + rating) / (prev.totalRatings + 1),
      totalRatings: prev.totalRatings + 1,
    }));
  }, []);

  return (
    <OrderContext.Provider
      value={{
        pendingOrders,
        activeOrders,
        activeOrder: activeOrders[0] ?? null,
        deliveredOrders,
        driver,
        adminConfig,
        isOnline,
        riderLocation,
        isLocationSharing,
        locationPermissionDenied,
        acceptOrder,
        declineOrder,
        updateOrderStatus,
        setOrderProofPhoto,
        toggleOnlineStatus,
        updateDriverRating,
        canAcceptOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}
