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
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useVault } from "@/context/VaultContext";
import LegalAdvisory from "@/components/LegalAdvisory";
import { detectLegal } from "@/utils/legalMap";

type MediaType = "none" | "image" | "audio";

export default function LogIncidentScreen() {
  const colors = useColors();
  const { addIncident } = useVault();

  const [title, setTitle] = useState("");
  const [narrative, setNarrative] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("none");
  const [mediaFilename, setMediaFilename] = useState("");
  const [mediaUri, setMediaUri] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [audioRecording, setAudioRecording] = useState(false);
  const [audioSeconds, setAudioSeconds] = useState(0);

  const legalMatches = detectLegal(narrative);

  const pickImage = useCallback(async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Allow access to photo library.");
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const filename = asset.fileName ?? `image_${Date.now()}.jpg`;
      setMediaType("image");
      setMediaFilename(filename);
      setMediaUri(asset.uri);
    }
  }, []);

  let audioTimer: ReturnType<typeof setInterval> | null = null;

  const toggleAudio = useCallback(() => {
    if (audioRecording) {
      if (audioTimer) clearInterval(audioTimer);
      setAudioRecording(false);
      const filename = `audio_${Date.now()}.m4a`;
      setMediaType("audio");
      setMediaFilename(filename);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      setAudioRecording(true);
      setAudioSeconds(0);
      audioTimer = setInterval(() => {
        setAudioSeconds((s) => s + 1);
      }, 1000);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  }, [audioRecording]);

  const clearMedia = () => {
    setMediaType("none");
    setMediaFilename("");
    setMediaUri(undefined);
    setAudioRecording(false);
    setAudioSeconds(0);
  };

  const handleSave = useCallback(async () => {
    if (!title.trim() && !narrative.trim()) {
      Alert.alert("Required", "Please add a title or narrative.");
      return;
    }
    setSaving(true);
    try {
      await addIncident({
        title: title.trim() || "Untitled Entry",
        narrative: narrative.trim(),
        mediaType,
        mediaFilename,
        mediaUri,
        legalCategories: legalMatches.map((m) => m.category),
      });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.replace("/vault");
    } catch (e) {
      Alert.alert("Error", "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [title, narrative, mediaType, mediaFilename, mediaUri, legalMatches, addIncident]);

  const formatAudio = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
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

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 20 }]}>
        ATTACH EVIDENCE / ثبوت منسلک کریں
      </Text>

      <View style={styles.mediaRow}>
        <TouchableOpacity
          style={[
            styles.mediaBtn,
            {
              backgroundColor: mediaType === "image" ? colors.primary : colors.secondary,
              borderColor: colors.border,
            },
          ]}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          <Feather
            name="image"
            size={20}
            color={mediaType === "image" ? "#FFFFFF" : colors.foreground}
          />
          <Text
            style={[
              styles.mediaBtnText,
              { color: mediaType === "image" ? "#FFFFFF" : colors.foreground },
            ]}
          >
            Photo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.mediaBtn,
            {
              backgroundColor:
                mediaType === "audio" || audioRecording ? colors.primary : colors.secondary,
              borderColor: audioRecording ? colors.destructive : colors.border,
            },
          ]}
          onPress={toggleAudio}
          activeOpacity={0.8}
        >
          <Feather
            name={audioRecording ? "square" : "mic"}
            size={20}
            color={mediaType === "audio" || audioRecording ? "#FFFFFF" : colors.foreground}
          />
          <Text
            style={[
              styles.mediaBtnText,
              {
                color:
                  mediaType === "audio" || audioRecording ? "#FFFFFF" : colors.foreground,
              },
            ]}
          >
            {audioRecording ? formatAudio(audioSeconds) : "Audio"}
          </Text>
        </TouchableOpacity>
      </View>

      {(mediaType !== "none") && (
        <View style={[styles.attachedRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather
            name={mediaType === "image" ? "image" : "mic"}
            size={14}
            color={colors.accent}
          />
          <Text style={[styles.attachedName, { color: colors.foreground }]} numberOfLines={1}>
            {mediaFilename}
          </Text>
          <TouchableOpacity onPress={clearMedia} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.infoBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Feather name="shield" size={13} color={colors.accent} />
        <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
          A SHA-256 tamper-evident hash is generated automatically on save, capturing exact timestamp + content.
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.saveBtn,
          {
            backgroundColor: saving ? colors.secondary : colors.primary,
            opacity: saving ? 0.7 : 1,
          },
        ]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.85}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Feather name="save" size={18} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Save Entry / محفوظ کریں</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  field: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  narrativeField: {
    minHeight: 120,
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    paddingVertical: 4,
  },
  inputNarrative: {
    fontSize: 14,
    lineHeight: 22,
    paddingVertical: 4,
    minHeight: 90,
  },
  charCount: {
    fontSize: 11,
    textAlign: "right",
    marginTop: 4,
  },
  mediaRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  mediaBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  mediaBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  attachedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  attachedName: {
    flex: 1,
    fontSize: 12,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700" as const,
  },
});
