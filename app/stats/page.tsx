"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { calcPlayerRecords } from "@/lib/aggregation";
import { StatCard } from "@/components/ui/StatCard";

function fmt(n: number, d = 2) { return n.toFixed(d); }
function pct(n: number) { return (n * 100).toFixed(1) + "%"; }
function shotRateFmt(n: number) { return n === 0 ? "-" : pct(n); }

export default function StatsPage() {
  const { players, matches, loading } = useApp();
  const [selectedId, setSelectedId] = useState("");

  const records = calcPlayerRecords(matches, players);
  const record = records.find((r) => r.playerId === selectedId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">個人成績</h1>

      <div>
        <label className="block text-sm text-gray-400 mb-1">プレイヤー</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-orange-400 w-full sm:w-auto text-base"
        >
          <option value="">-- 選択してください --</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>{p.name}{!p.active ? " （非表示）" : ""}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-500">読み込み中...</p>}

      {record && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="試合数" value={record.matches} />
            <StatCard label="勝利" value={record.wins} />
            <StatCard label="敗北" value={record.losses} />
            <StatCard label="勝率" value={pct(record.winRate)} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label="ゴール差" value={record.goalDiff > 0 ? `+${record.goalDiff}` : record.goalDiff} />
            <StatCard label="個人得点" value={record.totalScore} />
            <StatCard label="ゴール" value={record.totalGoals} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="アシスト" value={record.totalAssists} />
            <StatCard label="セーブ" value={record.totalSaves} />
            <StatCard label="シュート" value={record.totalShots} />
            <StatCard label="シュート決定率" value={shotRateFmt(record.shotRate)} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <StatCard label="平均得点" value={fmt(record.avgScore)} />
            <StatCard label="平均ゴール" value={fmt(record.avgGoals)} />
            <StatCard label="平均アシスト" value={fmt(record.avgAssists)} />
            <StatCard label="平均セーブ" value={fmt(record.avgSaves)} />
            <StatCard label="平均シュート" value={fmt(record.avgShots)} />
          </div>
        </div>
      )}

      {!record && selectedId && !loading && (
        <p className="text-gray-500">試合データがありません</p>
      )}
    </div>
  );
}
