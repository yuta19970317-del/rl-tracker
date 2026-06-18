"use client";

import type { PlayerRecord, Player } from "@/types";

type TitleDef = {
  icon: string;
  title: string;
  key: keyof PlayerRecord;
  mainFmt: (n: number) => string;
  mainColor: string;
  subKey?: keyof PlayerRecord;
  subFmt?: (n: number) => string;
};

const TITLES: TitleDef[] = [
  {
    icon: "👑",
    title: "勝率王",
    key: "winRate",
    mainFmt: (n) => (n * 100).toFixed(1) + "%",
    mainColor: "text-green-400",
  },
  {
    icon: "⚽",
    title: "ゴール王",
    key: "avgGoals",
    mainFmt: (n) => "avg " + n.toFixed(2),
    mainColor: "text-green-400",
    subKey: "totalGoals",
    subFmt: (n) => "総数 " + n,
  },
  {
    icon: "🧤",
    title: "守護神",
    key: "avgSaves",
    mainFmt: (n) => "avg " + n.toFixed(2),
    mainColor: "text-blue-400",
    subKey: "totalSaves",
    subFmt: (n) => "総数 " + n,
  },
  {
    icon: "🎯",
    title: "決定力王",
    key: "shotRate",
    mainFmt: (n) => (n * 100).toFixed(1) + "%",
    mainColor: "text-orange-400",
  },
  {
    icon: "💛",
    title: "アシスト王",
    key: "avgAssists",
    mainFmt: (n) => "avg " + n.toFixed(2),
    mainColor: "text-green-400",
    subKey: "totalAssists",
    subFmt: (n) => "総数 " + n,
  },
  {
    icon: "🚀",
    title: "撃ちたがり",
    key: "avgShots",
    mainFmt: (n) => "avg " + n.toFixed(2),
    mainColor: "text-orange-400",
    subKey: "totalShots",
    subFmt: (n) => "総数 " + n,
  },
];

type Props = {
  records: PlayerRecord[];
  players: Player[];
  minMatches: number;
};

export function TitleCards({ records, players, minMatches }: Props) {
  const filtered = records.filter((r) => r.matches >= minMatches);
  if (filtered.length === 0) return null;

  const name = (id: string) => players.find((p) => p.id === id)?.name ?? "?";

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {TITLES.map((def) => {
        const maxVal = Math.max(...filtered.map((r) => r[def.key] as number));
        const winners = filtered.filter((r) => (r[def.key] as number) === maxVal);
        const isTie = winners.length > 1;

        return (
          <div
            key={def.title}
            className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex-shrink-0 min-w-[112px]"
          >
            {/* アバター or アイコン */}
            <div className="flex gap-1.5 mb-2">
              {winners.map((r) => {
                const player = players.find((p) => p.id === r.playerId);
                return player?.avatarUrl ? (
                  <img
                    key={r.playerId}
                    src={player.avatarUrl}
                    alt={player.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-gray-700"
                  />
                ) : (
                  <div
                    key={r.playerId}
                    className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-base"
                  >
                    {def.icon}
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-gray-400 mb-1">{def.title}</div>
            {isTie && (
              <div className="text-[10px] text-gray-600 mb-0.5">同率</div>
            )}
            <div className="space-y-0.5 mb-1">
              {winners.map((r) => (
                <div
                  key={r.playerId}
                  className="text-sm font-bold text-white truncate max-w-[100px]"
                >
                  {name(r.playerId)}
                </div>
              ))}
            </div>
            <div className={`text-xs font-bold ${def.mainColor}`}>
              {def.mainFmt(maxVal)}
            </div>
            {def.subKey && def.subFmt && (
              <div className="text-[10px] text-gray-600 mt-0.5">
                {def.subFmt(winners[0][def.subKey] as number)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
