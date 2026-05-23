const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN ?? "";
const API_BASE = DOMAIN ? `https://${DOMAIN}/api` : "/api";

/**
 * Sends a local audio file URI to the STT proxy and returns the transcript.
 * Works on both native (file:// URIs) and web (blob: URIs).
 */
export async function transcribeAudio(uri: string): Promise<string> {
  const localResponse = await fetch(uri);
  const audioBlob = await localResponse.blob();

  const response = await fetch(`${API_BASE}/stt`, {
    method: "POST",
    headers: { "Content-Type": audioBlob.type || "audio/m4a" },
    body: audioBlob,
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(err.error ?? `STT failed: ${response.status}`);
  }

  const data = (await response.json()) as { transcript?: string };
  if (!data.transcript) throw new Error("No speech detected");
  return data.transcript;
}
