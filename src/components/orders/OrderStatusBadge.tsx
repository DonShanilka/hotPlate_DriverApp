import React from "react";

import { View, Text, StyleSheet } from "react-native";

import { OrderStatus } from "../../types/order.types";

interface Props {
  status: OrderStatus;
}

const OrderStatusBadge = ({ status }: Props) => {
  const label = status.replaceAll("_", " ");

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#EAF4FF",

    paddingHorizontal: 10,

    paddingVertical: 6,

    borderRadius: 20,

    alignSelf: "flex-start",
  },

  text: {
    fontSize: 11,

    fontWeight: "700",
  },
});

export default OrderStatusBadge;
