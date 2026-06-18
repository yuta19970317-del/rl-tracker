import type { Player, Match, AppData } from "@/types";

const PLAYERS_KEY = "rl_tracker_players";
const MATCHES_KEY = "rl_tracker_matches";

export const storage = {
  getPlayers(): Player[] {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(PLAYERS_KEY) ?? "[]");
    } catch {
      return [];
    }
  },

  savePlayers(players: Player[]): void {
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
  },

  getMatches(): Match[] {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(MATCHES_KEY) ?? "[]");
    } catch {
      return [];
    }
  },

  saveMatches(matches: Match[]): void {
    localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
  },

  exportData(): AppData {
    return {
      players: storage.getPlayers(),
      matches: storage.getMatches(),
    };
  },

  importData(data: AppData): void {
    storage.savePlayers(data.players);
    storage.saveMatches(data.matches);
  },

  clear(): void {
    localStorage.removeItem(PLAYERS_KEY);
    localStorage.removeItem(MATCHES_KEY);
  },
};
