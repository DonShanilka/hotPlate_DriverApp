import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

import { orderApi } from "../lib/api/order.api";
import { OrderStatus, type Order } from "../types/order.types";

const PENDING_POLL_INTERVAL_MS = 8_000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let orderAlertPermission: Promise<boolean> | null = null;

async function canPlayOrderAlert(): Promise<boolean> {
  if (!orderAlertPermission) {
    orderAlertPermission = (async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Order alerts",
          importance: Notifications.AndroidImportance.MAX,
          sound: "default",
          vibrationPattern: [0, 250, 150, 250],
        });
      }

      const currentPermission = await Notifications.getPermissionsAsync();
      const permission = currentPermission.granted
        ? currentPermission
        : await Notifications.requestPermissionsAsync();
      return permission.granted;
    })().catch((error: unknown) => {
      orderAlertPermission = null;
      console.warn("Could not enable new order alerts:", error);
      return false;
    });
  }

  return orderAlertPermission;
}

async function playPendingOrdersAlert(orders: Order[]): Promise<void> {
  if (orders.length === 0) return;

  try {
    if (!(await canPlayOrderAlert())) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title:
          orders.length === 1
            ? "Delivery order available"
            : "Delivery orders available",
        body:
          orders.length === 1
            ? `Order #${orders[0]._id.slice(-6).toUpperCase()} is waiting. Tap to view and accept.`
            : `${orders.length} pending orders are waiting. Tap to view and accept.`,
        sound: "default",
        data: { orderIds: orders.map((order) => order._id) },
      },
      trigger: null,
    });
  } catch (error) {
    console.warn("Could not play the new order alert:", error);
  }
}

function isAvailableOrder(value: unknown): value is Order {
  if (!value || typeof value !== "object") return false;

  const order = value as Partial<Order>;
  const assignedDriver = order.driverId;
  const hasNoDriver =
    !assignedDriver ||
    (typeof assignedDriver === "string" && assignedDriver.trim() === "") ||
    (typeof assignedDriver === "object" && !assignedDriver._id);

  return (
    typeof order._id === "string" &&
    order._id.trim().length > 0 &&
    order.status === OrderStatus.PENDING &&
    hasNoDriver &&
    typeof order.deliveryAddress === "string" &&
    order.deliveryAddress.trim().length > 0 &&
    Array.isArray(order.items) &&
    order.items.length > 0 &&
    typeof order.totalAmount === "number" &&
    Number.isFinite(order.totalAmount)
  );
}

interface Options {
  isOnline: boolean;
  hasActiveDelivery: boolean;
  driverId?: string;
  refreshAssignedOrders: () => Promise<void>;
}

export function useAvailableOrders({
  isOnline,
  hasActiveDelivery,
  driverId,
  refreshAssignedOrders,
}: Options) {
  const pendingRequestInFlight = useRef(false);
  const acceptingRequestInFlight = useRef(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissedOrderIds, setDismissedOrderIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visibleOrders = orders.filter(
    (order) => !dismissedOrderIds.has(order._id),
  );

  const refresh = useCallback(async () => {
    if (!isOnline || hasActiveDelivery || pendingRequestInFlight.current)
      return;
    pendingRequestInFlight.current = true;
    setLoading(true);

    try {
      const results = await orderApi.getAllOrders({
        status: OrderStatus.PENDING,
      });
      const availableOrders = results.filter(isAvailableOrder);
      setOrders(availableOrders);
      setDismissedOrderIds(new Set());
      setError(null);
      void playPendingOrdersAlert(availableOrders);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not load available orders.",
      );
    } finally {
      pendingRequestInFlight.current = false;
      setLoading(false);
    }
  }, [hasActiveDelivery, isOnline]);

  useEffect(() => {
    if (!isOnline || hasActiveDelivery) return;

    const initialRefresh = setTimeout(() => {
      void refresh();
    }, 0);
    const interval = setInterval(() => {
      void refresh();
    }, PENDING_POLL_INTERVAL_MS);

    return () => {
      clearTimeout(initialRefresh);
      clearInterval(interval);
    };
  }, [hasActiveDelivery, isOnline, refresh]);

  const accept = useCallback(
    async (orderId: string) => {
      if (!driverId || acceptingRequestInFlight.current) return;
      acceptingRequestInFlight.current = true;
      setAcceptingOrderId(orderId);
      setError(null);

      try {
        const latestOrder = await orderApi.getOrderById(orderId);
        if (
          latestOrder.status !== OrderStatus.PENDING ||
          !isAvailableOrder(latestOrder)
        ) {
          setOrders((current) =>
            current.filter((order) => order._id !== orderId),
          );
          throw new Error("This order is no longer available.");
        }

        await orderApi.assignDriverToOrder(orderId, driverId);
        setOrders((current) =>
          current.filter((order) => order._id !== orderId),
        );
        setDismissedOrderIds((current) => new Set(current).add(orderId));
        await refreshAssignedOrders();
      } catch (cause) {
        setError(
          cause instanceof Error
            ? `${cause.message} The order may have been accepted by another driver.`
            : "Could not accept this order. It may have been accepted by another driver.",
        );
        await refresh();
      } finally {
        acceptingRequestInFlight.current = false;
        setAcceptingOrderId(null);
      }
    },
    [driverId, refresh, refreshAssignedOrders],
  );

  const skip = useCallback((orderId: string) => {
    setDismissedOrderIds((current) => new Set(current).add(orderId));
  }, []);

  return {
    orders: visibleOrders,
    loading,
    error,
    acceptingOrderId,
    refresh,
    accept,
    skip,
  };
}
