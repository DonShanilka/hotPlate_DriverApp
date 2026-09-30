import type {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "../../types/order.types";
import { apiGet, apiPatch, apiPost } from "./client";

// Strips wrappers like { data }, { order }, { orders }, { result }
function unwrap<T>(response: unknown): T {
  if (response && typeof response === "object" && !Array.isArray(response)) {
    const envelope = response as Record<string, unknown>;
    for (const key of ["data", "order", "orders", "result"]) {
      if (key in envelope && envelope[key] !== undefined) {
        return unwrap<T>(envelope[key]);
      }
    }
  }
  return response as T;
}

function unwrapList(response: unknown): Order[] {
  const list = unwrap<unknown>(response);
  return Array.isArray(list) ? (list as Order[]) : [];
}

export interface OrderFilters {
  status?: OrderStatus;
  userId?: string;
  restaurantId?: string;
  driverId?: string;
}

export type CreateOrderPayload = Partial<Omit<Order, "_id" | "createdAt">>;

export const orderApi = {
  // POST /order
  async createOrder(data: CreateOrderPayload): Promise<Order> {
    const response = await apiPost<unknown>("/order", data);
    return unwrap<Order>(response);
  },

  // GET /order?status=&userId=&restaurantId=&driverId=
  async getAllOrders(filters: OrderFilters = {}): Promise<Order[]> {
    const params = new URLSearchParams();
    (Object.entries(filters) as [string, string | undefined][]).forEach(
      ([key, value]) => {
        if (value) params.append(key, value);
      },
    );
    const qs = params.toString();
    const response = await apiGet<unknown>(`/order${qs ? `?${qs}` : ""}`);
    return unwrapList(response);
  },

  // GET /order/:id
  async getOrderById(orderId: string): Promise<Order> {
    const response = await apiGet<unknown>(
      `/order/${encodeURIComponent(orderId)}`,
    );
    return unwrap<Order>(response);
  },

  // GET /order/user/:userId
  async getOrdersByUser(userId: string): Promise<Order[]> {
    const response = await apiGet<unknown>(
      `/order/user/${encodeURIComponent(userId)}`,
    );
    return unwrapList(response);
  },

  // GET /order/user/:userId/pending
  async getPendingOrdersByUser(userId: string): Promise<Order[]> {
    const response = await apiGet<unknown>(
      `/order/user/${encodeURIComponent(userId)}/pending`,
    );
    return unwrapList(response);
  },

  // GET /order/driver/:userId
  // takes the driver's *user* ID. The backend resolves the Driver
  // profile itself (getOrdersByDriverUserId) and returns its orders.
  async getDriverOrders(driverUserId: string): Promise<Order[]> {
    const response = await apiGet<unknown>(
      `/order/driver/${encodeURIComponent(driverUserId)}`,
    );
    return unwrapList(response);
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<Order> {
    const response = await apiPatch<unknown>(
      `/order/${encodeURIComponent(orderId)}/status`,
      { status },
    );
    return unwrap<Order>(response);
  },

  async assignDriverToOrder(
    orderId: string,
    driverId: string,
    estimatedDeliveryTime?: number,
  ): Promise<Order> {
    const response = await apiPatch<unknown>(
      `/order/${encodeURIComponent(orderId)}/driver`,
      { driverId, estimatedDeliveryTime },
    );
    return unwrap<Order>(response);
  },

  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    paymentMethod?: PaymentMethod,
  ): Promise<Order> {
    const response = await apiPatch<unknown>(
      `/order/${encodeURIComponent(orderId)}/payment`,
      { paymentStatus, paymentMethod },
    );
    return unwrap<Order>(response);
  },

  async cancelOrder(orderId: string): Promise<Order> {
    const response = await apiPatch<unknown>(
      `/order/${encodeURIComponent(orderId)}/cancel`,
      {},
    );
    return unwrap<Order>(response);
  },

  // DELETE /order/:id
  //   async deleteOrder(orderId: string): Promise<{ message: string }> {
  //     const response = await apiDelete<unknown>(
  //       `/order/${encodeURIComponent(orderId)}`,
  //     );
  //     return unwrap<{ message: string }>(response);
  //   },
};
