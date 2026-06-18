"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";

export default function PlayersPage() {
  const { players, activePlayers, loading, addPlayer, deactivatePlayer, renamePlayer, exportData, importData, matches } = useApp();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (players.some((p) => p.name === trimmed && p.active)) {
      setError("同じ名前のプレイヤーが既に存在します");
      return;
    }
    setSaving(true);
    try {
      await addPlayer(trimmed);
      setNewName("");
      setError("");
    } catch {
      setError("追加に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function handleRename(id: string) {
    const trimmed = editingName.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await renamePlayer(id, trimmed);
      setEditingId(null);
    } catch {
      alert("更新に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(id: string, name: string) {
    if (!confirm(`「${name}」を非表示にしますか？\n過去の試合記録は残ります。`)) return;
    await deactivatePlayer(id);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        await importData(data);
        alert("インポートが完了しました");
        window.location.reload();
      } catch {
        alert("インポートに失敗しました。JSONファイルを確認してください。");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const matchCount = (playerId: string) =>
    matches.filter(
      (m) => m.winners.includes(playerId) || m.losers.includes(playerId)
    ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">プレイヤー管理</h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportData(players)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
          >
            エクスポート
          </button>
          <label className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm cursor-pointer transition-colors">
            インポート
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">プレイヤー追加</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="プレイヤー名"
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-400"
          />
          <button
            onClick={handleAdd}
            disabled={saving}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 rounded font-medium transition-colors"
          >
            追加
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-8">読み込み中...</p>
      ) : (
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800 text-gray-400 text-sm">
              <tr>
                <th className="text-left px-4 py-3">名前</th>
                <th className="text-right px-4 py-3">試合数</th>
                <th className="text-right px-4 py-3 hidden sm:table-cell">登録日</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {players.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    プレイヤーがいません
                  </td>
                </tr>
              )}
              {players.map((p) => (
                <tr key={p.id} className={`hover:bg-gray-800/50 ${!p.active ? "opacity-40" : ""}`}>
                  <td className="px-4 py-3">
                    {editingId === p.id ? (
                      <div className="flex gap-2 flex-wrap">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleRename(p.id)}
                          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white focus:outline-none focus:border-orange-400"
                          autoFocus
                        />
                        <button onClick={() => handleRename(p.id)} className="text-orange-400 text-sm">保存</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 text-sm">キャンセル</button>
                      </div>
                    ) : (
                      <span className="font-medium">
                        {p.name}
                        {!p.active && <span className="ml-2 text-xs text-gray-500">（非表示）</span>}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">{matchCount(p.id)}</td>
                  <td className="px-4 py-3 text-right text-gray-500 text-sm hidden sm:table-cell">
                    {p.createdAt.slice(0, 10)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => { setEditingId(p.id); setEditingName(p.name); }}
                        className="text-gray-400 hover:text-white text-sm"
                      >
                        編集
                      </button>
                      {p.active && (
                        <button
                          onClick={() => handleDeactivate(p.id, p.name)}
                          className="text-red-500 hover:text-red-400 text-sm"
                        >
                          非表示
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
