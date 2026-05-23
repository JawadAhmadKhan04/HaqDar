import { supabase, SupabaseIncident } from "./supabase";
import { Incident } from "./storage";

export async function pushIncidentToCloud(incident: Incident, userId: string): Promise<void> {
  const row: Omit<SupabaseIncident, "created_at"> = {
    id: incident.id,
    user_id: userId,
    title: incident.title,
    narrative: incident.narrative,
    media_type: incident.mediaType,
    media_filename: incident.mediaFilename,
    media_uri: incident.mediaUri ?? null,
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

export async function fetchIncidentsFromCloud(userId: string): Promise<Incident[]> {
  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .eq("user_id", userId)
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
    mediaType: row.media_type,
    mediaFilename: row.media_filename,
    mediaUri: row.media_uri ?? undefined,
    hash: row.hash,
    legalCategories: row.legal_categories ?? [],
  }));
}

export async function deleteAllIncidentsFromCloud(userId: string): Promise<void> {
  const { error } = await supabase.from("incidents").delete().eq("user_id", userId);
  if (error) {
    console.warn("[sync] deleteAllIncidentsFromCloud failed:", error.message);
  }
}
