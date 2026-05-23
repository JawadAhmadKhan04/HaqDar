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

const MEDIA_ICON: Record<Incident["mediaType"], keyof typeof Feather.glyphMap> = {
  none: "file-text",
  image: "image",
  audio: "mic",
};

const MONO_FONT = "Courier";

export default function IncidentCard({ incident, onPress }: Props) {
  const colors = useColors();

  const date = new Date(incident.timestamp);
  const dateStr = date.toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = date.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });

  const hasImageThumb = incident.mediaType === "image" && !!incident.mediaUri;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.accent, { backgroundColor: colors.primary }]} />
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Feather name={MEDIA_ICON[incident.mediaType]} size={14} color={colors.mutedForeground} />
            <Text style={[styles.date, { color: colors.mutedForeground }]}>
              {dateStr} · {timeStr}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </View>

        <View style={styles.mainRow}>
          <View style={styles.textBlock}>
            <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
              {incident.title || "Untitled Entry"}
            </Text>

            {incident.narrative ? (
              <Text style={[styles.preview, { color: colors.mutedForeground }]} numberOfLines={hasImageThumb ? 1 : 2}>
                {incident.narrative}
              </Text>
            ) : null}
          </View>

          {hasImageThumb ? (
            <Image
              source={{ uri: incident.mediaUri }}
              style={[styles.thumb, { borderColor: colors.border }]}
              contentFit="cover"
              transition={150}
            />
          ) : incident.mediaType === "audio" ? (
            <View style={[styles.audioThumb, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="mic" size={18} color={colors.primary} />
            </View>
          ) : null}
        </View>

        {incident.legalCategories.length > 0 ? (
          <View style={styles.tags}>
            {incident.legalCategories.map((cat) => (
              <View key={cat} style={[styles.tag, { backgroundColor: colors.muted }]}>
                <Text style={[styles.tagText, { color: colors.accent }]} numberOfLines={1}>
                  {cat}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

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

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 12,
  },
  accent: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  date: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  preview: {
    fontSize: 13,
    lineHeight: 18,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    flexShrink: 0,
  },
  audioThumb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    maxWidth: 200,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  hashRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  hash: {
    fontSize: 10,
  },
});
