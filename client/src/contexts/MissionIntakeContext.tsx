import { createContext, useContext, useState } from "react";

interface MissionIntakeContextValue {
  openMissionIntake: () => void;
}

const MissionIntakeContext = createContext<MissionIntakeContextValue>({
  openMissionIntake: () => {},
});

export function useMissionIntake() {
  return useContext(MissionIntakeContext);
}

export function MissionIntakeProvider({
  children,
  onOpen,
}: {
  children: React.ReactNode;
  onOpen: () => void;
}) {
  return (
    <MissionIntakeContext.Provider value={{ openMissionIntake: onOpen }}>
      {children}
    </MissionIntakeContext.Provider>
  );
}
