import React, { createContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import * as Location from 'expo-location';
import { supabase } from '@/services/supabaseClient';
import { Order, OrderStatus, DriverProfile, AdminConfig } from '@/services/mockData';

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
  loading: boolean;
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
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const [driver, setDriver] = useState<DriverProfile>({
    id: '',
    name: 'مندوب التوصيل',
    phone: '',
    vehicleType: 'bicycle',
    isOnline: true,
    rating: 4.8,
    totalRatings: 120,
    totalDeliveries: 450,
    totalDistance: 1250,
    availableBalance: 2500,
  });
  const [adminConfig] = useState<AdminConfig>({
    max_simultaneous_orders: 3,
    commission_percentage: 15,
  });
  const [isOnline, setIsOnline] = useState(true);
  const [riderLocation, setRiderLocation] = useState<RiderLocation | null>(null);
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const channelRef = useRef<any>(null);

  // ─── Initialize driver from auth and fetch available orders ─────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        // Get current user (driver)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        // Fetch driver profile from drivers table
        const { data: driverData } = await supabase
          .from('drivers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (driverData && !cancelled) {
          setDriver(prev => ({
            ...prev,
            id: driverData.id,
            vehicleType: driverData.vehicle_type || 'bicycle',
            isOnline: driverData.is_online || false,
          }));
        }

        // Fetch available orders (status = 'preparing' AND required_vehicle_type matches driver's vehicle)
        const vehicleType = driverData?.vehicle_type || 'bicycle';
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('status', 'preparing')
          .eq('required_vehicle_type', vehicleType)
          .order('created_at', { ascending: false });

        if (ordersData && !cancelled) {
          const mappedOrders = ordersData.map((row: any) => ({
            id: row.id,
            restaurantId: row.restaurant_id,
            customerId: row.customer_id,
            status: row.status as OrderStatus,
            total: row.total_amount || 0,
            distance: 2.5, // Mock distance for now
            earnings: (row.total_amount || 0) * 0.15, // 15% commission
            tip: 0,
            items: row.items || [],
            address: row.customer_address || '',
            acceptedAt: null,
            deliveredAt: null,
            rating: 0,
            proofPhotoUri: undefined,
          }));
          setPendingOrders(mappedOrders);
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize driver:', err);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Subscribe to real-time changes for available orders ────────────────────
  useEffect(() => {
    if (!driver.id) return;

    const channel = supabase
      .channel(`available-orders-${driver.vehicleType}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `status=eq.preparing&required_vehicle_type=eq.${driver.vehicleType}`,
        },
        (payload: any) => {
          const newOrder = {
            id: payload.new.id,
            restaurantId: payload.new.restaurant_id,
            customerId: payload.new.customer_id,
            status: payload.new.status as OrderStatus,
            total: payload.new.total_amount || 0,
            distance: 2.5,
            earnings: (payload.new.total_amount || 0) * 0.15,
            tip: 0,
            items: payload.new.items || [],
            address: payload.new.customer_address || '',
            acceptedAt: null,
            deliveredAt: null,
            rating: 0,
            proofPhotoUri: undefined,
          };
          setPendingOrders(prev => [newOrder, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `status=neq.preparing&required_vehicle_type=eq.${driver.vehicleType}`,
        },
        (payload: any) => {
          // Remove from pending if status changed away from 'preparing'
          setPendingOrders(prev => prev.filter(o => o.id !== payload.new.id));
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [driver.vehicleType, driver.id]);

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

    const accepted = { ...order, status: 'accepted' as OrderStatus, acceptedAt: new Date() };
    setActiveOrders((prev) => [...prev, accepted]);
    setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));

    // Update in Supabase
    supabase
      .from('orders')
      .update({
        status: 'accepted',
        driver_id: driver.id,
      })
      .eq('id', orderId)
      .catch(err => console.error('Failed to accept order:', err));
  }, [pendingOrders, driver.id]);

  const declineOrder = useCallback((orderId: string) => {
    setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));
  }, []);

  const updateOrderStatus = useCallback((status: OrderStatus, orderId?: string) => {
    const targetId = orderId ?? activeOrders[0]?.id;
    if (!targetId) return;

    if (status === 'delivered') {
      const order = activeOrders.find((o) => o.id === targetId);
      if (!order) return;
      const delivered = { ...order, status: 'delivered' as OrderStatus, deliveredAt: new Date(), rating: 5 };
      setDeliveredOrders((prev) => [delivered, ...prev]);
      setActiveOrders((prev) => prev.filter((o) => o.id !== targetId));
      setDriver((prev) => ({
        ...prev,
        totalDeliveries: prev.totalDeliveries + 1,
        totalDistance: prev.totalDistance + order.distance,
        availableBalance: prev.availableBalance + order.earnings + order.tip,
      }));

      // Update in Supabase
      supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', targetId)
        .catch(err => console.error('Failed to update order status:', err));
    } else if (status === 'cancelled') {
      setActiveOrders((prev) => prev.filter((o) => o.id !== targetId));
    } else {
      setActiveOrders((prev) =>
        prev.map((o) => (o.id === targetId ? { ...o, status } : o))
      );

      // Update in Supabase
      supabase
        .from('orders')
        .update({ status })
        .eq('id', targetId)
        .catch(err => console.error('Failed to update order status:', err));
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

    // Update in Supabase
    supabase
      .from('drivers')
      .update({ is_online: !isOnline })
      .eq('id', driver.id)
      .catch(err => console.error('Failed to update driver status:', err));
  }, [isOnline, driver.id]);

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
        loading,
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
