import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
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

type FilterTab = "active" | "completed" | "all";

const TERMINAL_STATUSES = new Set(["DELIVERED", "CANCELLED"]);

export default function MyDeliveriesScreen() {
  const router = useRouter();
  const { orders, loading, error, refreshOrders } = useOrder();
  const [activeTab, setActiveTab] = useState<FilterTab>("active");

  // Cast once at the boundary — safe because the backend always
  // populates userId / restaurantId / driverId before returning orders.
  const populatedOrders = orders as unknown as PopulatedOrder[];

  // Filter orders based on the selected tab
  const filteredOrders = useMemo(() => {
    switch (activeTab) {
      case "active":
        return populatedOrders.filter(
          (o) => !TERMINAL_STATUSES.has(o.status),
        );
      case "completed":
        return populatedOrders.filter((o) =>
          TERMINAL_STATUSES.has(o.status),
        );
      case "all":
      default:
        return populatedOrders;
    }
  }, [populatedOrders, activeTab]);

  // Counts for the tab badges
  const activeCount = useMemo(
    () => populatedOrders.filter((o) => !TERMINAL_STATUSES.has(o.status)).length,
    [populatedOrders],
  );
  const completedCount = useMemo(
    () => populatedOrders.filter((o) => TERMINAL_STATUSES.has(o.status)).length,
    [populatedOrders],
  );

  const handleRefresh = () => {
    void refreshOrders().catch(() => undefined);
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "active", label: "Active", count: activeCount },
    { key: "completed", label: "Completed", count: completedCount },
    { key: "all", label: "All", count: populatedOrders.length },
  ];

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

        {/* ── Filter tabs ── */}
        <View className="mt-3 flex-row">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`mr-2 flex-row items-center rounded-full px-3.5 py-2 ${
                  isActive ? "bg-emerald-600" : "bg-slate-100"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isActive ? "text-white" : "text-slate-600"
                  }`}
                >
                  {tab.label}
                </Text>
                <View
                  className={`ml-1.5 min-w-[20px] items-center rounded-full px-1.5 py-0.5 ${
                    isActive ? "bg-white/20" : "bg-slate-200"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold ${
                      isActive ? "text-white" : "text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
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
      filteredOrders.length === 0 ? (
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
            <Ionicons
              name={
                activeTab === "completed"
                  ? "checkmark-circle-outline"
                  : "bicycle-outline"
              }
              size={32}
              color="#059669"
            />
          </View>
          <Text className="mt-4 text-lg font-bold text-slate-900">
            {activeTab === "active"
              ? "No active deliveries"
              : activeTab === "completed"
                ? "No completed deliveries"
                : "No assigned deliveries"}
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
            {activeTab === "active"
              ? "New orders assigned to you will appear here."
              : "Orders you've delivered will show up here."}
            {"\n"}Pull down to refresh.
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

          {filteredOrders.map((order) => (
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
