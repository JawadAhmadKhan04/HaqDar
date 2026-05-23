import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { Incident } from "@/utils/storage";

interface Props {
  incident: Incident;
  onPress: () => void;
}

const MONO_FONT = "Courier";
const MAX_THUMBS = 3;

export default function IncidentCard({ incident, onPress }: Props) {
  const colors = useColors();

  const date = new Date(incident.timestamp);
  const dateStr = date.toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = date.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });

  const images = incident.media.filter((m) => m.type === "image");
  const audios = incident.media.filter((m) => m.type === "audio");
  const thumbs = images.slice(0, MAX_THUMBS);
  const extraCount = images.length - MAX_THUMBS;

  // Summary icon for header
  const headerIcon: keyof typeof Feather.glyphMap =
    images.length > 0 ? "image" : audios.length > 0 ? "mic" : "file-text";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.accent, { backgroundColor: colors.primary }]} />
      <View style={styles.body}>
        {/* Header row */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Feather name={headerIcon} size={14} color={colors.mutedForeground} />
            <Text style={[styles.date, { color: colors.mutedForeground }]}>
              {dateStr} · {timeStr}
            </Text>
            {incident.media.length > 0 && (
              <View style={[styles.mediaBadge, { backgroundColor: colors.primary + "22" }]}>
                <Text style={[styles.mediaBadgeText, { color: colors.primary }]}>
                  {incident.media.length} file{incident.media.length !== 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </View>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </View>

        {/* Title + thumbnails row */}
        <View style={styles.mainRow}>
          <View style={styles.textBlock}>
            <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
              {incident.title || "Untitled Entry"}
            </Text>
            {incident.narrative ? (
              <Text
                style={[styles.preview, { color: colors.mutedForeground }]}
                numberOfLines={thumbs.length > 0 ? 1 : 2}
              >
                {incident.narrative}
              </Text>
            ) : null}
          </View>

          {/* Image thumbnail strip */}
          {thumbs.length > 0 && (
            <View style={styles.thumbStrip}>
              {thumbs.map((img, i) => (
                <View key={i} style={styles.thumbWrap}>
                  <Image
                    source={{ uri: img.uri }}
                    style={[styles.thumb, { borderColor: colors.border }]}
                    contentFit="cover"
                    transition={100}
                  />
                  {i === MAX_THUMBS - 1 && extraCount > 0 && (
                    <View style={[styles.thumbOverlay, { backgroundColor: "rgba(0,0,0,0.55)" }]}>
                      <Text style={styles.thumbOverlayText}>+{extraCount}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Audio-only badge */}
          {thumbs.length === 0 && audios.length > 0 && (
            <View style={[styles.audioBadge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="mic" size={16} color={colors.primary} />
              {audios.length > 1 && (
                <Text style={[styles.audioBadgeCount, { color: colors.primary }]}>
                  {audios.length}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Legal tags */}
        {incident.legalCategories.length > 0 && (
          <View style={styles.tags}>
            {incident.legalCategories.map((cat) => (
              <View key={cat} style={[styles.tag, { backgroundColor: colors.muted }]}>
                <Text style={[styles.tagText, { color: colors.accent }]} numberOfLines={1}>{cat}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Hash footer */}
        <View style={styles.hashRow}>
          <Feather name="shield" size={11} color={colors.success ?? colors.accent} />
          <Text style={[styles.hash, { color: colors.mutedForeground, fontFamily: MONO_FONT }]} numberOfLines={1}>
            {incident.hash.slice(0, 20)}…
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const THUMB = 56;

const styles = StyleSheet.create({
  card: {
    borderRadius: 14, borderWidth: 1, flexDirection: "row",
    overflow: "hidden", marginBottom: 12,
  },
  accent: { width: 4 },
  body: { flex: 1, padding: 14, gap: 6 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  date: { fontSize: 12, fontWeight: "500" as const },
  mediaBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  mediaBadgeText: { fontSize: 10, fontWeight: "700" as const },
  mainRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  textBlock: { flex: 1, gap: 4 },
  title: { fontSize: 15, fontWeight: "600" as const },
  preview: { fontSize: 13, lineHeight: 18 },
  thumbStrip: { flexDirection: "row", gap: 4, alignSelf: "flex-start" },
  thumbWrap: { position: "relative" },
  thumb: { width: THUMB, height: THUMB, borderRadius: 8, borderWidth: 1 },
  thumbOverlay: {
    position: "absolute", inset: 0, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  thumbOverlayText: { color: "#FFF", fontSize: 13, fontWeight: "700" as const },
  audioBadge: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1,
    alignItems: "center", justifyContent: "center", gap: 2,
  },
  audioBadgeCount: { fontSize: 10, fontWeight: "700" as const },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, maxWidth: 200 },
  tagText: { fontSize: 11, fontWeight: "600" as const },
  hashRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  hash: { fontSize: 10 },
});
