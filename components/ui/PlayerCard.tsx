"use client";

import type { CSSProperties } from "react";
import { Crosshair, Send, Shield, Swords, Target } from "lucide-react";

export type TitleKey =
  | "plague-god"
  | "win-rate-king"
  | "goal-king"
  | "guardian"
  | "playmaker"
  | "finisher"
  | "spray-king"
  | "default";

export type PlayerCardData = {
  name: string;
  titleLabel: string;
  titleKey: TitleKey;
  avatarUrl?: string;
  winRate: number;
  matches: number;
  wins: number;
  losses: number;
  avgGoals: number;
  avgAssists: number;
  avgSaves: number;
  avgShots: number;
  shotPct: number;
  playstyle: string;
};

type Theme = {
  accent: string;
  accentSoft: string;
  glow: string;
  ring: string;
};

const THEMES: Record<TitleKey, Theme> = {
  "plague-god": {
    accent: "oklch(0.62 0.24 25)",
    accentSoft: "oklch(0.72 0.16 25)",
    glow: "oklch(0.55 0.24 25 / 0.55)",
    ring: "oklch(0.62 0.24 25 / 0.4)",
  },
  "win-rate-king": {
    accent: "oklch(0.82 0.16 85)",
    accentSoft: "oklch(0.88 0.12 90)",
    glow: "oklch(0.78 0.15 85 / 0.5)",
    ring: "oklch(0.82 0.16 85 / 0.4)",
  },
  "goal-king": {
    accent: "oklch(0.72 0.2 55)",
    accentSoft: "oklch(0.8 0.16 60)",
    glow: "oklch(0.68 0.2 50 / 0.55)",
    ring: "oklch(0.72 0.2 55 / 0.4)",
  },
  guardian: {
    accent: "oklch(0.68 0.16 245)",
    accentSoft: "oklch(0.76 0.13 240)",
    glow: "oklch(0.6 0.18 250 / 0.55)",
    ring: "oklch(0.68 0.16 245 / 0.4)",
  },
  playmaker: {
    accent: "oklch(0.74 0.18 150)",
    accentSoft: "oklch(0.8 0.15 150)",
    glow: "oklch(0.66 0.18 150 / 0.5)",
    ring: "oklch(0.74 0.18 150 / 0.4)",
  },
  finisher: {
    accent: "oklch(0.66 0.2 300)",
    accentSoft: "oklch(0.74 0.17 300)",
    glow: "oklch(0.6 0.22 300 / 0.55)",
    ring: "oklch(0.66 0.2 300 / 0.4)",
  },
  "spray-king": {
    accent: "oklch(0.7 0.22 330)",
    accentSoft: "oklch(0.78 0.18 330)",
    glow: "oklch(0.64 0.22 330 / 0.5)",
    ring: "oklch(0.7 0.22 330 / 0.4)",
  },
  default: {
    accent: "oklch(0.65 0.04 250)",
    accentSoft: "oklch(0.72 0.03 250)",
    glow: "oklch(0.55 0.04 250 / 0.3)",
    ring: "oklch(0.65 0.04 250 / 0.3)",
  },
};

function StatChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-white/5 bg-black/40 px-2 py-3 text-center backdrop-blur-sm transition-colors duration-300 group-hover:border-[var(--accent-ring)]">
      <span className="text-[var(--accent)]" aria-hidden="true">
        {icon}
      </span>
      <span className="font-mono text-sm font-semibold tabular-nums text-white">
        {value}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
        {label}
      </span>
    </div>
  );
}

export function PlayerCard({ player }: { player: PlayerCardData }) {
  const theme = THEMES[player.titleKey];

  const cardStyle = {
    "--accent": theme.accent,
    "--accent-soft": theme.accentSoft,
    "--accent-glow": theme.glow,
    "--accent-ring": theme.ring,
  } as CSSProperties;

  const fmt = (n: number) => n.toFixed(2);
  const pct = (n: number) => (n * 100).toFixed(1) + "%";

  return (
    <article
      style={cardStyle}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/60 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--accent-ring)] hover:shadow-[0_0_45px_-8px_var(--accent-glow)]"
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full opacity-40 blur-3xl transition-opacity duration-300 group-hover:opacity-70"
        style={{ background: "var(--accent-glow)" }}
      />

      <div className="relative flex flex-col items-center">
        {/* Playstyle tag */}
        <div className="self-end mb-2">
          <span
            className="text-[10px] font-semibold px-2 py-1 rounded border"
            style={{
              background: "color-mix(in oklch, var(--accent) 15%, transparent)",
              color: "var(--accent-soft)",
              borderColor: "var(--accent-ring)",
            }}
          >
            {player.playstyle}
          </span>
        </div>

        {/* Avatar with glow ring */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full opacity-70 blur-md transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: "var(--accent-glow)" }}
          />
          <div
            className="relative size-28 rounded-full border-2 overflow-hidden flex items-center justify-center bg-gray-900 text-gray-300 text-4xl font-bold transition-transform duration-300 group-hover:scale-105"
            style={{ borderColor: "var(--accent)" }}
          >
            {player.avatarUrl ? (
              <img
                src={player.avatarUrl}
                alt={player.name}
                className="w-full h-full object-cover"
              />
            ) : (
              player.name.slice(0, 1)
            )}
          </div>
        </div>

        {/* Name */}
        <h2 className="mt-4 text-xl font-bold tracking-tight text-white">
          {player.name}
        </h2>

        {/* Title badge */}
        {player.titleLabel && (
          <span
            className="mt-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wider"
            style={{
              color: "var(--accent-soft)",
              borderColor: "var(--accent-ring)",
              background: "color-mix(in oklch, var(--accent) 12%, transparent)",
            }}
          >
            {player.titleLabel}
          </span>
        )}

        {/* Win rate + matches */}
        <div className="mt-5 grid w-full grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/5 bg-black/30 px-3 py-2 text-center">
            <div
              className="font-mono text-2xl font-bold tabular-nums"
              style={{ color: "var(--accent)" }}
            >
              {pct(player.winRate)}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
              勝率
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/30 px-3 py-2 text-center">
            <div className="font-mono text-2xl font-bold tabular-nums text-white">
              {player.matches}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
              {player.wins}勝 {player.losses}敗
            </div>
          </div>
        </div>

        {/* Stat chips */}
        <div className="mt-3 grid w-full grid-cols-5 gap-2">
          <StatChip
            icon={<Target className="size-4" />}
            label="G"
            value={fmt(player.avgGoals)}
          />
          <StatChip
            icon={<Swords className="size-4" />}
            label="A"
            value={fmt(player.avgAssists)}
          />
          <StatChip
            icon={<Shield className="size-4" />}
            label="Sv"
            value={fmt(player.avgSaves)}
          />
          <StatChip
            icon={<Send className="size-4" />}
            label="Sh"
            value={fmt(player.avgShots)}
          />
          <StatChip
            icon={<Crosshair className="size-4" />}
            label="決定率"
            value={player.avgShots > 0 ? `${player.shotPct.toFixed(1)}%` : "-"}
          />
        </div>
      </div>
    </article>
  );
}
