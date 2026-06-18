"use client";

import { createContext, useContext } from "react";
import { usePlayers } from "@/hooks/usePlayers";
import { useMatches } from "@/hooks/useMatches";

type AppContextValue = ReturnType<typeof usePlayers> & ReturnType<typeof useMatches>;

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const playersState = usePlayers();
  const matchesState = useMatches();

  return (
    <AppContext.Provider value={{ ...playersState, ...matchesState }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
