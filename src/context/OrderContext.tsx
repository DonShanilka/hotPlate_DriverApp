import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";

import { fetchDriverOrders, updateOrderStatus } from "../redux/features/order/orderThunk";
import { useAppDispatch, useAppSelector } from "../redux/store/hooks";
import type { Order, OrderStatus } from "../types/order.types";
import { useAuth } from "./AuthContext";
import { useDriver } from "./DriverContext";

/** How often (ms) the order list auto-refreshes. */
const POLL_INTERVAL_MS = 30_000;

interface OrderContextValue {
  orders: Order[];
  activeOrder: Order | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
  refreshOrders: () => Promise<void>;
  changeStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export function OrderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { profile } = useDriver();
  const ordersState = useAppSelector((state) => state.orders);

  // The backend route GET /orders/driver/:userId expects the *user* _id,
  // not the driver document _id. It resolves the driver profile internally.
  const userId = user?._id ?? null;

  // We only fetch when the driver profile is loaded AND it belongs to this user.
  const isLinked = Boolean(
    userId && profile?._id,
  );

  const refreshOrders = useCallback(async () => {
    // The backend uses Driver.findOne({ userId }), so it expects the User ID!
    if (!userId || !isLinked) return;
    
    try {
      console.log("Fetching orders for User ID:", userId);
      const res = await dispatch(fetchDriverOrders(userId)).unwrap();
      console.log("Orders fetched successfully! Count:", res.length);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  }, [dispatch, userId, isLinked]);

  const changeStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      await dispatch(updateOrderStatus({ orderId, status })).unwrap();
    },
    [dispatch],
  );

  // Initial fetch when the user / driver profile become available
  useEffect(() => {
    if (!userId || !isLinked) return;
    const timer = setTimeout(() => {
      void refreshOrders().catch(() => undefined);
    }, 0);
    return () => clearTimeout(timer);
  }, [userId, isLinked, refreshOrders]);

  // Auto-refresh every 30 seconds so the driver sees new assignments
  const refreshRef = useRef(refreshOrders);
  refreshRef.current = refreshOrders;

  useEffect(() => {
    if (!userId || !isLinked) return;
    const interval = setInterval(() => {
      void refreshRef.current().catch(() => undefined);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [userId, isLinked]);

  return (
    <OrderContext.Provider
      value={{
        orders: ordersState.orders,
        activeOrder: ordersState.activeOrder,
        loading: ordersState.loading,
        updating: ordersState.updating,
        error: ordersState.error,
        refreshOrders,
        changeStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}


export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrder must be used inside OrderProvider");
  return context;
}