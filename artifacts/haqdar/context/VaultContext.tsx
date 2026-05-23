import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
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

interface VaultContextType {
  isUnlocked: boolean;
  pinIsSet: boolean;
  incidents: Incident[];
  loading: boolean;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  setupPin: (pin: string) => Promise<void>;
  addIncident: (data: Omit<Incident, "id" | "hash" | "timestamp">) => Promise<Incident>;
  removeIncident: (id: string) => Promise<void>;
  wipe: () => Promise<void>;
  refresh: () => Promise<void>;
}

const VaultContext = createContext<VaultContextType | null>(null);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinIsSet, setPinIsSet] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (isUnlocked) {
      refresh();
    }
  }, [isUnlocked, refresh]);

  const unlock = useCallback(async (pin: string): Promise<boolean> => {
    const stored = await getStoredPinHash();
    if (!stored) return false;
    const entered = await sha256(pin);
    if (entered === stored) {
      setIsUnlocked(true);
      return true;
    }
    return false;
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
      await refresh();
      return incident;
    },
    [refresh]
  );

  const removeIncident = useCallback(
    async (id: string) => {
      await deleteIncident(id);
      await refresh();
    },
    [refresh]
  );

  const wipe = useCallback(async () => {
    await wipeAllData();
    setIsUnlocked(false);
    setIncidents([]);
    setPinIsSet(false);
  }, []);

  return (
    <VaultContext.Provider
      value={{
        isUnlocked,
        pinIsSet,
        incidents,
        loading,
        unlock,
        lock,
        setupPin,
        addIncident,
        removeIncident,
        wipe,
        refresh,
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
