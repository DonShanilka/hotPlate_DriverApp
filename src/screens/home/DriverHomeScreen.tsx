import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";

import ActiveDeliveryCard from "../../components/driver/home/ActiveDeliveryCard";
import DriverAvailabilityButton from "../../components/driver/home/DriverAvailabilityButton";
import DriverHomeAlerts from "../../components/driver/home/DriverHomeAlerts";
import DriverHomeHeader from "../../components/driver/home/DriverHomeHeader";
import DriverMapPanel from "../../components/driver/home/DriverMapPanel";
import DriverStatusCard from "../../components/driver/home/DriverStatusCard";
import UnassignedOrders from "../../components/orders/UnassignedOrders";
import { useAuth } from "../../context/AuthContext";
import { useDriver } from "../../context/DriverContext";
import { useOrder } from "../../context/OrderContext";
import { useAvailableOrders } from "../../hooks/useAvailableOrders";
import { useDriverLocation } from "../../hooks/useDriverLocation";

const TERMINAL_STATUSES = new Set(["DELIVERED", "CANCELLED"]);

export default function DriverHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    profile,
    loading: profileLoading,
    refresh: refreshDriverProfile,
    setAvailability,
  } = useDriver();
  const { orders, activeOrder, refreshOrders } = useOrder();

  const [onlineOverride, setOnlineOverride] = useState<boolean | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );

  const isOnline = onlineOverride ?? profile?.isAvailable ?? false;
  const activeCount = useMemo(
    () => orders.filter((order) => !TERMINAL_STATUSES.has(order.status)).length,
    [orders],
  );
  const hasActiveDelivery = Boolean(
    activeOrder && !TERMINAL_STATUSES.has(activeOrder.status),
  );
  const locationState = useDriverLocation(isOnline);
  const availableOrders = useAvailableOrders({
    isOnline,
    hasActiveDelivery,
    driverId: profile?._id,
    refreshAssignedOrders: refreshOrders,
  });

  const ensureDriverProfile = async () => {
    if (profile?._id) return profile;
    return refreshDriverProfile();
  };

  const toggleAvailability = async () => {
    setAvailabilityError(null);

    if (isOnline) {
      try {
        setAvailabilityLoading(true);
        const currentProfile = await ensureDriverProfile();
        if (!currentProfile?._id) {
          setOnlineOverride(false);
          locationState.stopTracking();
          return;
        }

        await setAvailability(false, currentProfile._id);
        setOnlineOverride(false);
        locationState.stopTracking();
      } catch (cause) {
        setAvailabilityError(
          cause instanceof Error ? cause.message : "Could not go offline.",
        );
      } finally {
        setAvailabilityLoading(false);
      }
      return;
    }

    try {
      setAvailabilityLoading(true);
      const currentLocation = await locationState.refresh();
      if (!currentLocation) {
        throw new Error(
          "Could not get your current location. Check GPS and permissions.",
        );
      }
      const currentProfile = await ensureDriverProfile();
      if (!currentProfile?._id) {
        setAvailabilityError(
          "No driver profile found. Open Profile, save your vehicle details, then try again.",
        );
        return;
      }

      await setAvailability(true, currentProfile._id);
      setOnlineOverride(true);
    } catch (cause) {
      setAvailabilityError(
        cause instanceof Error
          ? cause.message
          : "Could not go online. Check your GPS and permissions.",
      );
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const openActiveDelivery = () => {
    if (!activeOrder) return;
    router.push({
      pathname: "/(driver)/active-order",
      params: { orderId: activeOrder._id },
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      <DriverHomeHeader firstName={user?.first_name} isOnline={isOnline} />

      <DriverMapPanel
        location={locationState.location}
        loading={locationState.loading}
        error={locationState.error}
        isOnline={isOnline}
        onRefresh={() => void locationState.refresh()}
      />

      <View className="px-5 pb-5 pt-4">
        <DriverStatusCard
          isOnline={isOnline}
          activeCount={activeCount}
          gpsAccuracy={locationState.location?.accuracy}
        />

        {activeOrder ? (
          <ActiveDeliveryCard
            order={activeOrder}
            onPress={openActiveDelivery}
          />
        ) : null}

        {!hasActiveDelivery ? (
          <UnassignedOrders
            orders={availableOrders.orders}
            isOnline={isOnline}
            hasActiveOrder={false}
            hasDriverProfile={Boolean(profile?._id)}
            acceptingOrderId={availableOrders.acceptingOrderId}
            error={availableOrders.error}
            loading={availableOrders.loading}
            onAccept={(orderId) => void availableOrders.accept(orderId)}
            onDecline={availableOrders.skip}
            onRefresh={() => void availableOrders.refresh()}
          />
        ) : null}

        <DriverHomeAlerts
          availabilityError={availabilityError}
          locationError={locationState.error}
          hasLocation={Boolean(locationState.location)}
        />

        <DriverAvailabilityButton
          isOnline={isOnline}
          loading={availabilityLoading}
          disabled={
            availabilityLoading || locationState.loading || profileLoading
          }
          onPress={() => void toggleAvailability()}
        />
      </View>
    </View>
  );
}
