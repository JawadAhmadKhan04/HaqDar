import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { LegalMatch } from "@/utils/legalMap";
import { DISCLAIMER } from "@/utils/legalMap";

interface Props {
  matches: LegalMatch[];
}

export default function LegalAdvisory({ matches }: Props) {
  const colors = useColors();
  if (matches.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: "#FFF8E7", borderColor: "#F0C040" }]}>
      <View style={styles.headerRow}>
        <Feather name="alert-circle" size={15} color="#B8860B" />
        <Text style={styles.headerText}>Advisory Hint / قانونی اشارہ</Text>
      </View>

      {matches.map((m, i) => (
        <View key={i} style={[styles.matchCard, { borderLeftColor: "#B8860B" }]}>
          <Text style={styles.category}>
            {m.category} / {m.urduCategory}
          </Text>
          <Text style={styles.law}>{m.law}</Text>
          <Text style={styles.authority}>Contact: {m.authority}</Text>
        </View>
      ))}

      <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 10,
    marginTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#B8860B",
  },
  matchCard: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    gap: 3,
  },
  category: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#7A5500",
  },
  law: {
    fontSize: 12,
    color: "#3D2B00",
    lineHeight: 17,
  },
  authority: {
    fontSize: 11,
    color: "#7A5500",
    fontStyle: "italic" as const,
  },
  disclaimer: {
    fontSize: 10,
    color: "#9A7A00",
    lineHeight: 14,
    fontStyle: "italic" as const,
    marginTop: 4,
  },
});
