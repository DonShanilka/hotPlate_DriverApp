export type DriverVehicleType = "BIKE" | "CAR";

/** JSON representation of the backend IDriver document. */
export interface DriverProfile {
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
