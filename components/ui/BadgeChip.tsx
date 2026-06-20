"use client";

import type { EarnedBadge, BadgeCategory } from "@/lib/badges";

const CHIP_STYLE: Record<BadgeCategory, string> = {
  attack:  "bg-orange-950 text-orange-300 border-orange-800",
  support: "bg-green-950 text-green-300 border-green-800",
  defense: "bg-blue-950 text-blue-300 border-blue-800",
  streak:  "bg-amber-950 text-amber-300 border-amber-800",
  pair:    "bg-purple-950 text-purple-300 border-purple-800",
  plague:  "bg-red-950 text-red-300 border-red-800",
};

type Props = {
  badge: EarnedBadge;
  selected?: boolean;
  onClick?: () => void;
};

export function BadgeChip({ badge, selected, onClick }: Props) {
  const cls = CHIP_STYLE[badge.category];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${cls} ${
        selected ? "ring-1 ring-white/30 brightness-125" : "hover:brightness-110"
      }`}
    >
      <span aria-hidden="true">{badge.emoji}</span>
      <span>{badge.label}</span>
    </button>
  );
}
