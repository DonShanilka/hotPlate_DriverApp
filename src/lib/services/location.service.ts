import * as Location from "expo-location";

export interface DriverLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export const SRI_LANKA_CENTER = {
  latitude: 7.8731,
  longitude: 80.7718,
} as const;

/**
 * Maximum GPS accuracy we accept for driver tracking.
 *
 * Example:
 * 20m  -> good
 * 80m  -> acceptable
 * 200m -> poor but usable
 * 500m -> reject
 */
export const MAX_DRIVER_GPS_ACCURACY = 200;

/**
 * Sri Lanka approximate geographic bounds.
 *
 * This is only a sanity check.
 * It should NOT be used as a replacement for GPS accuracy.
 */
export const isInSriLanka = ({
  latitude,
  longitude,
}: Pick<DriverLocation, "latitude" | "longitude">): boolean => {
  return (
    latitude >= 5.9 && latitude <= 9.9 && longitude >= 79.6 && longitude <= 81.9
  );
};

/**
 * Check whether location services are enabled.
 */
export const ensureLocationServicesEnabled = async (): Promise<void> => {
  const enabled = await Location.hasServicesEnabledAsync();

  if (!enabled) {
    throw new Error(
      "Location Services are disabled. Please enable GPS/Location Services and try again.",
    );
  }
};

/**
 * Request foreground location permission.
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  const currentPermission = await Location.getForegroundPermissionsAsync();

  if (currentPermission.status === Location.PermissionStatus.GRANTED) {
    return true;
  }

  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== Location.PermissionStatus.GRANTED) {
    if (permission.canAskAgain) {
      throw new Error(
        "Location permission was denied. Please allow location access for HotPlate.",
      );
    }

    throw new Error(
      "Location permission is blocked. Open Settings and enable location access for HotPlate.",
    );
  }

  return true;
};

/**
 * Check iOS precise/reduced location.
 *
 * On iOS:
 * full     = Precise Location enabled
 * reduced  = Approximate Location
 *
 * On Android this returns true because the iOS
 * reduced/full authorization does not apply the same way.
 */
export const isPreciseLocation = async (): Promise<boolean> => {
  const permission = await Location.getForegroundPermissionsAsync();

  if (permission.status !== Location.PermissionStatus.GRANTED) {
    return false;
  }

  if (permission.ios?.accuracy) {
    return permission.ios.accuracy === "full";
  }

  return true;
};

/**
 * Make sure everything required for foreground GPS
 * is ready.
 */
export const prepareLocation = async (): Promise<void> => {
  await requestLocationPermission();
  await ensureLocationServicesEnabled();
};

/**
 * Convert Expo LocationObject into our DriverLocation.
 */
const toDriverLocation = (
  location: Location.LocationObject,
): DriverLocation => {
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy,
    heading: location.coords.heading,
    speed: location.coords.speed,
    timestamp: location.timestamp,
  };
};

/**
 * Get the driver's current GPS position.
 */
export const getCurrentLocation = async (): Promise<DriverLocation> => {
  await prepareLocation();

  const precise = await isPreciseLocation();

  if (!precise) {
    console.warn(
      "HotPlate: Precise Location is disabled. GPS may be approximate.",
    );
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.BestForNavigation,

    // Android only
    mayShowUserSettingsDialog: true,
  });

  const driverLocation = toDriverLocation(location);

  console.log("CURRENT DRIVER LOCATION:", driverLocation);

  return driverLocation;
};

/**
 * Watch driver's location in real time.
 *
 * IMPORTANT:
 * watchPositionAsync works while the application
 * is in the foreground.
 */
export const watchDriverLocation = async (
  callback: (location: DriverLocation) => void,
  onError?: (error: Error) => void,
): Promise<Location.LocationSubscription> => {
  await prepareLocation();

  const subscription = await Location.watchPositionAsync(
    {
      /**
       * Best accuracy available.
       * Good choice for a delivery/navigation app.
       */
      accuracy: Location.Accuracy.BestForNavigation,

      /**
       * Android:
       * Do not request updates more frequently
       * than every 3 seconds.
       */
      timeInterval: 3000,

      /**
       * Request another location when the driver
       * has moved approximately 5 meters.
       */
      distanceInterval: 5,

      /**
       * Android:
       * allow system to ask user to enable
       * improved location accuracy.
       */
      mayShowUserSettingsDialog: true,
    },

    /**
     * LOCATION CALLBACK
     */
    (location) => {
      const driverLocation = toDriverLocation(location);

      console.log(
        "LIVE DRIVER LOCATION:",
        driverLocation.latitude,
        driverLocation.longitude,
        "accuracy:",
        driverLocation.accuracy,
      );

      callback(driverLocation);
    },

    /**
     * LOCATION ERROR CALLBACK
     */
    (reason) => {
      const error = new Error(`GPS location update failed: ${reason}`);

      console.error("DRIVER GPS ERROR:", error.message);

      onError?.(error);
    },
  );

  return subscription;
};

/**
 * Check whether a GPS location is good enough
 * for sending to the HotPlate backend.
 */
export const isUsableDriverLocation = (location: DriverLocation): boolean => {
  /**
   * Invalid coordinates
   */
  if (
    !Number.isFinite(location.latitude) ||
    !Number.isFinite(location.longitude)
  ) {
    return false;
  }

  /**
   * No accuracy information
   */
  if (location.accuracy == null) {
    return false;
  }

  /**
   * GPS accuracy is too poor
   */
  if (location.accuracy > MAX_DRIVER_GPS_ACCURACY) {
    return false;
  }

  return true;
};

/**
 * Stop a location subscription safely.
 */
export const stopDriverLocation = (
  subscription: Location.LocationSubscription | null | undefined,
): void => {
  if (!subscription) {
    return;
  }

  subscription.remove();
};
