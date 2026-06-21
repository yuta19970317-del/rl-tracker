"use client";

import type { Player, PlayerRecord } from "@/types";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";

type Props = {
  players: Player[];
  records: PlayerRecord[];
  isTarget: (id: string) => boolean;
  onToggle: (id: string) => void;
  saving: boolean;
};

export function PlagueTargetSelector({ players, records, isTarget, onToggle, saving }: Props) {
  const active = players.filter((p) => p.active);
  const allChecked = active.every((p) => isTarget(p.id));

  function toggleAll() {
    if (allChecked) {
      active.forEach((p) => { if (isTarget(p.id)) onToggle(p.id); });
    } else {
      active.forEach((p) => { if (!isTarget(p.id)) onToggle(p.id); });
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">疫病神 対象者</h3>
        <div className="flex items-center gap-3">
          {saving && <span className="text-xs text-gray-500">保存中...</span>}
          <button
            type="button"
            onClick={toggleAll}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            全員{allChecked ? "解除" : "選択"}
          </button>
        </div>
      </div>

      <div className="space-y-0.5">
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
    </div>
  );
}
