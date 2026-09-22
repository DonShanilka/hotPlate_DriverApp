import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const localHost =
  Constants.manifest?.debuggerHost?.split(":").shift() ||
  Constants.expoConfig?.extra?.localHost ||
  "localhost";

export function normalizeImageValue(value: any): string | undefined {
    if (!value) {
        return undefined;
    }

    

    return undefined
}