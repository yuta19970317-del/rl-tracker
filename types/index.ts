export type Player = {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  avatarUrl?: string;
};

export type PlayerStats = {
  playerId: string;
  score: number;
  goals: number;
  assists: number;
  saves: number;
  shots: number;
};

export type Match = {
  id: string;
  date: string;
  winners: [string, string];
  losers: [string, string];
  stats: PlayerStats[];
  memo: string;
  createdAt: string;
};

export type PlayerRecord = {
  playerId: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  goalDiff: number;
  totalScore: number;
  totalGoals: number;
  totalAssists: number;
  totalSaves: number;
  totalShots: number;
  shotRate: number;
  avgScore: number;
  avgGoals: number;
  avgAssists: number;
  avgSaves: number;
  avgShots: number;
};

export type PairRecord = {
  pairKey: string;
  playerIds: [string, string];
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  goalDiff: number;
  teamScore: number;
  teamGoals: number;
  teamConceded: number;
  teamShots: number;
  teamShotRate: number;
};

export type AppData = {
  players: Player[];
  matches: Match[];
};
