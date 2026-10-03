import { Text, View } from "react-native";

interface Props {
  isOnline: boolean;
  activeCount: number;
  gpsAccuracy?: number | null;
}

export default function DriverStatusCard({
  isOnline,
  activeCount,
  gpsAccuracy,
}: Props) {
  return (
    <View className="mb-3 rounded-2xl bg-white p-4 shadow-sm">
      <View className="flex-row items-center">
        <View className="flex-1 flex-row items-center">
          <View
            className={`mr-2.5 h-3 w-3 rounded-full ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <View>
            <Text className="text-sm font-bold text-gray-900">
              {isOnline ? "You are online" : "You are offline"}
            </Text>
            <Text className="mt-0.5 text-xs text-gray-500">
              {isOnline
                ? activeCount > 0
                  ? `${activeCount} active ${activeCount === 1 ? "delivery" : "deliveries"}`
                  : "Waiting for delivery orders"
                : "Go online to receive orders"}
            </Text>
          </View>
        </View>
        {gpsAccuracy != null ? (
          <View className="items-end">
            <Text className="text-xs font-semibold text-gray-700">GPS</Text>
            <Text className="mt-0.5 text-xs text-gray-500">
              ±{Math.round(gpsAccuracy)}m
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
