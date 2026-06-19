"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { calcPlayerRecords } from "@/lib/aggregation";
import type { PlayerRecord } from "@/types";

function fmt(n: number, d = 2) { return n.toFixed(d); }
function pct(n: number) { return (n * 100).toFixed(1) + "%"; }

type Title = { label: string; emoji: string; color: string; bg: string };

function getTitles(record: PlayerRecord, allRecords: PlayerRecord[]): Title[] {
  const titles: Title[] = [];
  if (allRecords.length === 0) return titles;

  const maxGoals = Math.max(...allRecords.map((r) => r.avgGoals));
  const maxWin = Math.max(...allRecords.map((r) => r.winRate));
  const maxSaves = Math.max(...allRecords.map((r) => r.avgSaves));
  const maxShots = Math.max(...allRecords.map((r) => r.avgShots));
  const maxAssists = Math.max(...allRecords.map((r) => r.avgAssists));
  const maxShotRate = Math.max(...allRecords.filter((r) => r.avgShots > 0).map((r) => r.shotRate));

  if (record.avgGoals === maxGoals && record.avgGoals > 0)
    titles.push({ label: "ゴール王", emoji: "⚽", color: "#fbbf24", bg: "#78350f" });
  if (record.winRate === maxWin && record.winRate > 0)
    titles.push({ label: "勝率王", emoji: "👑", color: "#a78bfa", bg: "#3b0764" });
  if (record.avgSaves === maxSaves && record.avgSaves > 0)
    titles.push({ label: "守護神", emoji: "🛡️", color: "#60a5fa", bg: "#1e3a5f" });
  if (record.shotRate === maxShotRate && record.avgShots > 0)
    titles.push({ label: "決定力王", emoji: "⚡", color: "#fb923c", bg: "#431407" });
  if (record.avgAssists === maxAssists && record.avgAssists > 0)
    titles.push({ label: "アシスト王", emoji: "🎯", color: "#34d399", bg: "#064e3b" });
  if (record.avgShots === maxShots && record.avgShots > 0)
    titles.push({ label: "撃ちたがり", emoji: "🔥", color: "#f472b6", bg: "#500724" });

  return titles;
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
  const titles = record ? getTitles(record, records) : [];

  return (
    <div className="space-y-6 max-w-lg mx-auto">
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
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          {/* ヒーローバナー */}
          <div className="bg-gray-950 px-5 py-7 flex flex-col items-center gap-4">
            {/* アバター */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-orange-500 flex items-center justify-center bg-gray-800 text-orange-400 text-4xl font-bold flex-shrink-0">
              {player.avatarUrl
                ? <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                : player.name.slice(0, 1)}
            </div>

            {/* 名前 */}
            <div className="text-white text-xl font-bold">{player.name}</div>

            {/* 称号バッジ */}
            {titles.length > 0 && (
              <div className="flex gap-2 flex-wrap justify-center">
                {titles.map((t) => (
                  <span
                    key={t.label}
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: t.bg, color: t.color }}
                  >
                    {t.emoji} {t.label}
                  </span>
                ))}
              </div>
            )}

            {/* 勝敗サマリー */}
            <div className="flex items-center gap-6 mt-1">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{pct(record.winRate)}</div>
                <div className="text-xs text-gray-500 mt-0.5">勝率</div>
              </div>
              <div className="w-px h-10 bg-gray-700" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{record.matches}</div>
                <div className="text-xs text-gray-500 mt-0.5">試合</div>
              </div>
              <div className="w-px h-10 bg-gray-700" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{record.wins}勝</div>
                <div className="text-xs text-gray-500 mt-0.5">{record.losses}敗</div>
              </div>
            </div>

            {/* 勝率ゲージ */}
            <div className="w-full max-w-xs">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${(record.winRate * 100).toFixed(1)}%` }}
                />
              </div>
            </div>
          </div>

          {/* スタッツグリッド */}
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCell label="平均ゴール" value={fmt(record.avgGoals)} color="text-green-400" />
              <StatCell label="平均アシスト" value={fmt(record.avgAssists)} color="text-blue-400" />
              <StatCell label="平均セーブ" value={fmt(record.avgSaves)} />
              <StatCell label="平均シュート" value={fmt(record.avgShots)} />
              <StatCell label="決定率" value={record.avgShots > 0 ? pct(record.shotRate) : "-"} color="text-orange-400" />
              <StatCell label="平均得点" value={fmt(record.avgScore)} />
              <StatCell
                label="ゴール差"
                value={record.goalDiff > 0 ? `+${record.goalDiff}` : String(record.goalDiff)}
                color={record.goalDiff > 0 ? "text-green-400" : record.goalDiff < 0 ? "text-red-400" : "text-gray-400"}
              />
              <StatCell label="試合数" value={String(record.matches)} />
            </div>
          </div>
        </div>
      )}

      {!record && selectedId && !loading && (
        <p className="text-gray-500">試合データがありません</p>
      )}
    </div>
  );
}

function StatCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 text-center">
      <div className="text-gray-500 text-xs mb-1">{label}</div>
      <div className={`text-xl font-bold ${color ?? "text-white"}`}>{value}</div>
    </div>
  );
}
