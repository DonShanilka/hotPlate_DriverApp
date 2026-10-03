import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import DriverMap from "../DriverMap";
import { SRI_LANKA_CENTER } from "../../../lib/services/location.service";
import type { DriverLocation } from "../../../lib/services/location.service";

interface Props {
  location: DriverLocation | null;
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  onRefresh: () => void;
}

export default function DriverMapPanel({
  location,
  loading,
  error,
  isOnline,
  onRefresh,
}: Props) {
  return (
    <View className="mx-5 flex-1 overflow-hidden rounded-3xl bg-gray-200 shadow-sm">
      <DriverMap
        latitude={location?.latitude ?? SRI_LANKA_CENTER.latitude}
        longitude={location?.longitude ?? SRI_LANKA_CENTER.longitude}
        isApproximate={!location}
      />

      {!location ? (
        <View className="absolute inset-0 items-center justify-center bg-gray-100/90 px-8">
          <View className="items-center rounded-2xl bg-white px-6 py-5 shadow-md">
            {loading ? (
              <>
                <ActivityIndicator size="large" color="#16a34a" />
                <Text className="mt-3 text-center text-sm font-medium text-gray-700">
                  Finding your current location...
                </Text>
              </>
            ) : (
              <>
                <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <Ionicons name="location-outline" size={25} color="#dc2626" />
                </View>
                <Text className="text-center text-sm font-semibold text-gray-800">
                  Location unavailable
                </Text>
                <Text className="mt-1 text-center text-xs leading-5 text-gray-500">
                  {error || "We could not find your current GPS location."}
                </Text>
                <Pressable
                  onPress={onRefresh}
                  className="mt-4 flex-row items-center rounded-xl bg-green-600 px-5 py-3 active:bg-green-700"
                >
                  <Ionicons name="refresh-outline" size={18} color="#fff" />
                  <Text className="ml-2 font-semibold text-white">
                    Try Again
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      ) : null}

      {location ? (
        <View className="absolute left-4 top-4 flex-row items-center rounded-full bg-white px-3 py-2 shadow-md">
          <View
            className={`mr-2 h-2.5 w-2.5 rounded-full ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <Text className="text-xs font-semibold text-gray-800">
            {isOnline ? "Live GPS" : "GPS Available"}
          </Text>
        </View>
      ) : null}

      {location?.accuracy != null ? (
        <View className="absolute bottom-4 left-4 rounded-xl bg-white px-3 py-2 shadow-md">
          <View className="flex-row items-center">
            <Ionicons name="navigate-outline" size={15} color="#374151" />
            <Text className="ml-1.5 text-xs font-medium text-gray-700">
              GPS ±{Math.round(location.accuracy)}m
            </Text>
          </View>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Refresh GPS location"
        onPress={onRefresh}
        disabled={loading}
        className="absolute bottom-4 right-4 h-11 w-11 items-center justify-center rounded-full bg-white shadow-md active:bg-gray-100"
      >
        {loading ? (
          <ActivityIndicator size="small" color="#16a34a" />
        ) : (
          <Ionicons name="refresh-outline" size={21} color="#16a34a" />
        )}
      </Pressable>
    </View>
  );
}
