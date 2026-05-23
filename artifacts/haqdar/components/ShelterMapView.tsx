import React from "react";
import { View, Image, StyleSheet, Platform, Text } from "react-native";

export interface ShelterMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: "shelter" | "crisis" | "ngo";
}

interface Props {
  location: { latitude: number; longitude: number } | null;
  shelters: ShelterMarker[];
  mapRef?: React.RefObject<any>;
  onMarkerPress?: (id: string) => void;
  typeColors?: Record<string, string>;
}

export default function ShelterMapView({ location, shelters }: Props) {
  const lat = location?.latitude ?? 30.3753;
  const lon = location?.longitude ?? 69.3451;
  const zoom = location ? 6 : 5;

  const markersParam = shelters
    .map((s) => `${s.latitude},${s.longitude},lightred`)
    .join("|");

  const staticMapUrl =
    `https://staticmap.openstreetmap.de/staticmap.php` +
    `?center=${lat},${lon}` +
    `&zoom=${zoom}` +
    `&size=800x520` +
    `&maptype=mapnik` +
    (markersParam ? `&markers=${markersParam}` : "");

  if (Platform.OS === "web") {
    const bbox = `${lon - 5},${lat - 5},${lon + 5},${lat + 5}`;
    const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
    return React.createElement("iframe", {
      src,
      style: { width: "100%", height: "100%", border: "none" } as React.CSSProperties,
      title: "Shelter Homes Map",
      loading: "lazy",
    } as React.IframeHTMLAttributes<HTMLIFrameElement>);
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: staticMapUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>OpenStreetMap</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
  badge: {
    position: "absolute",
    bottom: 4,
    right: 6,
    backgroundColor: "rgba(255,255,255,0.75)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    color: "#333",
  },
});
