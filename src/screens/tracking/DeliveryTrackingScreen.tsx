import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    Platform,
    Pressable,
    Text,
    View,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

import {
    watchDriverLocation,
    type DriverLocation,
} from "../../lib/services/location.service";
import { fetchOrderById } from "../../redux/features/order/orderThunk";
import { useAppDispatch, useAppSelector } from "../../redux/store/hooks";

type MapPoint = { latitude: number; longitude: number };

function getDeliveryPoint(value: unknown): MapPoint | null {
  if (!value || typeof value !== "object") return null;

  const location = value as {
    latitude?: number;
    longitude?: number;
    lat?: number;
    lng?: number;
    coordinates?: number[];
  };
  const latitude =
    location.latitude ?? location.lat ?? location.coordinates?.[1];
  const longitude =
    location.longitude ?? location.lng ?? location.coordinates?.[0];

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}

export default function DeliveryTrackingScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const mapRef = useRef<MapView | null>(null);
  const hasFittedRoute = useRef(false);
  const [riderLocation, setRiderLocation] = useState<DriverLocation | null>(
    null,
  );
  const [locationError, setLocationError] = useState<string | null>(null);
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
  const useGoogleMaps =
    Platform.OS === "android" ||
    Boolean(Constants.expoConfig?.extra?.googleMapsIOSConfigured);
  const point = getDeliveryPoint(order?.deliveryLocation);

  const fitRoute = useCallback(() => {
    if (!point || !riderLocation || hasFittedRoute.current) return;
    mapRef.current?.fitToCoordinates(
      [
        {
          latitude: riderLocation.latitude,
          longitude: riderLocation.longitude,
        },
        point,
      ],
      {
        edgePadding: { top: 120, right: 48, bottom: 230, left: 48 },
        animated: true,
      },
    );
    hasFittedRoute.current = true;
  }, [point, riderLocation]);

  useEffect(() => {
    hasFittedRoute.current = false;
  }, [orderId]);

  useEffect(() => {
    let active = true;
    let subscription: Awaited<ReturnType<typeof watchDriverLocation>> | null =
      null;

    void watchDriverLocation(
      (location) => {
        if (active) {
          setRiderLocation(location);
          setLocationError(null);
        }
      },
      (error) => {
        if (active) setLocationError(error.message);
      },
    )
      .then((nextSubscription) => {
        if (active) subscription = nextSubscription;
        else nextSubscription.remove();
      })
      .catch((error: unknown) => {
        if (active) {
          setLocationError(
            error instanceof Error
              ? error.message
              : "Could not read GPS location.",
          );
        }
      });

    return () => {
      active = false;
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    fitRoute();
  }, [fitRoute]);

  useEffect(() => {
    if (orderId && !order) void dispatch(fetchOrderById(orderId));
  }, [dispatch, orderId, order]);

  const openNavigation = async () => {
    if (!point) return;
    const origin = riderLocation
      ? `&origin=${riderLocation.latitude},${riderLocation.longitude}`
      : "";
    const url = `https://www.google.com/maps/dir/?api=1${origin}&destination=${point.latitude},${point.longitude}&travelmode=driving`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Navigation unavailable", "Could not open Google Maps.");
    }
  };

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
        <Text className="mt-3 text-lg font-bold text-slate-900">
          Order not found
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

  return (
    <View className="flex-1 bg-slate-50">
      {point ? (
        <MapView
          ref={mapRef}
          className="flex-1"
          provider={useGoogleMaps ? PROVIDER_GOOGLE : undefined}
          initialRegion={{
            latitude: point.latitude,
            longitude: point.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          onMapReady={fitRoute}
          showsCompass
        >
          {riderLocation ? (
            <>
              <Marker
                coordinate={{
                  latitude: riderLocation.latitude,
                  longitude: riderLocation.longitude,
                }}
                title="Your current location"
                description="Live GPS location"
                pinColor="#2563eb"
              />
              <Polyline
                coordinates={[
                  {
                    latitude: riderLocation.latitude,
                    longitude: riderLocation.longitude,
                  },
                  point,
                ]}
                strokeColor="#059669"
                strokeWidth={5}
                lineDashPattern={[1]}
              />
            </>
          ) : null}
          <Marker
            coordinate={point}
            title="Delivery destination"
            description={order.deliveryAddress}
            pinColor="#dc2626"
          />
        </MapView>
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <Ionicons name="location-outline" size={32} color="#d97706" />
          </View>
          <Text className="mt-4 text-center font-bold text-slate-900">
            Delivery location unavailable
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
            This order does not contain valid delivery coordinates.
          </Text>
        </View>
      )}

      <View className="absolute left-4 right-4 top-14 z-10 flex-row items-center rounded-2xl bg-white p-3 shadow-md">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-slate-100"
        >
          <Ionicons name="arrow-back" size={20} color="#334155" />
        </Pressable>
        <View className="ml-3 flex-1">
          <Text className="font-bold text-slate-900">
            Order #{order._id.slice(-6).toUpperCase()}
          </Text>
          <Text className="mt-0.5 text-xs text-slate-500">
            {order.status.replaceAll("_", " ")}
          </Text>
        </View>
      </View>

      <View className="absolute bottom-5 left-4 right-4 rounded-2xl bg-white p-4 shadow-lg">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-slate-900">
            Delivery destination
          </Text>
          <Text className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            {order.status.replaceAll("_", " ")}
          </Text>
        </View>
        <Text selectable className="mt-2 text-sm leading-5 text-slate-600">
          {order.deliveryAddress}
        </Text>
        <View className="mt-3 flex-row items-center">
          <Ionicons
            name={riderLocation ? "navigate-circle" : "locate-outline"}
            size={19}
            color={riderLocation ? "#2563eb" : "#64748b"}
          />
          <Text className="ml-2 flex-1 text-xs text-slate-600">
            {riderLocation
              ? `Your live location · ${riderLocation.latitude.toFixed(5)}, ${riderLocation.longitude.toFixed(5)}`
              : (locationError ?? "Getting your current location...")}
          </Text>
          {riderLocation ? (
            <View className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          ) : (
            <ActivityIndicator size="small" color="#059669" />
          )}
        </View>
        {point ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => void openNavigation()}
            className="mt-3 min-h-12 flex-row items-center justify-center rounded-xl bg-emerald-600"
          >
            <Ionicons name="navigate" size={18} color="#fff" />
            <Text className="ml-2 font-bold text-white">
              Navigate to delivery
            </Text>
          </Pressable>
        ) : null}
        {point && riderLocation ? (
          <Text className="mt-2 text-center text-[11px] text-slate-400">
            The map line connects your live location to the destination.
            Turn-by-turn road directions open in Google Maps.
          </Text>
        ) : null}
      </View>
    </View>
  );
}
