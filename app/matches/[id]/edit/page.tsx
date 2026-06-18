"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { validateMatch } from "@/lib/validation";
import type { PlayerStats } from "@/types";

const STAT_FIELDS: { key: keyof Omit<PlayerStats, "playerId">; label: string }[] = [
  { key: "score", label: "得点" },
  { key: "goals", label: "G" },
  { key: "assists", label: "A" },
  { key: "saves", label: "Sv" },
  { key: "shots", label: "Sh" },
];

type Side = "w1" | "w2" | "l1" | "l2";

function emptyStats(playerId: string): PlayerStats {
  return { playerId, score: 0, goals: 0, assists: 0, saves: 0, shots: 0 };
}

export default function EditMatchPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { matches, activePlayers, players, editMatch } = useApp();

  const match = matches.find((m) => m.id === id);

  const [date, setDate] = useState("");
  const [selected, setSelected] = useState<Record<Side, string>>({ w1: "", w2: "", l1: "", l2: "" });
  const [stats, setStats] = useState<Record<Side, PlayerStats>>({
    w1: emptyStats(""), w2: emptyStats(""), l1: emptyStats(""), l2: emptyStats(""),
  });
  const [memo, setMemo] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!match) return;
    setDate(match.date);
    setMemo(match.memo);

    const w1 = match.winners[0];
    const w2 = match.winners[1];
    const l1 = match.losers[0];
    const l2 = match.losers[1];

    setSelected({ w1, w2, l1, l2 });

    const getStat = (pid: string): PlayerStats =>
      match.stats.find((s) => s.playerId === pid) ?? emptyStats(pid);

    setStats({ w1: getStat(w1), w2: getStat(w2), l1: getStat(l1), l2: getStat(l2) });
  }, [match]);

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
    // 編集時は全プレイヤー（activeでなくても既存選択済みは表示）
    return players.filter((p) => p.active || selected[currentSide] === p.id)
      .filter((p) => !usedIds.includes(p.id));
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
      await editMatch(id, matchData);
      router.push("/matches");
    } catch {
      setErrors(["保存に失敗しました。再度お試しください。"]);
    } finally {
      setSaving(false);
    }
  }

  if (!match) {
    return <p className="text-gray-500 py-8 text-center">試合が見つかりません</p>;
  }

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">試合を編集</h1>

      <div className="bg-gray-900 rounded-xl p-4">
        <label className="block text-sm text-gray-400 mb-1">試合日</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-orange-400 w-full sm:w-auto"
        />
      </div>

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
          />
        ))}
      </div>

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
        />
      </div>

      {errors.length > 0 && (
        <div className="bg-red-900/40 border border-red-700 rounded-xl p-3 space-y-1">
          {errors.map((e, i) => <p key={i} className="text-red-300 text-sm">{e}</p>)}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => router.back()}
          className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-colors"
        >
          キャンセル
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 py-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 rounded-xl font-bold transition-colors"
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </div>
    </div>
  );
}

type PlayerInputRowProps = {
  label: string;
  players: { id: string; name: string }[];
  selectedId: string;
  stats: PlayerStats;
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
