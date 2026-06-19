"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { recognizeScoreboard, type OcrPlayerResult, type OcrResult } from "@/lib/ocr";
import type { Player } from "@/types";

type Props = {
  players: Player[];
  onClose: () => void;
  onApply: (results: OcrPlayerResult[]) => void;
};

export function ScoreboardImport({ players, onClose, onApply }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [ocr, setOcr] = useState<OcrResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Ctrl+V / paste でクリップボードから画像取得
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
        setError(null);
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
    setError(null);
    e.target.value = "";
  }

  async function handleRecognize() {
    if (!imageBlob) return;
    setRunning(true);
    setProgress(0);
    setError(null);
    try {
      const result = await recognizeScoreboard(imageBlob, players, setProgress);
      setOcr(result);
    } catch (err) {
      setError("OCR処理に失敗しました: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setRunning(false);
    }
  }

  function handleApply() {
    if (!ocr) return;
    onApply(ocr.players);
    onClose();
  }

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
          <div
            className={`relative rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[140px] ${
              image ? "border-orange-500/60 bg-black" : "border-gray-600 hover:border-gray-400 bg-gray-800/40"
            }`}
            onClick={() => !image && fileRef.current?.click()}
          >
            {image ? (
              <img src={image} alt="pasted" className="max-w-full max-h-56 rounded-lg object-contain" />
            ) : (
              <div className="text-center py-6 select-none">
                <p className="text-3xl mb-2">⌨️</p>
                <p className="text-white font-semibold">Ctrl + V で貼り付け</p>
                <p className="text-gray-500 text-xs mt-1">または下のボタンからファイル選択</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
            >
              ファイルを選択
            </button>
            {image && (
              <button
                onClick={() => { setImage(null); setImageBlob(null); setOcr(null); }}
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
              {running ? `解析中... ${progress}%` : "🔍 スタッツを読み取る"}
            </button>
            {running && (
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        )}

        {/* Step 3: 結果確認 */}
        {ocr && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Step 3 — 結果確認</p>

            {ocr.players.length === 0 ? (
              <p className="text-yellow-400 text-sm">プレイヤーのスタッツを検出できませんでした。別の画像を試してください。</p>
            ) : (
              <div className="space-y-2">
                {ocr.players.map((p, i) => (
                  <div
                    key={i}
                    className={`rounded-lg p-3 border text-sm ${
                      p.team === "winner"
                        ? "bg-blue-950/40 border-blue-700/40"
                        : p.team === "loser"
                        ? "bg-red-950/40 border-red-700/40"
                        : "bg-gray-800 border-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`font-bold text-sm ${p.matchedPlayerId ? "text-white" : "text-yellow-400"}`}>
                        {p.name}
                        {!p.matchedPlayerId && <span className="text-xs ml-1 font-normal text-yellow-600">（未マッチ）</span>}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                        p.team === "winner" ? "bg-blue-700 text-white" :
                        p.team === "loser" ? "bg-red-700 text-white" : "bg-gray-700 text-gray-300"
                      }`}>
                        {p.team === "winner" ? "WIN" : p.team === "loser" ? "LOSE" : "?"}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-center">
                      {(["score", "goals", "assists", "saves", "shots"] as const).map((k) => (
                        <div key={k}>
                          <div className="text-gray-500 text-[10px]">{k === "score" ? "得点" : k === "goals" ? "G" : k === "assists" ? "A" : k === "saves" ? "Sv" : "Sh"}</div>
                          <div className="text-white font-mono">{p[k]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* RAW テキスト表示 */}
            <button
              onClick={() => setShowRaw((v) => !v)}
              className="text-xs text-gray-600 hover:text-gray-400"
            >
              {showRaw ? "▲ 生テキストを隠す" : "▼ OCR生テキストを確認"}
            </button>
            {showRaw && (
              <pre className="bg-gray-950 text-gray-400 text-[10px] rounded-lg p-3 overflow-x-auto max-h-40 whitespace-pre-wrap break-words">
                {ocr.rawText || "(空)"}
              </pre>
            )}

            {ocr.players.length > 0 && (
              <button
                onClick={handleApply}
                className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors"
              >
                ✅ この内容をフォームに反映する
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
