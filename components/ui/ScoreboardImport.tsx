"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { recognizeScoreboard, type OcrPlayerResult, type OcrResult } from "@/lib/ocr";
import type { Player } from "@/types";

type Props = {
  players: Player[];
  onClose: () => void;
  onApply: (results: OcrPlayerResult[]) => void;
};

type EditableRow = OcrPlayerResult & { _idx: number };
type CropRect = { x: number; y: number; w: number; h: number };

export function ScoreboardImport({ players, onClose, onApply }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [ocr, setOcr] = useState<OcrResult | null>(null);
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── クロップ選択 ──────────────────────────────────────────────
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const imgWrapRef = useRef<HTMLDivElement>(null);

  function getRatio(clientX: number, clientY: number): { x: number; y: number } {
    const el = imgWrapRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (clientY - r.top) / r.height)),
    };
  }

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    const pos = getRatio(e.clientX, e.clientY);
    setDragStart(pos);
    setIsDragging(true);
    setCropRect(null);
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging || !dragStart) return;
    const pos = getRatio(e.clientX, e.clientY);
    setCropRect({
      x: Math.min(dragStart.x, pos.x),
      y: Math.min(dragStart.y, pos.y),
      w: Math.abs(pos.x - dragStart.x),
      h: Math.abs(pos.y - dragStart.y),
    });
  }

  function onMouseUp() {
    setIsDragging(false);
    setDragStart(null);
  }

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    const pos = getRatio(t.clientX, t.clientY);
    setDragStart(pos);
    setIsDragging(true);
    setCropRect(null);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!isDragging || !dragStart) return;
    const t = e.touches[0];
    const pos = getRatio(t.clientX, t.clientY);
    setCropRect({
      x: Math.min(dragStart.x, pos.x),
      y: Math.min(dragStart.y, pos.y),
      w: Math.abs(pos.x - dragStart.x),
      h: Math.abs(pos.y - dragStart.y),
    });
  }

  // ── 画像トリミング ────────────────────────────────────────────
  async function getCroppedBlob(): Promise<Blob> {
    if (!imageBlob || !cropRect || cropRect.w < 0.02 || cropRect.h < 0.02) return imageBlob!;
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(imageBlob);
      img.onload = () => {
        const sx = Math.round(cropRect.x * img.naturalWidth);
        const sy = Math.round(cropRect.y * img.naturalHeight);
        const sw = Math.round(cropRect.w * img.naturalWidth);
        const sh = Math.round(cropRect.h * img.naturalHeight);
        const canvas = document.createElement("canvas");
        canvas.width = sw;
        canvas.height = sh;
        canvas.getContext("2d")!.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        URL.revokeObjectURL(url);
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  // ── クリップボード貼り付け ────────────────────────────────────
  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (!blob) continue;
        setImageBlob(blob);
        setImage(URL.createObjectURL(blob));
        setOcr(null);
        setRows([]);
        setError(null);
        setCropRect(null);
        break;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageBlob(file);
    setImage(URL.createObjectURL(file));
    setOcr(null);
    setRows([]);
    setError(null);
    setCropRect(null);
    e.target.value = "";
  }

  // ── OCR実行 ───────────────────────────────────────────────────
  async function handleRecognize() {
    if (!imageBlob) return;
    setRunning(true);
    setProgress(0);
    setError(null);
    try {
      const blob = await getCroppedBlob();
      const result = await recognizeScoreboard(blob, players, setProgress);
      setOcr(result);
      setRows(result.players.map((p, i) => ({ ...p, _idx: i })));
    } catch (err) {
      setError("OCR処理に失敗しました: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setRunning(false);
    }
  }

  function updateRow(idx: number, patch: Partial<OcrPlayerResult>) {
    setRows((prev) =>
      prev.map((r) => {
        if (r._idx !== idx) return r;
        const updated = { ...r, ...patch };
        if (patch.matchedPlayerId !== undefined) {
          const p = players.find((pl) => pl.id === patch.matchedPlayerId);
          updated.name = p?.name ?? updated.name;
        }
        return updated;
      })
    );
  }

  function addRow() {
    const newIdx = rows.length > 0 ? Math.max(...rows.map((r) => r._idx)) + 1 : 0;
    setRows((prev) => [
      ...prev,
      { _idx: newIdx, name: "", matchedPlayerId: null, score: 0, goals: 0, assists: 0, saves: 0, shots: 0, team: null },
    ]);
  }

  function removeRow(idx: number) {
    setRows((prev) => prev.filter((r) => r._idx !== idx));
  }

  function handleApply() {
    onApply(rows);
    onClose();
  }

  const hasCrop = cropRect && cropRect.w > 0.02 && cropRect.h > 0.02;
  const statKeys = ["score", "goals", "assists", "saves", "shots"] as const;
  const statLabels = { score: "得点", goals: "G", assists: "A", saves: "Sv", shots: "Sh" };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 overflow-y-auto py-8 px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md space-y-4 p-5">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-white text-base">📸 スコアボードから自動入力</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>

        {/* Step 1: 画像貼り付け */}
        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Step 1 — スクショを貼り付け</p>

          {!image ? (
            <div
              className="relative rounded-xl border-2 border-dashed border-gray-600 hover:border-gray-400 bg-gray-800/40 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[120px]"
              onClick={() => fileRef.current?.click()}
            >
              <div className="text-center py-5 select-none">
                <p className="text-3xl mb-2">⌨️</p>
                <p className="text-white font-semibold">Ctrl + V で貼り付け</p>
                <p className="text-gray-500 text-xs mt-1">または下のボタンからファイル選択</p>
              </div>
            </div>
          ) : (
            /* 画像 + クロップ選択UI */
            <div className="space-y-1.5">
              <p className="text-xs text-orange-400 font-medium">
                {hasCrop ? "✅ 範囲選択済み — 再選択するにはドラッグ" : "📐 スコアボード部分をドラッグで範囲選択（省略可）"}
              </p>
              <div
                ref={imgWrapRef}
                className="relative rounded-xl overflow-hidden border border-gray-700 select-none"
                style={{ cursor: "crosshair", touchAction: "none" }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onMouseUp}
              >
                <img
                  src={image}
                  alt="pasted"
                  className="w-full h-auto block max-h-56 object-contain"
                  draggable={false}
                />

                {/* 選択外を暗くするオーバーレイ */}
                {hasCrop && cropRect && (
                  <>
                    {/* 上 */}
                    <div className="absolute inset-x-0 top-0 bg-black/50 pointer-events-none" style={{ height: `${cropRect.y * 100}%` }} />
                    {/* 下 */}
                    <div className="absolute inset-x-0 bottom-0 bg-black/50 pointer-events-none" style={{ height: `${(1 - cropRect.y - cropRect.h) * 100}%` }} />
                    {/* 左 */}
                    <div className="absolute bg-black/50 pointer-events-none" style={{ top: `${cropRect.y * 100}%`, height: `${cropRect.h * 100}%`, left: 0, width: `${cropRect.x * 100}%` }} />
                    {/* 右 */}
                    <div className="absolute bg-black/50 pointer-events-none" style={{ top: `${cropRect.y * 100}%`, height: `${cropRect.h * 100}%`, right: 0, width: `${(1 - cropRect.x - cropRect.w) * 100}%` }} />
                    {/* 選択枠 */}
                    <div
                      className="absolute border-2 border-orange-400 pointer-events-none"
                      style={{
                        left: `${cropRect.x * 100}%`,
                        top: `${cropRect.y * 100}%`,
                        width: `${cropRect.w * 100}%`,
                        height: `${cropRect.h * 100}%`,
                      }}
                    />
                  </>
                )}

                {/* ドラッグ中の仮枠 */}
                {isDragging && cropRect && !hasCrop && (
                  <div
                    className="absolute border border-dashed border-orange-300 pointer-events-none"
                    style={{
                      left: `${cropRect.x * 100}%`,
                      top: `${cropRect.y * 100}%`,
                      width: `${cropRect.w * 100}%`,
                      height: `${cropRect.h * 100}%`,
                    }}
                  />
                )}
              </div>

              {hasCrop && (
                <button
                  type="button"
                  onClick={() => setCropRect(null)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  × 範囲選択をリセット（全体を使用）
                </button>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => fileRef.current?.click()} className="flex-1 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors">
              ファイルを選択
            </button>
            {image && (
              <button
                onClick={() => { setImage(null); setImageBlob(null); setOcr(null); setRows([]); setCropRect(null); }}
                className="py-2 px-3 text-sm bg-gray-800 hover:bg-red-900/50 rounded-lg border border-gray-700 text-gray-400 hover:text-red-400 transition-colors"
              >
                クリア
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        {/* Step 2: OCR実行 */}
        {image && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Step 2 — 解析</p>
            <button
              onClick={handleRecognize}
              disabled={running}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 rounded-lg font-bold transition-colors"
            >
              {running
                ? `解析中... ${progress}%`
                : hasCrop
                ? "🔍 選択範囲を読み取る"
                : "🔍 スタッツを読み取る（全体）"}
            </button>
            {running && (
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        )}

        {/* Step 3: 編集可能な結果 */}
        {(rows.length > 0 || (ocr && ocr.players.length === 0)) && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Step 3 — 確認・編集</p>

            {rows.length === 0 ? (
              <p className="text-yellow-400 text-sm">検出できませんでした。手動で追加してください。</p>
            ) : (
              <div className="space-y-3">
                {rows.map((r) => (
                  <div
                    key={r._idx}
                    className={`rounded-xl p-3 border space-y-2 ${
                      r.team === "winner" ? "bg-blue-950/40 border-blue-700/40" :
                      r.team === "loser" ? "bg-red-950/40 border-red-700/40" :
                      "bg-gray-800 border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateRow(r._idx, { team: r.team === "winner" ? "loser" : r.team === "loser" ? null : "winner" })}
                        className={`text-xs font-bold px-2 py-1 rounded shrink-0 ${
                          r.team === "winner" ? "bg-blue-700 text-white" :
                          r.team === "loser" ? "bg-red-700 text-white" :
                          "bg-gray-700 text-gray-400"
                        }`}
                      >
                        {r.team === "winner" ? "WIN" : r.team === "loser" ? "LOSE" : "?"}
                      </button>

                      <select
                        value={r.matchedPlayerId ?? ""}
                        onChange={(e) => updateRow(r._idx, { matchedPlayerId: e.target.value || null })}
                        className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-orange-400 min-w-0"
                      >
                        <option value="">-- 選択 --</option>
                        {players.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>

                      <button onClick={() => removeRow(r._idx)} className="text-gray-600 hover:text-red-400 text-lg leading-none shrink-0">×</button>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                      {statKeys.map((k) => (
                        <div key={k} className="text-center">
                          <div className="text-[10px] text-gray-500 mb-1">{statLabels[k]}</div>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            value={r[k]}
                            onChange={(e) => updateRow(r._idx, { [k]: parseInt(e.target.value, 10) || 0 })}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-1 py-1.5 text-white text-center text-sm focus:outline-none focus:border-orange-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={addRow} className="w-full py-2 text-sm text-gray-400 hover:text-white border border-dashed border-gray-700 hover:border-gray-500 rounded-lg transition-colors">
              + プレイヤーを追加
            </button>

            {ocr && (
              <>
                <button onClick={() => setShowRaw((v) => !v)} className="text-xs text-gray-600 hover:text-gray-400">
                  {showRaw ? "▲ 生テキストを隠す" : "▼ OCR生テキストを確認"}
                </button>
                {showRaw && (
                  <pre className="bg-gray-950 text-gray-400 text-[10px] rounded-lg p-3 overflow-x-auto max-h-40 whitespace-pre-wrap break-words">
                    {ocr.rawText || "(空)"}
                  </pre>
                )}
              </>
            )}

            <button onClick={handleApply} className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors">
              ✅ この内容をフォームに反映する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
