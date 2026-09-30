import api from "./axios";

import { Order, OrderStatus } from "../../types/order.types";

export const orderApi = {
  async getDriverOrders(driverId: string): Promise<Order[]> {
    const response = await api.get("/orders", {
      params: {
        driverId,
      },
    });

    return response.data;
  },

  async getOrderById(orderId: string): Promise<Order> {
    const response = await api.get(`/orders/${orderId}`);

    return response.data;
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<Order> {
    const response = await api.patch(`/orders/${orderId}/status`, {
      status,
    });

    return response.data;
  },
};
