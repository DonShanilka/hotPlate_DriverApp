import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
    LoginData,
    loginDriver,
    RegisterData,
    registerDriver,
} from "../services/api";
import {
    clearAuth,
    getToken,
    getUser,
    saveAuth,
} from "../storage/auth.storage";

export interface AuthUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

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

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

export const hydrateAuth = createAsyncThunk(
  "auth/hydrate",
  async (): Promise<Pick<AuthState, "token" | "user">> => ({
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
    const response = (await loginDriver(credentials)) as AuthResponse;
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
  await clearAuth();
});

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
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.status = "succeeded";
        },
      )
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
