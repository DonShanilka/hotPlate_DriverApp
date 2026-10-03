import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";

// ─── Types matching your backend populate() output ───────────────────────────

interface PopulatedUser {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface PopulatedRestaurant {
  _id: string;
  name: string;
  address: string;
  phone: string;
}

interface PopulatedDriver {
  _id: string;
  vehicleType: string;
  vehicleNumber: string;
  phone: string;
}

interface OrderItem {
  _id?: string;
  name: string;
  quantity: number;
  price: number;
  size?: string;
  foodId?: string;
  productId?: {
    _id: string;
    name: string;
  };
}

interface DeliveryLocation {
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  coordinates?: [number, number]; // [lng, lat] GeoJSON
}

// The shape your backend actually returns for a driver's order
export interface PopulatedOrder {
  _id: string;
  userId: PopulatedUser | string;
  restaurantId: PopulatedRestaurant | string;
  driverId: PopulatedDriver | string | null;
  items: OrderItem[];
  status: string;
  deliveryAddress: string;
  deliveryLocation?: DeliveryLocation;
  phoneNumber?: string; // top-level phone if stored on order
  subtotal?: number;
  deliveryFee?: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
  currency?: string;
  estimatedDeliveryTime?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function asPopulatedUser(value: unknown): PopulatedUser | null {
  if (value && typeof value === "object" && "first_name" in value) {
    return value as PopulatedUser;
  }
  return null;
}

function asPopulatedRestaurant(value: unknown): PopulatedRestaurant | null {
  if (value && typeof value === "object" && "name" in value) {
    return value as PopulatedRestaurant;
  }
  return null;
}

function formatMoney(value: number | undefined | null): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value.toLocaleString();
}

function timeAgo(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;

  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Status styling ──────────────────────────────────────────────────────────

function getStatusConfig(status: string): {
  bg: string;
  dot: string;
  text: string;
  icon: ComponentProps<typeof Ionicons>["name"];
} {
  switch (status?.toUpperCase()) {
    case "ARRIVED":
    case "DELIVERED":
      return {
        bg: "bg-emerald-100",
        dot: "bg-emerald-600",
        text: "text-emerald-800",
        icon: "checkmark-circle-outline",
      };
    case "CANCELLED":
      return {
        bg: "bg-red-100",
        dot: "bg-red-600",
        text: "text-red-800",
        icon: "close-circle-outline",
      };
    case "OUT_FOR_DELIVERY":
    case "DELIVERING":
    case "PICKED_UP":
      return {
        bg: "bg-blue-100",
        dot: "bg-blue-600",
        text: "text-blue-800",
        icon: "bicycle-outline",
      };
    case "DRIVER_ASSIGNED":
    case "READY_FOR_PICKUP":
      return {
        bg: "bg-violet-100",
        dot: "bg-violet-600",
        text: "text-violet-800",
        icon: "restaurant-outline",
      };
    default:
      return {
        bg: "bg-amber-100",
        dot: "bg-amber-600",
        text: "text-amber-800",
        icon: "time-outline",
      };
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ArrivedOrderCard({ order }: { order: PopulatedOrder }) {
  // Resolve populated vs ID-only references
  const customer = asPopulatedUser(order.userId);
  console.log("C", customer);
  const restaurant = asPopulatedRestaurant(order.restaurantId);
  console.log("R", restaurant);
  // Derived values
  const orderId = order._id.slice(-6).toUpperCase();
  console.log("orderId", orderId);
  const statusLabel = order.status.replaceAll("_", " ");
  console.log("statusLabel", statusLabel);
  const statusConfig = getStatusConfig(order.status);
  console.log("statusConfig", statusConfig);
  const currency = order.currency ?? "LKR";
  console.log("currency", currency);
  const total = formatMoney(order.totalAmount);
  console.log("total", total);
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
  console.log("itemCount", itemCount);

  const customerName = customer
    ? [customer.first_name, customer.last_name].filter(Boolean).join(" ")
    : null;

  const restaurantName = restaurant?.name ?? null;
  const placedTime = timeAgo(order.createdAt);

  return (
    <View className="mb-3 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      {/* ── Header row ── */}
      <View className="flex-row items-center justify-between border-b border-slate-50 px-4 py-3">
        <View className="flex-row items-center flex-1 pr-3">
          <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
            <Ionicons name={statusConfig.icon} size={18} color="#059669" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-slate-900">#{orderId}</Text>
            <Text className="text-xs text-slate-400">{placedTime}</Text>
          </View>
        </View>
        <View
          className={`flex-row items-center rounded-full px-2.5 py-1 ${statusConfig.bg}`}
        >
          <View
            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
          />
          <Text
            className={`text-[10px] font-bold uppercase ${statusConfig.text}`}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      <View className="px-4 py-3">
        {/* ── Restaurant ── */}
        {restaurantName ? (
          <View className="mb-2.5 flex-row items-center">
            <Ionicons name="restaurant-outline" size={15} color="#059669" />
            <Text
              className="ml-2 flex-1 text-sm font-semibold text-slate-800"
              numberOfLines={1}
            >
              {restaurantName}
            </Text>
          </View>
        ) : null}

        {/* ── Customer ── */}
        {customerName ? (
          <View className="mb-2.5 flex-row items-center">
            <Ionicons name="person-outline" size={15} color="#64748b" />
            <Text
              className="ml-2 flex-1 text-sm text-slate-700"
              numberOfLines={1}
            >
              {customerName}
            </Text>
          </View>
        ) : null}

        {/* ── Delivery address ── */}
        <View className="mb-2.5 flex-row items-start">
          <Ionicons
            name="location-outline"
            size={15}
            color="#64748b"
            style={{ marginTop: 1 }}
          />
          <Text
            className="ml-2 flex-1 text-sm leading-5 text-slate-600"
            numberOfLines={2}
          >
            {order.deliveryAddress}
          </Text>
        </View>

        {/* ── Notes indicator ── */}
        {order.notes ? (
          <View className="mb-2.5 flex-row items-center rounded-lg bg-amber-50 px-2.5 py-1.5">
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={13}
              color="#92400e"
            />
            <Text
              className="ml-1.5 flex-1 text-xs text-amber-800"
              numberOfLines={1}
            >
              {order.notes}
            </Text>
          </View>
        ) : null}

        {/* ── Footer: items count + total ── */}
        <View className="flex-row items-center justify-between border-t border-slate-50 pt-2.5">
          <View className="flex-row items-center">
            <View className="rounded-md bg-slate-100 px-2 py-1">
              <Text className="text-xs font-semibold text-slate-600">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </Text>
            </View>
            {order.paymentMethod ? (
              <View className="ml-2 flex-row items-center rounded-md bg-slate-50 px-2 py-1">
                <Ionicons name="card-outline" size={12} color="#64748b" />
                <Text className="ml-1 text-xs text-slate-500">
                  {order.paymentMethod.replaceAll("_", " ")}
                </Text>
              </View>
            ) : null}
          </View>
          {total ? (
            <Text className="text-base font-bold text-slate-900">
              {currency} {total}
            </Text>
          ) : null}
        </View>
      </View>

      {/* ── Tap hint ── */}
      <View className="flex-row items-center justify-center border-t border-slate-50 bg-slate-50/50 py-2">
        <Text className="text-[11px] font-medium text-slate-400">
          Tap to view details
        </Text>
        <Ionicons
          name="chevron-forward"
          size={12}
          color="#94a3b8"
          style={{ marginLeft: 2 }}
        />
      </View>
    </View>
  );
}
