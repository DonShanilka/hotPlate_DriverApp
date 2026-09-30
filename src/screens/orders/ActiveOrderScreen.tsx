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

function getNextAction(
  status: OrderStatus,
): { label: string; status: OrderStatus } | null {
  switch (status) {
    case OrderStatus.DRIVER_ASSIGNED:
    case OrderStatus.READY_FOR_PICKUP:
      return { label: "Confirm pickup", status: OrderStatus.PICKED_UP };
    case OrderStatus.PICKED_UP:
      return { label: "Start delivery", status: OrderStatus.OUT_FOR_DELIVERY };
    case OrderStatus.OUT_FOR_DELIVERY:
    case OrderStatus.DELIVERING:
      return { label: "Arrived at customer", status: OrderStatus.ARRIVED };
    case OrderStatus.ARRIVED:
      return { label: "Complete delivery", status: OrderStatus.DELIVERED };
    default:
      return null;
  }
}

function personName(value: Order["restaurantId"]): string {
  return typeof value === "object" && value ? value.name : "Restaurant";
}

function formatMoney(value: number): string {
  return `LKR ${value.toLocaleString()}`;
}

function ItemLine({ item }: { item: OrderItem }) {
  return (
    <View className="flex-row items-start justify-between border-b border-slate-100 py-3">
      <View className="flex-1 flex-row pr-3">
        <Text className="mr-2 rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
          {item.quantity}×
        </Text>
        <View className="flex-1">
          <Text className="font-medium text-slate-900">{item.name}</Text>
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

export default function ActiveOrderScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { orderId: rawOrderId } = useLocalSearchParams<{
    orderId?: string | string[];
  }>();
  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;
  const order = useAppSelector(
    (state) =>
      state.orders.orders.find((item) => item._id === orderId) ??
      (state.orders.activeOrder?._id === orderId
        ? state.orders.activeOrder
        : null),
  );
  const loading = useAppSelector((state) => state.orders.loading);
  const updating = useAppSelector((state) => state.orders.updating);
  const error = useAppSelector((state) => state.orders.error);

  useEffect(() => {
    if (orderId && !order) void dispatch(fetchOrderById(orderId));
  }, [dispatch, orderId, order]);

  const handleStatusChange = async (nextStatus: OrderStatus) => {
    if (!order) return;
    try {
      await dispatch(
        updateOrderStatus({ orderId: order._id, status: nextStatus }),
      ).unwrap();
      if (nextStatus === OrderStatus.DELIVERED) {
        Alert.alert(
          "Delivery complete",
          "The order has been marked delivered.",
          [{ text: "Done", onPress: () => router.back() }],
        );
      }
    } catch (updateError) {
      Alert.alert("Could not update order", String(updateError));
    }
  };

  if (loading && !order) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="mt-3 text-slate-500">Loading order...</Text>
      </View>
    );
  }

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

  const action = getNextAction(order.status);
  const createdAt = new Date(order.createdAt);

  return (
    <View className="flex-1 bg-slate-50">
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
            {Number.isNaN(createdAt.getTime())
              ? order.createdAt
              : createdAt.toLocaleString()}
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
        <View className="rounded-2xl bg-white p-4">
          <Text className="mb-3 text-base font-bold text-slate-900">
            Restaurant
          </Text>
          <View className="flex-row items-start">
            <Ionicons name="restaurant-outline" size={19} color="#059669" />
            <View className="ml-2.5 flex-1">
              <Text className="font-semibold text-slate-900">
                {personName(order.restaurantId)}
              </Text>
              {typeof order.restaurantId === "object" &&
              order.restaurantId?.address ? (
                <Text className="mt-1 text-sm text-slate-500">
                  {order.restaurantId.address}
                </Text>
              ) : null}
              {typeof order.restaurantId === "object" &&
              order.restaurantId?.phone ? (
                <Text className="mt-1 text-sm text-slate-500">
                  {order.restaurantId.phone}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        <View className="rounded-2xl bg-white p-4">
          <Text className="mb-3 text-base font-bold text-slate-900">
            Delivery details
          </Text>
          <View className="mb-3 flex-row items-start">
            <Ionicons name="location-outline" size={19} color="#059669" />
            <Text
              selectable
              className="ml-2.5 flex-1 text-sm leading-5 text-slate-700"
            >
              {order.deliveryAddress}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="call-outline" size={19} color="#059669" />
            <Text selectable className="ml-2.5 text-sm text-slate-700">
              {order.phoneNumber}
            </Text>
          </View>
          {order.notes ? (
            <Text className="mt-3 rounded-xl bg-amber-50 p-3 text-sm leading-5 text-amber-900">
              Note: {order.notes}
            </Text>
          ) : null}
        </View>

        <View className="rounded-2xl bg-white p-4">
          <Text className="mb-1 text-base font-bold text-slate-900">
            Order items
          </Text>
          {order.items.map((item, index) => (
            <ItemLine
              key={`${item.foodId ?? item.name}-${index}`}
              item={item}
            />
          ))}
          <View className="mt-3 gap-2">
            {order.subtotal !== undefined ? (
              <PriceRow label="Subtotal" value={order.subtotal} />
            ) : null}
            {order.deliveryFee !== undefined ? (
              <PriceRow label="Delivery fee" value={order.deliveryFee} />
            ) : null}
            <PriceRow label="Total" value={order.totalAmount} strong />
          </View>
        </View>

        <View className="rounded-2xl bg-white p-4">
          <Text className="mb-3 text-base font-bold text-slate-900">
            Payment
          </Text>
          <View className="flex-row justify-between">
            <Text className="text-sm text-slate-500">Method</Text>
            <Text className="text-sm font-semibold text-slate-800">
              {order.paymentMethod}
            </Text>
          </View>
          <View className="mt-2 flex-row justify-between">
            <Text className="text-sm text-slate-500">Status</Text>
            <Text className="text-sm font-semibold text-slate-800">
              {order.paymentStatus}
            </Text>
          </View>
        </View>

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

        {action ? (
          <Pressable
            disabled={updating}
            onPress={() => void handleStatusChange(action.status)}
            className={`min-h-14 items-center justify-center rounded-2xl ${updating ? "bg-slate-400" : "bg-emerald-600"}`}
          >
            {updating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="font-bold text-white">{action.label}</Text>
            )}
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

function PriceRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
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
