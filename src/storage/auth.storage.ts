import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "hotplate_driver_token";
const USER_KEY = "hotplate_driver_user";

export const saveAuth = async (token: string, user: any): Promise<void> => {
  await Promise.all([
    AsyncStorage.setItem("token", token),
    AsyncStorage.setItem("user", JSON.stringify(user)),
    AsyncStorage.setItem(TOKEN_KEY, token),
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
  ]);
};

export const getToken = async (): Promise<string | null> => {
  return (await AsyncStorage.getItem("token")) ?? AsyncStorage.getItem(TOKEN_KEY);
};

export const getUser = async (): Promise<any | null> => {
  const user =
    (await AsyncStorage.getItem("user")) ??
    (await AsyncStorage.getItem(USER_KEY));

  return user ? JSON.parse(user) : null;
};

export const clearAuth = async (): Promise<void> => {
  await Promise.all([
    AsyncStorage.removeItem("token"),
    AsyncStorage.removeItem("user"),
    AsyncStorage.removeItem(TOKEN_KEY),
    AsyncStorage.removeItem(USER_KEY),
  ]);
};
