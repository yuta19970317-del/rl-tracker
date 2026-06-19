"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { validateMatch } from "@/lib/validation";
import { ScoreboardImport } from "@/components/ui/ScoreboardImport";
import type { PlayerStats } from "@/types";
import type { OcrPlayerResult } from "@/lib/ocr";

const STAT_FIELDS: { key: keyof Omit<PlayerStats, "playerId">; label: string }[] = [
  { key: "score", label: "得点" },
  { key: "goals", label: "G" },
  { key: "assists", label: "A" },
  { key: "saves", label: "Sv" },
  { key: "shots", label: "Sh" },
];

type Side = "w1" | "w2" | "l1" | "l2";

const SIDES: { key: Side; team: "winner" | "loser" }[] = [
  { key: "w1", team: "winner" },
  { key: "w2", team: "winner" },
  { key: "l1", team: "loser" },
  { key: "l2", team: "loser" },
];

function emptyStats(playerId: string): PlayerStats {
  return { playerId, score: 0, goals: 0, assists: 0, saves: 0, shots: 0 };
}

export default function NewMatchPage() {
  const router = useRouter();
  const { activePlayers, addMatch } = useApp();

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [selected, setSelected] = useState<Record<Side, string>>({ w1: "", w2: "", l1: "", l2: "" });
  const [stats, setStats] = useState<Record<Side, PlayerStats>>({
    w1: emptyStats(""), w2: emptyStats(""), l1: emptyStats(""), l2: emptyStats(""),
  });
  const [memo, setMemo] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showImport, setShowImport] = useState(false);

  function handleSelectPlayer(side: Side, playerId: string) {
    setSelected((prev) => ({ ...prev, [side]: playerId }));
    setStats((prev) => ({ ...prev, [side]: { ...prev[side], playerId } }));
  }

  function handleStat(side: Side, key: keyof Omit<PlayerStats, "playerId">, value: string) {
    const num = parseInt(value, 10);
    setStats((prev) => ({ ...prev, [side]: { ...prev[side], [key]: isNaN(num) ? 0 : num } }));
  }

  function getAvailablePlayers(currentSide: Side) {
    const usedIds = Object.entries(selected)
      .filter(([k, v]) => k !== currentSide && v)
      .map(([, v]) => v);
    return activePlayers.filter((p) => !usedIds.includes(p.id));
  }

  // OCR結果をフォームに反映
  function handleOcrApply(results: OcrPlayerResult[]) {
    const winners = results.filter((r) => r.team === "winner");
    const losers = results.filter((r) => r.team === "loser");
    // チーム判定できない場合は前半2人をWIN、後半2人をLOSEとして扱う
    const all = results.length === 4 && winners.length === 0 && losers.length === 0
      ? results
      : null;

    const get = (team: "winner" | "loser", idx: number): OcrPlayerResult | undefined => {
      if (all) return team === "winner" ? all[idx] : all[2 + idx];
      return team === "winner" ? winners[idx] : losers[idx];
    };

    const newSelected = { ...selected };
    const newStats = { ...stats };

    SIDES.forEach(({ key, team }, i) => {
      const idx = team === "winner" ? (key === "w1" ? 0 : 1) : (key === "l1" ? 0 : 1);
      const r = get(team, idx);
      if (!r) return;

      const playerId = r.matchedPlayerId ?? "";
      newSelected[key] = playerId;
      newStats[key] = {
        playerId,
        score: r.score,
        goals: r.goals,
        assists: r.assists,
        saves: r.saves,
        shots: r.shots,
      };
    });

    setSelected(newSelected);
    setStats(newStats);
  }

  async function handleSubmit() {
    const matchData = {
      date,
      winners: [selected.w1, selected.w2] as [string, string],
      losers: [selected.l1, selected.l2] as [string, string],
      stats: [stats.w1, stats.w2, stats.l1, stats.l2],
      memo,
    };

    const errs = validateMatch(matchData);
    if (errs.length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      await addMatch(matchData);
      router.push("/matches");
    } catch {
      setErrors(["保存に失敗しました。再度お試しください。"]);
    } finally {
      setSaving(false);
    }
  }

  const playerName = (side: Side) =>
    activePlayers.find((p) => p.id === selected[side])?.name ?? "";

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      {showImport && (
        <ScoreboardImport
          players={activePlayers}
          onClose={() => setShowImport(false)}
          onApply={handleOcrApply}
        />
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">試合入力</h1>
        <button
          onClick={() => setShowImport(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-sm font-medium transition-colors"
        >
          <span>📸</span> スクショから入力
        </button>
      </div>

      <div className="bg-gray-900 rounded-xl p-4">
        <label className="block text-sm text-gray-400 mb-1">試合日</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-orange-400 w-full sm:w-auto"
        />
      </div>

      {/* 勝者チーム */}
      <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-4 space-y-4">
        <div className="text-sm font-bold text-blue-400 uppercase tracking-wide">WIN チーム</div>
        {(["w1", "w2"] as Side[]).map((side) => (
          <PlayerInputRow
            key={side}
            label={side === "w1" ? "プレイヤー 1" : "プレイヤー 2"}
            players={getAvailablePlayers(side)}
            selectedId={selected[side]}
            stats={stats[side]}
            onSelectPlayer={(id) => handleSelectPlayer(side, id)}
            onChangeStat={(key, val) => handleStat(side, key, val)}
            playerName={playerName(side)}
          />
        ))}
      </div>

      {/* 敗者チーム */}
      <div className="bg-red-950/40 border border-red-800/40 rounded-xl p-4 space-y-4">
        <div className="text-sm font-bold text-red-400 uppercase tracking-wide">LOSE チーム</div>
        {(["l1", "l2"] as Side[]).map((side) => (
          <PlayerInputRow
            key={side}
            label={side === "l1" ? "プレイヤー 1" : "プレイヤー 2"}
            players={getAvailablePlayers(side)}
            selectedId={selected[side]}
            stats={stats[side]}
            onSelectPlayer={(id) => handleSelectPlayer(side, id)}
            onChangeStat={(key, val) => handleStat(side, key, val)}
            playerName={playerName(side)}
          />
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl p-4">
        <label className="block text-sm text-gray-400 mb-1">メモ（任意）</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={2}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-400 resize-none"
          placeholder="メモ"
        />
      </div>

      {errors.length > 0 && (
        <div className="bg-red-900/40 border border-red-700 rounded-xl p-3 space-y-1">
          {errors.map((e, i) => <p key={i} className="text-red-300 text-sm">{e}</p>)}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full py-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 rounded-xl font-bold text-lg transition-colors"
      >
        {saving ? "保存中..." : "試合を記録する"}
      </button>
    </div>
  );
}

type PlayerInputRowProps = {
  label: string;
  players: { id: string; name: string }[];
  selectedId: string;
  stats: PlayerStats;
  playerName: string;
  onSelectPlayer: (id: string) => void;
  onChangeStat: (key: keyof Omit<PlayerStats, "playerId">, val: string) => void;
};

function PlayerInputRow({ label, players, selectedId, stats, onSelectPlayer, onChangeStat }: PlayerInputRowProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-400">{label}</div>
      <select
        value={selectedId}
        onChange={(e) => onSelectPlayer(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-orange-400 text-base"
      >
        <option value="">-- 選択 --</option>
        {players.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <div className="grid grid-cols-5 gap-1.5">
        {STAT_FIELDS.map(({ key, label }) => (
          <div key={key} className="text-center">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={stats[key]}
              onChange={(e) => onChangeStat(key, e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-1 py-2.5 text-white text-center text-base focus:outline-none focus:border-orange-400"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
