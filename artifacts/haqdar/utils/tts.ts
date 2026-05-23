import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import type { AudioPlayer } from "expo-audio";

const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN ?? "";
const API_BASE = DOMAIN ? `https://${DOMAIN}/api` : "/api";

/**
 * Configures the audio session and starts playing TTS audio for the given text.
 * Returns the AudioPlayer instance — caller must call player.remove() when done.
 */
export async function playTTS(text: string): Promise<AudioPlayer> {
  await setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: "duckOthers",
  });

  const trimmed = text.trim().slice(0, 1500);
  const url = `${API_BASE}/tts?text=${encodeURIComponent(trimmed)}`;

  const player = createAudioPlayer({ uri: url });
  player.play();
  return player;
}
