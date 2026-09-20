import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "hotplate_driver_token";
const USER_KEY = "hotplate_driver_user";

export const saveAuth = async (token: string, user: any): Promise<void> => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
};

export const getToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const getUser = async (): Promise<any | null> => {
  const user = await SecureStore.getItemAsync(USER_KEY);

  return user ? JSON.parse(user) : null;
};

export const clearAuth = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
};
