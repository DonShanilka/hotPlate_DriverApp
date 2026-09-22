import { createElement } from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  latitude: number;
  longitude: number;
}

export default function DriverMap({ latitude, longitude }: Props) {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.02},${latitude - 0.015},${longitude + 0.02},${latitude + 0.015}&layer=mapnik&marker=${latitude},${longitude}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <View style={styles.container}>
      {createElement("iframe", {
        title: "Driver location map",
        src: mapUrl,
        loading: "lazy",
        referrerPolicy: "no-referrer-when-downgrade",
        style: styles.map,
      })}
      <View pointerEvents="none" style={styles.locationLabel}>
        <Text style={styles.coordinates}>
          Driver location: {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </Text>
        {createElement(
          "a",
          {
            href: googleMapsUrl,
            target: "_blank",
            rel: "noreferrer",
            style: styles.googleLink,
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
    backgroundColor: "#dfe7e9",
  },
  map: {
    width: "100%",
    height: "100%",
    borderWidth: 0,
  },
  locationLabel: {
    position: "absolute",
    left: 12,
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
  },
  coordinates: {
    fontSize: 12,
    color: "#1d3438",
  },
  googleLink: {
    color: "#007bff",
    textDecorationLine: "underline",
  },
});
