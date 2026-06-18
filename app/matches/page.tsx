"use client";

import Link from "next/link";
import { useApp } from "@/contexts/AppContext";

export default function MatchesPage() {
  const { players, matches, loading, deleteMatch } = useApp();

  const name = (id: string) => players.find((p) => p.id === id)?.name ?? "?";

  const sorted = [...matches].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  async function handleDelete(id: string) {
    if (!confirm("この試合記録を削除しますか？\nこの操作は取り消せません。")) return;
    try {
      await deleteMatch(id);
    } catch {
      alert("削除に失敗しました");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">試合一覧</h1>
        <Link
          href="/matches/new"
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-400 rounded-lg font-medium transition-colors"
        >
          + 試合入力
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-8">読み込み中...</p>
      ) : sorted.length === 0 ? (
        <p className="text-gray-500 py-8 text-center">試合記録がありません</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((m) => {
            const winnerStats = m.winners.map(
              (id) => m.stats.find((s) => s.playerId === id)
            );
            const loserStats = m.losers.map(
              (id) => m.stats.find((s) => s.playerId === id)
            );
            return (
              <div key={m.id} className="bg-gray-900 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-sm">{m.date}</span>
                  <div className="flex gap-3">
                    <Link
                      href={`/matches/${m.id}/edit`}
                      className="text-gray-400 hover:text-white text-sm"
                    >
                      編集
                    </Link>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-red-500 hover:text-red-400 text-sm"
                    >
                      削除
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-blue-400">WIN</div>
                    {m.winners.map((id, i) => {
                      const st = winnerStats[i];
                      return (
                        <div key={id} className="text-sm">
                          <span className="font-medium text-white">{name(id)}</span>
                          <div className="text-gray-400 text-xs mt-0.5">
                            得点:{st?.score ?? 0} G:{st?.goals ?? 0} A:{st?.assists ?? 0} Sv:{st?.saves ?? 0} Sh:{st?.shots ?? 0}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-red-400">LOSE</div>
                    {m.losers.map((id, i) => {
                      const st = loserStats[i];
                      return (
                        <div key={id} className="text-sm">
                          <span className="font-medium text-white">{name(id)}</span>
                          <div className="text-gray-400 text-xs mt-0.5">
                            得点:{st?.score ?? 0} G:{st?.goals ?? 0} A:{st?.assists ?? 0} Sv:{st?.saves ?? 0} Sh:{st?.shots ?? 0}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {m.memo && (
                  <p className="mt-2 text-sm text-gray-500 border-t border-gray-800 pt-2">
                    {m.memo}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
