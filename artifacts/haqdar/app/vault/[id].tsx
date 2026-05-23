import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useVault } from "@/context/VaultContext";
import AudioPlayerRow from "@/components/AudioPlayerRow";
import type { MediaItem } from "@/utils/storage";

export default function IncidentDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { incidents, removeIncident } = useVault();

  const incident = incidents.find((i) => i.id === id);

  if (!incident) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground }}>Entry not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = incident.media.filter((m) => m.type === "image");
  const audios = incident.media.filter((m) => m.type === "audio");

  const date = new Date(incident.timestamp);
  const fullDate = date.toLocaleString("en-PK", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  const handleDelete = () => {
    Alert.alert(
      "Delete Entry",
      "This will permanently delete this entry. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await removeIncident(incident.id);
            router.replace("/vault");
          },
        },
      ]
    );
  };

  const Row = ({ label, value }: { label: string; value: string }) => (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: colors.secondary }]}
        >
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.foreground }]} numberOfLines={1}>
          {incident.title}
        </Text>
        <TouchableOpacity
          onPress={handleDelete}
          style={[styles.iconBtn, { backgroundColor: colors.muted }]}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Feather name="trash-2" size={16} color={colors.destructive} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Photo evidence */}
        {images.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>
              PHOTO EVIDENCE / تصویری ثبوت ({images.length})
            </Text>
            {images.map((item: MediaItem, i: number) => (
              <View key={i} style={i > 0 ? { marginTop: 10 } : undefined}>
                <Image
                  source={{ uri: item.uri }}
                  style={styles.evidenceImage}
                  contentFit="cover"
                  transition={200}
                />
                <Text style={[styles.fileNote, { color: colors.mutedForeground }]}>
                  {item.filename}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Audio evidence */}
        {audios.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>
              AUDIO EVIDENCE / آڈیو ثبوت ({audios.length})
            </Text>
            {audios.map((item: MediaItem, i: number) => (
              <AudioPlayerRow
                key={i}
                filename={item.filename}
                uri={item.uri}
                index={i}
              />
            ))}
          </View>
        )}

        {/* Narrative */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>NARRATIVE / بیان</Text>
          <Text style={[styles.narrative, { color: colors.foreground }]}>
            {incident.narrative || "(No narrative recorded)"}
          </Text>
        </View>

        {/* Metadata */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>METADATA / معلومات</Text>
          <Row label="Timestamp" value={fullDate} />
          <Row label="UTC (ISO 8601)" value={incident.timestamp} />
          <Row label="Photos" value={String(images.length)} />
          <Row label="Audio clips" value={String(audios.length)} />
          {incident.legalCategories.length > 0 && (
            <Row label="Legal Categories" value={incident.legalCategories.join(", ")} />
          )}
        </View>

        {/* Hash */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.hashHeader}>
            <Feather name="shield" size={14} color={colors.accent} />
            <Text style={[styles.cardLabel, { color: colors.mutedForeground, marginBottom: 0 }]}>
              SHA-256 INTEGRITY HASH
            </Text>
          </View>
          <Text style={[styles.hashValue, { color: colors.accent }]} selectable>
            {incident.hash}
          </Text>
          <Text style={[styles.hashNote, { color: colors.mutedForeground }]}>
            Computed from: Timestamp + Narrative + Media Filenames. Any tampering will invalidate this hash.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  topBar: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  topTitle: { flex: 1, fontSize: 16, fontWeight: "600" as const },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14 },
  cardLabel: { fontSize: 10, fontWeight: "700" as const, letterSpacing: 0.8, marginBottom: 10 },
  evidenceImage: { width: "100%", height: 240, borderRadius: 10, backgroundColor: "#111" },
  fileNote: { fontSize: 11, marginTop: 6, textAlign: "center" },
  narrative: { fontSize: 15, lineHeight: 24 },
  row: {
    flexDirection: "row", paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth, gap: 12, alignItems: "flex-start",
  },
  rowLabel: { fontSize: 12, fontWeight: "600" as const, width: 100, flexShrink: 0 },
  rowValue: { fontSize: 12, flex: 1, lineHeight: 18 },
  hashHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  hashValue: { fontSize: 11, fontFamily: "Courier", lineHeight: 18, letterSpacing: 0.5, marginBottom: 8 },
  hashNote: { fontSize: 11, lineHeight: 16, fontStyle: "italic" as const },
});
