import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { Order, OrderStatus, mockPendingOrders, mockDeliveredOrders, mockDriver, DriverProfile } from '@/services/mockData';

interface OrderContextType {
  pendingOrders: Order[];
  activeOrder: Order | null;
  deliveredOrders: Order[];
  driver: DriverProfile;
  isOnline: boolean;
  acceptOrder: (orderId: string) => void;
  declineOrder: (orderId: string) => void;
  updateOrderStatus: (status: OrderStatus) => void;
  toggleOnlineStatus: () => void;
  updateDriverRating: (rating: number) => void;
}

export const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [pendingOrders, setPendingOrders] = useState<Order[]>(mockPendingOrders);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>(mockDeliveredOrders);
  const [driver, setDriver] = useState<DriverProfile>(mockDriver);
  const [isOnline, setIsOnline] = useState(true);

  const acceptOrder = useCallback((orderId: string) => {
    const order = pendingOrders.find((o) => o.id === orderId);
    if (!order) return;
    const accepted: Order = {
      ...order,
      status: 'accepted',
      acceptedAt: new Date(),
    };
    setActiveOrder(accepted);
    setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));
  }, [pendingOrders]);

  const declineOrder = useCallback((orderId: string) => {
    setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));
  }, []);

  const updateOrderStatus = useCallback((status: OrderStatus) => {
    if (!activeOrder) return;
    if (status === 'delivered') {
      const delivered: Order = {
        ...activeOrder,
        status: 'delivered',
        deliveredAt: new Date(),
        rating: 5,
      };
      setDeliveredOrders((prev) => [delivered, ...prev]);
      setActiveOrder(null);
      setDriver((prev) => ({
        ...prev,
        totalDeliveries: prev.totalDeliveries + 1,
        totalDistance: prev.totalDistance + activeOrder.distance,
        availableBalance: prev.availableBalance + activeOrder.earnings + activeOrder.tip,
      }));
    } else if (status === 'cancelled') {
      setActiveOrder(null);
    } else {
      setActiveOrder((prev) => (prev ? { ...prev, status } : null));
    }
  }, [activeOrder]);

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
        activeOrder,
        deliveredOrders,
        driver,
        isOnline,
        acceptOrder,
        declineOrder,
        updateOrderStatus,
        toggleOnlineStatus,
        updateDriverRating,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}
