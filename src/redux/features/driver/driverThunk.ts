import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  getDriverProfile,
  registerDriverProfile,
  setDriverAvailability,
  updateDriverProfile,
} from "../../../lib/api/driver.api";
import {
  clearDriverProfile,
  getCachedDriverProfile,
  saveDriverProfile,
} from "../../../storage/driver.storage";
import type {
  DriverProfile,
  DriverProfileUpdate,
} from "../../../types/driver.types";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

function getStoredDriverId(getState: () => unknown): string | undefined {
  return (getState() as { driver?: { profile?: DriverProfile | null } }).driver
    ?.profile?._id;
}

export const loadDriverProfile = createAsyncThunk<
  DriverProfile | null,
  void,
  { rejectValue: string }
>("driver/loadProfile", async (_, { rejectWithValue }) => {
  try {
    const cachedProfile = await getCachedDriverProfile();
    try {
      const profile = await getDriverProfile();
      if (profile) await saveDriverProfile(profile);
      else await clearDriverProfile();
      return profile;
    } catch (error) {
      if (cachedProfile) return cachedProfile;
      throw error;
    }
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const saveDriverProfileChanges = createAsyncThunk<
  DriverProfile,
  DriverProfileUpdate,
  { rejectValue: string }
>("driver/updateProfile", async (updates, { getState, rejectWithValue }) => {
  try {
    const driverId = getStoredDriverId(getState);
    const profile = driverId
      ? await updateDriverProfile(driverId, updates)
      : await registerDriverProfile(updates);
    await saveDriverProfile(profile);
    return profile;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const saveDriverAvailability = createAsyncThunk<
  DriverProfile,
  { isAvailable: boolean; driverId?: string },
  { rejectValue: string }
>(
  "driver/setAvailability",
  async ({ isAvailable, driverId: requestedId }, { getState, rejectWithValue }) => {
    try {
      const driverId = requestedId || getStoredDriverId(getState);
      if (!driverId) {
        throw new Error(
          "No driver profile found. Open Profile, save your vehicle details, then try again.",
        );
      }
      const profile = await setDriverAvailability(driverId, isAvailable);
      await saveDriverProfile(profile);
      return profile;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const clearDriverProfileCache = createAsyncThunk(
  "driver/clearProfile",
  async () => {
    await clearDriverProfile();
  },
);
