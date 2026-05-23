import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Share,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useVault } from "@/context/VaultContext";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export default function DossierScreen() {
  const colors = useColors();
  const { incidents, wipe } = useVault();
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [document, setDocument] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const generated = new Date().toLocaleString("en-PK", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const handleGenerate = async () => {
    if (incidents.length === 0) {
      Alert.alert("No incidents", "Record at least one incident before generating a legal document.");
      return;
    }
    setGenerating(true);
    setGenError(null);
    setDocument(null);
    try {
      const res = await fetch(`${BASE_URL}/api/generate-document`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidents }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error ?? `Server error ${res.status}`);
      }
      const data = await res.json() as { document?: string; error?: string };
      if (!data.document) throw new Error("Empty document received");
      setDocument(data.document);
    } catch (e: any) {
      setGenError(e?.message ?? "Failed to generate document");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;
    setDownloading(true);
    try {
      if (Platform.OS === "web") {
        const blob = new Blob([document], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = (globalThis as any).document?.createElement?.("a");
        if (a) {
          a.href = url;
          a.download = `HaqDar_Legal_Document_${Date.now()}.txt`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        await Share.share({
          message: document,
          title: "HaqDar Legal Document",
        });
      }
    } catch (e: any) {
      Alert.alert("Download failed", e?.message ?? "Could not save the document.");
    } finally {
      setDownloading(false);
    }
  };

  const handleWipeConfirm = async () => {
    setWiping(true);
    try { await wipe(); } finally { router.replace("/pin-setup"); }
  };

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.docHeader, { backgroundColor: colors.primary }]}>
        <Feather name="file-text" size={28} color="#FFF" />
        <View>
          <Text style={styles.docTitle}>Legal Dossier</Text>
          <Text style={styles.docUrdu}>قانونی دستاویز</Text>
        </View>
      </View>

      {/* Metadata card */}
      <View style={[styles.metaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>DOSSIER METADATA</Text>
        <MetaRow label="Generated" value={generated} colors={colors} />
        <MetaRow label="Total Incidents" value={String(incidents.length)} colors={colors} />
        <MetaRow label="Data Location" value="This device only" colors={colors} />
        <MetaRow label="Integrity" value="SHA-256 per entry" colors={colors} />
      </View>

      {/* Generate section */}
      <View style={[styles.genSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.genTop}>
          <Feather name="cpu" size={18} color={colors.primary} />
          <Text style={[styles.genTitle, { color: colors.foreground }]}>AI Legal Document</Text>
        </View>
        <Text style={[styles.genDesc, { color: colors.mutedForeground }]}>
          Generate a formal legal complaint document from all your recorded incidents — ready to submit to police, courts, or ombudsmen in Pakistan.
        </Text>
        <Text style={[styles.genDescUrdu, { color: colors.mutedForeground }]}>
          تمام شواہد سے قانونی دستاویز تیار کریں
        </Text>

        {incidents.length === 0 && (
          <View style={[styles.noIncidentsBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="alert-circle" size={14} color={colors.mutedForeground} />
            <Text style={[styles.noIncidentsText, { color: colors.mutedForeground }]}>
              No incidents recorded yet. Log at least one incident first.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.generateBtn, { backgroundColor: incidents.length === 0 ? colors.muted : colors.primary, borderColor: incidents.length === 0 ? colors.border : "transparent" }]}
          onPress={handleGenerate}
          disabled={generating || incidents.length === 0}
          activeOpacity={0.85}
        >
          {generating ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Feather name="zap" size={16} color={incidents.length === 0 ? colors.mutedForeground : "#FFF"} />
          )}
          <Text style={[styles.generateBtnText, { color: incidents.length === 0 ? colors.mutedForeground : "#FFF" }]}>
            {generating ? "Generating…" : "Generate Legal Document"}
          </Text>
        </TouchableOpacity>

        {genError && (
          <View style={[styles.errorBox, { backgroundColor: "#FFF0F0", borderColor: colors.destructive }]}>
            <Feather name="alert-triangle" size={13} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{genError}</Text>
          </View>
        )}
      </View>

      {/* Generated document */}
      {document && (
        <View style={[styles.documentCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <View style={styles.documentCardHeader}>
            <View style={styles.documentCardTitleRow}>
              <Feather name="check-circle" size={16} color={colors.primary} />
              <Text style={[styles.documentCardTitle, { color: colors.foreground }]}>Document Ready</Text>
            </View>
            <TouchableOpacity
              style={[styles.downloadBtn, { backgroundColor: colors.primary }]}
              onPress={handleDownload}
              disabled={downloading}
              activeOpacity={0.85}
            >
              {downloading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Feather name="download" size={14} color="#FFF" />
              )}
              <Text style={styles.downloadBtnText}>{downloading ? "Saving…" : "Download"}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.documentPreview, { borderTopColor: colors.border }]}>
            <Text style={[styles.documentText, { color: colors.foreground }]} selectable>
              {document}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.downloadBtnFull, { backgroundColor: colors.primary }]}
            onPress={handleDownload}
            disabled={downloading}
            activeOpacity={0.85}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Feather name="download" size={17} color="#FFF" />
            )}
            <Text style={styles.downloadBtnFullText}>{downloading ? "Saving…" : "Download Document / دستاویز ڈاؤنلوڈ کریں"}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Panic reset */}
      <View style={styles.actions}>
        {!confirmWipe ? (
          <>
            <TouchableOpacity
              style={[styles.wipeBtn, { backgroundColor: "#FFF0F0", borderColor: colors.destructive }]}
              onPress={() => setConfirmWipe(true)}
              activeOpacity={0.85}
            >
              <Feather name="alert-triangle" size={16} color={colors.destructive} />
              <Text style={[styles.wipeBtnText, { color: colors.destructive }]}>Panic Reset — Wipe All Data</Text>
            </TouchableOpacity>
            <Text style={[styles.wipeNote, { color: colors.mutedForeground }]}>Instantly clears all records, PIN and resets the app.</Text>
          </>
        ) : (
          <View style={[styles.wipeConfirmBox, { backgroundColor: "#FFF0F0", borderColor: colors.destructive }]}>
            <Feather name="alert-triangle" size={18} color={colors.destructive} />
            <Text style={[styles.wipeConfirmTitle, { color: colors.destructive }]}>Wipe everything permanently?</Text>
            <Text style={[styles.wipeConfirmSub, { color: colors.destructive + "CC" }]}>
              All incidents, your PIN, and all data will be deleted. This cannot be undone.
            </Text>
            <View style={styles.wipeConfirmBtns}>
              <TouchableOpacity style={[styles.wipeConfirmCancel, { backgroundColor: colors.secondary }]} onPress={() => setConfirmWipe(false)} disabled={wiping}>
                <Text style={[styles.wipeConfirmCancelText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.wipeConfirmGo, { backgroundColor: colors.destructive }]} onPress={handleWipeConfirm} disabled={wiping} activeOpacity={0.85}>
                {wiping ? <ActivityIndicator size="small" color="#FFF" /> : <Feather name="trash-2" size={14} color="#FFF" />}
                <Text style={styles.wipeConfirmGoText}>{wiping ? "Wiping…" : "Yes, wipe everything"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  docHeader: { flexDirection: "row", alignItems: "center", gap: 14, padding: 18, borderRadius: 14 },
  docTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" as const },
  docUrdu: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2 },
  metaCard: { borderRadius: 12, borderWidth: 1, padding: 14 },
  metaLabel: { fontSize: 10, fontWeight: "700" as const, letterSpacing: 0.8, marginBottom: 10 },
  metaRowLine: { flexDirection: "row", paddingVertical: 7, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  metaRowLabel: { fontSize: 12, fontWeight: "600" as const, width: 110, flexShrink: 0 },
  metaRowValue: { fontSize: 12, flex: 1 },
  genSection: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
  genTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  genTitle: { fontSize: 16, fontWeight: "700" as const },
  genDesc: { fontSize: 13, lineHeight: 19 },
  genDescUrdu: { fontSize: 12, lineHeight: 18 },
  noIncidentsBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 10, borderRadius: 8, borderWidth: 1 },
  noIncidentsText: { flex: 1, fontSize: 12, lineHeight: 18 },
  generateBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1, marginTop: 4,
  },
  generateBtnText: { fontSize: 15, fontWeight: "700" as const },
  errorBox: { flexDirection: "row", alignItems: "flex-start", gap: 7, padding: 10, borderRadius: 8, borderWidth: 1 },
  errorText: { flex: 1, fontSize: 12, lineHeight: 18 },
  documentCard: { borderRadius: 14, borderWidth: 2, overflow: "hidden" },
  documentCardHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 14,
  },
  documentCardTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  documentCardTitle: { fontSize: 15, fontWeight: "700" as const },
  downloadBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 9,
  },
  downloadBtnText: { color: "#FFF", fontSize: 13, fontWeight: "700" as const },
  documentPreview: { borderTopWidth: 1, padding: 14 },
  documentText: { fontSize: 12, lineHeight: 20, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" },
  downloadBtnFull: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, margin: 12, borderRadius: 12,
  },
  downloadBtnFullText: { color: "#FFF", fontSize: 14, fontWeight: "700" as const },
  actions: { gap: 12, marginTop: 4 },
  wipeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5,
  },
  wipeBtnText: { fontSize: 14, fontWeight: "700" as const },
  wipeNote: { fontSize: 11, textAlign: "center", marginTop: -4 },
  wipeConfirmBox: { borderRadius: 14, borderWidth: 1.5, padding: 16, gap: 8, alignItems: "center" },
  wipeConfirmTitle: { fontSize: 15, fontWeight: "700" as const, textAlign: "center" },
  wipeConfirmSub: { fontSize: 12, textAlign: "center", lineHeight: 18 },
  wipeConfirmBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
  wipeConfirmCancel: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: "center" },
  wipeConfirmCancelText: { fontSize: 14, fontWeight: "600" as const },
  wipeConfirmGo: {
    flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 11, borderRadius: 10,
  },
  wipeConfirmGoText: { color: "#FFF", fontSize: 14, fontWeight: "700" as const },
});
