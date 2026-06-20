"use client";

import { useMemo, useState } from "react";
import type { PlayerRecord, Player, Match } from "@/types";
import { getCurrentPlagueGods, getPlagueGodHistory } from "@/lib/plague";

const PLAGUE_COMMENTS = [
  "勝利を遠ざける者、ここに降臨。",
  "その男が来ると、流れが変わる。悪い方に。",
  "チームメイト募集中。ただし覚悟が必要。",
  "勝率を吸い取る者。",
  "今日は味方か、災厄か。",
  "まだ本気を出していないだけ。たぶん。",
];

const PEACE_COMMENTS = [
  "今は誰も3連敗していません。平和。",
  "連敗ゼロ。奇跡のような均衡。",
  "全員絶好調……ではないかもしれないが、少なくとも疫病神はいない。",
];

type Props = {
  records: PlayerRecord[];
  players: Player[];
  matches: Match[];
  minMatches: number;
};

function fmtDate(d: string) {
  const dt = new Date(d);
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
}

export function EkibyoCard({ records, players, matches, minMatches }: Props) {
  const [showHistory, setShowHistory] = useState(false);

  const plagues = getCurrentPlagueGods(players, matches);
  const history = getPlagueGodHistory(players, matches);

  const plagueComment = useMemo(
    () => PLAGUE_COMMENTS[Math.floor(Math.random() * PLAGUE_COMMENTS.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const peaceComment = useMemo(
    () => PEACE_COMMENTS[Math.floor(Math.random() * PEACE_COMMENTS.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // 疫病神がいない場合の勝率王フォールバック
  const filtered = records.filter((r) => r.matches >= minMatches);
  const maxWinRate = filtered.length > 0 ? Math.max(...filtered.map((r) => r.winRate)) : 0;
  const winKings = filtered.filter((r) => r.winRate === maxWinRate && maxWinRate > 0);
  const name = (id: string) => players.find((p) => p.id === id)?.name ?? "?";
  const pct = (n: number) => (n * 100).toFixed(1) + "%";

  const isPlagueActive = plagues.length > 0;

  return (
    <div
      className={`border-2 rounded-xl p-5 space-y-4 shadow-lg ${
        isPlagueActive
          ? "bg-black border-red-700 shadow-red-900/30"
          : "bg-gray-950 border-gray-700 shadow-gray-900/20"
      }`}
    >
      {/* ヘッダー */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">{isPlagueActive ? "💀" : "🕊️"}</span>
        <h2
          className={`text-xl font-black tracking-wide ${
            isPlagueActive ? "text-red-500" : "text-gray-400"
          }`}
        >
          現在の疫病神
        </h2>
        {isPlagueActive && <span className="text-2xl">💀</span>}
      </div>

      {isPlagueActive ? (
        <>
          <p className="text-red-400 text-sm italic border-l-2 border-red-700 pl-3">
            "{plagueComment}"
          </p>
          <div className="space-y-3">
            {plagues.map(({ player, streak }) => (
              <div
                key={player.id}
                className="bg-red-950/30 border border-red-800/50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-black text-lg">⚠️ {player.name}</span>
                  <span className="text-red-400 font-black text-2xl">{streak}連敗</span>
                </div>
                <p className="text-gray-500 text-xs">👊 次の試合に勝てば脱出できる！</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* 疫病神なし → 勝率王を表示 */
        <div className="space-y-3">
          <p className="text-green-400 text-sm border-l-2 border-green-700 pl-3">
            "{peaceComment}"
          </p>
          {winKings.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <span>✨</span> 代わりに現在の勝率王
              </p>
              {winKings.map((r) => (
                <div
                  key={r.playerId}
                  className="bg-yellow-950/30 border border-yellow-700/40 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-black text-lg">👑 {name(r.playerId)}</span>
                    <span className="text-yellow-400 font-black text-2xl">{pct(r.winRate)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-gray-500 text-xs">試合</div>
                      <div className="text-white font-bold">{r.matches}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">勝</div>
                      <div className="text-blue-400 font-bold">{r.wins}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">負</div>
                      <div className="text-red-400 font-bold">{r.losses}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 疫病神履歴 */}
      <div className="border-t border-gray-800 pt-3">
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors w-full text-left"
        >
          {showHistory
            ? "▲ 疫病神履歴を閉じる"
            : `▼ 疫病神履歴（${history.length}件）`}
        </button>

        {showHistory && (
          <div className="mt-3 space-y-2">
            {history.length === 0 ? (
              <p className="text-gray-600 text-xs">まだ記録なし（3連敗が発生すると記録されます）</p>
            ) : (
              history.map((e, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 text-sm py-1.5 border-b border-gray-800/50 last:border-0 ${
                    e.endDate === null ? "opacity-100" : "opacity-60"
                  }`}
                >
                  <span className="text-red-500 text-base flex-shrink-0">☠️</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-white font-medium">{e.playerName}</span>
                    <span className="text-gray-500 ml-1.5 text-xs">最大{e.peakStreak}連敗</span>
                  </div>
                  <div className="text-xs text-gray-500 flex-shrink-0">
                    {fmtDate(e.startDate)}
                    {e.endDate ? (
                      <span> 〜 {fmtDate(e.endDate)} <span className="text-green-600">脱出</span></span>
                    ) : (
                      <span className="text-red-500"> 継続中</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
