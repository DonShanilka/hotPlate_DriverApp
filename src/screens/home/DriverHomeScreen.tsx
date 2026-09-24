import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import DriverMap from "@/components/driver/DriverMap";
import {
    getCurrentLocation,
    requestLocationPermission,
} from "../../lib/services/location.service";
import { useAppSelector } from "../../redux/store/hooks";

type DriverLocation = {
  latitude: number;
  longitude: number;
};

export default function DriverHomeScreen() {
  const user = useAppSelector((state) => state.auth.user);
  const [location, setLocation] = useState<DriverLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const loadLocation = async () => {
    setLocationError(null);

    try {
      await requestLocationPermission();
      setLocation(await getCurrentLocation());
    } catch {
      setLocationError(
        "Allow location access in your browser or device settings to show your position.",
      );
    }
  };

  useEffect(() => {
    loadLocation();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.firstName || "Driver"}</Text>
      <Text style={styles.subtitle}>Ready for your next delivery?</Text>
      <View style={styles.mapContainer}>
        {location ? (
          <DriverMap
            latitude={location.latitude}
            longitude={location.longitude}
          />
        ) : (
          <View style={styles.mapMessage}>
            <Text style={styles.mapMessageText}>
              {locationError || "Finding your location..."}
            </Text>
            {locationError && (
              <Pressable onPress={loadLocation} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Try again</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    paddingTop: 70,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 16,
    color: "#777",
    marginTop: 8,
  },

  mapContainer: {
    flex: 1,
    minHeight: 320,
    marginTop: 24,
    overflow: "hidden",
    borderRadius: 12,
  },

  mapMessage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#eef3f4",
  },

  mapMessageText: {
    textAlign: "center",
    color: "#777",
  },

  retryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#208AEF",
  },

  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
