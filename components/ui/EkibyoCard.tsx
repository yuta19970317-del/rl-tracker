"use client";

import { useMemo } from "react";
import type { PlayerRecord, Player } from "@/types";

const COMMENTS = [
  "勝利を遠ざける者、ここに降臨。",
  "その男が来ると、流れが変わる。悪い方に。",
  "チームメイト募集中。ただし覚悟が必要。",
  "勝率を吸い取る者。",
  "今日は味方か、災厄か。",
  "まだ本気を出していないだけ。たぶん。",
];

function calcEscapeWins(
  record: PlayerRecord,
  escapeTarget: number | null
): number | null {
  if (escapeTarget === null) return null;
  if (escapeTarget >= 1.0) return null; // ∞
  const needed = (escapeTarget * record.matches - record.wins) / (1 - escapeTarget);
  const x = Math.ceil(needed);
  return x <= 0 ? 0 : x;
}

type Props = {
  records: PlayerRecord[];
  players: Player[];
  minMatches: number;
};

export function EkibyoCard({ records, players, minMatches }: Props) {
  const filtered = records.filter((r) => r.matches >= minMatches);

  // コメントは初回レンダリングで固定
  const comment = useMemo(
    () => COMMENTS[Math.floor(Math.random() * COMMENTS.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (filtered.length === 0) return null;

  const minWinRate = Math.min(...filtered.map((r) => r.winRate));
  const ekibyo = filtered.filter((r) => r.winRate === minWinRate);

  // 脱出計算：単独最下位のときだけ
  let escapeWins: number | null = null;
  if (ekibyo.length === 1) {
    const sorted = [...filtered].sort((a, b) => a.winRate - b.winRate);
    const escapeTarget = sorted[1]?.winRate ?? null;
    escapeWins = calcEscapeWins(ekibyo[0], escapeTarget);
  }

  const name = (id: string) => players.find((p) => p.id === id)?.name ?? "?";
  const pct = (n: number) => (n * 100).toFixed(1) + "%";

  return (
    <div className="bg-black border-2 border-red-700 rounded-xl p-5 space-y-4 shadow-lg shadow-red-900/30">
      {/* ヘッダー */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">💀</span>
        <h2 className="text-xl font-black text-red-500 tracking-wide">現在の疫病神</h2>
        <span className="text-2xl">💀</span>
        <span className="ml-auto text-xs text-gray-600 border border-gray-700 rounded px-2 py-0.5">
          {minMatches}試合以上
        </span>
      </div>

      {/* 煽りコメント */}
      <p className="text-red-400 text-sm italic border-l-2 border-red-700 pl-3">
        "{comment}"
      </p>

      {/* プレイヤーカード */}
      <div className="space-y-3">
        {ekibyo.map((r) => (
          <div
            key={r.playerId}
            className="bg-red-950/30 border border-red-800/50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-black text-lg">
                ⚠️ {name(r.playerId)}
              </span>
              <span className="text-red-400 font-black text-2xl">
                {pct(r.winRate)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-gray-500 text-xs">試合数</div>
                <div className="text-white font-bold">{r.matches}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">勝利</div>
                <div className="text-blue-400 font-bold">{r.wins}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">敗北</div>
                <div className="text-red-400 font-bold">{r.losses}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 脱出カウンター */}
      {ekibyo.length === 1 && (
        <div className="text-center border-t border-red-900 pt-3">
          {escapeWins === null ? (
            <p className="text-gray-600 text-sm">脱出条件：計算不能 ♾️</p>
          ) : escapeWins === 0 ? (
            <p className="text-yellow-500 text-sm font-bold">🎉 同率脱出まであと一歩！</p>
          ) : (
            <p className="text-gray-400 text-sm">
              脱出まであと{" "}
              <span className="text-red-400 font-black text-lg">{escapeWins}勝</span>
              {" "}必要
            </p>
          )}
        </div>
      )}

      {ekibyo.length > 1 && (
        <p className="text-center text-gray-600 text-xs border-t border-red-900 pt-3">
          同率 {ekibyo.length}人が疫病神を分かち合っています
        </p>
      )}
    </div>
  );
}
