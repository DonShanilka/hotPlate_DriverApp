import type {
    DriverProfile,
    DriverProfileUpdate,
} from "../../types/driver.types";
import { apiGet, apiPut } from "./client";

type DriverProfileResponse =
  | DriverProfile
  | { data: DriverProfile }
  | { driver: DriverProfile }
  | { data: { driver: DriverProfile } };

const DRIVER_PROFILE_PATH = "/drivers/profile";

function unwrapDriverProfile(response: DriverProfileResponse): DriverProfile {
  if ("driver" in response) return response.driver;
  if ("data" in response) {
    const data = response.data;
    return "driver" in data ? data.driver : data;
  }
  return response;
}

export async function getDriverProfile(): Promise<DriverProfile> {
  const response = await apiGet<DriverProfileResponse>(DRIVER_PROFILE_PATH);
  return unwrapDriverProfile(response);
}

export async function updateDriverProfile(
  updates: DriverProfileUpdate,
): Promise<DriverProfile> {
  const response = await apiPut<DriverProfileResponse>(
    DRIVER_PROFILE_PATH,
    updates,
  );
  return unwrapDriverProfile(response);
}
