import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text } from "react-native";

interface Props {
  isOnline: boolean;
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
}

export default function DriverAvailabilityButton({
  isOnline,
  loading,
  disabled,
  onPress,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-[56px] flex-row items-center justify-center rounded-2xl ${
        disabled
          ? "bg-gray-400"
          : isOnline
            ? "bg-gray-700 active:bg-gray-800"
            : "bg-green-600 active:bg-green-700"
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <Ionicons
            name={isOnline ? "pause-circle-outline" : "radio-button-on-outline"}
            size={23}
            color="#fff"
          />
          <Text className="ml-2 text-base font-bold text-white">
            {isOnline ? "Go Offline" : "Go Online"}
          </Text>
        </>
      )}
    </Pressable>
  );
}
