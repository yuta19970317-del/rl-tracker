import type { Match, Player } from "@/types";

export type PlagueEntry = {
  playerId: string;
  playerName: string;
  peakStreak: number;
  startDate: string;
  endDate: string | null;
};

export function getConsecutiveLosses(playerId: string, matches: Match[]): number {
  const playerMatches = matches
    .filter((m) => m.winners.includes(playerId) || m.losers.includes(playerId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let streak = 0;
  for (const m of playerMatches) {
    if (m.losers.includes(playerId)) streak++;
    else break;
  }
  return streak;
}

export function getCurrentPlagueGods(
  players: Player[],
  matches: Match[]
): { player: Player; streak: number }[] {
  return players
    .map((p) => ({ player: p, streak: getConsecutiveLosses(p.id, matches) }))
    .filter((x) => x.streak >= 3)
    .sort((a, b) => b.streak - a.streak);
}

export function getPlagueGodHistory(players: Player[], matches: Match[]): PlagueEntry[] {
  const sorted = [...matches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const streaks = new Map<string, number>();
  players.forEach((p) => streaks.set(p.id, 0));

  const entries: PlagueEntry[] = [];
  const active = new Map<string, PlagueEntry>();

  for (const match of sorted) {
    for (const pid of [...match.winners, ...match.losers]) {
      const prev = streaks.get(pid) ?? 0;
      const curr = match.losers.includes(pid) ? prev + 1 : 0;
      streaks.set(pid, curr);

      const playerName = players.find((p) => p.id === pid)?.name ?? pid;

      if (curr === 3 && prev < 3) {
        const entry: PlagueEntry = {
          playerId: pid,
          playerName,
          peakStreak: 3,
          startDate: match.date,
          endDate: null,
        };
        active.set(pid, entry);
        entries.push(entry);
      } else if (curr > 3 && active.has(pid)) {
        active.get(pid)!.peakStreak = curr;
      } else if (curr === 0 && prev >= 3 && active.has(pid)) {
        active.get(pid)!.endDate = match.date;
        active.delete(pid);
      }
    }
  }

  return entries.reverse();
}
