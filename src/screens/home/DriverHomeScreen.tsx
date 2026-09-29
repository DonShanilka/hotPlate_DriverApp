import { Ionicons } from "@expo/vector-icons";
import type { LocationSubscription } from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import DriverMap from "@/components/driver/DriverMap";
import { useAuth } from "@/context/AuthContext";
import { useDriver } from "@/context/DriverContext";

import {
    getCurrentLocation,
    requestLocationPermission,
    SRI_LANKA_CENTER,
    watchDriverLocation,
} from "../../lib/services/location.service";

type DriverLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp?: number;
};

export default function DriverHomeScreen() {
  const { user } = useAuth();
  const { profile, update } = useDriver();

  // --------------------------------------------------
  // LOCATION STATE
  // --------------------------------------------------

  const [location, setLocation] = useState<DriverLocation | null>(null);

  const [locationLoading, setLocationLoading] = useState(true);

  const [locationError, setLocationError] = useState<string | null>(null);

  // --------------------------------------------------
  // DRIVER AVAILABILITY STATE
  // --------------------------------------------------

  const [onlineOverride, setOnlineOverride] = useState<boolean | null>(null);

  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );

  // --------------------------------------------------
  // LOCATION SUBSCRIPTION
  // --------------------------------------------------

  const locationSubscription = useRef<LocationSubscription | null>(null);

  // Backend profile status + local override
  const isOnline = onlineOverride ?? profile?.isAvailable ?? false;

  // --------------------------------------------------
  // STOP LOCATION WATCHING
  // --------------------------------------------------

  const stopLocationTracking = useCallback(() => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  }, []);

  // --------------------------------------------------
  // GET CURRENT LOCATION
  // --------------------------------------------------

  const loadLocation = useCallback(
    async (isActive: () => boolean = () => true) => {
      try {
        setLocationLoading(true);
        setLocationError(null);

        await requestLocationPermission();

        const currentLocation = await getCurrentLocation();

        if (!isActive()) {
          return;
        }

        setLocation(currentLocation);
      } catch (error) {
        if (!isActive()) {
          return;
        }

        setLocationError(
          error instanceof Error
            ? error.message
            : "Unable to get your current location.",
        );
      } finally {
        if (isActive()) {
          setLocationLoading(false);
        }
      }
    },
    [],
  );

  // --------------------------------------------------
  // REFRESH LOCATION
  // --------------------------------------------------

  const refreshLocation = async () => {
    await loadLocation();
  };

  // --------------------------------------------------
  // INITIAL LOCATION
  // --------------------------------------------------

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      void loadLocation(() => active);
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [loadLocation]);

  // --------------------------------------------------
  // REAL-TIME LOCATION
  //
  // Only track GPS when driver is ONLINE.
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    // Driver offline
    if (!isOnline) {
      stopLocationTracking();
      return;
    }

    const startTracking = async () => {
      try {
        await requestLocationPermission();

        if (cancelled) {
          return;
        }

        // Remove previous watcher first
        stopLocationTracking();

        const subscription = await watchDriverLocation((nextLocation) => {
          if (cancelled) {
            return;
          }

          // Ignore bad GPS fixes
          if (nextLocation.accuracy == null || nextLocation.accuracy > 200) {
            console.log("Ignoring inaccurate GPS:", nextLocation.accuracy);

            return;
          }

          console.log(
            "LIVE DRIVER LOCATION:",
            nextLocation.latitude,
            nextLocation.longitude,
            "accuracy:",
            nextLocation.accuracy,
          );

          setLocation(nextLocation);
          setLocationError(null);

          // ------------------------------------------------
          // NEXT STEP:
          // Send nextLocation to your backend here.
          //
          // Example:
          //
          // updateDriverLocation({
          //   latitude: nextLocation.latitude,
          //   longitude: nextLocation.longitude,
          // });
          // ------------------------------------------------
        });

        if (cancelled) {
          subscription.remove();
          return;
        }

        locationSubscription.current = subscription;
      } catch (error) {
        if (!cancelled) {
          setLocationError(
            error instanceof Error
              ? error.message
              : "Live location tracking could not be started.",
          );
        }
      }
    };

    void startTracking();

    return () => {
      cancelled = true;
      stopLocationTracking();
    };
  }, [isOnline, stopLocationTracking]);

  // --------------------------------------------------
  // GO ONLINE / OFFLINE
  // --------------------------------------------------

  const toggleAvailability = async () => {
    setAvailabilityError(null);

    // ==================================================
    // GO OFFLINE
    // ==================================================

    if (isOnline) {
      if (!profile) {
        setOnlineOverride(false);
        stopLocationTracking();
        return;
      }

      try {
        setAvailabilityLoading(true);

        await update({
          vehicleType: profile.vehicleType,
          vehicleNumber: profile.vehicleNumber,
          licenseNumber: profile.licenseNumber,
          phone: profile.phone,
          address: profile.address,
          isAvailable: false,
        });

        setOnlineOverride(false);

        stopLocationTracking();
      } catch (error) {
        setAvailabilityError(
          error instanceof Error ? error.message : "Could not go offline.",
        );
      } finally {
        setAvailabilityLoading(false);
      }

      return;
    }

    // ==================================================
    // GO ONLINE
    // ==================================================

    try {
      setAvailabilityLoading(true);

      // Get GPS before allowing driver to go online
      await requestLocationPermission();

      const currentLocation = await getCurrentLocation();

      // Save current location
      setLocation(currentLocation);
      setLocationError(null);

      // Update backend availability
      if (profile) {
        await update({
          vehicleType: profile.vehicleType,
          vehicleNumber: profile.vehicleNumber,
          licenseNumber: profile.licenseNumber,
          phone: profile.phone,
          address: profile.address,
          isAvailable: true,
        });
      } else {
        setAvailabilityError(
          "Driver profile was not found. Online status cannot be saved to the backend.",
        );

        return;
      }

      setOnlineOverride(true);
    } catch (error) {
      setAvailabilityError(
        error instanceof Error
          ? error.message
          : "Could not go online. Check your GPS and permissions.",
      );
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <View className="flex-1 bg-gray-50">
      {/* ================================================
          HEADER
      ================================================= */}

      <View className="px-5 pb-4 pt-14">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              Welcome, {user?.first_name || "Driver"} 👋
            </Text>

            <Text className="mt-1 text-sm text-gray-500">
              Ready for your next delivery?
            </Text>
          </View>

          {/* ONLINE INDICATOR */}

          <View className="ml-3 flex-row items-center rounded-full bg-white px-3 py-2 shadow-sm">
            <View
              className={`mr-2 h-2.5 w-2.5 rounded-full ${
                isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            />

            <Text className="text-xs font-semibold text-gray-700">
              {isOnline ? "ONLINE" : "OFFLINE"}
            </Text>
          </View>
        </View>
      </View>

      {/* ================================================
          MAP
      ================================================= */}

      <View className="mx-5 flex-1 overflow-hidden rounded-3xl bg-gray-200 shadow-sm">
        <DriverMap
          latitude={location?.latitude ?? SRI_LANKA_CENTER.latitude}
          longitude={location?.longitude ?? SRI_LANKA_CENTER.longitude}
          isApproximate={!location}
        />

        {/* MAP LOADING / ERROR */}

        {!location && (
          <View className="absolute inset-0 items-center justify-center bg-gray-100/90 px-8">
            <View className="items-center rounded-2xl bg-white px-6 py-5 shadow-md">
              {locationLoading ? (
                <>
                  <ActivityIndicator size="large" color="#16a34a" />

                  <Text className="mt-3 text-center text-sm font-medium text-gray-700">
                    Finding your current location...
                  </Text>
                </>
              ) : (
                <>
                  <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <Ionicons
                      name="location-outline"
                      size={25}
                      color="#dc2626"
                    />
                  </View>

                  <Text className="text-center text-sm font-semibold text-gray-800">
                    Location unavailable
                  </Text>

                  <Text className="mt-1 text-center text-xs leading-5 text-gray-500">
                    {locationError ||
                      "We could not find your current GPS location."}
                  </Text>

                  <Pressable
                    onPress={refreshLocation}
                    className="mt-4 flex-row items-center rounded-xl bg-green-600 px-5 py-3 active:bg-green-700"
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={18}
                      color="#ffffff"
                    />

                    <Text className="ml-2 font-semibold text-white">
                      Try Again
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        )}

        {/* LIVE GPS BADGE */}

        {location && (
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
        )}

        {/* GPS ACCURACY */}

        {location?.accuracy != null && (
          <View className="absolute bottom-4 left-4 rounded-xl bg-white px-3 py-2 shadow-md">
            <View className="flex-row items-center">
              <Ionicons name="navigate-outline" size={15} color="#374151" />

              <Text className="ml-1.5 text-xs font-medium text-gray-700">
                GPS ±{Math.round(location.accuracy)}m
              </Text>
            </View>
          </View>
        )}

        {/* REFRESH BUTTON */}

        <Pressable
          onPress={refreshLocation}
          disabled={locationLoading}
          className="absolute bottom-4 right-4 h-11 w-11 items-center justify-center rounded-full bg-white shadow-md active:bg-gray-100"
        >
          {locationLoading ? (
            <ActivityIndicator size="small" color="#16a34a" />
          ) : (
            <Ionicons name="refresh-outline" size={21} color="#16a34a" />
          )}
        </Pressable>
      </View>

      {/* ================================================
          BOTTOM CONTROL PANEL
      ================================================= */}

      <View className="px-5 pb-5 pt-4">
        {/* STATUS CARD */}

        <View className="mb-3 rounded-2xl bg-white p-4 shadow-sm">
          <View className="flex-row items-center">
            {/* Status */}

            <View className="flex-1 flex-row items-center">
              <View
                className={`mr-2.5 h-3 w-3 rounded-full ${
                  isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />

              <View>
                <Text className="text-sm font-bold text-gray-900">
                  {isOnline ? "You are online" : "You are offline"}
                </Text>

                <Text className="mt-0.5 text-xs text-gray-500">
                  {isOnline
                    ? "Waiting for delivery orders"
                    : "Go online to receive orders"}
                </Text>
              </View>
            </View>

            {/* GPS */}

            {location && (
              <View className="items-end">
                <Text className="text-xs font-semibold text-gray-700">GPS</Text>

                <Text className="mt-0.5 text-xs text-gray-500">
                  {location.accuracy != null
                    ? `±${Math.round(location.accuracy)}m`
                    : "Unknown"}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* AVAILABILITY ERROR */}

        {availabilityError && (
          <View className="mb-3 flex-row items-start rounded-xl border border-red-200 bg-red-50 p-3">
            <Ionicons name="alert-circle-outline" size={19} color="#dc2626" />

            <Text className="ml-2 flex-1 text-xs leading-5 text-red-700">
              {availabilityError}
            </Text>
          </View>
        )}

        {/* LOCATION ERROR */}

        {locationError && location && (
          <View className="mb-3 flex-row items-center rounded-xl bg-orange-50 p-3">
            <Ionicons name="warning-outline" size={18} color="#ea580c" />

            <Text className="ml-2 flex-1 text-xs text-orange-700">
              {locationError}
            </Text>
          </View>
        )}

        {/* ONLINE / OFFLINE BUTTON */}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{
            disabled: availabilityLoading || locationLoading,
          }}
          disabled={availabilityLoading || locationLoading}
          onPress={toggleAvailability}
          className={`min-h-[56px] flex-row items-center justify-center rounded-2xl ${
            availabilityLoading || locationLoading
              ? "bg-gray-400"
              : isOnline
                ? "bg-gray-700 active:bg-gray-800"
                : "bg-green-600 active:bg-green-700"
          }`}
        >
          {availabilityLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons
                name={
                  isOnline ? "pause-circle-outline" : "radio-button-on-outline"
                }
                size={23}
                color="#ffffff"
              />

              <Text className="ml-2 text-base font-bold text-white">
                {isOnline ? "Go Offline" : "Go Online"}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

