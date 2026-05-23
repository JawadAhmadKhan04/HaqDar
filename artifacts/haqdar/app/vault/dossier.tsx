import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import ShelterMapView from "@/components/ShelterMapView";
import * as Location from "expo-location";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useVault } from "@/context/VaultContext";

interface ShelterHome {
  id: string;
  name: string;
  urduName: string;
  description: string;
  phone?: string;
  city: string;
  latitude: number;
  longitude: number;
  type: "shelter" | "crisis" | "ngo";
}

const SHELTER_HOMES: ShelterHome[] = [
  {
    id: "1",
    name: "Darul Aman Lahore",
    urduName: "دارالامان لاہور",
    description: "Government shelter for women and children in distress.",
    phone: "042-99200392",
    city: "Lahore",
    latitude: 31.5497,
    longitude: 74.3436,
    type: "shelter",
  },
  {
    id: "2",
    name: "Panah Shelter Home",
    urduName: "پناہ شیلٹر ہوم",
    description: "Safe house for women escaping domestic violence.",
    phone: "042-35761999",
    city: "Lahore",
    latitude: 31.5204,
    longitude: 74.3587,
    type: "shelter",
  },
  {
    id: "3",
    name: "Darul Aman Karachi",
    urduName: "دارالامان کراچی",
    description: "Government-run shelter for abused women and children.",
    phone: "021-99251010",
    city: "Karachi",
    latitude: 24.861,
    longitude: 67.0099,
    type: "shelter",
  },
  {
    id: "4",
    name: "Edhi Women's Home",
    urduName: "ایدھی خواتین گھر",
    description: "Emergency shelter and rehabilitation by Edhi Foundation.",
    phone: "115",
    city: "Karachi",
    latitude: 24.8615,
    longitude: 67.0104,
    type: "ngo",
  },
  {
    id: "5",
    name: "Darul Aman Islamabad",
    urduName: "دارالامان اسلام آباد",
    description: "Safe shelter for women in the capital region.",
    phone: "051-9252648",
    city: "Islamabad",
    latitude: 33.7294,
    longitude: 73.0931,
    type: "shelter",
  },
  {
    id: "6",
    name: "ROZAN Counselling Centre",
    urduName: "روزان کاؤنسلنگ سینٹر",
    description: "Psychosocial support and crisis counselling for women.",
    phone: "051-2890505",
    city: "Islamabad",
    latitude: 33.7215,
    longitude: 73.0433,
    type: "crisis",
  },
  {
    id: "7",
    name: "Darul Aman Peshawar",
    urduName: "دارالامان پشاور",
    description: "Provincial shelter home for women and children.",
    phone: "091-9213601",
    city: "Peshawar",
    latitude: 34.0151,
    longitude: 71.5249,
    type: "shelter",
  },
  {
    id: "8",
    name: "Darul Aman Quetta",
    urduName: "دارالامان کوئٹہ",
    description: "Balochistan shelter for women facing violence.",
    phone: "081-9202601",
    city: "Quetta",
    latitude: 30.1798,
    longitude: 66.975,
    type: "shelter",
  },
  {
    id: "9",
    name: "Aurat Foundation Resource Centre",
    urduName: "عورت فاؤنڈیشن",
    description: "Legal aid, counselling and safe space for women.",
    phone: "042-35761999",
    city: "Lahore",
    latitude: 31.5624,
    longitude: 74.3517,
    type: "ngo",
  },
  {
    id: "10",
    name: "Dastak Shelter",
    urduName: "دستک شیلٹر",
    description: "Safe shelter and legal support for women and girls.",
    phone: "042-35840307",
    city: "Lahore",
    latitude: 31.508,
    longitude: 74.3326,
    type: "shelter",
  },
];

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const TYPE_COLORS: Record<ShelterHome["type"], string> = {
  shelter: "#C2185B",
  crisis: "#E64A19",
  ngo: "#1976D2",
};

const TYPE_LABELS: Record<ShelterHome["type"], string> = {
  shelter: "Shelter",
  crisis: "Crisis Centre",
  ngo: "NGO",
};

export default function DossierScreen() {
  const colors = useColors();
  const { incidents, wipe } = useVault();
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Location permission denied. Showing all shelters across Pakistan.");
        setLocationLoading(false);
        return;
      }
      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      } catch {
        setLocationError("Could not fetch location. Showing all shelters.");
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  const sheltersWithDist = SHELTER_HOMES.map((s) => ({
    ...s,
    distanceKm: location ? distanceKm(location.latitude, location.longitude, s.latitude, s.longitude) : null,
  })).sort((a, b) => {
    if (a.distanceKm == null || b.distanceKm == null) return 0;
    return a.distanceKm - b.distanceKm;
  });

  const handleShelterPress = (shelter: ShelterHome) => {
    setSelectedShelterId(shelter.id === selectedShelterId ? null : shelter.id);
    mapRef.current?.animateToRegion(
      { latitude: shelter.latitude, longitude: shelter.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 },
      500
    );
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleDirections = (shelter: ShelterHome) => {
    const url = Platform.select({
      ios: `maps://app?daddr=${shelter.latitude},${shelter.longitude}`,
      android: `geo:0,0?q=${shelter.latitude},${shelter.longitude}(${encodeURIComponent(shelter.name)})`,
    });
    if (url) Linking.openURL(url);
  };

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
    lines.push("NEARBY SHELTER HOMES");
    lines.push("=".repeat(60));
    sheltersWithDist.slice(0, 5).forEach((s, i) => {
      lines.push(`\n[${i + 1}] ${s.name} (${s.city})`);
      if (s.phone) lines.push(`Phone: ${s.phone}`);
      if (s.distanceKm) lines.push(`Distance: ~${s.distanceKm.toFixed(0)} km`);
    });
    lines.push("\nHaqDar stores all data locally on this device only.");
    lines.push("No data is transmitted to any server.");
    return lines.join("\n");
  };

  const handleShare = async () => {
    const text = buildDossierText();
    try {
      await Share.share({ message: text, title: "HaqDar — Shelter Homes" });
    } catch {
      Alert.alert("Share failed", "Could not share.");
    }
  };

  const handleWipeConfirm = async () => {
    setWiping(true);
    try {
      await wipe();
    } finally {
      router.replace("/pin-setup");
    }
  };

  const selectedShelter = selectedShelterId
    ? sheltersWithDist.find((s) => s.id === selectedShelterId) ?? null
    : null;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.docHeader, { backgroundColor: colors.primary }]}>
        <Feather name="map-pin" size={28} color="#FFFFFF" />
        <View>
          <Text style={styles.docTitle}>Shelter Homes Map</Text>
          <Text style={styles.docUrdu}>قریبی پناہ گاہیں</Text>
        </View>
      </View>

      {locationError && (
        <View style={[styles.infoBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="info" size={13} color={colors.mutedForeground} />
          <Text style={[styles.infoBarText, { color: colors.mutedForeground }]}>{locationError}</Text>
        </View>
      )}

      <View style={[styles.mapContainer, { borderColor: colors.border }]}>
        {locationLoading ? (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.mapLoadText, { color: colors.mutedForeground }]}>Locating you…</Text>
          </View>
        ) : (
          <ShelterMapView
            mapRef={mapRef}
            location={location}
            shelters={sheltersWithDist}
            onMarkerPress={(id: string) => setSelectedShelterId(id)}
            typeColors={TYPE_COLORS}
          />
        )}
      </View>

      <View style={styles.legendRow}>
        {(Object.keys(TYPE_COLORS) as ShelterHome["type"][]).map((t) => (
          <View key={t} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: TYPE_COLORS[t] }]} />
            <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>{TYPE_LABELS[t]}</Text>
          </View>
        ))}
      </View>

      {selectedShelter && (
        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <View style={styles.detailTop}>
            <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[selectedShelter.type] + "20" }]}>
              <Text style={[styles.typeBadgeText, { color: TYPE_COLORS[selectedShelter.type] }]}>
                {TYPE_LABELS[selectedShelter.type]}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedShelterId(null)}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.detailName, { color: colors.foreground }]}>{selectedShelter.name}</Text>
          <Text style={[styles.detailUrdu, { color: colors.mutedForeground }]}>{selectedShelter.urduName}</Text>
          <Text style={[styles.detailDesc, { color: colors.mutedForeground }]}>{selectedShelter.description}</Text>
          {selectedShelter.distanceKm != null && (
            <View style={styles.detailMeta}>
              <Feather name="navigation" size={12} color={colors.primary} />
              <Text style={[styles.detailMetaText, { color: colors.primary }]}>
                ~{selectedShelter.distanceKm.toFixed(0)} km away · {selectedShelter.city}
              </Text>
            </View>
          )}
          <View style={styles.detailActions}>
            {selectedShelter.phone && (
              <TouchableOpacity
                style={[styles.detailBtn, { backgroundColor: colors.primary }]}
                onPress={() => handleCall(selectedShelter.phone!)}
              >
                <Feather name="phone" size={14} color="#FFF" />
                <Text style={styles.detailBtnText}>Call</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.detailBtn, { backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border }]}
              onPress={() => handleDirections(selectedShelter)}
            >
              <Feather name="map" size={14} color={colors.foreground} />
              <Text style={[styles.detailBtnText, { color: colors.foreground }]}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        {location ? "NEARBY SHELTERS / قریبی پناہ گاہیں" : "ALL SHELTERS / تمام پناہ گاہیں"}
      </Text>

      {sheltersWithDist.map((shelter) => (
        <TouchableOpacity
          key={shelter.id}
          style={[
            styles.shelterCard,
            { backgroundColor: colors.card, borderColor: selectedShelterId === shelter.id ? colors.primary : colors.border },
          ]}
          onPress={() => handleShelterPress(shelter)}
          activeOpacity={0.8}
        >
          <View style={[styles.shelterDotCol, { backgroundColor: TYPE_COLORS[shelter.type] + "18" }]}>
            <View style={[styles.shelterDot, { backgroundColor: TYPE_COLORS[shelter.type] }]} />
          </View>
          <View style={styles.shelterInfo}>
            <Text style={[styles.shelterName, { color: colors.foreground }]}>{shelter.name}</Text>
            <Text style={[styles.shelterUrdu, { color: colors.mutedForeground }]}>{shelter.urduName}</Text>
            <View style={styles.shelterMeta}>
              <Feather name="map-pin" size={10} color={colors.mutedForeground} />
              <Text style={[styles.shelterMetaText, { color: colors.mutedForeground }]}>{shelter.city}</Text>
              {shelter.distanceKm != null && (
                <>
                  <Text style={[styles.shelterMetaDot, { color: colors.mutedForeground }]}>·</Text>
                  <Text style={[styles.shelterMetaText, { color: colors.mutedForeground }]}>
                    ~{shelter.distanceKm.toFixed(0)} km
                  </Text>
                </>
              )}
            </View>
          </View>
          {shelter.phone && (
            <TouchableOpacity
              style={[styles.callBtn, { backgroundColor: colors.primary + "15" }]}
              onPress={() => handleCall(shelter.phone!)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="phone" size={15} color={colors.primary} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ))}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.exportBtn, { backgroundColor: colors.primary }]}
          onPress={handleShare}
          activeOpacity={0.85}
        >
          <Feather name="share-2" size={18} color="#FFFFFF" />
          <Text style={styles.exportBtnText}>Share Shelter List / فہرست شیئر کریں</Text>
        </TouchableOpacity>

        {!confirmWipe ? (
          <>
            <TouchableOpacity
              style={[styles.wipeBtn, { backgroundColor: "#FFF0F0", borderColor: colors.destructive }]}
              onPress={() => setConfirmWipe(true)}
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
          </>
        ) : (
          <View style={[styles.wipeConfirmBox, { backgroundColor: "#FFF0F0", borderColor: colors.destructive }]}>
            <Feather name="alert-triangle" size={18} color={colors.destructive} />
            <Text style={[styles.wipeConfirmTitle, { color: colors.destructive }]}>
              Wipe everything permanently?
            </Text>
            <Text style={[styles.wipeConfirmSub, { color: colors.destructive + "CC" }]}>
              All incidents, your PIN, and all data will be deleted. This cannot be undone.
            </Text>
            <View style={styles.wipeConfirmBtns}>
              <TouchableOpacity
                style={[styles.wipeConfirmCancel, { backgroundColor: colors.secondary }]}
                onPress={() => setConfirmWipe(false)}
                disabled={wiping}
              >
                <Text style={[styles.wipeConfirmCancelText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.wipeConfirmGo, { backgroundColor: colors.destructive }]}
                onPress={handleWipeConfirm}
                disabled={wiping}
                activeOpacity={0.85}
              >
                {wiping ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Feather name="trash-2" size={14} color="#FFF" />
                )}
                <Text style={styles.wipeConfirmGoText}>
                  {wiping ? "Wiping…" : "Yes, wipe everything"}
                </Text>
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
  infoBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  infoBarText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  mapContainer: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    height: 260,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  mapLoadText: {
    fontSize: 13,
  },
  legendRow: {
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 2,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  detailCard: {
    borderRadius: 14,
    borderWidth: 2,
    padding: 14,
    gap: 6,
  },
  detailTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 0.4,
  },
  detailName: {
    fontSize: 16,
    fontWeight: "700" as const,
    lineHeight: 22,
  },
  detailUrdu: {
    fontSize: 13,
    marginTop: -2,
  },
  detailDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  detailMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  detailMetaText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  detailActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  detailBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  detailBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700" as const,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 0.8,
    marginTop: 4,
  },
  shelterCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: "hidden",
    gap: 0,
  },
  shelterDotCol: {
    width: 44,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
  },
  shelterDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  shelterInfo: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 8,
    gap: 2,
  },
  shelterName: {
    fontSize: 13,
    fontWeight: "700" as const,
    lineHeight: 18,
  },
  shelterUrdu: {
    fontSize: 12,
    lineHeight: 16,
  },
  shelterMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  shelterMetaText: {
    fontSize: 11,
  },
  shelterMetaDot: {
    fontSize: 11,
  },
  callBtn: {
    width: 44,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
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
  wipeConfirmBox: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16,
    gap: 8,
    alignItems: "center",
  },
  wipeConfirmTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    textAlign: "center",
  },
  wipeConfirmSub: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  wipeConfirmBtns: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  wipeConfirmCancel: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
  },
  wipeConfirmCancelText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  wipeConfirmGo: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
  },
  wipeConfirmGoText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700" as const,
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
});
