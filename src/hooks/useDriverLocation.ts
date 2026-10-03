import type { LocationSubscription } from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  getCurrentLocation,
  requestLocationPermission,
  watchDriverLocation,
  type DriverLocation,
} from "../lib/services/location.service";

export function useDriverLocation(isOnline: boolean) {
  const subscriptionRef = useRef<LocationSubscription | null>(null);
  const [location, setLocation] = useState<DriverLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stopTracking = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  }, []);

  const refresh = useCallback(
    async (
      isActive: () => boolean = () => true,
    ): Promise<DriverLocation | null> => {
      try {
        setLoading(true);
        setError(null);
        await requestLocationPermission();
        const currentLocation = await getCurrentLocation();
        if (isActive()) {
          setLocation(currentLocation);
          return currentLocation;
        }
        return null;
      } catch (cause) {
        if (isActive()) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to get your current GPS location.",
          );
        }
        return null;
      } finally {
        if (isActive()) setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      void refresh(() => active);
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;

    if (!isOnline) {
      stopTracking();
      return;
    }

    const startTracking = async () => {
      try {
        await requestLocationPermission();
        if (cancelled) return;

        stopTracking();
        const subscription = await watchDriverLocation((nextLocation) => {
          if (cancelled) return;
          if (nextLocation.accuracy == null || nextLocation.accuracy > 200) {
            console.log("Ignoring inaccurate GPS:", nextLocation.accuracy);
            return;
          }
          setLocation(nextLocation);
          setError(null);
        });

        if (cancelled) {
          subscription.remove();
          return;
        }
        subscriptionRef.current = subscription;
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Live location tracking could not be started.",
          );
        }
      }
    };

    void startTracking();
    return () => {
      cancelled = true;
      stopTracking();
    };
  }, [isOnline, stopTracking]);

  return { location, loading, error, refresh, stopTracking };
}
