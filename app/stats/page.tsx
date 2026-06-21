"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { calcPlayerRecords, calcPairRecords } from "@/lib/aggregation";
import { PlayerCard } from "@/components/ui/PlayerCard";
import type { TitleKey, PlayerCardData } from "@/components/ui/PlayerCard";
import { BadgeSection } from "@/components/ui/BadgeSection";
import { getPlayerBadges } from "@/lib/badges";
import { usePlagueTargets } from "@/hooks/usePlagueTargets";
import type { PlayerRecord } from "@/types";

function getTitleKey(record: PlayerRecord, allRecords: PlayerRecord[], plagueTargetIds: string[]): TitleKey {
  if (allRecords.length === 0) return "default";

  // ランキングと同じ定義: 対象者の中で勝率最下位
  const active = allRecords.filter((r) => r.matches >= 10 && plagueTargetIds.includes(r.playerId));
  const minWin = active.length > 0 ? Math.min(...active.map((r) => r.winRate)) : Infinity;
  if (record.winRate === minWin && active.length > 1 && record.matches >= 10 && plagueTargetIds.includes(record.playerId)) return "plague-god";

  const maxGoals = Math.max(...allRecords.map((r) => r.avgGoals));
  const maxWin = Math.max(...allRecords.map((r) => r.winRate));
  const maxSaves = Math.max(...allRecords.map((r) => r.avgSaves));
  const maxAssists = Math.max(...allRecords.map((r) => r.avgAssists));
  const maxShotRate = Math.max(...allRecords.filter((r) => r.avgShots > 0).map((r) => r.shotRate));
  const maxShots = Math.max(...allRecords.map((r) => r.avgShots));

  if (record.avgGoals === maxGoals && record.avgGoals > 0) return "goal-king";
  if (record.winRate === maxWin && record.winRate > 0) return "win-rate-king";
  if (record.avgSaves === maxSaves && record.avgSaves > 0) return "guardian";
  if (record.avgAssists === maxAssists && record.avgAssists > 0) return "playmaker";
  if (record.shotRate === maxShotRate && record.avgShots > 0) return "finisher";
  if (record.avgShots === maxShots && record.avgShots > 0) return "spray-king";
  return "default";
}

function getTitleLabel(titleKey: TitleKey): string {
  const map: Record<TitleKey, string> = {
    "plague-god": "💀 疫病神",
    "win-rate-king": "👑 勝率王",
    "goal-king": "⚽ ゴール王",
    guardian: "🛡️ 守護神",
    playmaker: "🎯 アシスト王",
    finisher: "⚡ 決定力王",
    "spray-king": "🔥 撃ちたがり",
    default: "",
  };
  return map[titleKey];
}

function getPlaystyle(titleKey: TitleKey): string {
  const map: Record<TitleKey, string> = {
    "plague-god": "疫病型",
    "win-rate-king": "支配型",
    "goal-king": "ストライカー",
    guardian: "守護神",
    playmaker: "プレイメーカー",
    finisher: "決定力型",
    "spray-king": "乱射型",
    default: "バランス型",
  };
  return map[titleKey];
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
  const { excludedIds } = usePlagueTargets();

  const records = calcPlayerRecords(matches, players);
  const pairRecords = calcPairRecords(matches);
  const record = records.find((r) => r.playerId === selectedId);
  const player = players.find((p) => p.id === selectedId);
  const badges = selectedId
    ? getPlayerBadges(selectedId, records, matches, players, pairRecords)
    : [];

  const plagueTargetIds = players.map((p) => p.id).filter((id) => !excludedIds.includes(id));

  let cardData: PlayerCardData | null = null;
  if (record && player) {
    const titleKey = getTitleKey(record, records, plagueTargetIds);
    cardData = {
      name: player.name,
      titleLabel: getTitleLabel(titleKey),
      titleKey,
      avatarUrl: player.avatarUrl,
      winRate: record.winRate,
      matches: record.matches,
      wins: record.wins,
      losses: record.losses,
      avgGoals: record.avgGoals,
      avgAssists: record.avgAssists,
      avgSaves: record.avgSaves,
      avgShots: record.avgShots,
      shotPct: record.shotRate * 100,
      playstyle: getPlaystyle(titleKey),
    };
  }

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

      {cardData && <PlayerCard player={cardData} />}

      {badges.length > 0 && (
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          <BadgeSection earned={badges} />
        </div>
      )}

      {record && (
        <div className="grid grid-cols-2 gap-3">
          <StatCell
            label="平均得点"
            value={record.avgScore.toFixed(2)}
          />
          <StatCell
            label="ゴール差"
            value={record.goalDiff > 0 ? `+${record.goalDiff}` : String(record.goalDiff)}
            color={record.goalDiff > 0 ? "text-green-400" : record.goalDiff < 0 ? "text-red-400" : "text-gray-400"}
          />
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
