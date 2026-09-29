export type DriverVehicleType = "BIKE" | "CAR";

/** JSON representation of the backend IDriver document. */
export interface DriverProfile {
  /** MongoDB Driver document ID. Order.driverId references this value. */
  _id?: string;
  userId: string;
  vehicleType: DriverVehicleType;
  vehicleNumber: string;
  licenseNumber: string;
  phone: string;
  address: string;
  profileImage?: string | { data: number[] };
  isAvailable?: boolean;
  isActive?: boolean;
  rating?: number;
  totalDeliveries?: number;
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
