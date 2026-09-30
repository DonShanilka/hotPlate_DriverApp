import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Order } from "../../types/order.types";
import OrderStatusBadge from "./OrderStatusBadge";

interface Props {order: Order; onPress: () => void;}

const OrderCard = ({ order, onPress }: Props) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.card}>
      <View style={styles.top}>
        <View>
          <Text style={styles.orderNumber}>
            Order #{order._id.slice(-6).toUpperCase()}
          </Text>

          <Text style={styles.date}>
            {new Date(order.createdAt).toLocaleString()}
          </Text>
        </View>

        <OrderStatusBadge status={order.status} />
      </View>

      <View style={styles.line} />

      <Text style={styles.label}>Delivery Address</Text>

      <Text style={styles.address} numberOfLines={2}>
        {order.deliveryAddress}
      </Text>

      <View style={styles.line} />

      <View style={styles.bottom}>
        <View>
          <Text style={styles.items}>{order.items.length} items</Text>

          <Text style={styles.payment}>{order.paymentMethod}</Text>
        </View>

        <Text style={styles.amount}>Rs. {order.totalAmount.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    padding: 16,

    marginBottom: 14,

    elevation: 3,

    shadowOpacity: 0.08,

    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  top: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-start",
  },

  orderNumber: {
    fontSize: 17,

    fontWeight: "800",
  },

  date: {
    marginTop: 4,

    color: "#777",

    fontSize: 11,
  },

  line: {
    height: 1,

    backgroundColor: "#EEEEEE",

    marginVertical: 14,
  },

  label: {
    fontSize: 11,

    color: "#888",

    marginBottom: 4,
  },

  address: {
    fontSize: 14,

    fontWeight: "600",

    lineHeight: 20,
  },

  bottom: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  items: {
    fontSize: 13,

    fontWeight: "700",
  },

  payment: {
    marginTop: 4,

    fontSize: 11,

    color: "#777",
  },

  amount: {
    fontSize: 18,

    fontWeight: "800",
  },
});

export default OrderCard;
