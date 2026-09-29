import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import driverReducer from "../features/driver/driverSlice";
import orderReducer from "../features/order/orderSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    driver: driverReducer,
    orders: orderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
