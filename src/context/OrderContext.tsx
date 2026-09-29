import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
} from "react";

import { loadArrivedOrders } from "../redux/features/order/orderThunk";
import { useAppDispatch, useAppSelector } from "../redux/store/hooks";
import type { DriverOrder } from "../types/order.types";
import { useAuth } from "./AuthContext";
import { useDriver } from "./DriverContext";

interface OrderContextValue {
  arrivedOrders: DriverOrder[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => void;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { profile } = useDriver();
  const { user } = useAuth();
  console.log("Users", user)
  const ordersState = useAppSelector((state) => state.orders);
  console.log('Order Status', ordersState)
  const driverId =
    profile?._id && profile.userId === user?._id ? profile._id : null;

  const refresh = useCallback(() => {
    if (driverId) void dispatch(loadArrivedOrders(driverId));
  }, [dispatch, driverId]);

  useEffect(() => {
    if (!driverId) return;

    const initialTimer = setTimeout(() => {
      void dispatch(loadArrivedOrders(driverId));
    }, 0);
    const refreshTimer = setInterval(() => {
      void dispatch(loadArrivedOrders(driverId));
    }, 30000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(refreshTimer);
    };
  }, [dispatch, driverId]);

  return (
    <OrderContext.Provider
      value={{
        arrivedOrders: ordersState.arrived,
        loading:
          ordersState.status === "loading" && !ordersState.arrived.length,
        refreshing:
          ordersState.status === "loading" &&
          Boolean(ordersState.arrived.length),
        error: ordersState.error,
        refresh,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrders must be used within OrderProvider");
  return context;
}
