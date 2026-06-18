"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useSettings } from "@/hooks/useSettings";
import { calcPlayerRecords, calcPairRecords } from "@/lib/aggregation";
import { EkibyoCard } from "@/components/ui/EkibyoCard";
import { TitleCards } from "@/components/ui/TitleCards";
import type { PlayerRecord } from "@/types";

function pct(n: number) { return (n * 100).toFixed(1) + "%"; }
function fmt(n: number) { return n.toFixed(2); }
function shotRateFmt(n: number) { return n === 0 ? "-" : pct(n); }

type StatKey = keyof Pick<
  PlayerRecord,
  "totalGoals" | "totalAssists" | "totalSaves" | "totalShots" | "shotRate" |
  "avgScore" | "avgGoals" | "avgAssists" | "avgSaves" | "avgShots"
>;

const STAT_OPTIONS: { key: StatKey; label: string; format: (n: number) => string }[] = [
  { key: "totalGoals", label: "ゴール", format: String },
  { key: "totalAssists", label: "アシスト", format: String },
  { key: "totalSaves", label: "セーブ", format: String },
  { key: "totalShots", label: "シュート", format: String },
  { key: "shotRate", label: "シュート決定率", format: shotRateFmt },
  { key: "avgScore", label: "平均得点", format: fmt },
  { key: "avgGoals", label: "平均ゴール", format: fmt },
  { key: "avgAssists", label: "平均アシスト", format: fmt },
  { key: "avgSaves", label: "平均セーブ", format: fmt },
  { key: "avgShots", label: "平均シュート", format: fmt },
];

function Medal({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="text-gray-400 text-sm">{rank}</span>;
}

export default function RankingsPage() {
  const { players, matches, loading } = useApp();
  const { minMatches, saving: settingSaving, saveMinMatches } = useSettings();
  const [statKey, setStatKey] = useState<StatKey>("totalGoals");

  const allRecords = calcPlayerRecords(matches, players);
  const pairRecords = calcPairRecords(matches);

  const records = allRecords.filter((r) => r.matches >= minMatches);
  const filteredPairs = pairRecords.filter((r) => r.matches >= minMatches);

  const name = (id: string) => players.find((p) => p.id === id)?.name ?? "?";

  const byWinRate = [...records].sort((a, b) => b.winRate - a.winRate || b.matches - a.matches);
  const byPairWinRate = [...filteredPairs].sort((a, b) => b.winRate - a.winRate || b.matches - a.matches);
  const byStat = [...records].sort((a, b) => b[statKey] - a[statKey]);
  const byShotRate = [...records]
    .filter((r) => r.totalShots > 0)
    .sort((a, b) => b.shotRate - a.shotRate);
  const selectedStat = STAT_OPTIONS.find((o) => o.key === statKey)!;

  const empty = <p className="text-gray-500 text-sm py-2">該当なし（最低試合数: {minMatches}）</p>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">ランキング</h1>
        <div className="flex items-center gap-2 text-sm bg-gray-900 rounded-lg px-3 py-2">
          <span className="text-gray-400">最低試合数</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={minMatches}
            onChange={(e) => saveMinMatches(parseInt(e.target.value) || 1)}
            className="w-14 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-center focus:outline-none focus:border-orange-400"
          />
          <span className="text-gray-400">試合以上</span>
          {settingSaving && <span className="text-gray-500 text-xs">保存中...</span>}
        </div>
      </div>

      {loading && <p className="text-gray-500">読み込み中...</p>}

      {/* 疫病神カード */}
      <EkibyoCard
        records={allRecords}
        players={players}
        minMatches={minMatches}
      />

      {/* 称号カード */}
      <TitleCards
        records={allRecords}
        players={players}
        minMatches={minMatches}
      />

      {/* 個人勝率 */}
      <section>
        <h2 className="text-lg font-semibold mb-3">個人勝率ランキング</h2>
        {byWinRate.length === 0 ? empty : (
          <div className="bg-gray-900 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800 text-gray-400 text-sm">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">#</th>
                  <th className="text-left px-4 py-3">プレイヤー</th>
                  <th className="text-right px-4 py-3">試合</th>
                  <th className="text-right px-4 py-3">勝</th>
                  <th className="text-right px-4 py-3">負</th>
                  <th className="text-right px-4 py-3">勝率</th>
                  <th className="text-right px-4 py-3">G差</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {byWinRate.map((r, i) => (
                  <tr key={r.playerId} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-center"><Medal rank={i + 1} /></td>
                    <td className="px-4 py-3 font-medium">{name(r.playerId)}</td>
                    <td className="px-4 py-3 text-right text-gray-400">{r.matches}</td>
                    <td className="px-4 py-3 text-right text-blue-400">{r.wins}</td>
                    <td className="px-4 py-3 text-right text-red-400">{r.losses}</td>
                    <td className="px-4 py-3 text-right font-bold text-orange-400">{pct(r.winRate)}</td>
                    <td className={`px-4 py-3 text-right ${r.goalDiff > 0 ? "text-green-400" : r.goalDiff < 0 ? "text-red-400" : "text-gray-400"}`}>
                      {r.goalDiff > 0 ? `+${r.goalDiff}` : r.goalDiff}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ペア勝率 */}
      <section>
        <h2 className="text-lg font-semibold mb-3">ペア勝率ランキング</h2>
        {byPairWinRate.length === 0 ? empty : (
          <div className="bg-gray-900 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800 text-gray-400 text-sm">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">#</th>
                  <th className="text-left px-4 py-3">ペア</th>
                  <th className="text-right px-4 py-3">試合</th>
                  <th className="text-right px-4 py-3">勝</th>
                  <th className="text-right px-4 py-3">負</th>
                  <th className="text-right px-4 py-3">勝率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {byPairWinRate.map((r, i) => (
                  <tr key={r.pairKey} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-center"><Medal rank={i + 1} /></td>
                    <td className="px-4 py-3 font-medium">{name(r.playerIds[0])} & {name(r.playerIds[1])}</td>
                    <td className="px-4 py-3 text-right text-gray-400">{r.matches}</td>
                    <td className="px-4 py-3 text-right text-blue-400">{r.wins}</td>
                    <td className="px-4 py-3 text-right text-red-400">{r.losses}</td>
                    <td className="px-4 py-3 text-right font-bold text-orange-400">{pct(r.winRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 個人スタッツ */}
      <section>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <h2 className="text-lg font-semibold">個人スタッツランキング</h2>
          <select
            value={statKey}
            onChange={(e) => setStatKey(e.target.value as StatKey)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-orange-400"
          >
            {STAT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </div>
        {byStat.length === 0 ? empty : (
          <div className="bg-gray-900 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800 text-gray-400 text-sm">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">#</th>
                  <th className="text-left px-4 py-3">プレイヤー</th>
                  <th className="text-right px-4 py-3">試合</th>
                  <th className="text-right px-4 py-3">{selectedStat.label}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {byStat.map((r, i) => (
                  <tr key={r.playerId} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-center"><Medal rank={i + 1} /></td>
                    <td className="px-4 py-3 font-medium">{name(r.playerId)}</td>
                    <td className="px-4 py-3 text-right text-gray-400">{r.matches}</td>
                    <td className="px-4 py-3 text-right font-bold text-orange-400">
                      {selectedStat.format(r[statKey])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* シュート決定率ランキング */}
      <section>
        <h2 className="text-lg font-semibold mb-3">シュート決定率ランキング</h2>
        {byShotRate.length === 0 ? empty : (
          <div className="bg-gray-900 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800 text-gray-400 text-sm">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">#</th>
                  <th className="text-left px-4 py-3">プレイヤー</th>
                  <th className="text-right px-4 py-3">試合</th>
                  <th className="text-right px-4 py-3">G</th>
                  <th className="text-right px-4 py-3">Sh</th>
                  <th className="text-right px-4 py-3">決定率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {byShotRate.map((r, i) => (
                  <tr key={r.playerId} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-center"><Medal rank={i + 1} /></td>
                    <td className="px-4 py-3 font-medium">{name(r.playerId)}</td>
                    <td className="px-4 py-3 text-right text-gray-400">{r.matches}</td>
                    <td className="px-4 py-3 text-right text-gray-400">{r.totalGoals}</td>
                    <td className="px-4 py-3 text-right text-gray-400">{r.totalShots}</td>
                    <td className="px-4 py-3 text-right font-bold text-orange-400">{pct(r.shotRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
