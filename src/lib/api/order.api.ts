import type { Order, OrderStatus } from "../../types/order.types";
import { apiGet, apiPatch } from "./client";

function unwrap<T>(response: unknown): T {
  if (response && typeof response === "object") {
    const envelope = response as Record<string, unknown>;
    for (const key of ["data", "order", "orders", "result"]) {
      if (key in envelope && envelope[key] !== undefined) {
        return unwrap<T>(envelope[key]);
      }
    }
  }
  return response as T;
}

function getDriverReferenceId(driverId: Order["driverId"]): string | null {
  if (typeof driverId === "string") return driverId;
  if (!driverId) return null;
  return driverId._id;
}

export const orderApi = {
  async getDriverOrders(driverId: string): Promise<Order[]> {
    const response = await apiGet<unknown>(
      `/orders?driverId=${encodeURIComponent(driverId)}`,
    );
    const orders = unwrap<unknown>(response);
    if (!Array.isArray(orders)) return [];
    return (orders as Order[]).filter(
      (order) => getDriverReferenceId(order.driverId) === driverId,
    );
  },

  async getOrderById(orderId: string): Promise<Order> {
    const response = await apiGet<unknown>(
      `/orders/${encodeURIComponent(orderId)}`,
    );
    return unwrap<Order>(response);
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<Order> {
    const response = await apiPatch<unknown>(
      `/orders/${encodeURIComponent(orderId)}/status`,
      { status },
    );
    return unwrap<Order>(response);
  },
};
