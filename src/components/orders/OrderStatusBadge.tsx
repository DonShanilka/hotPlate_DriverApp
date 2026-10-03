import { Text, View } from "react-native";

import { OrderStatus } from "../../types/order.types";

interface Props {
  status: OrderStatus;
}

const OrderStatusBadge = ({ status }: Props) => {
  const label = status.replaceAll("_", " ");

  return (
    <View className="self-start rounded-full bg-blue-50 px-2.5 py-1.5">
      <Text className="text-[11px] font-bold text-blue-900">{label}</Text>
    </View>
  );
};

export default OrderStatusBadge;
