import { createSlice } from "@reduxjs/toolkit";

import type { AuthUser } from "../../../lib/api/authApi";
import { hydrateAuth, login, logout, register } from "./authThunk";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.status = "succeeded";
      })
      .addCase(hydrateAuth.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Unable to restore your session";
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.status = "succeeded";
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to sign in";
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to register";
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.status = "idle";
        state.error = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
