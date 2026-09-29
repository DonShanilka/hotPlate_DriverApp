import { Switch, Text, View } from "react-native";

interface DriverStatusProps {
  isAvailable: boolean;
  onAvailabilityChange: (isAvailable: boolean) => void;
  rating?: number;
  totalDeliveries?: number;
  userId?: string;
  editable: boolean;
}

export default function DriverStatus({
  isAvailable,
  onAvailabilityChange,
  rating,
  totalDeliveries,
  userId,
  editable,
}: DriverStatusProps) {
  return (
    <View className="mb-4 rounded-2xl bg-white p-4">
      <Text className="mb-3.5 text-[17px] font-bold text-gray-900">
        Driver status
      </Text>
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="mb-2 text-[13px] font-medium text-gray-500">
            Available for deliveries
          </Text>
          <Text className="text-xs text-gray-400">
            {isAvailable
              ? "You can receive delivery requests"
              : "You are offline"}
          </Text>
        </View>
        {editable ? (
          <Switch
            value={isAvailable}
            onValueChange={onAvailabilityChange}
            trackColor={{ false: "#d1d5db", true: "#86efac" }}
            thumbColor={isAvailable ? "#16a34a" : "#f4f3f4"}
          />
        ) : (
          <Text
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
          >
            {isAvailable ? "Available" : "Offline"}
          </Text>
        )}
      </View>
      <Text className="mb-2 text-[13px] font-medium text-gray-500">Rating</Text>
      <Text className="mb-3.5 text-[17px] text-gray-900">
        {typeof rating === "number"
          ? `${rating.toFixed(1)} / 5`
          : "Not rated yet"}
      </Text>
      <Text className="mb-2 text-[13px] font-medium text-gray-500">
        Total deliveries
      </Text>
      <Text className="mb-3.5 text-[17px] text-gray-900">
        {typeof totalDeliveries === "number" ? totalDeliveries : "0"}
      </Text>
      {userId ? (
        <>
          <Text className="mb-2 text-[13px] font-medium text-gray-500">
            Driver ID
          </Text>
          <Text className="mb-3.5 text-[17px] text-gray-900">{userId}</Text>
        </>
      ) : null}
    </View>
  );
}
