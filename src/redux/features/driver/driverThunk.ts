import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  getDriverProfile,
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

export const loadDriverProfile = createAsyncThunk<
  DriverProfile,
  void,
  { rejectValue: string }
>("driver/loadProfile", async (_, { rejectWithValue }) => {
  try {
    const cachedProfile = await getCachedDriverProfile();
    try {
      const profile = await getDriverProfile();
      await saveDriverProfile(profile);
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
>("driver/updateProfile", async (updates, { rejectWithValue }) => {
  try {
    const profile = await updateDriverProfile(updates);
    await saveDriverProfile(profile);
    return profile;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const clearDriverProfileCache = createAsyncThunk(
  "driver/clearProfile",
  async () => {
    await clearDriverProfile();
  },
);
