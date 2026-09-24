import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const debuggerHost = Constants.manifest?.debuggerHost?.split(":")[0];
const localHost =
  debuggerHost || Constants.expoConfig?.extra?.localHost || "localhost";

export const Base_URL =
  Constants.expoConfig?.extra?.apiUrl || `http://${localHost}:3000/api`;

interface ErrorResponse {
  message?: string;
  error?: string;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() || "";
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  if (contentType.includes("application/json")) {
    return JSON.parse(text) as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Unexpected response format from server.");
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem("token");

  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${Base_URL}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(await getAuthHeaders()),
      ...init.headers,
    },
  });

  let payload: T;
  try {
    payload = await parseResponse<T>(response);
  } catch {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  if (!response.ok) {
    const error = payload as ErrorResponse;
    throw new Error(
      error.message ||
        error.error ||
        `Request failed with status ${response.status}.`,
    );
  }

  return payload;
}

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "PUT", body: JSON.stringify(body) });
}
