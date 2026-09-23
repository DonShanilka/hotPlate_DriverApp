import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const localHost =
  Constants.manifest?.debuggerHost?.split(":").shift() ||
  Constants.expoConfig?.extra?.localHost ||
  "localhost";

export const Base_URL = __DEV__
  ? `http://${localHost}:3000/api`
  : "http://localhost:3000/api";

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return {} as T;
  }

  const contentType =
    response.headers.get("Content-Type")?.toLocaleLowerCase() || "";
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text) as T;
    } catch (parseError) {
      throw new Error("Invalid JSON response from Server.");
    }
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Unexpected response fromat from server.");
  }
}
