"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchMatches,
  insertMatch,
  updateMatch as dbUpdateMatch,
  deleteMatch as dbDeleteMatch,
  bulkImport,
} from "@/lib/db";
import type { Match, AppData } from "@/types";

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches()
      .then(setMatches)
      .finally(() => setLoading(false));
  }, []);

  const addMatch = useCallback(async (match: Omit<Match, "id" | "createdAt">) => {
    const newMatch = await insertMatch(match);
    setMatches((prev) => [newMatch, ...prev]);
    return newMatch;
  }, []);

  const editMatch = useCallback(
    async (id: string, match: Omit<Match, "id" | "createdAt">) => {
      await dbUpdateMatch(id, match);
      setMatches((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, ...match }
            : m
        )
      );
    },
    []
  );

  const deleteMatch = useCallback(async (id: string) => {
    await dbDeleteMatch(id);
    setMatches((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const exportData = useCallback(
    (players: import("@/types").Player[]) => {
      const data: AppData = { players, matches };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rl-tracker-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [matches]
  );

  const importData = useCallback(async (data: AppData) => {
    await bulkImport(data.players, data.matches);
    const updated = await fetchMatches();
    setMatches(updated);
  }, []);

  return { matches, loading, addMatch, editMatch, deleteMatch, exportData, importData };
}
