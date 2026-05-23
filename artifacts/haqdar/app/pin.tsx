import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import PinPad from "@/components/PinPad";
import { useVault } from "@/context/VaultContext";
import { useColors } from "@/hooks/useColors";

export default function PinScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { unlock } = useVault();
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const handlePin = async (pin: string) => {
    const ok = await unlock(pin);
    if (ok) {
      router.replace("/vault");
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setError(`Incorrect PIN (attempt ${next})`);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16,
        },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.secondary }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="x" size={18} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <View style={styles.brand}>
        <View style={[styles.logo, { backgroundColor: colors.primary }]}>
          <Feather name="lock" size={26} color="#FFFFFF" />
        </View>
        <Text style={[styles.appName, { color: colors.foreground }]}>
          HaqDar / حق دار
        </Text>
      </View>

      <PinPad
        mode="unlock"
        onComplete={handlePin}
        error={error}
        title="Enter your PIN"
        subtitle="Access your private records"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: "700" as const,
  },
});
