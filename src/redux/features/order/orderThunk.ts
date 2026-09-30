import {
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  orderApi,
} from "../../../lib/api/order.api";

import {
  Order,
  OrderStatus,
} from "../../../types/order.types";


export const fetchDriverOrders =
  createAsyncThunk<
    Order[],
    string,
    {
      rejectValue: string;
    }
  >(
    "orders/fetchDriverOrders",

    async (
      driverId,
      { rejectWithValue }
    ) => {

      try {

        return await orderApi.getDriverOrders(
          driverId
        );

      } catch (error: any) {

        return rejectWithValue(
          error.response?.data?.message ??
          "Failed to load orders"
        );
      }
    }
  );


export const fetchOrderById =
  createAsyncThunk<
    Order,
    string,
    {
      rejectValue: string;
    }
  >(
    "orders/fetchOrderById",

    async (
      orderId,
      { rejectWithValue }
    ) => {

      try {

        return await orderApi.getOrderById(
          orderId
        );

      } catch (error: any) {

        return rejectWithValue(
          error.response?.data?.message ??
          "Failed to load order"
        );
      }
    }
  );


export const updateOrderStatus =
  createAsyncThunk<
    Order,
    {
      orderId: string;
      status: OrderStatus;
    },
    {
      rejectValue: string;
    }
  >(
    "orders/updateOrderStatus",

    async (
      {
        orderId,
        status,
      },
      { rejectWithValue }
    ) => {

      try {

        return await orderApi.updateOrderStatus(
          orderId,
          status
        );

      } catch (error: any) {

        return rejectWithValue(
          error.response?.data?.message ??
          "Failed to update order"
        );
      }
    }
  );