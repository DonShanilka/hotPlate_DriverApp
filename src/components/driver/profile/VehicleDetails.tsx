import { Text, TouchableOpacity, View } from "react-native";

import type { DriverVehicleType } from "../../../types/driver.types";
import ProfileField from "./ProfileField";

interface VehicleDetailsProps {
  vehicleType: DriverVehicleType;
  onVehicleTypeChange: (vehicleType: DriverVehicleType) => void;
  vehicleNumber: string;
  onVehicleNumberChange: (value: string) => void;
  licenseNumber: string;
  onLicenseNumberChange: (value: string) => void;
  editable: boolean;
}

export default function VehicleDetails({
  vehicleType,
  onVehicleTypeChange,
  vehicleNumber,
  onVehicleNumberChange,
  licenseNumber,
  onLicenseNumberChange,
  editable,
}: VehicleDetailsProps) {
  return (
    <View className="mb-4 rounded-2xl bg-white p-4">
      <Text className="mb-3.5 text-[17px] font-bold text-gray-900">
        Vehicle details
      </Text>
      {editable ? (
        <>
          <Text className="mb-2 text-[13px] font-medium text-gray-500">
            Vehicle type
          </Text>
          <View className="mb-3.5 flex-row">
            {(["BIKE", "CAR"] as const).map((type) => (
              <TouchableOpacity
                key={type}
                accessibilityRole="button"
                accessibilityState={{ selected: vehicleType === type }}
                onPress={() => onVehicleTypeChange(type)}
                className={`mr-2.5 rounded-[10px] border px-5 py-2.5 ${vehicleType === type ? "border-green-600 bg-green-50" : "border-gray-300"}`}
              >
                <Text
                  className={`font-semibold ${vehicleType === type ? "text-green-700" : "text-gray-600"}`}
                >
                  {type === "BIKE" ? "Bike" : "Car"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <ProfileField
          label="Vehicle type"
          value={vehicleType === "BIKE" ? "Bike" : "Car"}
          onChangeText={() => undefined}
          placeholder="Vehicle type"
          editable={false}
        />
      )}
      <ProfileField
        label="Vehicle number"
        value={vehicleNumber}
        onChangeText={onVehicleNumberChange}
        placeholder="Enter vehicle number"
        autoCapitalize="characters"
        editable={editable}
      />
      <ProfileField
        label="License number"
        value={licenseNumber}
        onChangeText={onLicenseNumberChange}
        placeholder="Enter license number"
        autoCapitalize="characters"
        editable={editable}
      />
    </View>
  );
}
