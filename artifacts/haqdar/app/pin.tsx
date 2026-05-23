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
  withRepeat,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import PinPad from "@/components/PinPad";
import { useVault } from "@/context/VaultContext";
import { useColors } from "@/hooks/useColors";
import ParticleBackground from "@/components/ParticleBackground";

function PulseLogo({ colors }: { colors: ReturnType<typeof useColors> }) {
  const scale   = useSharedValue(1);
  const glowOp  = useSharedValue(0.4);
  const ringScale = useSharedValue(1);
  const ringOp    = useSharedValue(0.5);

  useEffect(() => {
    scale.value  = withRepeat(
      withTiming(1.06, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      -1, true
    );
    glowOp.value = withRepeat(
      withTiming(0.9, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      -1, true
    );
    ringScale.value = withRepeat(
      withTiming(1.35, { duration: 2200, easing: Easing.out(Easing.quad) }),
      -1, true
    );
    ringOp.value = withRepeat(
      withTiming(0, { duration: 2200, easing: Easing.out(Easing.quad) }),
      -1, true
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOp.value,
    shadowOpacity: glowOp.value * 0.5,
  }));
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOp.value,
  }));

  return (
    <View style={styles.logoWrapper}>
      <Animated.View
        style={[
          styles.logoRing,
          { borderColor: colors.primary },
          ringStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.logo,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
          },
          glowStyle,
          logoStyle,
        ]}
      >
        <Feather name="lock" size={28} color={colors.primaryForeground} />
      </Animated.View>
    </View>
  );
}

export default function PinScreen() {
  const insets  = useSafeAreaInsets();
  const colors  = useColors();
  const { width, height } = useWindowDimensions();
  const { unlock, isUnlocked } = useVault();
  const [error, setError]     = useState("");
  const [attempts, setAttempts] = useState(0);

  const cardY = useSharedValue(30);
  const cardOp = useSharedValue(0);

  useEffect(() => {
    cardY.value  = withSpring(0, { damping: 16, stiffness: 120 });
    cardOp.value = withTiming(1, { duration: 500 });
  }, []);

  useEffect(() => {
    if (isUnlocked) router.replace("/vault");
  }, [isUnlocked]);

  const handlePin = async (pin: string) => {
    const ok = await unlock(pin);
    if (!ok) {
      const next = attempts + 1;
      setAttempts(next);
      setError(`Incorrect PIN (attempt ${next})`);
    }
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardY.value }],
    opacity: cardOp.value,
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
        <PulseLogo colors={colors} />
        <Text style={[styles.appName, { color: colors.foreground }]}>HaqDar</Text>
        <Text style={[styles.appUrdu, { color: colors.mutedForeground }]}>حق دار</Text>
        <View style={[styles.privacyBadge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="shield" size={10} color={colors.accent} />
          <Text style={[styles.privacyText, { color: colors.accent }]}>
            Data stays on this device only
          </Text>
        </View>
      </Animated.View>

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
    gap: 6,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  logoRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
  },
  appName: {
    fontSize: 26,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
  appUrdu: {
    fontSize: 13,
    marginTop: -2,
  },
  privacyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
  },
  privacyText: {
    fontSize: 10,
    fontWeight: "600" as const,
    letterSpacing: 0.2,
  },
});
