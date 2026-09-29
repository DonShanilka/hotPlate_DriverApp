import { Text, TextInput, View } from "react-native";

interface ProfileFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "phone-pad";
  multiline?: boolean;
}

export default function ProfileField({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = "sentences",
  keyboardType = "default",
  multiline = false,
}: ProfileFieldProps) {
  return (
    <View className="mb-3.5">
      <Text className="mb-2 text-[13px] font-medium text-gray-500">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        multiline={multiline}
        className={`min-h-12 rounded-[10px] border border-gray-200 bg-white px-3 py-2.5 text-gray-900 ${multiline ? "min-h-[82px]" : ""}`}
      />
    </View>
  );
}
