import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, Platform, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Constants from "expo-constants";

import { useAppDispatch, useAppSelector } from "../../redux/store/hooks";
import { fetchOrderById } from "../../redux/features/order/orderThunk";

export default function DeliveryTrackingScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { orderId: rawOrderId } = useLocalSearchParams<{ orderId?: string | string[] }>();
  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;
  const order = useAppSelector((state) =>
    state.orders.orders.find((item) => item._id === orderId) ??
    (state.orders.activeOrder?._id === orderId ? state.orders.activeOrder : null),
  );
  const loading = useAppSelector((state) => state.orders.loading);
  const useGoogleMaps = Platform.OS === "android" || Boolean(Constants.expoConfig?.extra?.googleMapsIOSConfigured);
  const point = order?.deliveryLocation;
  const hasCoordinates = Boolean(
    point && Number.isFinite(point.latitude) && Number.isFinite(point.longitude),
  );

  useEffect(() => {
    if (orderId && !order) void dispatch(fetchOrderById(orderId));
  }, [dispatch, orderId, order]);

  if (loading && !order) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="mt-3 text-slate-500">Loading delivery details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-8">
        <Ionicons name="map-outline" size={42} color="#64748b" />
        <Text className="mt-3 text-lg font-bold text-slate-900">Order not found</Text>
        <Pressable onPress={() => router.back()} className="mt-5 rounded-xl bg-emerald-600 px-5 py-3">
          <Text className="font-semibold text-white">Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <View className="absolute left-4 right-4 top-14 z-10 flex-row items-center rounded-2xl bg-white p-3 shadow-md">
        <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <Ionicons name="arrow-back" size={20} color="#334155" />
        </Pressable>
        <View className="ml-3 flex-1">
          <Text className="font-bold text-slate-900">Order #{order._id.slice(-6).toUpperCase()}</Text>
          <Text className="mt-0.5 text-xs text-slate-500">{order.status.replaceAll("_", " ")}</Text>
        </View>
      </View>

      {hasCoordinates && point ? (
        <MapView
          className="flex-1"
          provider={useGoogleMaps ? PROVIDER_GOOGLE : undefined}
          initialRegion={{ latitude: point.latitude, longitude: point.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
          showsCompass
          showsUserLocation
        >
          <Marker coordinate={{ latitude: point.latitude, longitude: point.longitude }} title="Delivery destination" description={order.deliveryAddress} />
        </MapView>
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <Ionicons name="location-outline" size={32} color="#d97706" />
          </View>
          <Text className="mt-4 text-center font-bold text-slate-900">Location unavailable</Text>
          <Text className="mt-2 text-center text-sm leading-5 text-slate-500">This order does not contain valid delivery coordinates.</Text>
        </View>
      )}

      <View className="absolute bottom-5 left-4 right-4 rounded-2xl bg-white p-4 shadow-lg">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-slate-900">Delivery destination</Text>
          <Text className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{order.status.replaceAll("_", " ")}</Text>
        </View>
        <Text selectable className="mt-2 text-sm leading-5 text-slate-600">{order.deliveryAddress}</Text>
        <Text selectable className="mt-2 text-sm font-medium text-slate-700">{order.phoneNumber}</Text>
      </View>
    </View>
  );
}
