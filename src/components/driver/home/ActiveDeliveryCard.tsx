import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import type { Order } from "../../../types/order.types";

interface Props {
  order: Order;
  onPress: () => void;
}

export default function ActiveDeliveryCard({ order, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open active delivery ${order._id.slice(-6)}`}
      onPress={onPress}
      className="mb-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm"
    >
      <View className="flex-row items-center">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
          <Ionicons name="bicycle" size={20} color="#059669" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-emerald-900">
            Active Delivery
          </Text>
          <Text className="mt-0.5 text-xs text-emerald-700">
            Order #{order._id.slice(-6).toUpperCase()} ·{" "}
            {order.status.replaceAll("_", " ")}
          </Text>
        </View>
        <View className="h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
          <Ionicons name="chevron-forward" size={16} color="#059669" />
        </View>
      </View>
      <Text className="mt-2 text-xs text-emerald-700" numberOfLines={1}>
        {order.deliveryAddress}
      </Text>
    </Pressable>
  );
}
