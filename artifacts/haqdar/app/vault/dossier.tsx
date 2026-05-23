import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useVault } from "@/context/VaultContext";

export default function DossierScreen() {
  const colors = useColors();
  const { incidents, wipe } = useVault();

  const generated = new Date().toLocaleString("en-PK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const buildDossierText = () => {
    const lines: string[] = [];
    lines.push("=".repeat(60));
    lines.push("HAQDAR — EVIDENCE DOSSIER / حق دار — شواہد کی فائل");
    lines.push("=".repeat(60));
    lines.push(`Generated: ${generated}`);
    lines.push(`Total Incidents: ${incidents.length}`);
    lines.push(`\nDISCLAIMER: This dossier is an automated documentation aid.`);
    lines.push(`It is not official legal advice. / یہ سرکاری قانونی مشورہ نہیں۔`);
    lines.push("\n" + "=".repeat(60));
    lines.push("AUDIT LOG / آڈٹ لاگ");
    lines.push("=".repeat(60));

    incidents.forEach((inc, idx) => {
      const date = new Date(inc.timestamp);
      lines.push(`\n[${idx + 1}] ${inc.title}`);
      lines.push(`Timestamp: ${inc.timestamp}`);
      lines.push(`Date: ${date.toLocaleString("en-PK")}`);
      if (inc.narrative) lines.push(`Narrative: ${inc.narrative}`);
      if (inc.mediaFilename) lines.push(`Attachment: ${inc.mediaFilename} (${inc.mediaType})`);
      if (inc.legalCategories.length) lines.push(`Legal Categories: ${inc.legalCategories.join(", ")}`);
      lines.push(`SHA-256 Hash: ${inc.hash}`);
      lines.push("-".repeat(60));
    });

    lines.push("\n" + "=".repeat(60));
    lines.push("CHAIN OF CUSTODY STATEMENT");
    lines.push("=".repeat(60));
    lines.push(
      "Each entry's SHA-256 hash was computed at time of recording from the exact timestamp, narrative text, and media filename. Any modification to this data after recording will produce a different hash, proving tampering."
    );
    lines.push("\nHaqDar stores all data locally on this device only.");
    lines.push("No data is transmitted to any server.");

    return lines.join("\n");
  };

  const handleShare = async () => {
    if (incidents.length === 0) {
      Alert.alert("No entries", "Record at least one incident before exporting.");
      return;
    }
    const text = buildDossierText();
    try {
      await Share.share({ message: text, title: "HaqDar Evidence Dossier" });
    } catch {
      Alert.alert("Share failed", "Could not share the dossier.");
    }
  };

  const handleWipe = () => {
    Alert.alert(
      "⚠️ Wipe All Data",
      "This will permanently delete ALL incidents, your PIN, and reset the app. This cannot be undone.\n\nAre you absolutely sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Wipe Everything",
          style: "destructive",
          onPress: async () => {
            await wipe();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.docHeader, { backgroundColor: colors.primary }]}>
        <Feather name="file-text" size={28} color="#FFFFFF" />
        <View>
          <Text style={styles.docTitle}>Evidence Dossier</Text>
          <Text style={styles.docUrdu}>شواہد کی فائل</Text>
        </View>
      </View>

      <View style={[styles.metaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>DOSSIER METADATA</Text>
        <MetaRow label="Generated" value={generated} colors={colors} />
        <MetaRow label="Total Entries" value={String(incidents.length)} colors={colors} />
        <MetaRow label="Data Location" value="This device only" colors={colors} />
        <MetaRow label="Encryption" value="XOR + Base64 obfuscation" colors={colors} />
      </View>

      {incidents.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            AUDIT LOG / آڈٹ لاگ
          </Text>
          {incidents.map((inc, idx) => {
            const date = new Date(inc.timestamp);
            return (
              <View
                key={inc.id}
                style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.entryHeader}>
                  <View style={[styles.entryNum, { backgroundColor: colors.primary }]}>
                    <Text style={styles.entryNumText}>{idx + 1}</Text>
                  </View>
                  <Text style={[styles.entryTitle, { color: colors.foreground }]} numberOfLines={1}>
                    {inc.title}
                  </Text>
                </View>

                <View style={[styles.metaGrid, { borderTopColor: colors.border }]}>
                  <View style={styles.metaItem}>
                    <Text style={[styles.metaKey, { color: colors.mutedForeground }]}>Timestamp</Text>
                    <Text style={[styles.metaVal, { color: colors.foreground }]}>
                      {date.toLocaleString("en-PK")}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={[styles.metaKey, { color: colors.mutedForeground }]}>ISO 8601</Text>
                    <Text style={[styles.metaVal, { color: colors.foreground }]}>{inc.timestamp}</Text>
                  </View>
                  {inc.mediaFilename ? (
                    <View style={styles.metaItem}>
                      <Text style={[styles.metaKey, { color: colors.mutedForeground }]}>Attachment</Text>
                      <Text style={[styles.metaVal, { color: colors.foreground }]}>
                        {inc.mediaFilename} ({inc.mediaType})
                      </Text>
                    </View>
                  ) : null}
                </View>

                {inc.narrative ? (
                  <Text style={[styles.narrativePreview, { color: colors.foreground, borderTopColor: colors.border }]} numberOfLines={3}>
                    {inc.narrative}
                  </Text>
                ) : null}

                <View style={[styles.hashRow, { backgroundColor: colors.muted }]}>
                  <Feather name="shield" size={11} color={colors.accent} />
                  <Text style={[styles.hashLabel, { color: colors.mutedForeground }]}>SHA-256</Text>
                  <Text style={[styles.hashValue, { color: colors.accent }]} numberOfLines={2} selectable>
                    {inc.hash}
                  </Text>
                </View>
              </View>
            );
          })}
        </>
      )}

      {incidents.length === 0 && (
        <View style={styles.emptyDossier}>
          <Feather name="inbox" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No incidents recorded yet.
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.exportBtn, { backgroundColor: colors.primary }]}
          onPress={handleShare}
          activeOpacity={0.85}
        >
          <Feather name="share-2" size={18} color="#FFFFFF" />
          <Text style={styles.exportBtnText}>Export Dossier / فائل برآمد کریں</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.wipeBtn, { backgroundColor: "#FFF0F0", borderColor: colors.destructive }]}
          onPress={handleWipe}
          activeOpacity={0.85}
        >
          <Feather name="alert-triangle" size={16} color={colors.destructive} />
          <Text style={[styles.wipeBtnText, { color: colors.destructive }]}>
            Panic Reset — Wipe All Data
          </Text>
        </TouchableOpacity>
        <Text style={[styles.wipeNote, { color: colors.mutedForeground }]}>
          Instantly clears all records, PIN and resets the app.
        </Text>
      </View>

      <View style={[styles.custody, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Feather name="info" size={13} color={colors.mutedForeground} />
        <Text style={[styles.custodyText, { color: colors.mutedForeground }]}>
          Chain of custody: Each entry's SHA-256 hash proves the data has not been modified since recording. Any change to the timestamp, narrative, or filename will produce a different hash.
        </Text>
      </View>
    </ScrollView>
  );
}

function MetaRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={[styles.metaRowLine, { borderBottomColor: colors.border }]}>
      <Text style={[styles.metaRowLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.metaRowValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 48, gap: 14 },
  docHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 14,
  },
  docTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700" as const,
  },
  docUrdu: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginTop: 2,
  },
  metaCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  metaRowLine: {
    flexDirection: "row",
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  metaRowLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    width: 110,
    flexShrink: 0,
  },
  metaRowValue: {
    fontSize: 12,
    flex: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 0.8,
    marginBottom: 0,
    marginTop: 4,
  },
  entryCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  entryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
  },
  entryNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  entryNumText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700" as const,
  },
  entryTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  metaGrid: {
    paddingHorizontal: 12,
    paddingBottom: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  metaItem: {
    paddingVertical: 6,
  },
  metaKey: {
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  metaVal: {
    fontSize: 12,
    lineHeight: 18,
  },
  narrativePreview: {
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  hashRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    padding: 10,
  },
  hashLabel: {
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 0.6,
    flexShrink: 0,
    marginTop: 1,
  },
  hashValue: {
    fontSize: 10,
    fontFamily: "Courier",
    flex: 1,
    lineHeight: 16,
  },
  emptyDossier: {
    alignItems: "center",
    padding: 32,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    borderRadius: 14,
  },
  exportBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700" as const,
  },
  wipeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  wipeBtnText: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  wipeNote: {
    fontSize: 11,
    textAlign: "center",
    marginTop: -4,
  },
  custody: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  custodyText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: "italic" as const,
  },
});
