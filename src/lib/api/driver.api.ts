import type {
  DriverProfile,
  DriverProfileUpdate,
} from "../../types/driver.types";
import { apiGet, apiPut } from "./client";

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

function unwrapDriverProfile(response: unknown): DriverProfile {
  if (isDriverProfile(response)) return response;

  if (response && typeof response === "object") {
    const envelope = response as Record<string, unknown>;
    for (const key of ["data", "driver", "profile", "result"]) {
      const nested = envelope[key];
      if (nested !== undefined) {
        try {
          return unwrapDriverProfile(nested);
        } catch {
          // Continue through the common API response envelope keys.
        }
      }
    }
  }

  throw new Error("The server response did not include a driver profile.");
}

export async function getDriverProfile(): Promise<DriverProfile> {
  const response = await apiGet<unknown>(DRIVER_PROFILE_PATH);
  console.log(response);
  return unwrapDriverProfile(response);
}

export async function updateDriverProfile(
  updates: DriverProfileUpdate,
): Promise<DriverProfile> {
  const response = await apiPut<unknown>(
    DRIVER_PROFILE_PATH,
    updates,
  );
  return unwrapDriverProfile(response);
}
