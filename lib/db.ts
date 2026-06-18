import { getSupabaseClient } from "@/lib/supabase";
import type { Player, Match, PlayerStats } from "@/types";

function db() {
  return getSupabaseClient();
}

// ---- Players ----

export async function fetchPlayers(): Promise<Player[]> {
  const { data, error } = await db()
    .from("players")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToPlayer);
}

export async function insertPlayer(name: string): Promise<Player> {
  const { data, error } = await db()
    .from("players")
    .insert({ name })
    .select()
    .single();
  if (error) throw error;
  return rowToPlayer(data);
}

export async function updatePlayerName(id: string, name: string): Promise<void> {
  const { error } = await db().from("players").update({ name }).eq("id", id);
  if (error) throw error;
}

export async function deactivatePlayer(id: string): Promise<void> {
  const { error } = await db().from("players").update({ active: false }).eq("id", id);
  if (error) throw error;
}

// ---- Matches ----

export async function fetchMatches(): Promise<Match[]> {
  const { data: matchRows, error: matchError } = await db()
    .from("matches")
    .select("*")
    .order("date", { ascending: false });
  if (matchError) throw matchError;

  const { data: mpRows, error: mpError } = await db()
    .from("match_players")
    .select("*");
  if (mpError) throw mpError;

  return (matchRows ?? []).map((m) => {
    const mps = (mpRows ?? []).filter((mp) => mp.match_id === m.id);
    return rowsToMatch(m, mps);
  });
}

export async function insertMatch(
  match: Omit<Match, "id" | "createdAt">
): Promise<Match> {
  const { data: matchRow, error: matchError } = await db()
    .from("matches")
    .insert({
      date: match.date,
      winner1_id: match.winners[0],
      winner2_id: match.winners[1],
      loser1_id: match.losers[0],
      loser2_id: match.losers[1],
      memo: match.memo,
    })
    .select()
    .single();
  if (matchError) throw matchError;

  const mpInserts = match.stats.map((s) => ({
    match_id: matchRow.id,
    player_id: s.playerId,
    team: match.winners.includes(s.playerId) ? "winner" : "loser",
    score: s.score,
    goals: s.goals,
    assists: s.assists,
    saves: s.saves,
    shots: s.shots,
  }));

  const { data: mpRows, error: mpError } = await db()
    .from("match_players")
    .insert(mpInserts)
    .select();
  if (mpError) throw mpError;

  return rowsToMatch(matchRow, mpRows ?? []);
}

export async function updateMatch(
  id: string,
  match: Omit<Match, "id" | "createdAt">
): Promise<void> {
  const { error: matchError } = await db()
    .from("matches")
    .update({
      date: match.date,
      winner1_id: match.winners[0],
      winner2_id: match.winners[1],
      loser1_id: match.losers[0],
      loser2_id: match.losers[1],
      memo: match.memo,
    })
    .eq("id", id);
  if (matchError) throw matchError;

  const { error: delError } = await db()
    .from("match_players")
    .delete()
    .eq("match_id", id);
  if (delError) throw delError;

  const mpInserts = match.stats.map((s) => ({
    match_id: id,
    player_id: s.playerId,
    team: match.winners.includes(s.playerId) ? "winner" : "loser",
    score: s.score,
    goals: s.goals,
    assists: s.assists,
    saves: s.saves,
    shots: s.shots,
  }));

  const { error: mpError } = await db().from("match_players").insert(mpInserts);
  if (mpError) throw mpError;
}

export async function deleteMatch(id: string): Promise<void> {
  const { error } = await db().from("matches").delete().eq("id", id);
  if (error) throw error;
}

// ---- Bulk import ----

export async function bulkImport(
  players: Player[],
  matches: Match[]
): Promise<void> {
  const playerRows = players.map((p) => ({
    id: p.id,
    name: p.name,
    active: p.active ?? true,
    created_at: p.createdAt,
  }));
  const { error: pe } = await db()
    .from("players")
    .upsert(playerRows, { onConflict: "id" });
  if (pe) throw pe;

  const matchRows = matches.map((m) => ({
    id: m.id,
    date: m.date,
    winner1_id: m.winners[0],
    winner2_id: m.winners[1],
    loser1_id: m.losers[0],
    loser2_id: m.losers[1],
    memo: m.memo,
    created_at: m.createdAt,
  }));
  const { error: me } = await db()
    .from("matches")
    .upsert(matchRows, { onConflict: "id" });
  if (me) throw me;

  for (const m of matches) {
    await db().from("match_players").delete().eq("match_id", m.id);
  }

  const mpRows = matches.flatMap((m) =>
    m.stats.map((s) => ({
      match_id: m.id,
      player_id: s.playerId,
      team: m.winners.includes(s.playerId) ? "winner" : "loser",
      score: s.score,
      goals: s.goals,
      assists: s.assists,
      saves: s.saves,
      shots: s.shots,
    }))
  );
  if (mpRows.length > 0) {
    const { error: mpe } = await db().from("match_players").insert(mpRows);
    if (mpe) throw mpe;
  }
}

// ---- App Settings ----

export async function fetchSetting(key: string): Promise<string | null> {
  const { data, error } = await db()
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .single();
  if (error) return null;
  return (data as { value: string }).value;
}

export async function updateSetting(key: string, value: string): Promise<void> {
  const { error } = await db()
    .from("app_settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key);
  if (error) throw error;
}

// ---- Row converters ----

function rowToPlayer(row: Record<string, unknown>): Player {
  return {
    id: row.id as string,
    name: row.name as string,
    active: row.active as boolean,
    createdAt: row.created_at as string,
  };
}

function rowsToMatch(
  matchRow: Record<string, unknown>,
  mpRows: Record<string, unknown>[]
): Match {
  const winners: [string, string] = [
    matchRow.winner1_id as string,
    matchRow.winner2_id as string,
  ];
  const losers: [string, string] = [
    matchRow.loser1_id as string,
    matchRow.loser2_id as string,
  ];

  const stats: PlayerStats[] = mpRows.map((mp) => ({
    playerId: mp.player_id as string,
    score: mp.score as number,
    goals: mp.goals as number,
    assists: mp.assists as number,
    saves: mp.saves as number,
    shots: mp.shots as number,
  }));

  return {
    id: matchRow.id as string,
    date: matchRow.date as string,
    winners,
    losers,
    stats,
    memo: (matchRow.memo as string) ?? "",
    createdAt: matchRow.created_at as string,
  };
}
