import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const localHost =
  Constants.manifest?.debuggerHost?.split(":").shift() ||
  Constants.expoConfig?.extra?.localHost ||
  "localhost";

export const Base_URL = __DEV__
  ? `http://${localHost}:3000/api`
  : "http://localhost:3000/api";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("Content-Type")?.toLowerCase() || "";
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error("Invalid JSON response from server.");
    }
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Unexpected response format from server.");
  }
}

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem("token");

  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${Base_URL}${path}`, {
    headers: await getAuthHeaders(),
  });
  const json = await parseResponse<T>(response);

  if (!response.ok) {
    throw new Error((json as { message?: string }).message || "Service error");
  }

  return json;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${Base_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify(body),
  });
  const json = await parseResponse<T>(response);

  if (!response.ok) {
    throw new Error((json as { message?: string }).message || "Server error");
  }

  return json;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${Base_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify(body),
  });
  const json = await parseResponse<T>(response);

  if (!response.ok) {
    throw new Error((json as { message?: string }).message || "Server error");
  }

  return json;
}

