import AsyncStorage from "@react-native-async-storage/async-storage";

import type { DriverOrder } from "../types/order.types";

const ORDER_CACHE_KEY = "hotplate_driver_arrived_orders";

export async function saveArrivedOrders(orders: DriverOrder[]): Promise<void> {
  await AsyncStorage.setItem(ORDER_CACHE_KEY, JSON.stringify(orders));
}

export async function getCachedArrivedOrders(): Promise<DriverOrder[] | null> {
  const cached = await AsyncStorage.getItem(ORDER_CACHE_KEY);
  if (!cached) return null;
  try {
    const orders = JSON.parse(cached) as DriverOrder[];
    return Array.isArray(orders) ? orders : null;
  } catch {
    await AsyncStorage.removeItem(ORDER_CACHE_KEY);
    return null;
  }
}

export async function clearArrivedOrders(): Promise<void> {
  await AsyncStorage.removeItem(ORDER_CACHE_KEY);
}
