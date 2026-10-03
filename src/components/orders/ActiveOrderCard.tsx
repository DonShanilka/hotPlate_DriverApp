import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import type { Order } from "../../types/order.types";

// Helper to resolve populated references for restaurant or user
function resolveName(ref: unknown): string | null {
  if (ref && typeof ref === "object") {
    if ("name" in ref) return String((ref as { name: string }).name);
    if ("first_name" in ref) {
      const u = ref as { first_name: string; last_name?: string };
      return `${u.first_name} ${u.last_name || ""}`.trim();
    }
  }
  return null;
}

export default function ActiveOrderCard({ order }: { order: Order }) {
  const router = useRouter();
  if (!order) return null;

  const orderId = order._id.slice(-6).toUpperCase();
  const statusLabel = order.status.replaceAll("_", " ");
  const restaurantName = resolveName(order.restaurantId) || "Restaurant";

  // Calculate total items
  const itemCount = Array.isArray(order.items)
    ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
    : 0;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: "/(driver)/active-order",
          params: { orderId: order._id },
        })
      }
      className="mb-4 overflow-hidden rounded-3xl bg-emerald-700 shadow-md active:bg-emerald-800"
    >
      {/* ── Header section with status ── */}
      <View className="flex-row items-center justify-between bg-emerald-800/40 px-5 py-3">
        <View className="flex-row items-center">
          <View className="mr-2 h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-sm" />
          <Text className="text-xs font-bold uppercase tracking-wider text-emerald-100">
            {statusLabel}
          </Text>
        </View>
        <Text className="text-xs font-medium text-emerald-200">#{orderId}</Text>
      </View>

      {/* ── Main Content: Route visualization ── */}
      <View className="px-5 py-4">
        <View className="flex-row items-start">
          {/* Icons and line */}
          <View className="mr-3 items-center justify-center pt-1">
            <Ionicons name="restaurant" size={16} color="#a7f3d0" />
            <View className="my-1.5 h-6 w-0.5 bg-emerald-500/50" />
            <Ionicons name="location" size={16} color="#fbbf24" />
          </View>

          {/* Text details */}
          <View className="flex-1">
            <View className="min-h-[24px] justify-center">
              <Text className="text-sm font-bold text-white" numberOfLines={1}>
                {restaurantName}
              </Text>
            </View>
            <View className="h-4" /> {/* Spacer matching the line */}
            <View className="min-h-[24px] justify-center">
              <Text
                className="text-sm font-medium leading-5 text-emerald-50"
                numberOfLines={2}
              >
                {order.deliveryAddress}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Footer / CTA ── */}
      <View className="flex-row items-center justify-between border-t border-emerald-600/50 bg-emerald-800/20 px-5 py-3">
        <Text className="text-xs font-medium text-emerald-200">
          {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
          {order.paymentMethod?.replaceAll("_", " ") || "CASH"}
        </Text>
        <View className="flex-row items-center rounded-full bg-emerald-600/80 px-3 py-1.5">
          <Text className="mr-1 text-xs font-bold text-white">
            View details
          </Text>
          <Ionicons name="arrow-forward" size={12} color="#fff" />
        </View>
      </View>
    </Pressable>
  );
}
