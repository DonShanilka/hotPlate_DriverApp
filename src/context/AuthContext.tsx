import React, { createContext, useContext, useEffect, useState } from "react";

import {
  clearAuth,
  getToken,
  getUser,
  saveAuth,
} from "../storage/auth.storage";

import { loginDriver, registerDriver } from "../api/auth.api";

interface AuthContextType {
  token: string | null;
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuth();
  }, []);

  const loadAuth = async () => {
    try {
      const storedToken = await getToken();
      const storedUser = await getUser();

      setToken(storedToken);
      setUser(storedUser);
    } catch (error) {
      console.log("Failed to load auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await loginDriver({
      email,
      password,
    });

    const authToken = response.token;
    const authUser = response.user;

    await saveAuth(authToken, authUser);

    setToken(authToken);
    setUser(authUser);
  };

  const register = async (data: any) => {
    await registerDriver(data);
  };

  const logout = async () => {
    await clearAuth();

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
