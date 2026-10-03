import { Ionicons } from "@expo/vector-icons";
import { createElement, useState } from "react";
import { Pressable, Text, View } from "react-native";

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
    <View className="relative flex-1 overflow-hidden bg-[#eaf1ec]">
      {createElement("iframe", {
        title: "Driver Google Map",
        src: googleMapsUrl,
        loading: "lazy",
        referrerPolicy: "no-referrer-when-downgrade",
        allowFullScreen: true,
        className: "h-full w-full border-0",
      })}
      <View className="absolute right-3 top-3 overflow-hidden rounded-xl bg-white shadow-md">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Zoom in"
          disabled={zoom >= 21}
          onPress={() => setZoom((current) => Math.min(21, current + 1))}
          className="h-11 w-11 cursor-pointer items-center justify-center"
        >
          <Ionicons name="add" size={24} color="#1f2937" />
        </Pressable>
        <View className="h-px bg-slate-200" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Zoom out"
          disabled={zoom <= 3}
          onPress={() => setZoom((current) => Math.max(3, current - 1))}
          className="h-11 w-11 cursor-pointer items-center justify-center"
        >
          <Ionicons name="remove" size={24} color="#1f2937" />
        </Pressable>
      </View>
      <View
        pointerEvents="box-none"
        className="absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-2"
      >
        <Text className="text-xs font-semibold text-[#26382d]">
          {isApproximate ? "Approximate map center" : "Current location"}:{" "}
          {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </Text>
        {createElement(
          "a",
          {
            href: openMapsUrl,
            target: "_blank",
            rel: "noreferrer",
            className: "mt-1 text-sm text-green-700 underline",
          },
          "Open in Google Maps",
        )}
      </View>
    </View>
  );
}
