import type {
    DriverProfile,
    DriverProfileUpdate,
} from "../../types/driver.types";
import { ApiError, apiGet, apiPut } from "./client";

const DRIVER_PROFILE_PATH = "/drivers/profile";

function isDriverProfile(value: unknown): value is DriverProfile {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DriverProfile>;
  return Boolean(
    candidate.userId ||
    candidate.vehicleType ||
    candidate.vehicleNumber ||
    candidate.licenseNumber,
  );
}

function findDriverProfile(response: unknown): DriverProfile | null {
  if (isDriverProfile(response)) return response;

  if (response && typeof response === "object") {
    const envelope = response as Record<string, unknown>;
    for (const key of [
      "data",
      "driver",
      "driverProfile",
      "profile",
      "result",
    ]) {
      const nested = envelope[key];
      if (nested !== undefined) {
        const profile = findDriverProfile(nested);
        if (profile) return profile;
      }
    }
  }

  return null;
}

export async function getDriverProfile(): Promise<DriverProfile | null> {
  try {
    const response = await apiGet<unknown>(DRIVER_PROFILE_PATH);
    return findDriverProfile(response);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 404) throw error;

    // Some backends include the driver document in the authenticated user profile
    // rather than exposing a dedicated GET /drivers/profile endpoint.
    const userResponse = await apiGet<unknown>("/users/profile");
    return findDriverProfile(userResponse);
  }
}

export async function updateDriverProfile(
  updates: DriverProfileUpdate,
): Promise<DriverProfile> {
  const response = await apiPut<unknown>(DRIVER_PROFILE_PATH, updates);
  const profile = findDriverProfile(response);
  if (!profile) {
    throw new Error(
      "Driver details were updated, but the server returned no driver profile.",
    );
  }
  return profile;
}
