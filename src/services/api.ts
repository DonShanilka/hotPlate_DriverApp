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

export async function apiGet<T>(params: string): Promise<T> {
    const token = await AsyncStorage.getItem("token");
    const headers: Record<string, string> = token ? {Authorization: `Bearer ${token}`} : {};

    const response = await fetch(`${Base_URL}${params}`, {headers});
    const json = await parseResponse<T>(response);

    if (!response.ok) {
        throw new Error((json as any)?.message || "Service error");
    }

    return json;
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
    const token = await AsyncStorage.getItem("token");
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? {Authorization: `Bearer ${token}`} : {}),
    };

    const response = await fetch(`${Base_URL}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });

    const json = await parseResponse<T>(response);

    if (!response.ok) {
        throw new Error((json as any)?.message || "Server error");;
    }

    return json;
}

export async function apiPut<T>(path: string, body: any): Promise<T> {
    const token = await AsyncStorage.getItem("token");
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? {Authorization: `Bearer ${token}`} : {}),
    };

    const response = await fetch(`${Base_URL}${path}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
    });

    const json = await parseResponse<T>(response);

    if (!response.ok) {
        throw new Error((json as any)?.message || "Server error");
    }

    return json;
}