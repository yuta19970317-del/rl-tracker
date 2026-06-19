"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/contexts/AppContext";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";

export default function MatchesPage() {
  const { players, matches, loading, deleteMatch } = useApp();
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const name = (id: string) => players.find((p) => p.id === id)?.name ?? "?";
  const player = (id: string) => players.find((p) => p.id === id);

  const sorted = [...matches].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

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
        <div className="space-y-2">
          {sorted.map((m) => {
            const isOpen = openIds.has(m.id);
            const winGoals = m.winners.reduce((s, id) => s + (m.stats.find((st) => st.playerId === id)?.goals ?? 0), 0);
            const loseGoals = m.losers.reduce((s, id) => s + (m.stats.find((st) => st.playerId === id)?.goals ?? 0), 0);

            return (
              <div key={m.id} className="bg-gray-900 rounded-xl overflow-hidden">
                {/* サマリー行 */}
                <button
                  onClick={() => toggle(m.id)}
                  className="w-full px-4 py-3 hover:bg-gray-800/60 transition-colors text-left space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-900 text-green-300 flex-shrink-0">勝</span>
                    <span className="flex items-center gap-1.5 flex-1 flex-wrap">
                      {m.winners.map((id) => {
                        const p = player(id);
                        return (
                          <span key={id} className="flex items-center gap-1">
                            <PlayerAvatar name={name(id)} avatarUrl={p?.avatarUrl} size={20} />
                            <span className="text-sm text-green-400 font-medium">{name(id)}</span>
                          </span>
                        );
                      })}
                    </span>
                    <span className="text-sm font-bold text-white">
                      <span className="text-green-400">{winGoals}</span>
                      <span className="text-gray-500 mx-1">–</span>
                      <span className="text-red-400">{loseGoals}</span>
                    </span>
                    <span className="text-gray-500 text-xs flex-shrink-0">{m.date} {isOpen ? "▾" : "▸"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-950 text-red-400 flex-shrink-0">敗</span>
                    <span className="flex items-center gap-1.5 flex-1 flex-wrap">
                      {m.losers.map((id) => {
                        const p = player(id);
                        return (
                          <span key={id} className="flex items-center gap-1">
                            <PlayerAvatar name={name(id)} avatarUrl={p?.avatarUrl} size={20} />
                            <span className="text-sm text-red-400">{name(id)}</span>
                          </span>
                        );
                      })}
                    </span>
                  </div>
                </button>

                {/* 詳細 */}
                {isOpen && (
                  <div className="border-t border-gray-800 px-4 pb-4 pt-3 space-y-3">
                    {/* 勝チーム */}
                    <div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-900 text-green-300">
                        勝 · {m.winners.map((id) => name(id)).join(" & ")}
                      </span>
                      <div className="mt-2 space-y-2">
                        {m.winners.map((id) => {
                          const st = m.stats.find((s) => s.playerId === id);
                          const p = player(id);
                          return (
                            <div key={id}>
                              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                                <PlayerAvatar name={name(id)} avatarUrl={p?.avatarUrl} size={18} />
                                {name(id)}
                              </div>
                              <div className="grid grid-cols-5 gap-1.5">
                                {[
                                  { label: "得点", value: st?.score ?? 0 },
                                  { label: "ゴール", value: st?.goals ?? 0, green: true },
                                  { label: "アシスト", value: st?.assists ?? 0 },
                                  { label: "セーブ", value: st?.saves ?? 0 },
                                  { label: "シュート", value: st?.shots ?? 0 },
                                ].map(({ label, value, green }) => (
                                  <div key={label} className="bg-gray-800 rounded p-1.5 text-center">
                                    <div className="text-gray-500 text-[9px]">{label}</div>
                                    <div className={`text-xs font-bold ${green ? "text-green-400" : "text-white"}`}>{value}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t border-gray-800" />

                    {/* 敗チーム */}
                    <div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-950 text-red-400">
                        敗 · {m.losers.map((id) => name(id)).join(" & ")}
                      </span>
                      <div className="mt-2 space-y-2">
                        {m.losers.map((id) => {
                          const st = m.stats.find((s) => s.playerId === id);
                          const p = player(id);
                          return (
                            <div key={id}>
                              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                                <PlayerAvatar name={name(id)} avatarUrl={p?.avatarUrl} size={18} />
                                {name(id)}
                              </div>
                              <div className="grid grid-cols-5 gap-1.5">
                                {[
                                  { label: "得点", value: st?.score ?? 0 },
                                  { label: "ゴール", value: st?.goals ?? 0, red: true },
                                  { label: "アシスト", value: st?.assists ?? 0 },
                                  { label: "セーブ", value: st?.saves ?? 0 },
                                  { label: "シュート", value: st?.shots ?? 0 },
                                ].map(({ label, value, red }) => (
                                  <div key={label} className="bg-gray-800 rounded p-1.5 text-center">
                                    <div className="text-gray-500 text-[9px]">{label}</div>
                                    <div className={`text-xs font-bold ${red ? "text-red-400" : "text-white"}`}>{value}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {m.memo && (
                      <p className="text-sm text-gray-500 border-t border-gray-800 pt-2">{m.memo}</p>
                    )}

                    <div className="flex gap-4 justify-end border-t border-gray-800 pt-2">
                      <Link href={`/matches/${m.id}/edit`} className="text-sm text-gray-400 hover:text-white">
                        編集
                      </Link>
                      <button onClick={() => handleDelete(m.id)} className="text-sm text-red-500 hover:text-red-400">
                        削除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
