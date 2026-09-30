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

import ArrivedOrderCard, {
  type PopulatedOrder,
} from "../../components/orders/ArrivedOrderCard";
import { useOrder } from "../../context/OrderContext";

export default function MyDeliveriesScreen() {
  const router = useRouter();
  const { orders, loading, error, refreshOrders } = useOrder();

  // Cast once at the boundary — safe because the backend always
  // populates userId / restaurantId / driverId before returning orders.
  const populatedOrders = orders as unknown as PopulatedOrder[];

  const handleRefresh = () => {
    void refreshOrders().catch(() => undefined);
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* ── Header ── */}
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
            onPress={handleRefresh}
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
            {populatedOrders.length}{" "}
            {populatedOrders.length === 1 ? "order" : "orders"} assigned
          </Text>
        </View>
      </View>

      {/* ── Body ── */}

      {/* Initial load spinner */}
      {loading && populatedOrders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <ActivityIndicator size="large" color="#059669" />
          <Text className="mt-3 text-sm text-slate-500">
            Loading deliveries…
          </Text>
        </View>
      ) : /* Error with no cached orders */
      error && populatedOrders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={42} color="#dc2626" />
          <Text className="mt-4 text-center font-semibold text-slate-900">
            Could not load deliveries
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
            {error}
          </Text>
          <Pressable
            onPress={handleRefresh}
            className="mt-5 rounded-xl bg-emerald-600 px-5 py-3"
          >
            <Text className="font-semibold text-white">Try again</Text>
          </Pressable>
        </View>
      ) : /* Empty state — pull to refresh available */
      populatedOrders.length === 0 ? (
        <ScrollView
          contentContainerClassName="flex-grow items-center justify-center px-8 py-10"
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
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
            Orders assigned to your driver profile will appear here.{"\n"}
            Pull down to refresh.
          </Text>
        </ScrollView>
      ) : (
        /* Order list */
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-8 pt-4"
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              tintColor="#059669"
            />
          }
        >
          {/* Stale-data banner — shown when a refresh failed but we still
              have cached orders to display */}
          {error ? (
            <View className="mb-3 flex-row items-center rounded-xl bg-amber-50 px-4 py-3">
              <Ionicons name="warning-outline" size={17} color="#92400e" />
              <Text className="ml-2 flex-1 text-xs leading-4 text-amber-900">
                Could not refresh: {error}
              </Text>
              <Pressable onPress={handleRefresh} className="ml-3">
                <Text className="text-xs font-semibold text-amber-800">
                  Retry
                </Text>
              </Pressable>
            </View>
          ) : null}

          {populatedOrders.map((order) => (
            <Pressable
              key={order._id}
              accessibilityRole="button"
              accessibilityLabel={`Open order ${order._id.slice(-6).toUpperCase()}`}
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
