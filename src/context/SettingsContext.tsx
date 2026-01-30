import { createContext, useContext, ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Settings } from "../types";

interface SettingsContextType {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  parseCoins: true,
  sortKeys: false,
  compareMode: false,
  dualPanel: true,
  labels: [],
  coinDenoms: [],
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useLocalStorage<Partial<Settings>>(
    "cosmos-json-settings",
    defaultSettings,
  );

  // Merge stored value with defaults so new keys are always present
  const settings: Settings = { ...defaultSettings, ...raw };

  const updateSettings = (partial: Partial<Settings>) => {
    setRaw((prev) => ({ ...prev, ...partial }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
