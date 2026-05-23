import React from "react";
import { View, Text, StyleSheet } from "react-native";

export interface ShelterMapProps {
  location: { latitude: number; longitude: number } | null;
  shelters: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    type: "shelter" | "crisis" | "ngo";
  }>;
  onMarkerPress: (id: string) => void;
  mapRef: React.RefObject<any>;
  typeColors: Record<string, string>;
}

export default function ShelterMapView({ location, shelters }: ShelterMapProps) {
  const lat = location?.latitude ?? 30.3753;
  const lon = location?.longitude ?? 69.3451;
  const delta = location ? 1.0 : 10;

  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  const markerParts = shelters
    .map((s) => `mlat=${s.latitude}&mlon=${s.longitude}`)
    .slice(0, 1)
    .join("&");

  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${markerParts ? `&${markerParts}` : ""}`;

  return React.createElement("iframe", {
    src,
    style: { width: "100%", height: "100%", border: "none" } as React.CSSProperties,
    title: "Shelter Homes Map",
    loading: "lazy",
  } as React.IframeHTMLAttributes<HTMLIFrameElement>);
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 13, textAlign: "center" },
});
