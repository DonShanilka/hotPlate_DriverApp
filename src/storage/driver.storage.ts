import AsyncStorage from "@react-native-async-storage/async-storage";

import type { DriverProfile } from "../types/driver.types";

const DRIVER_PROFILE_KEY = "hotplate_driver_profile";

export async function saveDriverProfile(profile: DriverProfile): Promise<void> {
  const cachedProfile = { ...profile };

  // Avoid putting binary image payloads or large data URLs into the local cache.
  if (
    typeof cachedProfile.profileImage === "string" &&
    cachedProfile.profileImage.startsWith("data:")
  ) {
    delete cachedProfile.profileImage;
  } else if (
    cachedProfile.profileImage &&
    typeof cachedProfile.profileImage === "object"
  ) {
    delete cachedProfile.profileImage;
  }

  await AsyncStorage.setItem(DRIVER_PROFILE_KEY, JSON.stringify(cachedProfile));
}

export async function getCachedDriverProfile(): Promise<DriverProfile | null> {
  const profile = await AsyncStorage.getItem(DRIVER_PROFILE_KEY);
  return profile ? (JSON.parse(profile) as DriverProfile) : null;
}

export async function clearDriverProfile(): Promise<void> {
  await AsyncStorage.removeItem(DRIVER_PROFILE_KEY);
}
