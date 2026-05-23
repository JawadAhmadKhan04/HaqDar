import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useVault } from "@/context/VaultContext";
import IncidentCard from "@/components/IncidentCard";
import type { Incident } from "@/utils/storage";

export default function VaultHomeScreen() {
  const colors = useColors();
  const { incidents, refresh } = useVault();

  const renderItem = useCallback(
    ({ item }: { item: Incident }) => (
      <IncidentCard
        incident={item}
        onPress={() => router.push(`/vault/${item.id}`)}
      />
    ),
    []
  );

  const EmptyState = () => (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
        <Feather name="shield" size={32} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
        No entries yet
      </Text>
      <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
        Tap "Log" to record your first incident. All data stays on this device.
      </Text>
      <Text style={[styles.emptyUrdu, { color: colors.mutedForeground }]}>
        ابھی تک کوئی اندراج نہیں۔ پہلا واقعہ درج کریں۔
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {incidents.length > 0 && (
        <View style={[styles.summary, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="clock" size={13} color={colors.mutedForeground} />
          <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>
            {incidents.length} recorded {incidents.length === 1 ? "incident" : "incidents"} · sorted oldest first
          </Text>
        </View>
      )}

      <FlatList
        data={incidents}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.list,
          incidents.length === 0 && styles.listEmpty,
        ]}
        scrollEnabled={!!incidents.length}
        ListEmptyComponent={<EmptyState />}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  summaryText: { fontSize: 12 },
  list: {
    padding: 16,
    paddingBottom: 24,
  },
  listEmpty: {
    flex: 1,
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyUrdu: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 4,
  },
});
