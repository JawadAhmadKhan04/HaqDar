import { supabase, SupabaseIncident } from "./supabase";
import { Incident } from "./storage";

export async function pushIncidentToCloud(incident: Incident, deviceId: string): Promise<void> {
  const row: Omit<SupabaseIncident, "created_at"> = {
    id: incident.id,
    device_id: deviceId,
    title: incident.title,
    narrative: incident.narrative,
    media: incident.media,
    hash: incident.hash,
    legal_categories: incident.legalCategories,
    timestamp: incident.timestamp,
  };

  const { error } = await supabase.from("incidents").upsert(row, { onConflict: "id" });
  if (error) {
    console.warn("[sync] pushIncidentToCloud failed:", error.message);
    throw error;
  }
}

export async function deleteIncidentFromCloud(id: string): Promise<void> {
  const { error } = await supabase.from("incidents").delete().eq("id", id);
  if (error) {
    console.warn("[sync] deleteIncidentFromCloud failed:", error.message);
  }
}

export async function fetchIncidentsFromCloud(deviceId: string): Promise<Incident[]> {
  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .eq("device_id", deviceId)
    .order("timestamp", { ascending: true });

  if (error) {
    console.warn("[sync] fetchIncidentsFromCloud failed:", error.message);
    return [];
  }

  return (data as SupabaseIncident[]).map((row) => ({
    id: row.id,
    timestamp: row.timestamp,
    title: row.title,
    narrative: row.narrative,
    media: (row.media as Incident["media"]) ?? [],
    hash: row.hash,
    legalCategories: row.legal_categories ?? [],
  }));
}

export async function deleteAllIncidentsFromCloud(deviceId: string): Promise<void> {
  const { error } = await supabase.from("incidents").delete().eq("device_id", deviceId);
  if (error) {
    console.warn("[sync] deleteAllIncidentsFromCloud failed:", error.message);
  }
}
