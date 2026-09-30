import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "hotplate_access_token";
const DRIVER_ID_KEY = "hotplate_driver_id";

export const storage = {
  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(
      ACCESS_TOKEN_KEY,
      token
    );
  },

  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(
      ACCESS_TOKEN_KEY
    );
  },

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(
      ACCESS_TOKEN_KEY
    );
  },

  async setDriverId(driverId: string): Promise<void> {
    await SecureStore.setItemAsync(
      DRIVER_ID_KEY,
      driverId
    );
  },

  async getDriverId(): Promise<string | null> {
    return SecureStore.getItemAsync(
      DRIVER_ID_KEY
    );
  },

  async removeDriverId(): Promise<void> {
    await SecureStore.deleteItemAsync(
      DRIVER_ID_KEY
    );
  },

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(
      ACCESS_TOKEN_KEY
    );

    await SecureStore.deleteItemAsync(
      DRIVER_ID_KEY
    );
  },
};