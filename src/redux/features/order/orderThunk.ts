import { createAsyncThunk } from "@reduxjs/toolkit";

import { getArrivedDriverOrders } from "../../../lib/api/order.api";
import {
    clearArrivedOrders,
    getCachedArrivedOrders,
    saveArrivedOrders,
} from "../../../storage/order.storage";
import type { DriverOrder } from "../../../types/order.types";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unable to load orders.";

export const loadArrivedOrders = createAsyncThunk<
  DriverOrder[],
  string,
  { rejectValue: string }
>("orders/loadArrived", async (driverId, { rejectWithValue }) => {
  try {
    if (!driverId) return [];
    try {
      const orders = await getArrivedDriverOrders(driverId);
      await saveArrivedOrders(orders);
      return orders;
    } catch (error) {
      const cachedOrders = await getCachedArrivedOrders();
      if (cachedOrders) return cachedOrders;
      throw error;
    }
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const clearOrdersCache = createAsyncThunk(
  "orders/clearCache",
  async () => {
    await clearArrivedOrders();
  },
);
