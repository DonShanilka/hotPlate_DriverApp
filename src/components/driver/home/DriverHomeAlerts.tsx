import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface Props {
  availabilityError: string | null;
  locationError: string | null;
  hasLocation: boolean;
}

export default function DriverHomeAlerts({
  availabilityError,
  locationError,
  hasLocation,
}: Props) {
  return (
    <>
      {availabilityError ? (
        <View className="mb-3 flex-row items-start rounded-xl border border-red-200 bg-red-50 p-3">
          <Ionicons name="alert-circle-outline" size={19} color="#dc2626" />
          <Text className="ml-2 flex-1 text-xs leading-5 text-red-700">
            {availabilityError}
          </Text>
        </View>
      ) : null}
      {locationError && hasLocation ? (
        <View className="mb-3 flex-row items-center rounded-xl bg-orange-50 p-3">
          <Ionicons name="warning-outline" size={18} color="#ea580c" />
          <Text className="ml-2 flex-1 text-xs text-orange-700">
            {locationError}
          </Text>
        </View>
      ) : null}
    </>
  );
}
