"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { AvatarCropModal } from "@/components/ui/AvatarCropModal";

export default function PlayersPage() {
  const { players, loading, addPlayer, deactivatePlayer, deletePlayer, confirmDeletePlayer, renamePlayer, updateAvatar, deleteAvatar, exportData, importData, matches } = useApp();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<{ playerId: string; src: string } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    id: string;
    name: string;
    matchCount: number;
  } | null>(null);

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
    if (!confirm(`「${name}」を非表示にしますか？\n過去の試合記録は集計に残ります。`)) return;
    await deactivatePlayer(id);
  }

  async function handleDeleteClick(id: string, name: string) {
    const { matchCount } = await deletePlayer(id);
    setDeleteDialog({ id, name, matchCount });
  }

  function handleAvatarChange(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = URL.createObjectURL(file);
    setCropTarget({ playerId: id, src });
    e.target.value = "";
  }

  async function handleCropSave(blob: Blob) {
    if (!cropTarget) return;
    setAvatarUploading(cropTarget.playerId);
    setCropTarget(null);
    try {
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      await updateAvatar(cropTarget.playerId, file);
    } catch {
      alert("画像のアップロードに失敗しました");
    } finally {
      setAvatarUploading(null);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteDialog) return;
    setSaving(true);
    try {
      await confirmDeletePlayer(deleteDialog.id);
      setDeleteDialog(null);
    } catch {
      alert("削除に失敗しました");
    } finally {
      setSaving(false);
    }
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
      {/* アバタートリミングモーダル */}
      {cropTarget && (
        <AvatarCropModal
          imageSrc={cropTarget.src}
          onCancel={() => setCropTarget(null)}
          onSave={handleCropSave}
        />
      )}

      {/* 削除確認ダイアログ */}
      {deleteDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full space-y-4">
            <h2 className="text-lg font-bold text-red-400">プレイヤーを削除</h2>
            <p className="text-white">
              「<span className="font-bold">{deleteDialog.name}</span>」を完全に削除しますか？
            </p>
            {deleteDialog.matchCount > 0 ? (
              <div className="bg-red-950/50 border border-red-700 rounded-lg p-3 text-sm text-red-300 space-y-1">
                <p className="font-bold">⚠️ 警告</p>
                <p>このプレイヤーは <span className="font-bold">{deleteDialog.matchCount}試合</span> に出場しています。</p>
                <p>削除すると関連する試合データも全て消えます。この操作は取り消せません。</p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">このプレイヤーの試合記録はありません。この操作は取り消せません。</p>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteDialog(null)}
                className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={saving}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-lg font-bold transition-colors"
              >
                {saving ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                    <div className="flex items-center gap-3">
                      {/* アバター */}
                      <label className="relative cursor-pointer flex-shrink-0 group">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-orange-400 transition-colors">
                          {p.avatarUrl ? (
                            <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400 text-sm font-bold">
                              {p.name.slice(0, 1)}
                            </div>
                          )}
                        </div>
                        {avatarUploading === p.id && (
                          <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                            <span className="text-[9px] text-white">...</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleAvatarChange(p.id, e)}
                        />
                      </label>
                      {/* 名前 */}
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
                        <div>
                          <span className="font-medium">
                            {p.name}
                            {!p.active && <span className="ml-2 text-xs text-gray-500">（非表示）</span>}
                          </span>
                          {p.avatarUrl && (
                            <button
                              onClick={() => deleteAvatar(p.id)}
                              className="ml-2 text-[10px] text-gray-600 hover:text-red-400"
                            >
                              画像削除
                            </button>
                          )}
                        </div>
                      )}
                    </div>
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
                          className="text-yellow-500 hover:text-yellow-400 text-sm"
                        >
                          非表示
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(p.id, p.name)}
                        className="text-red-500 hover:text-red-400 text-sm"
                      >
                        削除
                      </button>
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
