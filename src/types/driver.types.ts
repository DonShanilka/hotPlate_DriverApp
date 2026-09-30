export type DriverVehicleType = "BIKE" | "CAR";

export type MongoReference =
  | string
  | { _id?: string; id?: string; userId?: string }
  | null
  | undefined;

/** Driver collection document returned by the backend. */
export interface DriverProfile {
  /** Driver document ObjectId. Order.driverId references this _id. */
  _id: string;
  /** User document ObjectId linked to this driver. */
  userId: MongoReference;
  vehicleType: DriverVehicleType;
  vehicleNumber: string;
  licenseNumber: string;
  phone: string;
  address: string;
  profileImage?: string | { data: number[] };
  isAvailable: boolean;
  isActive: boolean;
  rating: number;
  totalDeliveries: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export type DriverProfileUpdate = Pick<
  DriverProfile,
  | "vehicleType"
  | "vehicleNumber"
  | "licenseNumber"
  | "phone"
  | "address"
  | "isAvailable"
>;

/** Backend-facing alias: this shape represents one Mongo Driver document. */
export type Driver = DriverProfile;

export function getDriverUserId(
  driver: DriverProfile | null | undefined,
): string | null {
  return driver ? referenceId(driver.userId) : null;
}

function referenceId(reference: MongoReference): string | null {
  if (typeof reference === "string") return reference;
  if (!reference || typeof reference !== "object") return null;
  return reference._id ?? reference.id ?? reference.userId ?? null;
}

/** Return Driver._id only when its userId matches the authenticated User._id. */
export function getMatchingDriverId(
  authenticatedUserId: string | null | undefined,
  driver: DriverProfile | null | undefined,
): string | null {
  if (!authenticatedUserId || !driver?._id) return null;
  return referenceId(driver.userId) === authenticatedUserId ? driver._id : null;
}
