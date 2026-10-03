import { Text, View } from "react-native";

import type { OrderItem } from "../../types/order.types";

interface Props {
  item: OrderItem;
}

const OrderItemRow = ({ item }: Props) => {
  const total = item.price * item.quantity;

  return (
    <View className="flex-row items-center justify-between py-2.5">
      <View className="flex-1 flex-row items-center">
        <Text className="mr-2.5 font-bold text-slate-700">
          {item.quantity} ×
        </Text>

        <View>
          <Text className="text-sm font-semibold text-slate-900">
            {item.name}
          </Text>

          {item.size ? (
            <Text className="mt-0.5 text-xs text-gray-500">{item.size}</Text>
          ) : null}
        </View>
      </View>

      <Text className="text-sm font-bold text-slate-900">
        Rs. {total.toFixed(2)}
      </Text>
    </View>
  );
};

export default OrderItemRow;
