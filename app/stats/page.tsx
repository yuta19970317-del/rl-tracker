"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { calcPlayerRecords } from "@/lib/aggregation";

function fmt(n: number, d = 2) { return n.toFixed(d); }
function pct(n: number) { return (n * 100).toFixed(1) + "%"; }
function shotRateFmt(n: number) { return n === 0 ? "-" : pct(n); }

function StatCell({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-3 text-center">
      <div className="text-gray-500 text-xs mb-1">{label}</div>
      <div className={`text-lg font-bold ${color ?? "text-white"}`}>{value}</div>
    </div>
  );
}

export default function StatsPage() {
  return (
    <Suspense fallback={<p className="text-gray-500">読み込み中...</p>}>
      <StatsContent />
    </Suspense>
  );
}

function StatsContent() {
  const { players, matches, loading } = useApp();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState(searchParams.get("player") ?? "");

  const records = calcPlayerRecords(matches, players);
  const record = records.find((r) => r.playerId === selectedId);
  const player = players.find((p) => p.id === selectedId);
  const initials = player?.name?.slice(0, 1) ?? "";

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

      {record && player && (
        <div className="bg-gray-900 rounded-xl p-5 space-y-4">
          {/* プロフィール行 */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-green-700 flex items-center justify-center text-green-100 text-xl font-bold flex-shrink-0">
              {player.avatarUrl
                ? <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                : initials}
            </div>
            <div>
              <div className="text-white text-lg font-bold">{player.name}</div>
              <div className="text-gray-400 text-sm">{record.matches}試合 · {record.wins}勝 {record.losses}敗</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-3xl font-bold text-green-400">{pct(record.winRate)}</div>
              <div className="text-gray-500 text-xs">勝率</div>
            </div>
          </div>

          {/* 勝率ゲージ */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>勝率</span><span>{pct(record.winRate)}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${(record.winRate * 100).toFixed(1)}%` }}
              />
            </div>
          </div>

          {/* スタッツグリッド */}
          <div className="grid grid-cols-4 gap-2">
            <StatCell label="平均得点" value={fmt(record.avgScore)} />
            <StatCell label="平均ゴール" value={fmt(record.avgGoals)} color="text-green-400" />
            <StatCell label="平均アシスト" value={fmt(record.avgAssists)} color="text-blue-400" />
            <StatCell label="平均セーブ" value={fmt(record.avgSaves)} />
            <StatCell label="平均シュート" value={fmt(record.avgShots)} />
            <StatCell label="決定率" value={shotRateFmt(record.shotRate)} color="text-green-400" />
            <StatCell label="ゴール差" value={record.goalDiff > 0 ? `+${record.goalDiff}` : record.goalDiff} color={record.goalDiff > 0 ? "text-green-400" : record.goalDiff < 0 ? "text-red-400" : "text-gray-400"} />
            <StatCell label="試合数" value={record.matches} />
          </div>
        </div>
      )}

      {!record && selectedId && !loading && (
        <p className="text-gray-500">試合データがありません</p>
      )}
    </div>
  );
}
