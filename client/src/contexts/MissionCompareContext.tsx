import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CalculatedResults, PayloadConfig } from "@/lib/types";

export interface SavedMission {
  id: string;
  name: string;
  payload: PayloadConfig;
  results: CalculatedResults;
  savedAt: Date;
}

interface MissionCompareContextType {
  savedMissions: SavedMission[];
  saveMission: (name: string, payload: PayloadConfig, results: CalculatedResults) => void;
  removeMission: (id: string) => void;
  clearAllMissions: () => void;
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;
}

const MissionCompareContext = createContext<MissionCompareContextType | null>(null);

export function MissionCompareProvider({ children }: { children: ReactNode }) {
  const [savedMissions, setSavedMissions] = useState<SavedMission[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const saveMission = useCallback((name: string, payload: PayloadConfig, results: CalculatedResults) => {
    const newMission: SavedMission = {
      id: `mission-${Date.now()}`,
      name: name || `Mission ${savedMissions.length + 1}`,
      payload,
      results,
      savedAt: new Date(),
    };
    setSavedMissions(prev => [...prev, newMission].slice(-5));
  }, [savedMissions.length]);

  const removeMission = useCallback((id: string) => {
    setSavedMissions(prev => prev.filter(m => m.id !== id));
  }, []);

  const clearAllMissions = useCallback(() => {
    setSavedMissions([]);
  }, []);

  return (
    <MissionCompareContext.Provider value={{
      savedMissions,
      saveMission,
      removeMission,
      clearAllMissions,
      isCompareOpen,
      setIsCompareOpen,
    }}>
      {children}
    </MissionCompareContext.Provider>
  );
}

export function useMissionCompare() {
  const context = useContext(MissionCompareContext);
  if (!context) {
    throw new Error("useMissionCompare must be used within MissionCompareProvider");
  }
  return context;
}
