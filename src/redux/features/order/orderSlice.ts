import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Order } from "../../../types/order.types";

import { logout } from "../auth/authThunk";
import {
    fetchDriverOrders,
    fetchOrderById,
    updateOrderStatus,
} from "./orderThunk";

interface OrderState {
  orders: Order[];

  activeOrder: Order | null;

  loading: boolean;

  updating: boolean;

  error: string | null;
}

const initialState: OrderState = {
  orders: [],

  activeOrder: null,

  loading: false,

  updating: false,

  error: null,
};

const orderSlice = createSlice({
  name: "orders",

  initialState,

  reducers: {
    setActiveOrder(state, action: PayloadAction<Order | null>) {
      state.activeOrder = action.payload;
    },

    clearOrders(state) {
      state.orders = [];

      state.activeOrder = null;

      state.error = null;
    },

    clearOrderError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // =====================================
    // FETCH DRIVER ORDERS
    // =====================================

    builder.addCase(fetchDriverOrders.pending, (state) => {
      state.loading = true;

      state.error = null;
    });

    builder.addCase(fetchDriverOrders.fulfilled, (state, action) => {
      state.loading = false;

      state.orders = action.payload;

      const activeOrder = action.payload.find(
        (order) => order.status !== "DELIVERED" && order.status !== "CANCELLED",
      );

      state.activeOrder = activeOrder ?? null;
    });

    builder.addCase(fetchDriverOrders.rejected, (state, action) => {
      state.loading = false;

      state.error = action.payload ?? "Failed to load orders";
    });

    // =====================================
    // FETCH ONE ORDER
    // =====================================

    builder.addCase(fetchOrderById.pending, (state) => {
      state.loading = true;

      state.error = null;
    });

    builder.addCase(fetchOrderById.fulfilled, (state, action) => {
      state.loading = false;

      state.activeOrder = action.payload;

      const index = state.orders.findIndex(
        (order) => order._id === action.payload._id,
      );

      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    });

    builder.addCase(fetchOrderById.rejected, (state, action) => {
      state.loading = false;

      state.error = action.payload ?? "Failed to load order";
    });

    // =====================================
    // UPDATE STATUS
    // =====================================

    builder.addCase(updateOrderStatus.pending, (state) => {
      state.updating = true;

      state.error = null;
    });

    builder.addCase(updateOrderStatus.fulfilled, (state, action) => {
      state.updating = false;

      const updated = action.payload;

      const index = state.orders.findIndex(
        (order) => order._id === updated._id,
      );

      if (index !== -1) {
        state.orders[index] = updated;
      }

      if (updated.status === "DELIVERED" || updated.status === "CANCELLED") {
        state.activeOrder = null;
      } else {
        state.activeOrder = updated;
      }
    });

    builder.addCase(updateOrderStatus.rejected, (state, action) => {
      state.updating = false;

      state.error = action.payload ?? "Failed to update order";
    });
    builder.addCase(logout.fulfilled, () => initialState);
  },
});

export const { setActiveOrder, clearOrders, clearOrderError } =
  orderSlice.actions;

export default orderSlice.reducer;
