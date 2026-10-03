import { Text, View } from "react-native";

interface Props {
  firstName?: string;
  isOnline: boolean;
}

export default function DriverHomeHeader({ firstName, isOnline }: Props) {
  return (
    <View className="px-5 pb-4 pt-14">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-900">
            Welcome, {firstName || "Driver"} 👋
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            Ready for your next delivery?
          </Text>
        </View>
        <View className="ml-3 flex-row items-center rounded-full bg-white px-3 py-2 shadow-sm">
          <View
            className={`mr-2 h-2.5 w-2.5 rounded-full ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <Text className="text-xs font-semibold text-gray-700">
            {isOnline ? "ONLINE" : "OFFLINE"}
          </Text>
        </View>
      </View>
    </View>
  );
}
