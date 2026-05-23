import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useVault } from "@/context/VaultContext";
import AudioPlayerRow from "@/components/AudioPlayerRow";
import { getLegalAdvice } from "@/utils/legalAdvisor";
import type { MediaItem } from "@/utils/storage";

export default function IncidentDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { incidents, removeIncident } = useVault();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // AI insights state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const incident = incidents.find((i) => i.id === id);

  useEffect(() => {
    if (!incident) return;
    const issue = [incident.title, incident.narrative].filter(Boolean).join(". ");
    if (!issue.trim()) return;

    setAiLoading(true);
    setAiText(null);
    setAiError(null);
    getLegalAdvice(issue)
      .then((res) => setAiText(res.text))
      .catch(() => setAiError("Could not reach AI advisor. Try again later."))
      .finally(() => setAiLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incident?.id]);

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

  const handleDelete = async () => {
    setDeleting(true);
    await removeIncident(incident.id);
    router.replace("/vault");
  };

  // Parse "• sentence" bullets
  const parseBullets = (text: string): string[] =>
    text
      .split(/(?=•)/)
      .map((s) => s.replace(/^•\s*/, "").trim())
      .filter(Boolean);

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
          onPress={() => setConfirmDelete(true)}
          style={[styles.iconBtn, { backgroundColor: colors.muted }]}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Feather name="trash-2" size={16} color={colors.destructive} />
        </TouchableOpacity>
      </View>

      {/* Inline delete confirmation bar */}
      {confirmDelete && (
        <View style={[styles.confirmBar, { backgroundColor: "#FFF0F0", borderColor: colors.destructive }]}>
          <Feather name="alert-triangle" size={14} color={colors.destructive} />
          <Text style={[styles.confirmText, { color: colors.destructive }]}>
            Delete this entry permanently?
          </Text>
          <View style={styles.confirmBtns}>
            <TouchableOpacity
              style={[styles.confirmCancelBtn, { backgroundColor: colors.secondary }]}
              onPress={() => setConfirmDelete(false)}
            >
              <Text style={[styles.confirmCancelText, { color: colors.foreground }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmDeleteBtn, { backgroundColor: colors.destructive }]}
              onPress={handleDelete}
              disabled={deleting}
            >
              <Text style={styles.confirmDeleteText}>{deleting ? "Deleting…" : "Delete"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── AI Legal Insights ── */}
        <View style={[styles.aiCard, { backgroundColor: colors.primary + "0D", borderColor: colors.primary + "33" }]}>
          <View style={styles.aiHeader}>
            <View style={[styles.aiIconWrap, { backgroundColor: colors.primary + "22" }]}>
              <Feather name="cpu" size={14} color={colors.primary} />
            </View>
            <View style={styles.aiHeaderText}>
              <Text style={[styles.aiTitle, { color: colors.primary }]}>AI Legal Insights</Text>
              <Text style={[styles.aiSubtitle, { color: colors.mutedForeground }]}>
                Based on your recorded narrative
              </Text>
            </View>
          </View>

          {aiLoading && (
            <View style={styles.aiLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.aiLoadingText, { color: colors.mutedForeground }]}>
                Analysing your situation…
              </Text>
            </View>
          )}

          {aiError && !aiLoading && (
            <View style={[styles.aiErrorRow, { borderColor: colors.border }]}>
              <Feather name="wifi-off" size={13} color={colors.mutedForeground} />
              <Text style={[styles.aiErrorText, { color: colors.mutedForeground }]}>{aiError}</Text>
            </View>
          )}

          {aiText && !aiLoading && (
            <View style={styles.aiBullets}>
              {parseBullets(aiText).map((bullet, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.bulletText, { color: colors.foreground }]}>{bullet}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={[styles.aiDisclaimer, { color: colors.mutedForeground }]}>
            Automated aid only — not official legal advice.
          </Text>
        </View>

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
  confirmBar: {
    flexDirection: "row", alignItems: "center", flexWrap: "wrap",
    gap: 8, paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1.5,
  },
  confirmText: { fontSize: 13, fontWeight: "600" as const, flex: 1 },
  confirmBtns: { flexDirection: "row", gap: 8 },
  confirmCancelBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  confirmCancelText: { fontSize: 13, fontWeight: "600" as const },
  confirmDeleteBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  confirmDeleteText: { fontSize: 13, fontWeight: "700" as const, color: "#FFFFFF" },
  content: { padding: 16, gap: 14, paddingBottom: 40 },

  // AI Insights card
  aiCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  aiIconWrap: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  aiHeaderText: { flex: 1, gap: 2 },
  aiTitle: { fontSize: 13, fontWeight: "700" as const },
  aiSubtitle: { fontSize: 11 },
  aiLoading: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  aiLoadingText: { fontSize: 13 },
  aiErrorRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 4, borderTopWidth: 1 },
  aiErrorText: { fontSize: 12, flex: 1 },
  aiBullets: { gap: 10 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bulletDot: { width: 7, height: 7, borderRadius: 4, marginTop: 5, flexShrink: 0 },
  bulletText: { fontSize: 13, lineHeight: 20, flex: 1 },
  aiDisclaimer: { fontSize: 10, fontStyle: "italic" as const, marginTop: 2 },

  // Evidence & metadata cards
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
});
