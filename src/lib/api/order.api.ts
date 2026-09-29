import type { DriverOrder } from "../../types/order.types";
import { apiGet } from "./client";

function getId(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    const id = object._id ?? object.id;
    return id == null ? null : String(id);
  }
  return null;
}

function unwrapOrders(response: unknown): DriverOrder[] {
  if (Array.isArray(response)) return response as DriverOrder[];
  if (!response || typeof response !== "object") return [];

  const envelope = response as Record<string, unknown>;
  for (const key of ["orders", "data", "result", "deliveries"]) {
    const nested = envelope[key];
    if (Array.isArray(nested)) return nested as DriverOrder[];
    if (nested && typeof nested === "object") {
      const orders = unwrapOrders(nested);
      if (orders.length) return orders;
    }
  }
  return [];
}

function orderDriverIds(order: DriverOrder): string[] {
  const raw = order as Record<string, unknown>;
  return [getId(order.driverId ?? raw.driver_id)].filter(
    (id): id is string => id !== null,
  );
}

function isArrivedOrder(order: DriverOrder): boolean {
  const raw = order as Record<string, unknown>;
  const arrivedStates = [
    order.status,
    order.paymentStatus,
    raw.orderStatus,
    raw.deliveryStatus,
  ].map((status) => String(status ?? "").toUpperCase());
  return arrivedStates.includes("ARRIVED");
}

/** Fetch all orders, then filter to ARRIVED orders assigned to this Driver._id. */
export async function getArrivedDriverOrders(
  driverId: string,
): Promise<DriverOrder[]> {
  if (!driverId) return [];

  // Resolve User._id -> Driver.userId in OrderContext first. The Order model's
  // driverId stores the Driver document _id, not the User document _id.
  const response = await apiGet<unknown>("/orders");

  return unwrapOrders(response).filter(
    (order) =>
      isArrivedOrder(order) && orderDriverIds(order).includes(driverId),
  );
}
