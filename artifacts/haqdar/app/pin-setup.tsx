import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import PinPad from "@/components/PinPad";
import { useVault } from "@/context/VaultContext";
import { useColors } from "@/hooks/useColors";
import ParticleBackground from "@/components/ParticleBackground";

export default function PinSetupScreen() {
  const insets  = useSafeAreaInsets();
  const colors  = useColors();
  const { width, height } = useWindowDimensions();
  const { setupPin } = useVault();
  const [step, setStep]       = useState<"enter" | "confirm">("enter");
  const [firstPin, setFirstPin] = useState("");
  const [error, setError]     = useState("");

  const cardY  = useSharedValue(40);
  const cardOp = useSharedValue(0);
  const shieldScale = useSharedValue(0.8);
  const shieldOp    = useSharedValue(0);
  const glowOp      = useSharedValue(0.3);

  useEffect(() => {
    cardY.value       = withSpring(0, { damping: 16, stiffness: 120 });
    cardOp.value      = withTiming(1, { duration: 500 });
    shieldScale.value = withSpring(1, { damping: 14, stiffness: 150 });
    shieldOp.value    = withTiming(1, { duration: 400 });
    glowOp.value      = withRepeat(
      withTiming(0.8, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
      -1, true
    );
  }, []);

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

  const cardStyle   = useAnimatedStyle(() => ({
    transform: [{ translateY: cardY.value }],
    opacity: cardOp.value,
  }));
  const shieldStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shieldScale.value }],
    opacity: shieldOp.value,
  }));
  const glowStyle   = useAnimatedStyle(() => ({
    opacity: glowOp.value,
    shadowOpacity: glowOp.value * 0.5,
  }));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop:    Platform.OS === "web" ? 67 : insets.top + 16,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16,
        },
      ]}
    >
      <ParticleBackground width={width} height={height} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="x" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.brand, cardStyle]}>
        <Animated.View
          style={[
            styles.logoContainer,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
            glowStyle,
            shieldStyle,
          ]}
        >
          <Feather
            name={step === "confirm" ? "check-circle" : "shield"}
            size={30}
            color={colors.primaryForeground}
          />
        </Animated.View>

        <Text style={[styles.appName, { color: colors.foreground }]}>
          HaqDar
        </Text>
        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
          Privacy-first evidence vault
        </Text>

        <View style={styles.stepRow}>
          {["enter", "confirm"].map((s, i) => (
            <View
              key={s}
              style={[
                styles.stepDot,
                {
                  backgroundColor:
                    (s === "enter" && (step === "enter" || step === "confirm")) ||
                    (s === "confirm" && step === "confirm")
                      ? colors.primary
                      : colors.border,
                  width: step === s ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>

      <PinPad
        mode={step === "enter" ? "setup" : "confirm"}
        onComplete={step === "enter" ? handleFirst : handleConfirm}
        error={error}
        title={step === "enter" ? "Set a Security PIN" : "Confirm your PIN"}
        subtitle={
          step === "enter"
            ? "This PIN protects your private records."
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
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 4,
    gap: 8,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
  },
  appName: {
    fontSize: 26,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    letterSpacing: 0.1,
  },
  stepRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    marginTop: 4,
  },
  stepDot: {
    height: 8,
    borderRadius: 4,
  },
});
