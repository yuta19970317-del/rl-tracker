"use client";

import { useApp } from "@/contexts/AppContext";
import { calcPairRecords } from "@/lib/aggregation";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";

function pct(n: number) { return (n * 100).toFixed(1) + "%"; }
function shotRateFmt(n: number) { return n === 0 ? "-" : pct(n); }

export default function PairsPage() {
  const { players, matches, loading } = useApp();

  const records = calcPairRecords(matches);
  const sorted = [...records].sort((a, b) => b.winRate - a.winRate);

  const name = (id: string) => players.find((p) => p.id === id)?.name ?? "?";
  const player = (id: string) => players.find((p) => p.id === id);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">ペア成績</h1>

      {loading ? (
        <p className="text-gray-500 text-center py-8">読み込み中...</p>
      ) : sorted.length === 0 ? (
        <p className="text-gray-500 py-8 text-center">データがありません</p>
      ) : (
        <div className="bg-gray-900 rounded-xl overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-gray-800 text-gray-400 text-sm">
              <tr>
                <th className="text-left px-4 py-3">ペア</th>
                <th className="text-right px-4 py-3">試合</th>
                <th className="text-right px-4 py-3">勝</th>
                <th className="text-right px-4 py-3">負</th>
                <th className="text-right px-4 py-3">勝率</th>
                <th className="text-right px-4 py-3">G差</th>
                <th className="text-right px-4 py-3">得点</th>
                <th className="text-right px-4 py-3">G</th>
                <th className="text-right px-4 py-3">失点G</th>
                <th className="text-right px-4 py-3">Sh</th>
                <th className="text-right px-4 py-3">決定率</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sorted.map((r) => (
                <tr key={r.pairKey} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <PlayerAvatar name={name(r.playerIds[0])} avatarUrl={player(r.playerIds[0])?.avatarUrl} size={22} />
                        {name(r.playerIds[0])}
                      </span>
                      <span className="text-gray-500">&</span>
                      <span className="flex items-center gap-1.5">
                        <PlayerAvatar name={name(r.playerIds[1])} avatarUrl={player(r.playerIds[1])?.avatarUrl} size={22} />
                        {name(r.playerIds[1])}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">{r.matches}</td>
                  <td className="px-4 py-3 text-right text-blue-400">{r.wins}</td>
                  <td className="px-4 py-3 text-right text-red-400">{r.losses}</td>
                  <td className="px-4 py-3 text-right font-medium">{pct(r.winRate)}</td>
                  <td className={`px-4 py-3 text-right ${r.goalDiff > 0 ? "text-green-400" : r.goalDiff < 0 ? "text-red-400" : "text-gray-400"}`}>
                    {r.goalDiff > 0 ? `+${r.goalDiff}` : r.goalDiff}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">{r.teamScore}</td>
                  <td className="px-4 py-3 text-right text-gray-400">{r.teamGoals}</td>
                  <td className="px-4 py-3 text-right text-gray-400">{r.teamConceded}</td>
                  <td className="px-4 py-3 text-right text-gray-400">{r.teamShots}</td>
                  <td className="px-4 py-3 text-right text-gray-400">{shotRateFmt(r.teamShotRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
