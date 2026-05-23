import React from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from "react-native-maps";

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
  mapRef: React.RefObject<MapView | null>;
  typeColors: Record<string, string>;
}

export default function ShelterMapView({ location, shelters, onMarkerPress, mapRef, typeColors }: ShelterMapProps) {
  const initialRegion = location
    ? { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 1.5, longitudeDelta: 1.5 }
    : { latitude: 30.3753, longitude: 69.3451, latitudeDelta: 12, longitudeDelta: 12 };

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={PROVIDER_DEFAULT}
      initialRegion={initialRegion}
      showsUserLocation={!!location}
      showsMyLocationButton={false}
    >
      {location && (
        <Circle
          center={location}
          radius={50000}
          strokeColor="rgba(194,24,91,0.25)"
          fillColor="rgba(194,24,91,0.07)"
        />
      )}
      {shelters.map((shelter) => (
        <Marker
          key={shelter.id}
          coordinate={{ latitude: shelter.latitude, longitude: shelter.longitude }}
          title={shelter.name}
          pinColor={typeColors[shelter.type]}
          onPress={() => onMarkerPress(shelter.id)}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
