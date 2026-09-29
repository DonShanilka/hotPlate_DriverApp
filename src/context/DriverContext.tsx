import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
} from "react";

import { useAuth } from "./AuthContext";
import {
  loadDriverProfile,
  saveDriverProfileChanges,
} from "../redux/features/driver/driverThunk";
import { useAppDispatch, useAppSelector } from "../redux/store/hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  DriverProfile,
  DriverProfileUpdate,
} from "../types/driver.types";

interface DriverContextValue {
  profile: DriverProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => void;
  update: (updates: DriverProfileUpdate) => Promise<void>;
}

const DriverContext = createContext<DriverContextValue | undefined>(undefined);

export function DriverProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, loading: authLoading } = useAuth();
  const driverState = useAppSelector((state) => state.driver);

  const refresh = useCallback(() => {
    if (user) void dispatch(loadDriverProfile());
  }, [dispatch, user]);

  useEffect(() => {
    if (!authLoading && driverState.status === "idle") {
      void AsyncStorage.getItem("token").then((token) => {
        if (token) void dispatch(loadDriverProfile());
      });
    }
  }, [authLoading, dispatch, driverState.status, user]);

  const update = useCallback(
    async (updates: DriverProfileUpdate) => {
      await dispatch(saveDriverProfileChanges(updates)).unwrap();
    },
    [dispatch],
  );

  return (
    <DriverContext.Provider
      value={{
        profile: driverState.profile,
        loading: driverState.status === "loading",
        saving: driverState.saveStatus === "loading",
        error: driverState.saveError || driverState.error,
        refresh,
        update,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
}

export function useDriver() {
  const context = useContext(DriverContext);
  if (!context) {
    throw new Error("useDriver must be used within DriverProvider");
  }
  return context;
}
