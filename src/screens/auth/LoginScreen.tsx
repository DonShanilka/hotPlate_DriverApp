import { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAuth } from "@/context/AuthContext";
import { apiPost } from "@/lib/api/client";

import LoginImage from "../../../assets/images/loginPage/login_image.png";

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await apiPost<{
        success: boolean;
        data: any;
        token?: string;
      }>("/users/login", {
        email: email.trim(),
        password,
      });

      if (result?.data) {
        const token =
          result?.token || result?.data?.token || result?.data?.accessToken;

        if (token) {
          if (remember) {
            await AsyncStorage.setItem("token", token);
          } else {
            await AsyncStorage.setItem("token", token);
          }
        }

        await setUser(result.data);

        router.replace("/(driver)/home");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6">
      {/* Illustration */}
      <View className="items-center mt-40 mb-8">
        <Image source={LoginImage} className="w-64 h-64" resizeMode="contain" />
      </View>

      <View className="absolute top-106 left-0 right-0 px-6 pt-12">
        {/* Title */}
        <Text className="text-3xl font-bold text-gray-800 mb-2">Login</Text>
        <Text className="text-gray-500 mb-8">
          Welcome back! Login to continue.
        </Text>
      </View>

      <View className="absolute bottom-14 left-0 right-0 px-6">
        {/* Email */}
        <View className="flex-row items-center border border-gray-200 rounded-xl px-4 h-14 mb-4">
          <Feather name="mail" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            className="flex-1 ml-3 text-base"
          />
        </View>

        {/* Password */}
        <View className="flex-row items-center border border-gray-200 rounded-xl px-4 h-14">
          <Feather name="lock" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            className="flex-1 ml-3 text-base"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>

        {/* Remember */}
        <View className="flex-row justify-between items-center mt-4 mb-5">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setRemember(!remember)}
          >
            <View
              className={`w-5 h-5 rounded border mr-2 justify-center items-center ${
                remember ? "bg-green-500 border-green-500" : "border-gray-300"
              }`}
            >
              {remember && <Feather name="check" size={14} color="white" />}
            </View>
            <Text className="text-gray-500">Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text className="text-green-500 font-semibold">
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        {error ? <Text className="text-red-500 mb-3">{error}</Text> : null}

        {/* Login Button */}
        <TouchableOpacity
          className="bg-green-500 rounded-xl h-14 justify-center items-center"
          onPress={handleLogin}
        >
          <Text className="text-white text-lg font-bold">
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center my-8">
          <View className="flex-1 h-[1px] bg-gray-200" />
          <Text className="mx-4 text-gray-400">Or login with</Text>
          <View className="flex-1 h-[1px] bg-gray-200" />
        </View>

        {/* Social */}
        <View className="flex-row justify-between">
          <TouchableOpacity className="border border-gray-200 rounded-xl h-14 flex-1 mr-2 justify-center items-center flex-row">
            <AntDesign name="google" size={20} color="#DB4437" />
            <Text className="ml-2 font-semibold">Google</Text>
          </TouchableOpacity>

          <TouchableOpacity className="border border-gray-200 rounded-xl h-14 flex-1 ml-2 justify-center items-center flex-row">
            <FontAwesome name="facebook" size={20} color="#1877F2" />
            <Text className="ml-2 font-semibold">Facebook</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom */}
        <View className="flex-row justify-center mt-10">
          <Text className="text-gray-500">Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text className="text-green-500 font-bold ml-2 mb-2">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
