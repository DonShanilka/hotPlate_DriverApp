import { Text, TextInput, View } from "react-native";

interface ProfileFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  editable: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "phone-pad";
  multiline?: boolean;
}

export default function ProfileField({
  label,
  value,
  onChangeText,
  placeholder,
  editable,
  autoCapitalize = "sentences",
  keyboardType = "default",
  multiline = false,
}: ProfileFieldProps) {
  return (
    <View className="mb-3.5">
      <Text className="mb-2 text-[13px] font-medium text-gray-500">
        {label}
      </Text>
      {editable ? (
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
      ) : (
        <Text className="min-h-12 justify-center rounded-[10px] bg-slate-50 px-3 py-3 text-[15px] text-gray-900">
          {value || "Not provided"}
        </Text>
      )}
    </View>
  );
}
