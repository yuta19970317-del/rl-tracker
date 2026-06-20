import type { Match, Player, PlayerRecord, PairRecord } from "@/types";
import { getConsecutiveLosses, getCurrentPlagueGods } from "@/lib/plague";

export type BadgeCategory = "attack" | "support" | "defense" | "streak" | "pair" | "plague";

export type Badge = {
  id: string;
  label: string;
  emoji: string;
  category: BadgeCategory;
  description: string;
  priority: number;
};

export type EarnedBadge = Badge & { detail?: string };

export const BADGE_DEFS: Badge[] = [
  { id: "plague-god",    label: "疫病神",        emoji: "☠️",   category: "plague",  description: "現在3連敗以上かつ最長連敗中",                 priority: 1  },
  { id: "cold-streak",   label: "沼り中",        emoji: "📉",   category: "streak",  description: "直近3連敗以上が続いている",                   priority: 3  },
  { id: "win-king",      label: "勝率王",        emoji: "👑",   category: "streak",  description: "5試合以上の中で勝率1位",                       priority: 4  },
  { id: "hat-trick",     label: "ハットトリック", emoji: "⚽",   category: "attack",  description: "1試合で3ゴール以上を達成",                     priority: 5  },
  { id: "hot-streak",    label: "上振れ中",      emoji: "📈",   category: "streak",  description: "直近5試合の勝率が通算より20%以上高い",         priority: 6  },
  { id: "finisher",      label: "決定力の鬼",    emoji: "🎯",   category: "attack",  description: "シュート決定率50%以上（5試合以上）",            priority: 8  },
  { id: "assist-pro",    label: "アシスト職人",  emoji: "🤝",   category: "support", description: "5試合以上の中で平均アシストが最高",             priority: 9  },
  { id: "iron-wall",     label: "鉄壁",          emoji: "🧱",   category: "defense", description: "1試合で5セーブ以上を記録",                     priority: 11 },
  { id: "exorcism",      label: "除霊成功",      emoji: "🧯",   category: "plague",  description: "疫病神と組んだ直近の試合で勝利",               priority: 12 },
  { id: "infected",      label: "感染者",        emoji: "🦠",   category: "plague",  description: "疫病神と組んで2回以上負けた",                  priority: 13 },
  { id: "nurse",         label: "介護士",        emoji: "🧑‍⚕️", category: "pair",    description: "疫病神と組んで2回以上勝った",                  priority: 15 },
  { id: "partner",       label: "相棒",          emoji: "🤜🤛", category: "pair",    description: "同じ相方との試合数が最多（3試合以上）",         priority: 16 },
  { id: "trigger-happy", label: "撃ちたがり",    emoji: "🔫",   category: "attack",  description: "1試合で8シュート以上を記録",                   priority: 20 },
  { id: "hell-duo",      label: "地獄デュオ",    emoji: "💀",   category: "pair",    description: "特定ペアの勝率が全ペア中最低（3試合以上）",    priority: 22 },
];

const BADGE_MAP = new Map(BADGE_DEFS.map((b) => [b.id, b]));
function def(id: string): Badge { return BADGE_MAP.get(id)!; }

export const CATEGORY_LABEL: Record<BadgeCategory, string> = {
  plague:  "☠️ 疫病神系",
  streak:  "📊 調子系",
  attack:  "⚔️ 攻撃系",
  support: "🤝 支援系",
  defense: "🛡️ 守備系",
  pair:    "👥 ペア系",
};

export function getPlayerBadges(
  playerId: string,
  allRecords: PlayerRecord[],
  matches: Match[],
  players: Player[],
  pairRecords: PairRecord[],
): EarnedBadge[] {
  const record = allRecords.find((r) => r.playerId === playerId);
  if (!record) return [];

  const earned: EarnedBadge[] = [];

  const playerMatches = matches
    .filter((m) => m.winners.includes(playerId) || m.losers.includes(playerId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // ── ☠️ 疫病神 ─────────────────────────────────────────────────
  // 新定義: 現在3連敗以上 かつ 全プレイヤー中で最長連敗
  const currentPlagues = getCurrentPlagueGods(players, matches);
  const plagueGodIds = currentPlagues.map((x) => x.player.id);
  const myStreak = getConsecutiveLosses(playerId, matches);
  const maxPlague = currentPlagues[0]?.streak ?? 0;
  if (myStreak >= 3 && myStreak === maxPlague) {
    earned.push({ ...def("plague-god"), detail: `現在${myStreak}連敗中` });
  }

  // ── 📉 沼り中 ─────────────────────────────────────────────────
  let streak = 0;
  for (const m of playerMatches) {
    if (m.losers.includes(playerId)) streak++;
    else break;
  }
  if (streak >= 3) earned.push({ ...def("cold-streak"), detail: `${streak}連敗中` });

  // ── 👑 勝率王 ─────────────────────────────────────────────────
  const qual5 = allRecords.filter((r) => r.matches >= 5);
  if (qual5.length > 1 && record.matches >= 5) {
    const maxWin = Math.max(...qual5.map((r) => r.winRate));
    if (record.winRate === maxWin) {
      earned.push({ ...def("win-king"), detail: `勝率 ${(record.winRate * 100).toFixed(1)}%` });
    }
  }

  // ── ⚽ ハットトリック ──────────────────────────────────────────
  const bestGoals = Math.max(0, ...playerMatches.map((m) => m.stats.find((s) => s.playerId === playerId)?.goals ?? 0));
  if (bestGoals >= 3) earned.push({ ...def("hat-trick"), detail: `最大 ${bestGoals} ゴール / 試合` });

  // ── 📈 上振れ中 ───────────────────────────────────────────────
  if (playerMatches.length >= 5 && record.matches >= 5) {
    const recent5 = playerMatches.slice(0, 5);
    const recentRate = recent5.filter((m) => m.winners.includes(playerId)).length / 5;
    if (recentRate >= record.winRate + 0.2) {
      earned.push({
        ...def("hot-streak"),
        detail: `直近5試合 ${(recentRate * 100).toFixed(0)}% vs 通算 ${(record.winRate * 100).toFixed(0)}%`,
      });
    }
  }

  // ── 🎯 決定力の鬼 ──────────────────────────────────────────────
  if (record.matches >= 5 && record.totalShots > 0 && record.shotRate >= 0.5) {
    earned.push({ ...def("finisher"), detail: `決定率 ${(record.shotRate * 100).toFixed(1)}%` });
  }

  // ── 🤝 アシスト職人 ────────────────────────────────────────────
  if (qual5.length > 1 && record.matches >= 5) {
    const maxA = Math.max(...qual5.map((r) => r.avgAssists));
    if (record.avgAssists === maxA && maxA > 0) {
      earned.push({ ...def("assist-pro"), detail: `平均 ${record.avgAssists.toFixed(2)} A / 試合` });
    }
  }

  // ── 🧱 鉄壁 ───────────────────────────────────────────────────
  const bestSaves = Math.max(0, ...playerMatches.map((m) => m.stats.find((s) => s.playerId === playerId)?.saves ?? 0));
  if (bestSaves >= 5) earned.push({ ...def("iron-wall"), detail: `最大 ${bestSaves} セーブ / 試合` });

  // ── 疫病神絡みバッジ（介護士・感染者・除霊成功）────────────────
  const otherPlagueIds = plagueGodIds.filter((id) => id !== playerId);
  if (otherPlagueIds.length > 0) {
    const withPlague = playerMatches.filter((m) => {
      const team = m.winners.includes(playerId) ? [...m.winners] : [...m.losers];
      return otherPlagueIds.some((id) => team.includes(id));
    });
    const winsWithPlague = withPlague.filter((m) => m.winners.includes(playerId)).length;
    const lossesWithPlague = withPlague.filter((m) => m.losers.includes(playerId)).length;

    if (lossesWithPlague >= 2) earned.push({ ...def("infected"), detail: `疫病神と ${lossesWithPlague} 回一緒に敗北` });
    if (winsWithPlague >= 2)   earned.push({ ...def("nurse"),    detail: `疫病神と ${winsWithPlague} 回一緒に勝利` });
    if (withPlague.length > 0 && withPlague[0].winners.includes(playerId)) {
      earned.push({ ...def("exorcism"), detail: "疫病神との直近試合で勝利" });
    }
  }

  // ── 🔫 撃ちたがり ─────────────────────────────────────────────
  const bestShots = Math.max(0, ...playerMatches.map((m) => m.stats.find((s) => s.playerId === playerId)?.shots ?? 0));
  if (bestShots >= 8) earned.push({ ...def("trigger-happy"), detail: `最大 ${bestShots} シュート / 試合` });

  // ── 🤜🤛 相棒 ─────────────────────────────────────────────────
  const myPairs = pairRecords.filter((p) => p.playerIds.includes(playerId) && p.matches >= 3);
  if (myPairs.length > 0) {
    const top = myPairs.reduce((a, b) => (b.matches > a.matches ? b : a));
    const partnerId = top.playerIds.find((id) => id !== playerId)!;
    const partner = players.find((p) => p.id === partnerId);
    if (partner) earned.push({ ...def("partner"), detail: `${partner.name} と ${top.matches} 試合` });
  }

  // ── 💀 地獄デュオ ─────────────────────────────────────────────
  const allQualPairs = pairRecords.filter((p) => p.matches >= 3);
  if (myPairs.length > 0 && allQualPairs.length > 1) {
    const globalMin = Math.min(...allQualPairs.map((p) => p.winRate));
    const myWorst = myPairs.find((p) => p.winRate === globalMin);
    if (myWorst) {
      const partnerId = myWorst.playerIds.find((id) => id !== playerId)!;
      const partner = players.find((p) => p.id === partnerId);
      earned.push({
        ...def("hell-duo"),
        detail: partner
          ? `${partner.name} とのペア勝率 ${(myWorst.winRate * 100).toFixed(1)}%`
          : `ペア勝率 ${(myWorst.winRate * 100).toFixed(1)}%`,
      });
    }
  }

  return earned.sort((a, b) => a.priority - b.priority);
}
