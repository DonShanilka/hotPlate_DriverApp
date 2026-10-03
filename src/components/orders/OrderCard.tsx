import { Text, TouchableOpacity, View } from "react-native";

import type { Order } from "../../types/order.types";
import OrderStatusBadge from "./OrderStatusBadge";

interface Props {
  order: Order;
  onPress: () => void;
}

export default function OrderCard({ order, onPress }: Props) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.8}
      onPress={onPress}
      className="mb-3.5 rounded-[18px] bg-white p-4 shadow-md"
    >
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-[17px] font-extrabold text-slate-900">
            Order #{order._id.slice(-6).toUpperCase()}
          </Text>
          <Text className="mt-1 text-[11px] text-gray-500">
            {new Date(order.createdAt).toLocaleString()}
          </Text>
        </View>
        <OrderStatusBadge status={order.status} />
      </View>

      <View className="my-3.5 h-px bg-gray-100" />

      <Text className="mb-1 text-[11px] text-gray-500">Delivery Address</Text>
      <Text
        className="text-sm font-semibold leading-5 text-slate-900"
        numberOfLines={2}
      >
        {order.deliveryAddress}
      </Text>

      <View className="my-3.5 h-px bg-gray-100" />

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[13px] font-bold text-slate-900">
            {order.items.length} items
          </Text>
          <Text className="mt-1 text-[11px] text-gray-500">
            {order.paymentMethod}
          </Text>
        </View>
        <Text className="text-lg font-extrabold text-slate-900">
          Rs. {order.totalAmount.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
