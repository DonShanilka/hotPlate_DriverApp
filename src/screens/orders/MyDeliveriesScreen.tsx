import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import ArrivedOrderCard from "../../components/orders/ArrivedOrderCard";
import { useOrder } from "../../context/OrderContext";

export default function MyDeliveriesScreen() {
  const router = useRouter();
  const { orders, loading, error, refreshOrders } = useOrder();

  return (
    <View className="flex-1 bg-slate-50">
      <View className="border-b border-slate-100 bg-white px-5 pb-4 pt-14">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-900">
              My Deliveries
            </Text>
            <Text className="mt-1 text-sm text-slate-500">
              Orders assigned to your driver account
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Refresh deliveries"
            disabled={loading}
            onPress={() => void refreshOrders().catch(() => undefined)}
            className="h-11 w-11 items-center justify-center rounded-full bg-emerald-50"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#059669" />
            ) : (
              <Ionicons name="refresh-outline" size={21} color="#059669" />
            )}
          </Pressable>
        </View>
        <View className="mt-3 self-start rounded-full bg-emerald-50 px-3 py-1.5">
          <Text className="text-xs font-semibold text-emerald-800">
            {orders.length} assigned {orders.length === 1 ? "order" : "orders"}
          </Text>
        </View>
      </View>

      {loading && orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <ActivityIndicator size="large" color="#059669" />
          <Text className="mt-3 text-sm text-slate-500">
            Loading deliveries...
          </Text>
        </View>
      ) : error && orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={42} color="#dc2626" />
          <Text className="mt-4 text-center font-semibold text-slate-900">
            Could not load deliveries
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
            {error}
          </Text>
          <Pressable
            onPress={() => void refreshOrders().catch(() => undefined)}
            className="mt-5 rounded-xl bg-emerald-600 px-5 py-3"
          >
            <Text className="font-semibold text-white">Try again</Text>
          </Pressable>
        </View>
      ) : orders.length === 0 ? (
        <ScrollView
          contentContainerClassName="flex-grow items-center justify-center px-8 py-10"
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => void refreshOrders().catch(() => undefined)}
              tintColor="#059669"
            />
          }
        >
          <View className="h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <Ionicons name="bicycle-outline" size={32} color="#059669" />
          </View>
          <Text className="mt-4 text-lg font-bold text-slate-900">
            No assigned deliveries
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
            Orders assigned to your driver profile will appear here. Pull down
            to refresh.
          </Text>
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-8 pt-4"
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => void refreshOrders().catch(() => undefined)}
              tintColor="#059669"
            />
          }
        >
          {orders.map((order) => (
            <Pressable
              key={order._id}
              accessibilityRole="button"
              accessibilityLabel={`Open order ${order._id}`}
              onPress={() =>
                router.push({
                  pathname: "/(driver)/active-order",
                  params: { orderId: order._id },
                })
              }
            >
              <ArrivedOrderCard order={order} />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
