import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import ShelterMapView from "@/components/ShelterMapView";

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
  { id: "1", name: "Darul Aman Lahore", urduName: "دارالامان لاہور", description: "Government shelter for women and children in distress.", phone: "042-99200392", city: "Lahore", latitude: 31.5497, longitude: 74.3436, type: "shelter" },
  { id: "2", name: "Panah Shelter Home", urduName: "پناہ شیلٹر ہوم", description: "Safe house for women escaping domestic violence.", phone: "042-35761999", city: "Lahore", latitude: 31.5204, longitude: 74.3587, type: "shelter" },
  { id: "3", name: "Darul Aman Karachi", urduName: "دارالامان کراچی", description: "Government-run shelter for abused women and children.", phone: "021-99251010", city: "Karachi", latitude: 24.861, longitude: 67.0099, type: "shelter" },
  { id: "4", name: "Edhi Women's Home", urduName: "ایدھی خواتین گھر", description: "Emergency shelter and rehabilitation by Edhi Foundation.", phone: "115", city: "Karachi", latitude: 24.8615, longitude: 67.0104, type: "ngo" },
  { id: "5", name: "Darul Aman Islamabad", urduName: "دارالامان اسلام آباد", description: "Safe shelter for women in the capital region.", phone: "051-9252648", city: "Islamabad", latitude: 33.7294, longitude: 73.0931, type: "shelter" },
  { id: "6", name: "ROZAN Counselling Centre", urduName: "روزان کاؤنسلنگ سینٹر", description: "Psychosocial support and crisis counselling for women.", phone: "051-2890505", city: "Islamabad", latitude: 33.7215, longitude: 73.0433, type: "crisis" },
  { id: "7", name: "Darul Aman Peshawar", urduName: "دارالامان پشاور", description: "Provincial shelter home for women and children.", phone: "091-9213601", city: "Peshawar", latitude: 34.0151, longitude: 71.5249, type: "shelter" },
  { id: "8", name: "Darul Aman Quetta", urduName: "دارالامان کوئٹہ", description: "Balochistan shelter for women facing violence.", phone: "081-9202601", city: "Quetta", latitude: 30.1798, longitude: 66.975, type: "shelter" },
  { id: "9", name: "Aurat Foundation", urduName: "عورت فاؤنڈیشن", description: "Legal aid, counselling and safe space for women.", phone: "042-35761999", city: "Lahore", latitude: 31.5624, longitude: 74.3517, type: "ngo" },
  { id: "10", name: "Dastak Shelter", urduName: "دستک شیلٹر", description: "Safe shelter and legal support for women and girls.", phone: "042-35840307", city: "Lahore", latitude: 31.508, longitude: 74.3326, type: "shelter" },
];

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const TYPE_COLORS: Record<ShelterHome["type"], string> = { shelter: "#C2185B", crisis: "#E64A19", ngo: "#1976D2" };
const TYPE_LABELS: Record<ShelterHome["type"], string> = { shelter: "Shelter", crisis: "Crisis Centre", ngo: "NGO" };

export default function SheltersScreen() {
  const colors = useColors();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Location permission denied. Showing all shelters.");
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

  const sorted = SHELTER_HOMES.map((s) => ({
    ...s,
    distanceKm: location ? distanceKm(location.latitude, location.longitude, s.latitude, s.longitude) : null,
  })).sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

  const selected = selectedId ? sorted.find((s) => s.id === selectedId) ?? null : null;

  const handleCall = (phone: string) => Linking.openURL(`tel:${phone}`);
  const handleDirections = (s: ShelterHome) => {
    const url = Platform.select({
      ios: `maps://app?daddr=${s.latitude},${s.longitude}`,
      android: `geo:0,0?q=${s.latitude},${s.longitude}(${encodeURIComponent(s.name)})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}`,
    });
    if (url) Linking.openURL(url);
  };

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Feather name="map-pin" size={26} color="#FFF" />
        <View>
          <Text style={styles.headerTitle}>Shelter Homes</Text>
          <Text style={styles.headerUrdu}>قریبی پناہ گاہیں</Text>
        </View>
      </View>

      {locationError && (
        <View style={[styles.infoBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="info" size={12} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>{locationError}</Text>
        </View>
      )}

      <View style={[styles.mapBox, { borderColor: colors.border }]}>
        {locationLoading ? (
          <View style={styles.mapLoader}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.mapLoaderText, { color: colors.mutedForeground }]}>Locating you…</Text>
          </View>
        ) : (
          <ShelterMapView mapRef={mapRef} location={location} shelters={sorted} onMarkerPress={setSelectedId} typeColors={TYPE_COLORS} />
        )}
      </View>

      <View style={styles.legend}>
        {(Object.keys(TYPE_COLORS) as ShelterHome["type"][]).map((t) => (
          <View key={t} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: TYPE_COLORS[t] }]} />
            <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>{TYPE_LABELS[t]}</Text>
          </View>
        ))}
      </View>

      {selected && (
        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <View style={styles.detailTop}>
            <View style={[styles.badge, { backgroundColor: TYPE_COLORS[selected.type] + "20" }]}>
              <Text style={[styles.badgeText, { color: TYPE_COLORS[selected.type] }]}>{TYPE_LABELS[selected.type]}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedId(null)}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.detailName, { color: colors.foreground }]}>{selected.name}</Text>
          <Text style={[styles.detailUrdu, { color: colors.mutedForeground }]}>{selected.urduName}</Text>
          <Text style={[styles.detailDesc, { color: colors.mutedForeground }]}>{selected.description}</Text>
          {selected.distanceKm != null && (
            <View style={styles.distRow}>
              <Feather name="navigation" size={11} color={colors.primary} />
              <Text style={[styles.distText, { color: colors.primary }]}>~{selected.distanceKm.toFixed(0)} km · {selected.city}</Text>
            </View>
          )}
          <View style={styles.detailActions}>
            {selected.phone && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => handleCall(selected.phone!)}>
                <Feather name="phone" size={14} color="#FFF" />
                <Text style={styles.actionBtnText}>Call</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border }]} onPress={() => handleDirections(selected)}>
              <Feather name="map" size={14} color={colors.foreground} />
              <Text style={[styles.actionBtnText, { color: colors.foreground }]}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        {location ? "SORTED BY DISTANCE / فاصلے کے مطابق" : "ALL SHELTERS / تمام پناہ گاہیں"}
      </Text>

      {sorted.map((s) => (
        <TouchableOpacity
          key={s.id}
          style={[styles.card, { backgroundColor: colors.card, borderColor: selectedId === s.id ? colors.primary : colors.border }]}
          onPress={() => setSelectedId(s.id === selectedId ? null : s.id)}
          activeOpacity={0.8}
        >
          <View style={[styles.cardDotCol, { backgroundColor: TYPE_COLORS[s.type] + "18" }]}>
            <View style={[styles.cardDot, { backgroundColor: TYPE_COLORS[s.type] }]} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardName, { color: colors.foreground }]}>{s.name}</Text>
            <Text style={[styles.cardUrdu, { color: colors.mutedForeground }]}>{s.urduName}</Text>
            <View style={styles.cardMeta}>
              <Feather name="map-pin" size={10} color={colors.mutedForeground} />
              <Text style={[styles.cardMetaText, { color: colors.mutedForeground }]}>{s.city}</Text>
              {s.distanceKm != null && <Text style={[styles.cardMetaText, { color: colors.mutedForeground }]}>· ~{s.distanceKm.toFixed(0)} km</Text>}
            </View>
          </View>
          {s.phone && (
            <TouchableOpacity style={[styles.callBtn, { backgroundColor: colors.primary + "15" }]} onPress={() => handleCall(s.phone!)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="phone" size={15} color={colors.primary} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 48, gap: 12 },
  header: { flexDirection: "row", alignItems: "center", gap: 14, padding: 18, borderRadius: 14 },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" as const },
  headerUrdu: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2 },
  infoBar: { flexDirection: "row", alignItems: "flex-start", gap: 7, padding: 10, borderRadius: 10, borderWidth: 1 },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
  mapBox: { borderRadius: 14, borderWidth: 1, overflow: "hidden", height: 260 },
  mapLoader: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  mapLoaderText: { fontSize: 13 },
  legend: { flexDirection: "row", gap: 14, paddingHorizontal: 2 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendLabel: { fontSize: 11, fontWeight: "600" as const },
  detailCard: { borderRadius: 14, borderWidth: 2, padding: 14, gap: 5 },
  detailTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: "700" as const },
  detailName: { fontSize: 16, fontWeight: "700" as const },
  detailUrdu: { fontSize: 13 },
  detailDesc: { fontSize: 12, lineHeight: 18 },
  distRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  distText: { fontSize: 12, fontWeight: "600" as const },
  detailActions: { flexDirection: "row", gap: 8, marginTop: 4 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  actionBtnText: { color: "#FFF", fontSize: 13, fontWeight: "700" as const },
  sectionLabel: { fontSize: 11, fontWeight: "700" as const, letterSpacing: 0.8, marginTop: 4 },
  card: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1.5, overflow: "hidden" },
  cardDotCol: { width: 44, alignSelf: "stretch", alignItems: "center", justifyContent: "center" },
  cardDot: { width: 10, height: 10, borderRadius: 5 },
  cardInfo: { flex: 1, paddingVertical: 12, paddingRight: 8, gap: 2 },
  cardName: { fontSize: 13, fontWeight: "700" as const },
  cardUrdu: { fontSize: 12 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  cardMetaText: { fontSize: 11 },
  callBtn: { width: 44, alignSelf: "stretch", alignItems: "center", justifyContent: "center" },
});
