import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useEffect, useRef } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

const DRIVER_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#f2f5f2" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#52635a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f8faf8" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry.fill",
    stylers: [{ color: "#dce9dd" }],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#b8dce3" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: "#d7ebd5" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#e3e9e4" }],
  },
];

interface Props {
  latitude: number;
  longitude: number;
  isApproximate?: boolean;
}

export default function DriverMap({
  latitude,
  longitude,
  isApproximate = false,
}: Props) {
  const mapRef = useRef<MapView | null>(null);
  const zoomDelta = useRef(0.01);
  const useGoogleMaps =
    Platform.OS === "android" ||
    Boolean(Constants.expoConfig?.extra?.googleMapsIOSConfigured);

  useEffect(() => {
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: zoomDelta.current,
        longitudeDelta: zoomDelta.current,
      },
      350,
    );
  }, [latitude, longitude]);

  const changeZoom = (factor: number) => {
    const nextDelta = Math.max(
      0.0003,
      Math.min(90, zoomDelta.current * factor),
    );
    zoomDelta.current = nextDelta;
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: nextDelta,
        longitudeDelta: nextDelta,
      },
      250,
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        // Without an iOS Google Maps key, use Apple Maps rather than a blank map.
        provider={useGoogleMaps ? PROVIDER_GOOGLE : undefined}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onRegionChangeComplete={(nextRegion) => {
          zoomDelta.current = Math.max(
            0.0003,
            Math.min(90, nextRegion.latitudeDelta),
          );
        }}
        customMapStyle={useGoogleMaps ? DRIVER_MAP_STYLE : undefined}
        showsUserLocation={!isApproximate}
        showsMyLocationButton
        followsUserLocation={false}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={
            isApproximate ? "Approximate Sri Lanka center" : "Your Location"
          }
          description={
            isApproximate ? "Waiting for a GPS fix" : "HotPlate Driver"
          }
        />
      </MapView>
      <View style={styles.zoomControls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Zoom in"
          onPress={() => changeZoom(0.5)}
          style={styles.zoomButton}
        >
          <Ionicons name="add" size={24} color="#1f2937" />
        </Pressable>
        <View style={styles.separator} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Zoom out"
          onPress={() => changeZoom(2)}
          style={styles.zoomButton}
        >
          <Ionicons name="remove" size={24} color="#1f2937" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  zoomControls: {
    position: "absolute",
    right: 14,
    top: 14,
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  zoomButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: "#e5e7eb" },
});
