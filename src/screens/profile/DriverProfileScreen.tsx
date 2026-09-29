import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  getDriverProfile,
  updateDriverProfile,
} from "../../lib/api/driver.api";
import { logout } from "../../redux/features/auth/authThunk";
import { useAppDispatch, useAppSelector } from "../../redux/store/hooks";
import type {
  DriverProfile,
  DriverProfileUpdate,
  DriverVehicleType,
} from "../../types/driver.types";

export default function DriverProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicleType, setVehicleType] = useState<DriverVehicleType>("BIKE");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const loadedProfile = await getDriverProfile();
      setProfile(loadedProfile);
      setVehicleType(loadedProfile.vehicleType ?? "BIKE");
      setVehicleNumber(loadedProfile.vehicleNumber ?? "");
      setLicenseNumber(loadedProfile.licenseNumber ?? "");
      setPhone(loadedProfile.phone ?? "");
      setAddress(loadedProfile.address ?? "");
      setIsAvailable(loadedProfile.isAvailable ?? false);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load your driver profile.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (
      !vehicleNumber.trim() ||
      !licenseNumber.trim() ||
      !phone.trim() ||
      !address.trim()
    ) {
      setError(
        "Please complete your vehicle, license, phone, and address details.",
      );
      return;
    }

    const updates: DriverProfileUpdate = {
      vehicleType,
      vehicleNumber: vehicleNumber.trim(),
      licenseNumber: licenseNumber.trim(),
      phone: phone.trim(),
      address: address.trim(),
      isAvailable,
    };

    setSaving(true);
    setError(null);
    try {
      const updatedProfile = await updateDriverProfile(updates);
      setProfile(updatedProfile);
      setVehicleType(updatedProfile.vehicleType ?? vehicleType);
      setVehicleNumber(updatedProfile.vehicleNumber ?? updates.vehicleNumber);
      setLicenseNumber(updatedProfile.licenseNumber ?? updates.licenseNumber);
      setPhone(updatedProfile.phone ?? updates.phone);
      setAddress(updatedProfile.address ?? updates.address);
      setIsAvailable(updatedProfile.isAvailable ?? isAvailable);
      Alert.alert("Profile updated", "Your driver details have been saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update your driver profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          void dispatch(logout());
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-5 pt-14 pb-9">
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="mt-3 text-gray-500">Loading driver profile...</Text>
      </View>
    );
  }

  const profileImageUri =
    typeof profile?.profileImage === "string" ? profile.profileImage : null;

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      keyboardShouldPersistTaps="handled"
    >
      <View className="px-5 pt-14 pb-9">
        <Text className="mb-[22px] text-[28px] font-bold text-gray-900">
          Driver Profile
        </Text>

        <View className="mb-4 flex-row items-center rounded-2xl bg-white p-4">
          {profileImageUri ? (
            <Image
              source={{ uri: profileImageUri }}
              className="h-16 w-16 rounded-full bg-gray-200"
            />
          ) : (
            <View className="h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Text className="text-[26px] font-bold text-green-700">
                {(user?.firstName || "D").charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View className="ml-3.5 flex-1">
            <Text className="text-lg font-bold text-gray-900">
              {user?.firstName || "Driver"} {user?.lastName || ""}
            </Text>
            <Text className="mt-1 text-gray-500">{user?.email || ""}</Text>
            <Text className="mt-1 text-xs font-semibold text-green-700">
              {profile?.isActive === false
                ? "Inactive account"
                : "Active account"}
            </Text>
          </View>
        </View>

        <View className="mb-4 rounded-2xl bg-white p-4">
          <Text className="mb-3.5 text-[17px] font-bold text-gray-900">
            Vehicle
          </Text>
          <Text className="mb-2 text-[13px] font-medium text-gray-500">
            Vehicle type
          </Text>
          <View className="mb-3.5 flex-row">
            {(["BIKE", "CAR"] as const).map((type) => (
              <TouchableOpacity
                key={type}
                accessibilityRole="button"
                accessibilityState={{ selected: vehicleType === type }}
                onPress={() => setVehicleType(type)}
                className={`mr-2.5 rounded-[10px] border px-5 py-2.5 ${vehicleType === type ? "border-green-600 bg-green-50" : "border-gray-300"}`}
              >
                <Text
                  className={`font-semibold ${vehicleType === type ? "text-green-700" : "text-gray-600"}`}
                >
                  {type === "BIKE" ? "Bike" : "Car"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <ProfileInput
            label="Vehicle number"
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
            placeholder="Enter vehicle number"
            autoCapitalize="characters"
          />
          <ProfileInput
            label="License number"
            value={licenseNumber}
            onChangeText={setLicenseNumber}
            placeholder="Enter license number"
            autoCapitalize="characters"
          />
        </View>

        <View className="mb-4 rounded-2xl bg-white p-4">
          <Text className="mb-3.5 text-[17px] font-bold text-gray-900">
            Contact details
          </Text>
          <Text className="mb-2 text-[13px] font-medium text-gray-500">
            Email
          </Text>
          <Text className="mb-3.5 text-[17px] text-gray-900">
            {user?.email || "Not provided"}
          </Text>
          <ProfileInput
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
          <ProfileInput
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your address"
            multiline
          />
        </View>

        <View className="mb-4 rounded-2xl bg-white p-4">
          <Text className="mb-3.5 text-[17px] font-bold text-gray-900">
            Driver status
          </Text>
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="mb-2 text-[13px] font-medium text-gray-500">
                Available for deliveries
              </Text>
              <Text className="text-xs text-gray-400">
                {isAvailable
                  ? "You can receive delivery requests"
                  : "You are offline"}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: "#d1d5db", true: "#86efac" }}
              thumbColor={isAvailable ? "#16a34a" : "#f4f3f4"}
            />
          </View>
          <Text className="mb-2 text-[13px] font-medium text-gray-500">
            Rating
          </Text>
          <Text className="mb-3.5 text-[17px] text-gray-900">
            {typeof profile?.rating === "number"
              ? `${profile.rating.toFixed(1)} / 5`
              : "Not rated yet"}
          </Text>
          {profile?.userId ? (
            <>
              <Text className="mb-2 text-[13px] font-medium text-gray-500">
                Driver ID
              </Text>
              <Text className="mb-3.5 text-[17px] text-gray-900">
                {profile.userId}
              </Text>
            </>
          ) : null}
        </View>

        {error ? (
          <Text accessibilityRole="alert" className="mb-3.5 text-red-600">
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          className={`h-[52px] items-center justify-center rounded-[11px] bg-green-600 ${saving ? "opacity-65" : ""}`}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-bold text-white">Save changes</Text>
          )}
        </TouchableOpacity>

        {error && !profile ? (
          <TouchableOpacity
            className="items-center py-3.5"
            onPress={() => {
              setLoading(true);
              setError(null);
              void loadProfile();
            }}
          >
            <Text className="font-semibold text-green-700">
              Retry loading profile
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          className="mt-3.5 h-[50px] items-center justify-center rounded-[11px] bg-gray-900"
          onPress={handleLogout}
        >
          <Text className="font-bold text-white">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

interface ProfileInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "phone-pad";
  multiline?: boolean;
}

function ProfileInput({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = "sentences",
  keyboardType = "default",
  multiline = false,
}: ProfileInputProps) {
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
