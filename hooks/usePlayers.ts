"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchPlayers,
  insertPlayer,
  updatePlayerName,
  deactivatePlayer as dbDeactivatePlayer,
  countPlayerMatches,
  deletePlayerWithMatches,
  uploadPlayerAvatar,
  removePlayerAvatar,
} from "@/lib/db";
import type { Player } from "@/types";

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers()
      .then(setPlayers)
      .finally(() => setLoading(false));
  }, []);

  const addPlayer = useCallback(async (name: string) => {
    const player = await insertPlayer(name.trim());
    setPlayers((prev) => [...prev, player]);
  }, []);

  const deactivatePlayer = useCallback(async (id: string) => {
    await dbDeactivatePlayer(id);
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: false } : p))
    );
  }, []);

  const renamePlayer = useCallback(async (id: string, name: string) => {
    await updatePlayerName(id, name.trim());
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: name.trim() } : p))
    );
  }, []);

  const deletePlayer = useCallback(async (id: string): Promise<{ matchCount: number }> => {
    const matchCount = await countPlayerMatches(id);
    return { matchCount };
  }, []);

  const confirmDeletePlayer = useCallback(async (id: string) => {
    await deletePlayerWithMatches(id);
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateAvatar = useCallback(async (id: string, file: File) => {
    const url = await uploadPlayerAvatar(id, file);
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, avatarUrl: url } : p)));
  }, []);

  const deleteAvatar = useCallback(async (id: string) => {
    await removePlayerAvatar(id);
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, avatarUrl: undefined } : p)));
  }, []);

  // 試合選択用：activeなプレイヤーのみ
  const activePlayers = players.filter((p) => p.active);

  return { players, activePlayers, loading, addPlayer, deactivatePlayer, deletePlayer, confirmDeletePlayer, renamePlayer, updateAvatar, deleteAvatar };
}
