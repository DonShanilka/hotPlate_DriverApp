import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";

import ArrivedOrderCard from "../../components/driver/orders/ArrivedOrderCard";
import { useOrders } from "../../context/OrderContext";

export default function MyDeliveriesScreen() {
  const { arrivedOrders, loading, refreshing, error, refresh } = useOrders();
  console.log("Arrived order", arrivedOrders);

  return (
    <View className="flex-1 bg-slate-50">
      <View className="border-b border-slate-100 bg-white px-5 pb-4 pt-14">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-900">
              My Deliveries
            </Text>
            <Text className="mt-1 text-sm text-slate-500">
              Arrived orders assigned to your driver account
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Refresh arrived orders"
            onPress={refresh}
            disabled={refreshing || loading}
            className="h-11 w-11 items-center justify-center rounded-full bg-emerald-50"
          >
            {refreshing || loading ? (
              <ActivityIndicator size="small" color="#059669" />
            ) : (
              <Ionicons name="refresh-outline" size={21} color="#059669" />
            )}
          </Pressable>
        </View>
        {!loading && !error ? (
          <View className="mt-3 self-start rounded-full bg-emerald-50 px-3 py-1.5">
            <Text className="text-xs font-semibold text-emerald-800">
              {arrivedOrders.length} arrived{" "}
              {arrivedOrders.length === 1 ? "order" : "orders"}
            </Text>
          </View>
        ) : null}
      </View>

      {loading && arrivedOrders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <ActivityIndicator size="large" color="#059669" />
          <Text className="mt-3 text-sm text-slate-500">
            Loading your orders...
          </Text>
        </View>
      ) : error && arrivedOrders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <Ionicons name="alert-circle-outline" size={28} color="#dc2626" />
          </View>
          <Text className="mt-4 text-center font-semibold text-slate-900">
            Could not load deliveries
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
            {error}
          </Text>
          <Pressable
            onPress={refresh}
            className="mt-5 rounded-xl bg-emerald-600 px-5 py-3"
          >
            <Text className="font-semibold text-white">Try again</Text>
          </Pressable>
        </View>
      ) : arrivedOrders.length === 0 ? (
        <ScrollView
          contentContainerClassName="flex-grow items-center justify-center px-8 py-10"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor="#059669"
            />
          }
        >
          <View className="h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <Ionicons name="bicycle-outline" size={32} color="#059669" />
          </View>
          <Text className="mt-4 text-lg font-bold text-slate-900">
            No arrived orders
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
            Arrived orders assigned to your driver account will appear here.
            Pull down to refresh.
          </Text>
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-8 pt-4"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor="#059669"
            />
          }
        >
          {arrivedOrders.map((order) => (
            <ArrivedOrderCard key={String(order._id)} order={order} />
          ))}
          {error ? (
            <Text className="mt-2 text-center text-xs text-amber-700">
              Showing cached orders. Refresh failed: {error}
            </Text>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
