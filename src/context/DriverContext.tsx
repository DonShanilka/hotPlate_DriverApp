import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    loadDriverProfile,
    saveDriverAvailability,
    saveDriverProfileChanges,
} from "../redux/features/driver/driverThunk";
import { useAppDispatch, useAppSelector } from "../redux/store/hooks";
import type { DriverProfile, DriverProfileUpdate } from "../types/driver.types";
import { useAuth } from "./AuthContext";

interface DriverContextValue {
  profile: DriverProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<DriverProfile | null>;
  update: (updates: DriverProfileUpdate) => Promise<void>;
  setAvailability: (isAvailable: boolean, driverId?: string) => Promise<void>;
}

const DriverContext = createContext<DriverContextValue | undefined>(undefined);

export function DriverProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, loading: authLoading } = useAuth();
  const driverState = useAppSelector((state) => state.driver);

  const refresh = useCallback(async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return null;
    return await dispatch(loadDriverProfile()).unwrap();
  }, [dispatch]);

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

  const setAvailability = useCallback(
    async (isAvailable: boolean, driverId?: string) => {
      await dispatch(
        saveDriverAvailability({ isAvailable, driverId }),
      ).unwrap();
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
        setAvailability,
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
