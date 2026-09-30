import React from "react";

import { View, Text, StyleSheet } from "react-native";

import { OrderItem } from "../../types/order.types";

interface Props {
  item: OrderItem;
}

const OrderItemRow = ({ item }: Props) => {
  const total = item.price * item.quantity;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.quantity}>{item.quantity} ×</Text>

        <View>
          <Text style={styles.name}>{item.name}</Text>

          {item.size && <Text style={styles.size}>{item.size}</Text>}
        </View>
      </View>

      <Text style={styles.price}>Rs. {total.toFixed(2)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingVertical: 10,
  },

  left: {
    flexDirection: "row",

    alignItems: "center",

    flex: 1,
  },

  quantity: {
    fontWeight: "700",

    marginRight: 10,
  },

  name: {
    fontSize: 14,

    fontWeight: "600",
  },

  size: {
    fontSize: 12,

    color: "#777",

    marginTop: 3,
  },

  price: {
    fontSize: 14,

    fontWeight: "700",
  },
});

export default OrderItemRow;
