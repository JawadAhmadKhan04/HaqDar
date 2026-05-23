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
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function PinScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { unlock } = useVault();
  const { user } = useAuth();
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

        {/* Cloud sign-in shortcut */}
        {!user && (
          <TouchableOpacity
            onPress={() => router.push("/auth")}
            style={[styles.cloudBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          >
            <Feather name="cloud" size={14} color={colors.mutedForeground} />
            <Text style={[styles.cloudText, { color: colors.mutedForeground }]}>Sign in</Text>
          </TouchableOpacity>
        )}

        {user && (
          <View style={[styles.cloudBtn, { backgroundColor: colors.primary + "18", borderColor: colors.primary }]}>
            <Feather name="cloud" size={14} color={colors.primary} />
            <Text style={[styles.cloudText, { color: colors.primary }]} numberOfLines={1}>
              {user.email?.split("@")[0]}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.brand}>
        <View style={[styles.logo, { backgroundColor: colors.primary }]}>
          <Feather name="lock" size={26} color="#FFFFFF" />
        </View>
        <Text style={[styles.appName, { color: colors.foreground }]}>
          HaqDar / حق دار
        </Text>
        {user && (
          <Text style={[styles.syncNote, { color: colors.mutedForeground }]}>
            Cloud backup active · {user.email}
          </Text>
        )}
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
    justifyContent: "space-between",
    marginBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cloudBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 140,
  },
  cloudText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  brand: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 8,
    gap: 6,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  appName: {
    fontSize: 24,
    fontWeight: "700" as const,
  },
  syncNote: {
    fontSize: 11,
    textAlign: "center",
  },
});
