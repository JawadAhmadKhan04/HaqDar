import { supabase } from "./supabase";

const BUCKET = "haqdar-media";

export async function uploadMediaToStorage(
  uri: string,
  filename: string,
  deviceId: string,
  mimeType: string
): Promise<string> {
  const path = `${deviceId}/${Date.now()}_${filename}`;

  const response = await fetch(uri);
  const blob = await response.blob();

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
