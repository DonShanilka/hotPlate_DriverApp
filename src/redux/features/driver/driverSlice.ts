import { createSlice } from "@reduxjs/toolkit";

import type { DriverProfile } from "../../../types/driver.types";
import { logout } from "../auth/authThunk";
import {
    clearDriverProfileCache,
    loadDriverProfile,
    saveDriverProfileChanges,
} from "./driverThunk";

interface DriverState {
  profile: DriverProfile | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  saveStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  saveError: string | null;
}

const initialState: DriverState = {
  profile: null,
  status: "idle",
  saveStatus: "idle",
  error: null,
  saveError: null,
};

const driverSlice = createSlice({
  name: "driver",
  initialState,
  reducers: {
    clearDriverErrors(state) {
      state.error = null;
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDriverProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadDriverProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.status = "succeeded";
      })
      .addCase(loadDriverProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to load driver profile";
      })
      .addCase(saveDriverProfileChanges.pending, (state) => {
        state.saveStatus = "loading";
        state.saveError = null;
      })
      .addCase(saveDriverProfileChanges.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.saveStatus = "succeeded";
      })
      .addCase(saveDriverProfileChanges.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.saveError = action.payload || "Unable to update driver profile";
      })
      .addCase(logout.fulfilled, () => initialState)
      .addCase(clearDriverProfileCache.fulfilled, () => initialState);
  },
});

export const { clearDriverErrors } = driverSlice.actions;
export default driverSlice.reducer;
