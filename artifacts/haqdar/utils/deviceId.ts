import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEVICE_ID_KEY = "@haqdar:device_id";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback manual UUID v4
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let _cachedDeviceId: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (_cachedDeviceId) return _cachedDeviceId;

  // On native, expo-constants provides a stable hardware-based device ID
  const nativeId = Constants.deviceId as string | null | undefined;
  if (nativeId) {
    _cachedDeviceId = nativeId;
    return nativeId;
  }

  // Web / fallback: generate once and persist forever in AsyncStorage
  const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (stored) {
    _cachedDeviceId = stored;
    return stored;
  }

  const newId = generateUUID();
  await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
  _cachedDeviceId = newId;
  return newId;
}
