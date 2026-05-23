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

export default function PinSetupScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { setupPin } = useVault();
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [firstPin, setFirstPin] = useState("");
  const [error, setError] = useState("");

  const handleFirst = (pin: string) => {
    setFirstPin(pin);
    setStep("confirm");
    setError("");
  };

  const handleConfirm = async (pin: string) => {
    if (pin !== firstPin) {
      setError("PINs do not match. Try again.");
      setStep("enter");
      setFirstPin("");
      return;
    }
    await setupPin(pin);
    router.replace("/vault");
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
          <Feather name="shield" size={28} color="#FFFFFF" />
        </View>
        <Text style={[styles.appName, { color: colors.foreground }]}>
          HaqDar / حق دار
        </Text>
        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
          Privacy-first evidence vault
        </Text>
      </View>

      <PinPad
        mode={step === "enter" ? "setup" : "confirm"}
        onComplete={step === "enter" ? handleFirst : handleConfirm}
        error={error}
        title={step === "enter" ? "Set a Security PIN" : "Confirm your PIN"}
        subtitle={
          step === "enter"
            ? "This PIN protects your private records. Choose 4 digits you will remember."
            : "Enter the same PIN again to confirm."
        }
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
    marginBottom: 4,
  },
  tagline: {
    fontSize: 13,
  },
});
