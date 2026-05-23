import AsyncStorage from "@react-native-async-storage/async-storage";
import { obfuscate, deobfuscate } from "./crypto";

const STORAGE_KEY = "hq_v1";
const PIN_KEY = "hq_p";

export interface Incident {
  id: string;
  timestamp: string;
  title: string;
  narrative: string;
  mediaType: "none" | "image" | "audio";
  mediaFilename: string;
  mediaUri?: string;
  hash: string;
  legalCategories: string[];
}

export async function saveIncident(incident: Incident): Promise<void> {
  const incidents = await getIncidents();
  incidents.push(incident);
  await AsyncStorage.setItem(STORAGE_KEY, obfuscate(JSON.stringify(incidents)));
}

export async function deleteIncident(id: string): Promise<void> {
  const incidents = await getIncidents();
  const filtered = incidents.filter((i) => i.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, obfuscate(JSON.stringify(filtered)));
}

export async function getIncidents(): Promise<Incident[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(deobfuscate(raw)) as Incident[];
  } catch {
    return [];
  }
}

export async function savePin(pinHash: string): Promise<void> {
  await AsyncStorage.setItem(PIN_KEY, obfuscate(pinHash));
}

export async function getStoredPinHash(): Promise<string | null> {
  const raw = await AsyncStorage.getItem(PIN_KEY);
  if (!raw) return null;
  try {
    return deobfuscate(raw);
  } catch {
    return null;
  }
}

export async function hasPinSet(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(PIN_KEY);
  return raw !== null;
}

export async function wipeAllData(): Promise<void> {
  await AsyncStorage.clear();
}
