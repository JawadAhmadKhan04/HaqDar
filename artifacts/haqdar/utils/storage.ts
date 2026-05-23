import AsyncStorage from "@react-native-async-storage/async-storage";
import { obfuscate, deobfuscate } from "./crypto";

const STORAGE_KEY = "hq_v1";
const PIN_KEY = "hq_p";

export interface MediaItem {
  type: "image" | "audio";
  filename: string;
  uri: string;
}

export interface Incident {
  id: string;
  timestamp: string;
  title: string;
  narrative: string;
  media: MediaItem[];
  hash: string;
  legalCategories: string[];
}

/** Migrate old single-media format to new media array format */
function migrateIncident(raw: any): Incident {
  if (Array.isArray(raw.media)) return raw as Incident;
  // Old format: mediaType, mediaFilename, mediaUri
  const media: MediaItem[] = [];
  if (raw.mediaType && raw.mediaType !== "none" && raw.mediaFilename) {
    media.push({
      type: raw.mediaType as "image" | "audio",
      filename: raw.mediaFilename,
      uri: raw.mediaUri ?? "",
    });
  }
  return {
    id: raw.id,
    timestamp: raw.timestamp,
    title: raw.title,
    narrative: raw.narrative,
    media,
    hash: raw.hash,
    legalCategories: raw.legalCategories ?? [],
  };
}

export async function saveIncident(incident: Incident): Promise<void> {
  const incidents = await getIncidents();
  const idx = incidents.findIndex((i) => i.id === incident.id);
  if (idx >= 0) {
    incidents[idx] = incident;
  } else {
    incidents.push(incident);
  }
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
    const parsed = JSON.parse(deobfuscate(raw));
    return (parsed as any[]).map(migrateIncident);
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
