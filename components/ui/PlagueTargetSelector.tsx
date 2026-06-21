"use client";

import { useState } from "react";
import type { Player, PlayerRecord } from "@/types";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";

type Props = {
  players: Player[];
  records: PlayerRecord[];
  isTarget: (id: string) => boolean;
  onToggle: (id: string) => void;
  saving: boolean;
  error: string | null;
};

export function PlagueTargetSelector({ players, records, isTarget, onToggle, saving, error }: Props) {
  const [open, setOpen] = useState(false);
  const active = players.filter((p) => p.active);
  const allChecked = active.every((p) => isTarget(p.id));
  const excludedCount = active.filter((p) => !isTarget(p.id)).length;

  function toggleAll() {
    if (allChecked) {
      active.forEach((p) => { if (isTarget(p.id)) onToggle(p.id); });
    } else {
      active.forEach((p) => { if (!isTarget(p.id)) onToggle(p.id); });
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      {/* ヘッダー（クリックで開閉） */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/60 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
          <span>☠️</span>
          <span>疫病神 対象者</span>
          {excludedCount > 0 && (
            <span className="text-xs font-normal text-gray-500">（{excludedCount}人除外中）</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {saving && <span className="text-xs text-gray-500">保存中...</span>}
          <span className="text-gray-500 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* 展開コンテンツ */}
      {open && (
        <div className="border-t border-gray-700 px-4 pb-3 pt-2 space-y-1">
          {error && (
            <p className="text-red-400 text-xs py-1">{error}</p>
          )}

          <div className="flex justify-end pb-1">
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              全員{allChecked ? "解除" : "選択"}
            </button>
          </div>

          {active.map((p) => {
            const rec = records.find((r) => r.playerId === p.id);
            const targeted = isTarget(p.id);
            return (
              <label
                key={p.id}
                className={`flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-opacity hover:bg-gray-800/60 ${
                  targeted ? "opacity-100" : "opacity-40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={targeted}
                  onChange={() => onToggle(p.id)}
                  className="w-4 h-4 accent-red-600 flex-shrink-0"
                />
                <PlayerAvatar name={p.name} avatarUrl={p.avatarUrl} size={28} />
                <span className="flex-1 text-sm text-white">{p.name}</span>
                {rec && (
                  <span className="text-xs text-gray-600">{rec.matches}試合</span>
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
