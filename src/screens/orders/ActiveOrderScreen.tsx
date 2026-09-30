import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useAppDispatch, useAppSelector } from "../../redux/store/hooks";
import {
  fetchOrderById,
  updateOrderStatus,
} from "../../redux/features/order/orderThunk";
import {
  OrderStatus,
  type Order,
  type OrderItem,
} from "../../types/order.types";

// ─── Populated sub-types (match backend .populate() output) ──────────────────

interface PopulatedRestaurant {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
}

interface PopulatedDriver {
  _id: string;
  vehicleType?: string;
  vehicleNumber?: string;
  phone?: string;
}

interface PopulatedUser {
  _id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}

// What the backend actually returns (populated fields replace raw IDs)
interface PopulatedOrder extends Omit<
  Order,
  "restaurantId" | "driverId" | "userId"
> {
  restaurantId: PopulatedRestaurant | string;
  driverId: PopulatedDriver | string | null;
  userId: PopulatedUser | string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getNextAction(
  status: OrderStatus,
): { label: string; next: OrderStatus } | null {
  switch (status) {
    case OrderStatus.DRIVER_ASSIGNED:
    case OrderStatus.READY_FOR_PICKUP:
      return { label: "Confirm pickup", next: OrderStatus.PICKED_UP };
    case OrderStatus.PICKED_UP:
      return { label: "Start delivery", next: OrderStatus.OUT_FOR_DELIVERY };
    case OrderStatus.OUT_FOR_DELIVERY:
    case OrderStatus.DELIVERING:
      return { label: "Arrived at customer", next: OrderStatus.ARRIVED };
    case OrderStatus.ARRIVED:
      return { label: "Complete delivery", next: OrderStatus.DELIVERED };
    default:
      return null;
  }
}

function restaurantName(r: PopulatedOrder["restaurantId"]): string {
  return typeof r === "object" && r ? r.name : "Restaurant";
}

function restaurantAddress(r: PopulatedOrder["restaurantId"]): string | null {
  return typeof r === "object" && r ? (r.address ?? null) : null;
}

function restaurantPhone(r: PopulatedOrder["restaurantId"]): string | null {
  return typeof r === "object" && r ? (r.phone ?? null) : null;
}

function driverLine(d: PopulatedOrder["driverId"]): string | null {
  if (!d || typeof d !== "object") return null;
  return [d.vehicleType, d.vehicleNumber].filter(Boolean).join(" · ") || null;
}

function driverPhone(d: PopulatedOrder["driverId"]): string | null {
  return d && typeof d === "object" ? (d.phone ?? null) : null;
}

function customerName(u: PopulatedOrder["userId"]): string | null {
  if (!u || typeof u !== "object") return null;
  return [u.first_name, u.last_name].filter(Boolean).join(" ") || null;
}

function customerPhone(u: PopulatedOrder["userId"]): string | null {
  return u && typeof u === "object" ? (u.phone ?? null) : null;
}

function formatMoney(value: number): string {
  return `LKR ${value.toLocaleString()}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="mb-3 text-base font-bold text-slate-900">{title}</Text>
  );
}

function InfoRow({
  icon,
  value,
  selectable = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value: string | null | undefined;
  selectable?: boolean;
}) {
  if (!value) return null;
  return (
    <View className="mb-2 flex-row items-start">
      <Ionicons name={icon} size={18} color="#059669" />
      <Text
        selectable={selectable}
        className="ml-2.5 flex-1 text-sm leading-5 text-slate-700"
      >
        {value}
      </Text>
    </View>
  );
}

function LabelRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <View className="mt-2 flex-row justify-between">
      <Text className="text-sm text-slate-500">{label}</Text>
      <Text className="text-sm font-semibold text-slate-800">{value}</Text>
    </View>
  );
}

function PriceRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: number | undefined;
  strong?: boolean;
}) {
  if (value === undefined) return null;
  return (
    <View className="flex-row justify-between">
      <Text
        className={
          strong ? "font-bold text-slate-900" : "text-sm text-slate-500"
        }
      >
        {label}
      </Text>
      <Text
        className={
          strong
            ? "font-bold text-slate-900"
            : "text-sm font-medium text-slate-700"
        }
      >
        {formatMoney(value)}
      </Text>
    </View>
  );
}

function ItemLine({ item }: { item: OrderItem }) {
  const productName =
    item.name ??
    (item as unknown as { productId?: { name?: string } }).productId?.name ??
    "Item";
  return (
    <View className="flex-row items-start justify-between border-b border-slate-100 py-3">
      <View className="flex-1 flex-row pr-3">
        <Text className="mr-2 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
          {item.quantity}×
        </Text>
        <View className="flex-1">
          <Text className="font-medium text-slate-900">{productName}</Text>
          {item.size ? (
            <Text className="mt-0.5 text-xs text-slate-500">{item.size}</Text>
          ) : null}
        </View>
      </View>
      <Text className="font-semibold text-slate-800">
        {formatMoney(item.price * item.quantity)}
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ActiveOrderScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { orderId: rawOrderId } = useLocalSearchParams<{
    orderId?: string | string[];
  }>();
  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;

  // Pull from both the list and the dedicated activeOrder slot
  const rawOrder = useAppSelector(
    (state) =>
      state.orders.orders.find((o) => o._id === orderId) ??
      (state.orders.activeOrder?._id === orderId
        ? state.orders.activeOrder
        : null),
  );
  const order = rawOrder as PopulatedOrder | null;
  const loading = useAppSelector((state) => state.orders.loading);
  const updating = useAppSelector((state) => state.orders.updating);
  const error = useAppSelector((state) => state.orders.error);

  // Fetch if not already in store
  useEffect(() => {
    if (orderId && !order) void dispatch(fetchOrderById(orderId));
  }, [dispatch, orderId, order]);

  const handleStatusChange = async (next: OrderStatus) => {
    if (!order) return;
    try {
      await dispatch(
        updateOrderStatus({ orderId: order._id, status: next }),
      ).unwrap();
      if (next === OrderStatus.DELIVERED) {
        Alert.alert(
          "Delivery complete",
          "The order has been marked as delivered.",
          [{ text: "Done", onPress: () => router.back() }],
        );
      }
    } catch (err) {
      Alert.alert("Could not update order", String(err));
    }
  };

  // ── Loading state ──
  if (loading && !order) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="mt-3 text-slate-500">Loading order…</Text>
      </View>
    );
  }

  // ── Not found ──
  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-8">
        <Ionicons name="alert-circle-outline" size={42} color="#dc2626" />
        <Text className="mt-3 text-lg font-bold text-slate-900">
          Order not found
        </Text>
        <Text className="mt-2 text-center text-sm text-slate-500">
          {error ?? "This order may no longer be assigned to you."}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-5 rounded-xl bg-emerald-600 px-5 py-3"
        >
          <Text className="font-semibold text-white">Go back</Text>
        </Pressable>
      </View>
    );
  }

  // ── Derived values ──
  const action = getNextAction(order.status);
  const currency =
    (order as unknown as { currency?: string }).currency ?? "LKR";
  const custName = customerName(order.userId);
  const custPhone = order.phoneNumber ?? customerPhone(order.userId);
  const drvLine = driverLine(order.driverId);
  const drvPhone = driverPhone(order.driverId);

  return (
    <View className="flex-1 bg-slate-50">
      {/* ── Top bar ── */}
      <View className="flex-row items-center border-b border-slate-100 bg-white px-5 pb-4 pt-14">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-slate-100"
        >
          <Ionicons name="arrow-back" size={20} color="#334155" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-xl font-bold text-slate-900">
            Order #{order._id.slice(-6).toUpperCase()}
          </Text>
          <Text className="mt-0.5 text-xs text-slate-500">
            {formatDate(order.createdAt)}
          </Text>
        </View>
        <Text className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">
          {order.status.replaceAll("_", " ")}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 px-4 py-4 pb-8"
      >
        {/* ── Restaurant ── */}
        <View className="rounded-2xl bg-white p-4">
          <SectionHeader title="Restaurant" />
          <View className="flex-row items-start">
            <Ionicons name="restaurant-outline" size={19} color="#059669" />
            <View className="ml-2.5 flex-1">
              <Text className="font-semibold text-slate-900">
                {restaurantName(order.restaurantId)}
              </Text>
              {restaurantAddress(order.restaurantId) ? (
                <Text className="mt-1 text-sm text-slate-500">
                  {restaurantAddress(order.restaurantId)}
                </Text>
              ) : null}
              {restaurantPhone(order.restaurantId) ? (
                <Text className="mt-1 text-sm text-slate-500">
                  {restaurantPhone(order.restaurantId)}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* ── Customer ── */}
        {custName || custPhone ? (
          <View className="rounded-2xl bg-white p-4">
            <SectionHeader title="Customer" />
            <InfoRow icon="person-outline" value={custName} />
            <InfoRow icon="call-outline" value={custPhone} selectable />
          </View>
        ) : null}

        {/* ── Driver ── */}
        {drvLine || drvPhone ? (
          <View className="rounded-2xl bg-white p-4">
            <SectionHeader title="Your vehicle" />
            <InfoRow icon="car-outline" value={drvLine} />
            <InfoRow icon="call-outline" value={drvPhone} selectable />
          </View>
        ) : null}

        {/* ── Delivery details ── */}
        <View className="rounded-2xl bg-white p-4">
          <SectionHeader title="Delivery details" />
          <InfoRow
            icon="location-outline"
            value={order.deliveryAddress}
            selectable
          />
          {order.deliveryLocation ? (
            <InfoRow
              icon="navigate-outline"
              value={(() => {
                const loc = order.deliveryLocation as {
                  latitude?: number;
                  longitude?: number;
                  lat?: number;
                  lng?: number;
                  coordinates?: [number, number];
                };
                const lat = loc.latitude ?? loc.lat;
                const lng = loc.longitude ?? loc.lng;
                if (typeof lat === "number" && typeof lng === "number") {
                  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                }
                if (
                  Array.isArray(loc.coordinates) &&
                  loc.coordinates.length >= 2
                ) {
                  return `${loc.coordinates[1]}, ${loc.coordinates[0]}`;
                }
                return null;
              })()}
              selectable
            />
          ) : null}
          {order.estimatedDeliveryTime ? (
            <InfoRow
              icon="timer-outline"
              value={`Est. ${order.estimatedDeliveryTime} min`}
            />
          ) : null}
          {order.notes ? (
            <Text className="mt-2 rounded-xl bg-amber-50 p-3 text-sm leading-5 text-amber-900">
              Note: {order.notes}
            </Text>
          ) : null}
        </View>

        {/* ── Items ── */}
        <View className="rounded-2xl bg-white p-4">
          <SectionHeader title="Order items" />
          {order.items.map((item, index) => (
            <ItemLine
              key={`${(item as { foodId?: string }).foodId ?? item.name ?? index}-${index}`}
              item={item}
            />
          ))}
          <View className="mt-3 gap-2">
            <PriceRow label="Subtotal" value={order.subtotal} />
            <PriceRow label="Delivery fee" value={order.deliveryFee} />
            <PriceRow label="Total" value={order.totalAmount} strong />
          </View>
        </View>

        {/* ── Payment ── */}
        <View className="rounded-2xl bg-white p-4">
          <SectionHeader title="Payment" />
          <LabelRow label="Method" value={order.paymentMethod} />
          <LabelRow label="Status" value={order.paymentStatus} />
          {currency !== "LKR" ? (
            <LabelRow label="Currency" value={currency} />
          ) : null}
        </View>

        {/* ── Map button ── */}
        {order.deliveryLocation ? (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(driver)/tracking",
                params: { orderId: order._id },
              })
            }
            className="min-h-12 flex-row items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50"
          >
            <Ionicons name="map-outline" size={19} color="#047857" />
            <Text className="ml-2 font-semibold text-emerald-800">
              Open delivery map
            </Text>
          </Pressable>
        ) : null}

        {/* ── Status action button ── */}
        {action ? (
          <Pressable
            disabled={updating}
            onPress={() => void handleStatusChange(action.next)}
            className={`min-h-14 items-center justify-center rounded-2xl ${
              updating ? "bg-slate-400" : "bg-emerald-600"
            }`}
          >
            {updating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-bold text-white">
                {action.label}
              </Text>
            )}
          </Pressable>
        ) : /* Terminal states — show a clear read-only badge */
        order.status === OrderStatus.DELIVERED ||
          order.status === OrderStatus.CANCELLED ? (
          <View className="min-h-12 items-center justify-center rounded-2xl bg-slate-100">
            <Text className="font-semibold text-slate-500">
              {order.status === OrderStatus.DELIVERED
                ? "Delivery complete"
                : "Order cancelled"}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
