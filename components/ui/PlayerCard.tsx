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

// ─── Background SVG art per title ───────────────────────────────────────────

function BgPlagueGod() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 300 450" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(150,210)" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.13">
        <circle r="130" />
        <circle r="110" strokeWidth="0.5" />
        <circle r="90" />
        <circle r="60" strokeWidth="0.5" />
        <circle r="35" />
        <polygon points="0,-100 86.6,50 -86.6,50" strokeWidth="1.5" />
        <polygon points="0,100 -86.6,-50 86.6,-50" strokeWidth="1.5" />
        <line x1="0" y1="-130" x2="0" y2="130" strokeWidth="0.5" />
        <line x1="-130" y1="0" x2="130" y2="0" strokeWidth="0.5" />
        <line x1="-91.9" y1="-91.9" x2="91.9" y2="91.9" strokeWidth="0.5" />
        <line x1="91.9" y1="-91.9" x2="-91.9" y2="91.9" strokeWidth="0.5" />
        <circle r="5" cx="0" cy="-100" fill="currentColor" />
        <circle r="5" cx="86.6" cy="50" fill="currentColor" />
        <circle r="5" cx="-86.6" cy="50" fill="currentColor" />
        <circle r="5" cx="0" cy="100" fill="currentColor" />
        <circle r="5" cx="-86.6" cy="-50" fill="currentColor" />
        <circle r="5" cx="86.6" cy="-50" fill="currentColor" />
      </g>
      <path d="M0,400 Q75,375 150,390 Q225,405 300,390 L300,450 L0,450 Z" fill="currentColor" opacity="0.07" />
    </svg>
  );
}

function BgGoalKing() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 300 450" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <g fill="currentColor">
        <polygon points="150,70 122,450 178,450" opacity="0.14" />
        <polygon points="150,120 138,450 162,450" opacity="0.08" />
        <polygon points="85,150 58,450 122,450" opacity="0.1" />
        <polygon points="215,150 178,450 242,450" opacity="0.1" />
        <polygon points="35,200 12,450 68,450" opacity="0.07" />
        <polygon points="265,200 232,450 288,450" opacity="0.07" />
        <polygon points="130,220 118,450 148,450" opacity="0.06" />
        <polygon points="170,220 152,450 182,450" opacity="0.06" />
      </g>
    </svg>
  );
}

function BgWinRateKing() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 300 450" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="currentColor">
        <path d="M55,305 L55,225 L98,265 L150,175 L202,265 L245,225 L245,305 Z" strokeWidth="1.5" opacity="0.14" />
        <rect x="55" y="285" width="190" height="24" rx="3" strokeWidth="1" opacity="0.1" />
        <circle cx="105" cy="272" r="9" fill="currentColor" opacity="0.1" />
        <circle cx="150" cy="255" r="11" fill="currentColor" opacity="0.1" />
        <circle cx="195" cy="272" r="9" fill="currentColor" opacity="0.1" />
      </g>
      <g fill="currentColor" opacity="0.12">
        <rect x="36" y="110" width="16" height="16" transform="rotate(45 44 118)" />
        <rect x="248" y="110" width="16" height="16" transform="rotate(45 256 118)" />
        <rect x="144" y="72" width="14" height="14" transform="rotate(45 151 79)" />
        <rect x="80" y="90" width="10" height="10" transform="rotate(45 85 95)" />
        <rect x="212" y="90" width="10" height="10" transform="rotate(45 217 95)" />
        <rect x="22" y="155" width="8" height="8" transform="rotate(45 26 159)" opacity="0.7" />
        <rect x="272" y="155" width="8" height="8" transform="rotate(45 276 159)" opacity="0.7" />
      </g>
    </svg>
  );
}

function BgGuardian() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 300 450" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="currentColor" transform="translate(150,210)">
        <path d="M0,-148 L102,-98 L102,52 L0,148 L-102,52 L-102,-98 Z" strokeWidth="1.5" opacity="0.13" />
        <path d="M0,-110 L76,-72 L76,38 L0,112 L-76,38 L-76,-72 Z" strokeWidth="1" opacity="0.1" />
        <path d="M0,-72 L50,-46 L50,22 L0,74 L-50,22 L-50,-46 Z" strokeWidth="0.8" opacity="0.08" />
        <line x1="0" y1="-148" x2="0" y2="148" strokeWidth="0.8" opacity="0.1" />
        <line x1="-102" y1="0" x2="102" y2="0" strokeWidth="0.8" opacity="0.1" />
        <circle r="22" strokeWidth="1" opacity="0.12" />
        <circle r="8" fill="currentColor" opacity="0.1" />
      </g>
    </svg>
  );
}

function BgPlaymaker() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 300 450" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="currentColor" strokeWidth="1" opacity="0.11">
        <line x1="150" y1="200" x2="150" y2="108" />
        <line x1="150" y1="200" x2="78" y2="138" />
        <line x1="150" y1="200" x2="222" y2="138" />
        <line x1="150" y1="200" x2="82" y2="282" />
        <line x1="150" y1="200" x2="218" y2="282" />
        <line x1="78" y1="138" x2="150" y2="108" strokeWidth="0.7" />
        <line x1="222" y1="138" x2="150" y2="108" strokeWidth="0.7" />
        <line x1="82" y1="282" x2="218" y2="282" strokeWidth="0.7" />
        <path d="M78,138 Q55,200 82,282" strokeWidth="0.8" />
        <path d="M222,138 Q245,200 218,282" strokeWidth="0.8" />
        <path d="M150,108 Q200,140 222,138" strokeWidth="0.7" />
        <path d="M150,108 Q100,140 78,138" strokeWidth="0.7" />
      </g>
      <g fill="currentColor" opacity="0.13">
        <circle cx="150" cy="200" r="11" />
        <circle cx="150" cy="108" r="8" />
        <circle cx="78" cy="138" r="7" />
        <circle cx="222" cy="138" r="7" />
        <circle cx="82" cy="282" r="7" />
        <circle cx="218" cy="282" r="7" />
      </g>
    </svg>
  );
}

function BgFinisher() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 300 450" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="currentColor" transform="translate(150,210)" opacity="0.12">
        <circle r="28" />
        <circle r="54" />
        <circle r="80" />
        <circle r="108" strokeWidth="0.8" />
        <circle r="135" strokeWidth="0.5" />
        <line x1="-135" y1="0" x2="-36" y2="0" strokeWidth="0.8" />
        <line x1="36" y1="0" x2="135" y2="0" strokeWidth="0.8" />
        <line x1="0" y1="-135" x2="0" y2="-36" strokeWidth="0.8" />
        <line x1="0" y1="36" x2="0" y2="135" strokeWidth="0.8" />
        <line x1="-5" y1="-54" x2="5" y2="-54" strokeWidth="2" />
        <line x1="-5" y1="54" x2="5" y2="54" strokeWidth="2" />
        <line x1="-54" y1="-5" x2="-54" y2="5" strokeWidth="2" />
        <line x1="54" y1="-5" x2="54" y2="5" strokeWidth="2" />
        <circle r="6" fill="currentColor" />
      </g>
    </svg>
  );
}

function BgSprayKing() {
  const cx = 150, cy = 210, r = 112;
  const angles = Array.from({ length: 12 }, (_, i) => (i * 30 * Math.PI) / 180);
  const pts = angles.map((a) => ({
    x: cx + r * Math.sin(a),
    y: cy - r * Math.cos(a),
  }));
  return (
    <svg width="100%" height="100%" viewBox="0 0 300 450" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <g stroke="currentColor" fill="none" strokeWidth="1" opacity="0.1">
        {pts.map((p, i) => (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} />
        ))}
      </g>
      <g fill="currentColor" opacity="0.13">
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i % 3 === 0 ? 5 : 3.5} />
        ))}
        <circle cx={cx} cy={cy} r={9} />
        <circle cx={cx} cy={cy} r={4} opacity="0.6" />
      </g>
    </svg>
  );
}

function CardBackground({ titleKey }: { titleKey: TitleKey }) {
  switch (titleKey) {
    case "plague-god":   return <BgPlagueGod />;
    case "goal-king":    return <BgGoalKing />;
    case "win-rate-king": return <BgWinRateKing />;
    case "guardian":     return <BgGuardian />;
    case "playmaker":    return <BgPlaymaker />;
    case "finisher":     return <BgFinisher />;
    case "spray-king":   return <BgSprayKing />;
    default:             return null;
  }
}

// ─── Stat chip ───────────────────────────────────────────────────────────────

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-white/5 bg-black/40 px-2 py-3 text-center backdrop-blur-sm transition-colors duration-300 group-hover:border-[var(--accent-ring)]">
      <span className="text-[var(--accent)]" aria-hidden="true">{icon}</span>
      <span className="font-mono text-sm font-semibold tabular-nums text-white">{value}</span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">{label}</span>
    </div>
  );
}

// ─── Player card ─────────────────────────────────────────────────────────────

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
      {/* Background art */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ color: "var(--accent)" }}
      >
        <CardBackground titleKey={player.titleKey} />
      </div>

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
              <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
            ) : (
              player.name.slice(0, 1)
            )}
          </div>
        </div>

        {/* Name */}
        <h2 className="mt-4 text-xl font-bold tracking-tight text-white">{player.name}</h2>

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
            <div className="font-mono text-2xl font-bold tabular-nums" style={{ color: "var(--accent)" }}>
              {pct(player.winRate)}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">勝率</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/30 px-3 py-2 text-center">
            <div className="font-mono text-2xl font-bold tabular-nums text-white">{player.matches}</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
              {player.wins}勝 {player.losses}敗
            </div>
          </div>
        </div>

        {/* Stat chips */}
        <div className="mt-3 grid w-full grid-cols-5 gap-2">
          <StatChip icon={<Target className="size-4" />} label="G" value={fmt(player.avgGoals)} />
          <StatChip icon={<Swords className="size-4" />} label="A" value={fmt(player.avgAssists)} />
          <StatChip icon={<Shield className="size-4" />} label="Sv" value={fmt(player.avgSaves)} />
          <StatChip icon={<Send className="size-4" />} label="Sh" value={fmt(player.avgShots)} />
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
