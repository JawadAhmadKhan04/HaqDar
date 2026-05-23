import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router, usePathname, Slot } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useVault } from "@/context/VaultContext";
import { useAuth } from "@/context/AuthContext";

type Tab = "index" | "log" | "dossier" | "resources";

const TABS: { name: Tab; icon: keyof typeof Feather.glyphMap; label: string }[] = [
  { name: "index", icon: "list", label: "Timeline" },
  { name: "log", icon: "plus-circle", label: "Log" },
  { name: "dossier", icon: "file-text", label: "Dossier" },
  { name: "resources", icon: "phone-call", label: "Help" },
];

function getActiveTab(pathname: string): Tab {
  if (pathname.includes("/dossier")) return "dossier";
  if (pathname.includes("/resources")) return "resources";
  if (pathname.includes("/log")) return "log";
  return "index";
}

export default function VaultLayout() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { isUnlocked, loading, lock, syncing } = useVault();
  const { deviceId, ready } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isUnlocked) {
      router.replace("/pin");
    }
  }, [loading, isUnlocked]);

  if (!loading && !isUnlocked) return null;

  const active = getActiveTab(pathname);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const navigate = (tab: Tab) => {
    router.push(tab === "index" ? "/vault" : `/vault/${tab}`);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === "web" ? 67 : insets.top,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={[styles.appTitle, { color: colors.foreground }]}>HaqDar</Text>
          <Text style={[styles.appUrdu, { color: colors.mutedForeground }]}>حق دار</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Cloud sync status pill */}
          <View
            style={[
              styles.syncPill,
              {
                backgroundColor: deviceId ? colors.primary + "14" : colors.muted,
                borderColor: deviceId ? colors.primary + "44" : colors.border,
              },
            ]}
          >
            {syncing ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ width: 14, height: 14 }} />
            ) : (
              <Feather
                name={deviceId ? "cloud" : "cloud-off"}
                size={12}
                color={deviceId ? colors.primary : colors.mutedForeground}
              />
            )}
            <Text
              style={[
                styles.syncText,
                { color: deviceId ? colors.primary : colors.mutedForeground },
              ]}
            >
              {syncing ? "Syncing…" : deviceId ? "Backed up" : "Local only"}
            </Text>
          </View>

          <TouchableOpacity
            onPress={lock}
            style={[styles.lockBtn, { backgroundColor: colors.secondary }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="lock" size={16} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Slot />
      </View>

      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: bottomPad + 4,
          },
        ]}
      >
        {TABS.map((tab) => {
          const isActive = tab.name === active;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={() => navigate(tab.name)}
              activeOpacity={0.7}
            >
              <Feather
                name={tab.icon}
                size={22}
                color={isActive ? colors.primary : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? colors.primary : colors.mutedForeground },
                  isActive && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerLeft: { gap: 1 },
  appTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
  },
  appUrdu: {
    fontSize: 12,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  syncText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  lockBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "500" as const,
  },
  tabLabelActive: {
    fontWeight: "700" as const,
  },
});
