import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { router, usePathname, Slot } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useColors } from "@/hooks/useColors";
import { useVault } from "@/context/VaultContext";
import { useAuth } from "@/context/AuthContext";
import ParticleBackground from "@/components/ParticleBackground";

type Tab = "index" | "dossier" | "rights" | "resources";

const TABS: { name: Tab; icon: keyof typeof Feather.glyphMap; label: string }[] = [
  { name: "index",     icon: "clock",       label: "Timeline" },
  { name: "dossier",   icon: "file-text",   label: "Dossier"  },
  { name: "rights",    icon: "book-open",   label: "Rights"   },
  { name: "resources", icon: "phone-call",  label: "Help"     },
];

function getActiveTab(pathname: string): Tab | "log" {
  if (pathname.includes("/dossier"))   return "dossier";
  if (pathname.includes("/resources")) return "resources";
  if (pathname.includes("/rights"))    return "rights";
  if (pathname.includes("/log"))       return "log";
  return "index";
}

function AnimatedTab({
  tab,
  isActive,
  onPress,
  colors,
}: {
  tab: (typeof TABS)[0];
  isActive: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const scale   = useSharedValue(1);
  const glowOp  = useSharedValue(0);

  useEffect(() => {
    scale.value  = withSpring(isActive ? 1.18 : 1, { damping: 12, stiffness: 200 });
    glowOp.value = withTiming(isActive ? 1 : 0, { duration: 250 });
  }, [isActive]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const dotStyle  = useAnimatedStyle(() => ({
    opacity: glowOp.value,
    transform: [{ scale: interpolate(glowOp.value, [0, 1], [0.4, 1], Extrapolation.CLAMP) }],
  }));

  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress} activeOpacity={0.7}>
      <Animated.View style={iconStyle}>
        <Feather
          name={tab.icon}
          size={22}
          color={isActive ? colors.primary : colors.mutedForeground}
        />
      </Animated.View>
      <Text
        style={[
          styles.tabLabel,
          { color: isActive ? colors.primary : colors.mutedForeground },
          isActive && styles.tabLabelActive,
        ]}
      >
        {tab.label}
      </Text>
      <Animated.View
        style={[
          styles.activeGlowDot,
          { backgroundColor: colors.primary },
          dotStyle,
        ]}
      />
    </TouchableOpacity>
  );
}

function FabButton({
  onPress,
  colors,
}: {
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const scale  = useSharedValue(1);
  const rotate = useSharedValue(0);

  const handlePress = () => {
    scale.value  = withSpring(0.88, { damping: 8 }, () => {
      scale.value = withSpring(1, { damping: 12 });
    });
    rotate.value = withTiming(45, { duration: 200 }, () => {
      rotate.value = withTiming(0, { duration: 200 });
    });
    onPress();
  };

  const fabStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={styles.fabTouch}>
      <Animated.View
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
          },
          fabStyle,
        ]}
      >
        <Feather name="plus" size={26} color={colors.primaryForeground} />
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function VaultLayout() {
  const insets  = useSafeAreaInsets();
  const colors  = useColors();
  const { width, height } = useWindowDimensions();
  const { isUnlocked, pinIsSet, loading, lock, syncing, cloudConnected } = useVault();
  const { deviceId } = useAuth();
  const pathname = usePathname();
  const scheme   = Platform.select({ ios: "dark", default: "default" }) as "dark" | "default" | "light";

  useEffect(() => {
    if (!loading && !isUnlocked) {
      router.replace(pinIsSet ? "/pin" : "/pin-setup");
    }
  }, [loading, isUnlocked, pinIsSet]);

  if (!loading && !isUnlocked) return null;

  const active    = getActiveTab(pathname);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const navigate = (tab: Tab) => {
    router.push(tab === "index" ? "/vault" : `/vault/${tab}`);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ParticleBackground width={width} height={height} />

      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === "web" ? 67 : insets.top,
            borderBottomColor: colors.border + "80",
          },
        ]}
      >
        {Platform.OS !== "web" ? (
          <BlurView
            intensity={60}
            tint={colors.background === "#080D0B" ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.background + "E8" }]}
          />
        )}

        <View style={styles.headerInner}>
          <View style={styles.headerLeft}>
            <View style={[styles.logoMark, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
              <Feather name="shield" size={14} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.appTitle, { color: colors.foreground }]}>HaqDar</Text>
              <Text style={[styles.appUrdu, { color: colors.mutedForeground }]}>حق دار</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View
              style={[
                styles.syncPill,
                {
                  backgroundColor: cloudConnected ? colors.primary + "18" : colors.muted,
                  borderColor: cloudConnected ? colors.primary + "55" : colors.border,
                },
              ]}
            >
              {syncing ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ width: 12, height: 12 }} />
              ) : (
                <View style={[styles.syncDot, { backgroundColor: cloudConnected ? colors.primary : colors.mutedForeground }]} />
              )}
              <Text style={[styles.syncText, { color: cloudConnected ? colors.primary : colors.mutedForeground }]}>
                {syncing ? "Syncing" : cloudConnected ? "Backed up" : "Local only"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={lock}
              style={[styles.lockBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="lock" size={15} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Slot />
      </View>

      <View style={[styles.navContainer, { paddingBottom: bottomPad + 8 }]}>
        <View style={[styles.navDock, { shadowColor: colors.primary }]}>
          {Platform.OS !== "web" ? (
            <BlurView
              intensity={80}
              tint={colors.background === "#080D0B" ? "dark" : "light"}
              style={[StyleSheet.absoluteFill, styles.navBlur]}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                styles.navBlur,
                { backgroundColor: colors.card + "F0", borderColor: colors.border },
              ]}
            />
          )}

          <View style={[styles.navBorder, { borderColor: colors.border + "60" }]} />

          {TABS.slice(0, 2).map((tab) => (
            <AnimatedTab
              key={tab.name}
              tab={tab}
              isActive={active === tab.name}
              onPress={() => navigate(tab.name)}
              colors={colors}
            />
          ))}

          <FabButton
            onPress={() => router.push("/vault/log")}
            colors={colors}
          />

          {TABS.slice(2).map((tab) => (
            <AnimatedTab
              key={tab.name}
              tab={tab}
              isActive={active === tab.name}
              onPress={() => navigate(tab.name)}
              colors={colors}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
    overflow: "hidden",
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  appTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  appUrdu: {
    fontSize: 10,
    lineHeight: 13,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  syncPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  syncText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  lockBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  content: { flex: 1 },

  navContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  navDock: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 28,
    overflow: "hidden",
    paddingVertical: 6,
    paddingHorizontal: 4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    shadowOpacity: 0.15,
    elevation: 12,
  },
  navBlur: {
    borderRadius: 28,
    borderWidth: 1,
  },
  navBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
  },

  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    gap: 3,
    position: "relative" as const,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: "500" as const,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    fontWeight: "700" as const,
  },
  activeGlowDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 1,
  },

  fabTouch: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.4,
    elevation: 8,
  },
});
