import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import ContactDetails from "../../components/driver/profile/ContactDetails";
import DriverStatus from "../../components/driver/profile/DriverStatus";
import VehicleDetails from "../../components/driver/profile/VehicleDetails";
import { useAuth } from "../../context/AuthContext";
import { useDriver } from "../../context/DriverContext";
import { logout } from "../../redux/features/auth/authThunk";
import { useAppDispatch } from "../../redux/store/hooks";
import type { DriverProfileUpdate } from "../../types/driver.types";

export default function DriverProfileScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  console.log(user);
  const { profile, loading, saving, error, refresh, update } = useDriver();
  const [form, setForm] = useState<DriverProfileUpdate | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const vehicleType = form?.vehicleType ?? profile?.vehicleType ?? "BIKE";
  const vehicleNumber = form?.vehicleNumber ?? profile?.vehicleNumber ?? "";
  const licenseNumber = form?.licenseNumber ?? profile?.licenseNumber ?? "";
  const phone = form?.phone ?? profile?.phone ?? "";
  const address = form?.address ?? profile?.address ?? "";
  const isAvailable = form?.isAvailable ?? profile?.isAvailable ?? false;

  const updateForm = (updates: Partial<DriverProfileUpdate>) => {
    setForm((current) => ({
      vehicleType: current?.vehicleType ?? profile?.vehicleType ?? "BIKE",
      vehicleNumber: current?.vehicleNumber ?? profile?.vehicleNumber ?? "",
      licenseNumber: current?.licenseNumber ?? profile?.licenseNumber ?? "",
      phone: current?.phone ?? profile?.phone ?? "",
      address: current?.address ?? profile?.address ?? "",
      isAvailable: current?.isAvailable ?? profile?.isAvailable ?? false,
      ...updates,
    }));
  };

  // useEffect(() => {
  //   void dispatch(loadDriverProfile());
  // }, [dispatch]);

  const handleSave = async () => {
    if (
      !vehicleNumber.trim() ||
      !licenseNumber.trim() ||
      !phone.trim() ||
      !address.trim()
    ) {
      Alert.alert(
        "Missing details",
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

    try {
      await update(updates);
      setForm(null);
      setIsEditing(false);
      Alert.alert("Profile updated", "Your driver details have been saved.");
    } catch {
      // Save errors are exposed from Redux state.
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
        <View className="mb-[22px] flex-row items-center justify-between">
          <Text className="text-[28px] font-bold text-gray-900">
            Driver Profile
          </Text>
          {profile ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={
                isEditing ? "Cancel profile editing" : "Edit profile"
              }
              className="h-11 w-11 items-center justify-center rounded-full bg-green-100"
              onPress={() => {
                if (isEditing) {
                  setForm(null);
                  setIsEditing(false);
                } else {
                  setForm(null);
                  setIsEditing(true);
                }
              }}
            >
              <Ionicons
                name={isEditing ? "close" : "create-outline"}
                size={22}
                color="#15803d"
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <View className="mb-4 flex-row items-center rounded-2xl bg-white p-4">
          {profileImageUri ? (
            <Image
              source={{ uri: profileImageUri }}
              className="h-16 w-16 rounded-full bg-gray-200"
            />
          ) : (
            <View className="h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Text className="text-[26px] font-bold text-green-700">
                {(user?.first_name || "D").charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View className="ml-3.5 flex-1">
            <Text className="text-lg font-bold text-gray-900">
              {user?.first_name || "Driver"} {user?.last_name || ""}
            </Text>
            <Text className="mt-1 text-gray-500">{user?.email || ""}</Text>
            <Text className="mt-1 text-xs font-semibold text-green-700">
              {profile?.isActive === false
                ? "Inactive account"
                : "Active account"}
            </Text>
          </View>
        </View>

        {!profile ? (
          <View className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <Text className="font-semibold text-amber-900">
              Driver details are not set up yet.
            </Text>
            <Text className="mt-1 text-sm text-amber-800">
              Your account is loaded, but the backend did not return a driver
              record. Ask the backend to create/link a driver record for this
              user, then refresh this screen.
            </Text>
          </View>
        ) : null}

        <VehicleDetails
          vehicleType={vehicleType}
          onVehicleTypeChange={(value) => updateForm({ vehicleType: value })}
          vehicleNumber={vehicleNumber}
          onVehicleNumberChange={(value) =>
            updateForm({ vehicleNumber: value })
          }
          licenseNumber={licenseNumber}
          onLicenseNumberChange={(value) =>
            updateForm({ licenseNumber: value })
          }
          editable={isEditing}
        />

        <ContactDetails
          email={user?.email}
          phone={phone}
          onPhoneChange={(value) => updateForm({ phone: value })}
          address={address}
          onAddressChange={(value) => updateForm({ address: value })}
          editable={isEditing}
        />

        <DriverStatus
          isAvailable={isAvailable}
          onAvailabilityChange={(value) => updateForm({ isAvailable: value })}
          rating={profile?.rating}
          userId={profile?.userId}
          editable={isEditing}
        />

        {error ? (
          <Text accessibilityRole="alert" className="mb-3.5 text-red-600">
            {error}
          </Text>
        ) : null}

        {isEditing ? (
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="h-[52px] flex-1 items-center justify-center rounded-[11px] border border-gray-300 bg-white"
              onPress={() => {
                setForm(null);
                setIsEditing(false);
              }}
              disabled={saving}
            >
              <Text className="font-semibold text-gray-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`h-[52px] flex-1 items-center justify-center rounded-[11px] bg-green-600 ${saving ? "opacity-65" : ""}`}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-bold text-white">
                  Save changes
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        {!profile ? (
          <TouchableOpacity
            className="items-center py-3.5"
            onPress={() => {
              refresh();
            }}
          >
            <Text className="font-semibold text-green-700">
              {error ? "Retry loading profile" : "Refresh profile"}
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
