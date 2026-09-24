import React, { useEffect } from "react";

import { LoginData, RegisterData } from "../services/api";
import {
    hydrateAuth,
    login as loginUser,
    logout as logoutUser,
    register as registerUser,
} from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(hydrateAuth());
  }, [dispatch]);

  return children;
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  return {
    token: auth.token,
    user: auth.user,
    loading: auth.status === "loading" || auth.status === "idle",
    error: auth.error,
    login: (credentials: LoginData) =>
      dispatch(loginUser(credentials)).unwrap(),
    register: (data: RegisterData) => dispatch(registerUser(data)).unwrap(),
    logout: () => dispatch(logoutUser()).unwrap(),
  };
}
