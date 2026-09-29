import { createElement, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  const [zoom, setZoom] = useState(15);
  const googleMapsUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`;
  const openMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <View style={styles.container}>
      {createElement("iframe", {
        title: "Driver Google Map",
        src: googleMapsUrl,
        loading: "lazy",
        referrerPolicy: "no-referrer-when-downgrade",
        allowFullScreen: true,
        style: styles.map,
      })}
      <View style={styles.zoomControls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Zoom in"
          disabled={zoom >= 21}
          onPress={() => setZoom((current) => Math.min(21, current + 1))}
          style={styles.zoomButton}
        >
          <Ionicons name="add" size={24} color="#1f2937" />
        </Pressable>
        <View style={styles.separator} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Zoom out"
          disabled={zoom <= 3}
          onPress={() => setZoom((current) => Math.max(3, current - 1))}
          style={styles.zoomButton}
        >
          <Ionicons name="remove" size={24} color="#1f2937" />
        </Pressable>
      </View>
      <View pointerEvents="box-none" style={styles.locationLabel}>
        <Text style={styles.coordinates}>
          {isApproximate ? "Approximate map center" : "Current location"}: {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </Text>
        {createElement(
          "a",
          {
            href: openMapsUrl,
            target: "_blank",
            rel: "noreferrer",
            style: styles.link,
          },
          "Open in Google Maps",
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#eaf1ec",
  },
  map: {
    width: "100%",
    height: "100%",
    borderWidth: 0,
  },
  zoomControls: {
    position: "absolute",
    right: 12,
    top: 12,
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  zoomButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e5e7eb",
  },
  locationLabel: {
    position: "absolute",
    left: 12,
    bottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.96)",
  },
  coordinates: {
    fontSize: 12,
    color: "#26382d",
    fontWeight: "600",
  },
  link: {
    marginTop: 3,
    color: "#15803d",
    textDecorationLine: "underline",
  },
});
