import React, { createContext, useContext, useEffect, useState } from "react";
import { getDeviceId } from "@/utils/deviceId";

interface AuthContextType {
  deviceId: string | null;
  ready: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getDeviceId()
      .then((id) => setDeviceId(id))
      .catch((e) => console.warn("[AuthContext] getDeviceId failed:", e))
      .finally(() => setReady(true));
  }, []);

  return (
    <AuthContext.Provider value={{ deviceId, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
