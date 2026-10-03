import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import type { Order } from "../../types/order.types";

interface Props {
  orders: Order[];
  isOnline: boolean;
  hasActiveOrder: boolean;
  hasDriverProfile: boolean;
  acceptingOrderId: string | null;
  error: string | null;
  loading: boolean;
  onAccept: (orderId: string) => void;
  onDecline: (orderId: string) => void;
  onRefresh: () => void;
}

export default function UnassignedOrders({
  orders,
  isOnline,
  hasActiveOrder,
  hasDriverProfile,
  acceptingOrderId,
  error,
  loading,
  onAccept,
  onDecline,
  onRefresh,
}: Props) {
  return (
    <View className="mb-3 rounded-2xl bg-white p-4 shadow-sm">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="receipt-outline" size={19} color="#047857" />
          <Text className="ml-2 text-sm font-bold text-slate-900">
            Available orders
          </Text>
          {isOnline ? (
            <Text className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
              {orders.length}
            </Text>
          ) : null}
        </View>
        {isOnline ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Refresh available orders"
            onPress={onRefresh}
            className="h-9 w-9 items-center justify-center rounded-full bg-slate-100"
          >
            <Ionicons name="refresh-outline" size={18} color="#475569" />
          </Pressable>
        ) : null}
      </View>

      {!isOnline ? (
        <Text className="text-xs leading-5 text-slate-500">
          Go online to see and accept unassigned delivery orders.
        </Text>
      ) : error ? (
        <Text
          accessibilityRole="alert"
          className="text-xs leading-5 text-red-700"
        >
          {error}
        </Text>
      ) : loading && orders.length === 0 ? (
        <View className="flex-row items-center py-2">
          <ActivityIndicator size="small" color="#059669" />
          <Text className="ml-2 text-xs text-slate-500">
            Checking for available orders...
          </Text>
        </View>
      ) : orders.length === 0 ? (
        <Text className="text-xs leading-5 text-slate-500">
          No valid unassigned orders right now. New orders are checked every 8
          seconds. Skipped offers can appear again on the next refresh.
        </Text>
      ) : (
        <ScrollView
          className="max-h-56"
          nestedScrollEnabled
          showsVerticalScrollIndicator
        >
          {orders.map((order) => {
            const isAccepting = acceptingOrderId === order._id;
            const acceptingAny = acceptingOrderId !== null;
            const cannotAccept = hasActiveOrder || !hasDriverProfile;

            return (
              <View
                key={order._id}
                className="mb-2 rounded-xl border border-slate-200 p-3"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-2">
                    <Text className="text-sm font-bold text-slate-900">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </Text>
                    <Text
                      className="mt-1 text-xs leading-4 text-slate-600"
                      numberOfLines={2}
                    >
                      {order.deliveryAddress}
                    </Text>
                    <Text className="mt-1 text-xs font-semibold text-slate-700">
                      {order.items?.length ?? 0} items · LKR{" "}
                      {(order.totalAmount ?? 0).toLocaleString()}
                    </Text>
                  </View>
                  <Text className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">
                    PENDING
                  </Text>
                </View>
                <View className="mt-3 flex-row gap-2">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Skip order ${order._id.slice(-6)}`}
                    disabled={acceptingAny}
                    onPress={() => onDecline(order._id)}
                    className="min-h-10 flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white"
                  >
                    <Text className="text-xs font-bold text-slate-700">
                      Skip
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Accept order ${order._id.slice(-6)}`}
                    disabled={acceptingAny || cannotAccept}
                    onPress={() => onAccept(order._id)}
                    className={`min-h-10 flex-1 flex-row items-center justify-center rounded-lg ${
                      acceptingAny || cannotAccept
                        ? "bg-slate-300"
                        : "bg-emerald-600"
                    }`}
                  >
                    {isAccepting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-xs font-bold text-white">
                        {hasActiveOrder
                          ? "Finish current order"
                          : hasDriverProfile
                            ? "Accept order"
                            : "Driver profile required"}
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
