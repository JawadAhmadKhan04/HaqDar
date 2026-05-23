import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  Incident,
  getIncidents,
  getStoredPinHash,
  hasPinSet,
  saveIncident,
  savePin,
  wipeAllData,
  deleteIncident,
} from "@/utils/storage";
import { sha256 } from "@/utils/crypto";
import {
  pushIncidentToCloud,
  fetchIncidentsFromCloud,
  deleteIncidentFromCloud,
  deleteAllIncidentsFromCloud,
} from "@/utils/sync";
import { useAuth } from "./AuthContext";

interface VaultContextType {
  isUnlocked: boolean;
  pinIsSet: boolean;
  incidents: Incident[];
  loading: boolean;
  syncing: boolean;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  setupPin: (pin: string) => Promise<void>;
  addIncident: (data: Omit<Incident, "id" | "hash" | "timestamp">) => Promise<Incident>;
  removeIncident: (id: string) => Promise<void>;
  wipe: () => Promise<void>;
  refresh: () => Promise<void>;
  syncFromCloud: () => Promise<void>;
}

const VaultContext = createContext<VaultContextType | null>(null);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinIsSet, setPinIsSet] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    hasPinSet().then((has) => {
      setPinIsSet(has);
      setLoading(false);
    });
  }, []);

  const refresh = useCallback(async () => {
    const data = await getIncidents();
    data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    setIncidents(data);
  }, []);

  // Load incidents when vault is unlocked
  useEffect(() => {
    if (isUnlocked) {
      refresh();
    }
  }, [isUnlocked, refresh]);

  // When a cloud identity is available and vault is unlocked, trigger a sync
  useEffect(() => {
    if (user && isUnlocked) {
      syncFromCloud();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isUnlocked]);

  const syncFromCloud = useCallback(async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const cloudIncidents = await fetchIncidentsFromCloud(user.id);
      const local = await getIncidents();
      const cloudIds = new Set(cloudIncidents.map((i) => i.id));
      const localIds = new Set(local.map((i) => i.id));

      // Push local-only entries up to cloud
      const localOnly = local.filter((i) => !cloudIds.has(i.id));
      for (const inc of localOnly) {
        try {
          await pushIncidentToCloud(inc, user.id);
        } catch {
          // non-fatal
        }
      }

      // Save cloud-only entries locally (don't touch existing local ones)
      const cloudOnly = cloudIncidents.filter((i) => !localIds.has(i.id));
      for (const inc of cloudOnly) {
        try {
          await saveIncident(inc);
        } catch {
          // non-fatal
        }
      }

      // Refresh from local storage (now contains merged set)
      await refresh();
    } catch (e) {
      console.warn("[VaultContext] syncFromCloud error:", e);
    } finally {
      setSyncing(false);
    }
  }, [user, refresh]);

  const unlock = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const stored = await getStoredPinHash();
      if (!stored) return false;
      const entered = await sha256(pin);
      if (entered === stored) {
        setIsUnlocked(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const lock = useCallback(() => {
    setIsUnlocked(false);
    setIncidents([]);
  }, []);

  const setupPin = useCallback(async (pin: string) => {
    const pinHash = await sha256(pin);
    await savePin(pinHash);
    setPinIsSet(true);
    setIsUnlocked(true);
  }, []);

  const addIncident = useCallback(
    async (data: Omit<Incident, "id" | "hash" | "timestamp">): Promise<Incident> => {
      const timestamp = new Date().toISOString();
      const hashInput = `${timestamp}|${data.narrative}|${data.mediaFilename}`;
      const hash = await sha256(hashInput);
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const incident: Incident = { id, timestamp, hash, ...data };
      await saveIncident(incident);

      if (user) {
        try {
          await pushIncidentToCloud(incident, user.id);
        } catch {
          // non-fatal — data is saved locally
        }
      }

      await refresh();
      return incident;
    },
    [refresh, user]
  );

  const removeIncident = useCallback(
    async (id: string) => {
      await deleteIncident(id);
      if (user) {
        try {
          await deleteIncidentFromCloud(id);
        } catch {
          // non-fatal
        }
      }
      await refresh();
    },
    [refresh, user]
  );

  const wipe = useCallback(async () => {
    if (user) {
      try {
        await deleteAllIncidentsFromCloud(user.id);
      } catch {
        // non-fatal
      }
    }
    await wipeAllData();
    setIsUnlocked(false);
    setIncidents([]);
    setPinIsSet(false);
  }, [user]);

  return (
    <VaultContext.Provider
      value={{
        isUnlocked,
        pinIsSet,
        incidents,
        loading,
        syncing,
        unlock,
        lock,
        setupPin,
        addIncident,
        removeIncident,
        wipe,
        refresh,
        syncFromCloud,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault(): VaultContextType {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
}
