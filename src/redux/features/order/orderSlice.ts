import { createSlice } from "@reduxjs/toolkit";

import type { DriverOrder } from "../../../types/order.types";
import { logout } from "../auth/authThunk";
import { clearOrdersCache, loadArrivedOrders } from "./orderThunk";

interface OrdersState {
	arrived: DriverOrder[];
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
	lastFetchedAt: number | null;
}

const initialState: OrdersState = {
	arrived: [],
	status: "idle",
	error: null,
	lastFetchedAt: null,
};

const orderSlice = createSlice({
	name: "orders",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(loadArrivedOrders.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(loadArrivedOrders.fulfilled, (state, action) => {
				state.arrived = action.payload;
				state.status = "succeeded";
				state.error = null;
				state.lastFetchedAt = Date.now();
			})
			.addCase(loadArrivedOrders.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload || "Unable to load arrived orders.";
			})
			.addCase(logout.fulfilled, () => initialState)
			.addCase(clearOrdersCache.fulfilled, () => initialState);
	},
});

export default orderSlice.reducer;
