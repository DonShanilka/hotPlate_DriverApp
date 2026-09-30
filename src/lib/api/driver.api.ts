import type {
  DriverProfile,
  DriverProfileUpdate,
} from "../../types/driver.types";
import { ApiError, apiGet, apiPatch, apiPost, apiPut } from "./client";

const DRIVER_BASE = "/driver";

function isDriverProfile(value: unknown): value is DriverProfile {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DriverProfile> & { id?: string };
  const rawId = candidate._id ?? candidate.id;
  const driverId = typeof rawId === "string" ? rawId : rawId != null ? String(rawId) : "";
  if (!driverId) return false;
  candidate._id = driverId;
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
    for (const key of ["data", "driver", "driverProfile", "profile", "result"]) {
      const nested = envelope[key];
      if (nested !== undefined) {
        const profile = findDriverProfile(nested);
        if (profile) return profile;
      }
    }
  }

  return null;
}

function requireProfile(response: unknown, fallbackMessage: string): DriverProfile {
  const profile = findDriverProfile(response);
  if (!profile) {
    throw new Error(fallbackMessage);
  }
  return profile;
}

export async function getDriverProfile(): Promise<DriverProfile | null> {
  try {
    const response = await apiGet<unknown>(`${DRIVER_BASE}/profile`);
    return findDriverProfile(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function registerDriverProfile(
  updates: DriverProfileUpdate,
): Promise<DriverProfile> {
  const response = await apiPost<unknown>(`${DRIVER_BASE}/register`, updates);
  return requireProfile(
    response,
    "Driver profile was created, but the server returned no driver profile.",
  );
}

export async function updateDriverProfile(
  driverId: string,
  updates: DriverProfileUpdate,
): Promise<DriverProfile> {
  const response = await apiPut<unknown>(
    `${DRIVER_BASE}/update/${encodeURIComponent(driverId)}`,
    updates,
  );
  return requireProfile(
    response,
    "Driver details were updated, but the server returned no driver profile.",
  );
}

export async function setDriverAvailability(
  driverId: string,
  isAvailable: boolean,
): Promise<DriverProfile> {
  const response = await apiPatch<unknown>(
    `${DRIVER_BASE}/${encodeURIComponent(driverId)}/availability`,
    { isAvailable },
  );
  return requireProfile(
    response,
    "Online status was updated, but the server returned no driver profile.",
  );
}
