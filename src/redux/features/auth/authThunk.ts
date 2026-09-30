import { createAsyncThunk } from "@reduxjs/toolkit";

import type { AuthUser } from "../../../lib/api/authApi";
import {
    AuthResponse,
    LoginData,
    loginDriver,
    RegisterData,
    registerDriver,
} from "../../../lib/api/authApi";
import {
    clearAuth,
    getToken,
    getUser,
    saveAuth,
} from "../../../storage/auth.storage";
import { clearDriverProfile } from "../../../storage/driver.storage";
// import { clearArrivedOrders } from "../../../storage/order.storage";

interface AuthHydration {
  token: string | null;
  user: AuthUser | null;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

export const hydrateAuth = createAsyncThunk<AuthHydration>(
  "auth/hydrate",
  async () => ({
    token: await getToken(),
    user: await getUser(),
  }),
);

export const login = createAsyncThunk<
  AuthResponse,
  LoginData,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await loginDriver(credentials);
    await saveAuth(response.token, response.user);
    return response;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const register = createAsyncThunk<
  void,
  RegisterData,
  { rejectValue: string }
>("auth/register", async (data, { rejectWithValue }) => {
  try {
    await registerDriver(data);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  await Promise.all([clearAuth(), clearDriverProfile(), ]);
});

// clearArrivedOrders()