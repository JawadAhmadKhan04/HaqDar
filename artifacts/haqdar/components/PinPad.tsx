import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

interface Props {
  mode: "setup" | "confirm" | "unlock";
  onComplete: (pin: string) => void;
  error?: string;
  title?: string;
  subtitle?: string;
}

const DIGITS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "del"],
];

export default function PinPad({ mode, onComplete, error, title, subtitle }: Props) {
  const colors = useColors();
  const [pin, setPin] = useState("");

  const haptic = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDigit = (d: string) => {
    haptic();
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        onComplete(next);
        setPin("");
      }, 120);
    }
  };

  const handleDelete = () => {
    haptic();
    setPin((p) => p.slice(0, -1));
  };

  const dots = Array.from({ length: 4 }, (_, i) => i < pin.length);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
      ) : null}

      <View style={styles.dots}>
        {dots.map((filled, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: filled ? colors.primary : "transparent",
                borderColor: error ? colors.destructive : colors.primary,
              },
            ]}
          />
        ))}
      </View>

      {error ? (
        <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
      ) : null}

      <View style={styles.pad}>
        {DIGITS.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((d, di) =>
              d === "" ? (
                <View key={di} style={styles.btnEmpty} />
              ) : d === "del" ? (
                <TouchableOpacity
                  key={di}
                  style={[styles.btn, { backgroundColor: colors.secondary }]}
                  onPress={handleDelete}
                  activeOpacity={0.7}
                >
                  <Feather name="delete" size={22} color={colors.foreground} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  key={di}
                  style={[styles.btn, { backgroundColor: colors.secondary }]}
                  onPress={() => handleDigit(d)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.btnText, { color: colors.foreground }]}>{d}</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const BTN = 76;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700" as const,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  dots: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 8,
    marginTop: 8,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  error: {
    fontSize: 13,
    marginTop: 8,
    marginBottom: 0,
    textAlign: "center",
  },
  pad: {
    marginTop: 40,
    gap: 14,
  },
  row: {
    flexDirection: "row",
    gap: 20,
  },
  btn: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  btnEmpty: {
    width: BTN,
    height: BTN,
  },
  btnText: {
    fontSize: 26,
    fontWeight: "400" as const,
  },
});
