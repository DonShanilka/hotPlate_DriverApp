import { Text, View } from "react-native";

import ProfileField from "./ProfileField";

interface ContactDetailsProps {
  email?: string;
  phone: string;
  onPhoneChange: (value: string) => void;
  address: string;
  onAddressChange: (value: string) => void;
  editable: boolean;
}

export default function ContactDetails({
  email,
  phone,
  onPhoneChange,
  address,
  onAddressChange,
  editable,
}: ContactDetailsProps) {
  return (
    <View className="mb-4 rounded-2xl bg-white p-4">
      <Text className="mb-3.5 text-[17px] font-bold text-gray-900">
        Contact details
      </Text>
      <Text className="mb-2 text-[13px] font-medium text-gray-500">Email</Text>
      <Text className="mb-3.5 text-[17px] text-gray-900">
        {email || "Not provided"}
      </Text>
      <ProfileField
        label="Phone"
        value={phone}
        onChangeText={onPhoneChange}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
        editable={editable}
      />
      <ProfileField
        label="Address"
        value={address}
        onChangeText={onAddressChange}
        placeholder="Enter your address"
        multiline
        editable={editable}
      />
    </View>
  );
}
