import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import {
  useAudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setIsAudioActiveAsync,
} from "expo-audio";
import { useColors } from "@/hooks/useColors";
import { useVault } from "@/context/VaultContext";
import { useAuth } from "@/context/AuthContext";
import LegalAdvisory from "@/components/LegalAdvisory";
import { detectLegal } from "@/utils/legalMap";
import { uploadMediaToStorage } from "@/utils/mediaUpload";
import type { MediaItem } from "@/utils/storage";

export default function LogIncidentScreen() {
  const colors = useColors();
  const { addIncident } = useVault();
  const { deviceId } = useAuth();

  const [title, setTitle] = useState("");
  const [narrative, setNarrative] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [timerRef, setTimerRef] = useState<ReturnType<typeof setInterval> | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const legalMatches = detectLegal(narrative);

  // ─── Photo picker ────────────────────────────────────────────────────────
  const pickImages = useCallback(async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Allow access to your photo library.");
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      const newItems: MediaItem[] = result.assets.map((a) => ({
        type: "image" as const,
        filename: a.fileName ?? `image_${Date.now()}.jpg`,
        uri: a.uri,
      }));
      setMedia((prev) => [...prev, ...newItems]);
    }
  }, []);

  // ─── Audio recording ─────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    try {
      if (Platform.OS !== "web") {
        const { granted } = await requestRecordingPermissionsAsync();
        if (!granted) {
          Alert.alert("Permission needed", "Allow microphone access to record audio.");
          return;
        }
        await setIsAudioActiveAsync(true);
      }
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
      setRecordingSeconds(0);
      const t = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
      setTimerRef(t);
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      console.warn("[log] startRecording error:", e);
      Alert.alert("Recording failed", "Could not start audio recording.");
    }
  }, [recorder]);

  const stopRecording = useCallback(async () => {
    if (timerRef) clearInterval(timerRef);
    setTimerRef(null);
    setIsRecording(false);
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (uri) {
        const index = media.filter((m) => m.type === "audio").length + 1;
        const filename = `audio_${Date.now()}_${index}.m4a`;
        setMedia((prev) => [...prev, { type: "audio", filename, uri }]);
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      console.warn("[log] stopRecording error:", e);
    }
  }, [recorder, timerRef, media]);

  const removeMedia = useCallback((index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ─── Save ────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!title.trim() && !narrative.trim()) {
      Alert.alert("Required", "Please add a title or narrative.");
      return;
    }
    setSaving(true);
    try {
      // Upload all media to cloud storage
      const uploadedMedia: MediaItem[] = await Promise.all(
        media.map(async (item) => {
          if (deviceId && item.uri && !item.uri.startsWith("http")) {
            try {
              const mimeType = item.type === "image" ? "image/jpeg" : "audio/m4a";
              const cloudUri = await uploadMediaToStorage(item.uri, item.filename, deviceId, mimeType);
              return { ...item, uri: cloudUri };
            } catch {
              return item; // keep local URI as fallback
            }
          }
          return item;
        })
      );

      await addIncident({
        title: title.trim() || "Untitled Entry",
        narrative: narrative.trim(),
        media: uploadedMedia,
        legalCategories: legalMatches.map((m) => m.category),
      });
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/vault");
    } catch {
      Alert.alert("Error", "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [title, narrative, media, legalMatches, addIncident, deviceId]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const imageItems = media.filter((m) => m.type === "image");
  const audioItems = media.filter((m) => m.type === "audio");

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* ── Incident details ── */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        INCIDENT DETAILS / تفصیلات
      </Text>

      <View style={[styles.field, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          style={[styles.inputTitle, { color: colors.foreground }]}
          placeholder="Entry title"
          placeholderTextColor={colors.mutedForeground}
          value={title}
          onChangeText={setTitle}
          maxLength={80}
        />
      </View>

      <View style={[styles.field, styles.narrativeField, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          style={[styles.inputNarrative, { color: colors.foreground }]}
          placeholder="Describe what happened... / واقعہ بیان کریں"
          placeholderTextColor={colors.mutedForeground}
          value={narrative}
          onChangeText={setNarrative}
          multiline
          textAlignVertical="top"
          maxLength={4000}
        />
        <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
          {narrative.length}/4000
        </Text>
      </View>

      <LegalAdvisory matches={legalMatches} />

      {/* ── Attach Evidence ── */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 20 }]}>
        ATTACH EVIDENCE / ثبوت منسلک کریں
      </Text>

      <View style={styles.mediaRow}>
        {/* Photos button */}
        <TouchableOpacity
          style={[
            styles.mediaBtn,
            {
              backgroundColor: imageItems.length > 0 ? colors.primary : colors.secondary,
              borderColor: colors.border,
            },
          ]}
          onPress={pickImages}
          activeOpacity={0.8}
        >
          <Feather name="image" size={20} color={imageItems.length > 0 ? "#FFF" : colors.foreground} />
          <Text style={[styles.mediaBtnText, { color: imageItems.length > 0 ? "#FFF" : colors.foreground }]}>
            {imageItems.length > 0 ? `Photos (${imageItems.length})` : "+ Photos"}
          </Text>
        </TouchableOpacity>

        {/* Record Audio button */}
        <TouchableOpacity
          style={[
            styles.mediaBtn,
            {
              backgroundColor: isRecording ? colors.destructive : audioItems.length > 0 ? colors.primary : colors.secondary,
              borderColor: isRecording ? colors.destructive : colors.border,
            },
          ]}
          onPress={isRecording ? stopRecording : startRecording}
          activeOpacity={0.8}
        >
          <Feather
            name={isRecording ? "square" : "mic"}
            size={20}
            color={isRecording || audioItems.length > 0 ? "#FFF" : colors.foreground}
          />
          <Text style={[styles.mediaBtnText, { color: isRecording || audioItems.length > 0 ? "#FFF" : colors.foreground }]}>
            {isRecording ? fmt(recordingSeconds) : audioItems.length > 0 ? `Audio (${audioItems.length})` : "+ Audio"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Image thumbnails grid ── */}
      {imageItems.length > 0 && (
        <View style={styles.thumbGrid}>
          {media.map((item, idx) =>
            item.type !== "image" ? null : (
              <View key={idx} style={styles.thumbWrap}>
                <Image
                  source={{ uri: item.uri }}
                  style={[styles.thumb, { borderColor: colors.border }]}
                  contentFit="cover"
                />
                <TouchableOpacity
                  style={[styles.thumbRemove, { backgroundColor: colors.destructive }]}
                  onPress={() => removeMedia(idx)}
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                  <Feather name="x" size={10} color="#FFF" />
                </TouchableOpacity>
              </View>
            )
          )}
        </View>
      )}

      {/* ── Audio clips list ── */}
      {audioItems.length > 0 && (
        <View style={styles.audioList}>
          {media.map((item, idx) =>
            item.type !== "audio" ? null : (
              <View
                key={idx}
                style={[styles.audioRow, { backgroundColor: colors.muted, borderColor: colors.border }]}
              >
                <View style={[styles.audioIcon, { backgroundColor: colors.card }]}>
                  <Feather name="mic" size={14} color={colors.primary} />
                </View>
                <Text style={[styles.audioName, { color: colors.foreground }]} numberOfLines={1}>
                  Recording {audioItems.indexOf(item) + 1}
                </Text>
                <TouchableOpacity
                  onPress={() => removeMedia(idx)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Feather name="x" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            )
          )}
        </View>
      )}

      <View style={[styles.infoBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Feather name="shield" size={13} color={colors.accent} />
        <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
          SHA-256 hash generated on save. All media is uploaded to encrypted cloud storage.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: saving ? colors.secondary : colors.primary, opacity: saving ? 0.7 : 1 }]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.85}
      >
        {saving ? (
          <>
            <ActivityIndicator color="#FFF" size="small" />
            <Text style={styles.saveBtnText}>{media.length > 0 ? "Uploading…" : "Saving…"}</Text>
          </>
        ) : (
          <>
            <Feather name="save" size={18} color="#FFF" />
            <Text style={styles.saveBtnText}>Save Entry / محفوظ کریں</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const THUMB_SIZE = 90;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 11, fontWeight: "700" as const, letterSpacing: 0.8, marginBottom: 8, marginTop: 4,
  },
  field: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 10 },
  narrativeField: { minHeight: 120 },
  inputTitle: { fontSize: 16, fontWeight: "600" as const, paddingVertical: 4 },
  inputNarrative: { fontSize: 14, lineHeight: 22, paddingVertical: 4, minHeight: 90 },
  charCount: { fontSize: 11, textAlign: "right", marginTop: 4 },
  mediaRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  mediaBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1,
  },
  mediaBtnText: { fontSize: 14, fontWeight: "600" as const },
  thumbGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  thumbWrap: { position: "relative" },
  thumb: { width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: 10, borderWidth: 1 },
  thumbRemove: {
    position: "absolute", top: -6, right: -6,
    width: 18, height: 18, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
  },
  audioList: { gap: 0, marginBottom: 12 },
  audioRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 8,
  },
  audioIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  audioName: { flex: 1, fontSize: 13, fontWeight: "500" as const },
  infoBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1,
    marginTop: 4, marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 11, lineHeight: 16 },
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 16, borderRadius: 14,
  },
  saveBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" as const },
});
