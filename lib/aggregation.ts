import type { Match, Player, PlayerRecord, PairRecord, PlayerStats } from "@/types";

export function getPairKey(a: string, b: string): string {
  return [a, b].sort().join(":");
}

export function calcPlayerRecords(
  matches: Match[],
  players: Player[]
): PlayerRecord[] {
  return players.map((player) => {
    const pid = player.id;
    const playerMatches = matches.filter(
      (m) => m.winners.includes(pid) || m.losers.includes(pid)
    );

    const wins = playerMatches.filter((m) => m.winners.includes(pid)).length;
    const losses = playerMatches.filter((m) => m.losers.includes(pid)).length;
    const total = playerMatches.length;

    let totalScore = 0;
    let totalGoals = 0;
    let totalAssists = 0;
    let totalSaves = 0;
    let totalShots = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    for (const m of playerMatches) {
      const stat = m.stats.find((s) => s.playerId === pid);
      if (stat) {
        totalScore += stat.score;
        totalGoals += stat.goals;
        totalAssists += stat.assists;
        totalSaves += stat.saves;
        totalShots += stat.shots;
      }

      const isWinner = m.winners.includes(pid);
      const teammateId = isWinner
        ? m.winners.find((id) => id !== pid)!
        : m.losers.find((id) => id !== pid)!;
      const opponentIds = isWinner ? m.losers : m.winners;

      const teamGoals =
        (m.stats.find((s) => s.playerId === pid)?.goals ?? 0) +
        (m.stats.find((s) => s.playerId === teammateId)?.goals ?? 0);
      const oppGoals = opponentIds.reduce(
        (sum, id) => sum + (m.stats.find((s) => s.playerId === id)?.goals ?? 0),
        0
      );

      goalsFor += teamGoals;
      goalsAgainst += oppGoals;
    }

    const goalDiff = goalsFor - goalsAgainst;

    return {
      playerId: pid,
      matches: total,
      wins,
      losses,
      winRate: total > 0 ? wins / total : 0,
      goalDiff,
      totalScore,
      totalGoals,
      totalAssists,
      totalSaves,
      totalShots,
      shotRate: totalShots > 0 ? totalGoals / totalShots : 0,
      avgScore: total > 0 ? totalScore / total : 0,
      avgGoals: total > 0 ? totalGoals / total : 0,
      avgAssists: total > 0 ? totalAssists / total : 0,
      avgSaves: total > 0 ? totalSaves / total : 0,
      avgShots: total > 0 ? totalShots / total : 0,
    };
  });
}

export function calcPairRecords(matches: Match[]): PairRecord[] {
  const map = new Map<string, PairRecord>();

  for (const m of matches) {
    const pairs: Array<{ ids: [string, string]; won: boolean }> = [
      { ids: [m.winners[0], m.winners[1]], won: true },
      { ids: [m.losers[0], m.losers[1]], won: false },
    ];

    for (const { ids, won } of pairs) {
      const key = getPairKey(ids[0], ids[1]);
      const sorted = [ids[0], ids[1]].sort() as [string, string];

      if (!map.has(key)) {
        map.set(key, {
          pairKey: key,
          playerIds: sorted,
          matches: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          goalDiff: 0,
          teamScore: 0,
          teamGoals: 0,
          teamConceded: 0,
          teamShots: 0,
          teamShotRate: 0,
        });
      }

      const rec = map.get(key)!;
      rec.matches += 1;
      if (won) rec.wins += 1;
      else rec.losses += 1;

      const teamStats = ids.map(
        (id) => m.stats.find((s) => s.playerId === id) ?? defaultStats(id)
      );
      const oppIds = won ? m.losers : m.winners;
      const oppStats = oppIds.map(
        (id) => m.stats.find((s) => s.playerId === id) ?? defaultStats(id)
      );

      const teamGoals = teamStats.reduce((s, st) => s + st.goals, 0);
      const oppGoals = oppStats.reduce((s, st) => s + st.goals, 0);

      rec.teamScore += teamStats.reduce((s, st) => s + st.score, 0);
      rec.teamGoals += teamGoals;
      rec.teamConceded += oppGoals;
      rec.teamShots += teamStats.reduce((s, st) => s + st.shots, 0);
      rec.goalDiff += teamGoals - oppGoals;
    }
  }

  for (const rec of map.values()) {
    rec.winRate = rec.matches > 0 ? rec.wins / rec.matches : 0;
    rec.teamShotRate = rec.teamShots > 0 ? rec.teamGoals / rec.teamShots : 0;
  }

  return Array.from(map.values());
}

function defaultStats(playerId: string): PlayerStats {
  return { playerId, score: 0, goals: 0, assists: 0, saves: 0, shots: 0 };
}
