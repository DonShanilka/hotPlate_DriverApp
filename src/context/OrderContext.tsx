import {
  createContext,
  useCallback,
  useContext,
  useEffect,
} from "react";

import { fetchDriverOrders, updateOrderStatus } from "../redux/features/order/orderThunk";
import { useAppDispatch, useAppSelector } from "../redux/store/hooks";
import { getMatchingDriverId } from "../types/driver.types";
import type { Order, OrderStatus } from "../types/order.types";
import { useAuth } from "./AuthContext";
import { useDriver } from "./DriverContext";

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
  const driverId = getMatchingDriverId(user?._id, profile);

  const refreshOrders = useCallback(async () => {
    if (!driverId) return;
    await dispatch(fetchDriverOrders(driverId)).unwrap();
  }, [dispatch, driverId]);

  const changeStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      await dispatch(updateOrderStatus({ orderId, status })).unwrap();
    },
    [dispatch],
  );

  useEffect(() => {
    if (!driverId) return;
    const timer = setTimeout(() => {
      void refreshOrders().catch(() => undefined);
    }, 0);
    return () => clearTimeout(timer);
  }, [driverId, refreshOrders]);

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