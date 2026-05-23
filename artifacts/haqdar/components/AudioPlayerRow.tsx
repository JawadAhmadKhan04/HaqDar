import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useColors } from "@/hooks/useColors";

interface Props {
  filename: string;
  uri: string;
  index: number;
}

export default function AudioPlayerRow({ filename, uri, index }: Props) {
  const colors = useColors();
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  const handlePlayPause = () => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <View style={[styles.row, { backgroundColor: colors.muted, borderColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.card }]}>
        <Feather name="mic" size={16} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.label, { color: colors.foreground }]} numberOfLines={1}>
          Recording {index + 1}
        </Text>
        <Text style={[styles.filename, { color: colors.mutedForeground }]} numberOfLines={1}>
          {filename}
        </Text>
      </View>
      <TouchableOpacity
        onPress={handlePlayPause}
        style={[styles.playBtn, { backgroundColor: colors.primary }]}
      >
        {status.isLoaded === false ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Feather name={status.playing ? "pause" : "play"} size={16} color="#FFF" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  label: { fontSize: 13, fontWeight: "600" as const },
  filename: { fontSize: 11, marginTop: 1 },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
