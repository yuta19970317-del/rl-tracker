"use client";

import { useState } from "react";
import { BadgeChip } from "./BadgeChip";
import { BADGE_DEFS, CATEGORY_LABEL } from "@/lib/badges";
import type { EarnedBadge, BadgeCategory } from "@/lib/badges";

const MAX_PREVIEW = 5;

const DETAIL_COLOR: Record<BadgeCategory, string> = {
  attack:  "text-orange-400",
  support: "text-green-400",
  defense: "text-blue-400",
  streak:  "text-amber-400",
  pair:    "text-purple-400",
  plague:  "text-red-400",
};

type Props = {
  earned: EarnedBadge[];
};

export function BadgeSection({ earned }: Props) {
  const [selected, setSelected] = useState<EarnedBadge | null>(null);
  const [expanded, setExpanded] = useState(false);

  if (earned.length === 0) return null;

  const preview = earned.slice(0, MAX_PREVIEW);
  const overflow = Math.max(0, earned.length - MAX_PREVIEW);
  const earnedIds = new Set(earned.map((b) => b.id));

  const categories = Object.keys(CATEGORY_LABEL) as BadgeCategory[];

  function toggle(badge: EarnedBadge) {
    setSelected((s) => (s?.id === badge.id ? null : badge));
  }

  return (
    <div className="space-y-3">
      {/* プレビュー行 */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-500 flex-shrink-0">バッジ</span>
        {preview.map((b) => (
          <BadgeChip
            key={b.id}
            badge={b}
            selected={selected?.id === b.id}
            onClick={() => toggle(b)}
          />
        ))}
        {overflow > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-xs text-gray-500 bg-gray-800 border border-gray-700 px-2 py-1 rounded-full hover:border-gray-500 transition-colors"
          >
            +{overflow}
          </button>
        )}
      </div>

      {/* 選択バッジの説明 */}
      {selected && (
        <div className="bg-gray-900/80 rounded-xl p-3 border border-gray-800 text-left">
          <div className="font-semibold text-white text-sm mb-0.5">
            {selected.emoji} {selected.label}
          </div>
          <div className="text-gray-400 text-xs leading-relaxed">{selected.description}</div>
          {selected.detail && (
            <div className={`mt-1.5 text-xs font-medium ${DETAIL_COLOR[selected.category]}`}>
              {selected.detail}
            </div>
          )}
        </div>
      )}

      {/* 全バッジ展開ボタン */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
      >
        {expanded
          ? "▲ 閉じる"
          : `▼ 全バッジ（${earned.length} / ${BADGE_DEFS.length} 取得）`}
      </button>

      {/* 全バッジ詳細パネル */}
      {expanded && (
        <div className="space-y-5 pt-1">
          {categories.map((cat) => {
            const catBadges = BADGE_DEFS.filter((b) => b.category === cat);
            if (catBadges.length === 0) return null;
            return (
              <div key={cat}>
                <div className="text-xs font-semibold text-gray-500 mb-2">
                  {CATEGORY_LABEL[cat]}
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {catBadges.map((b) => {
                    const e = earned.find((eb) => eb.id === b.id);
                    return (
                      <div
                        key={b.id}
                        className={`flex items-start gap-3 bg-gray-900 rounded-xl p-3 border transition-opacity ${
                          e ? "border-gray-700" : "border-gray-800 opacity-35"
                        }`}
                      >
                        <span className="text-xl flex-shrink-0 mt-0.5">{b.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-sm font-medium ${e ? "text-white" : "text-gray-500"}`}
                          >
                            {b.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                            {b.description}
                          </div>
                          {e?.detail && (
                            <div className={`text-xs font-medium mt-1 ${DETAIL_COLOR[b.category]}`}>
                              {e.detail}
                            </div>
                          )}
                        </div>
                        {e && (
                          <span className="text-green-500 text-xs flex-shrink-0 mt-0.5 font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
