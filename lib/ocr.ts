"use client";

import { createWorker } from "tesseract.js";
import type { Player } from "@/types";

export type OcrPlayerResult = {
  name: string;
  matchedPlayerId: string | null;
  score: number;
  goals: number;
  assists: number;
  saves: number;
  shots: number;
  team: "winner" | "loser" | null;
};

export type OcrResult = {
  players: OcrPlayerResult[];
  rawText: string;
};

// 画像を前処理: グレースケール→コントラスト強調→2値化→2倍拡大
async function preprocessImage(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      const ctx = canvas.getContext("2d")!;

      // 拡大して描画
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // グレースケール化
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        // コントラスト強調: 閾値120以上を白、未満を黒に2値化
        const val = gray > 120 ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = val;
        data[i + 3] = 255;
      }

      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error("toBlob failed")), "image/png");
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function recognizeScoreboard(
  image: File | Blob,
  players: Player[],
  onProgress?: (pct: number) => void
): Promise<OcrResult> {
  onProgress?.(5);

  // 前処理
  const processed = await preprocessImage(image);
  onProgress?.(20);

  // 数字専用ワーカー（スタッツ列用）
  const numWorker = await createWorker("eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(20 + Math.round(m.progress * 60));
      }
    },
  });
  await numWorker.setParameters({
    tessedit_char_whitelist: "0123456789 ",
    tessedit_pageseg_mode: "6" as never,
  });

  const { data: { text: numText } } = await numWorker.recognize(processed);
  await numWorker.terminate();
  onProgress?.(85);

  // テキスト専用ワーカー（チーム・プレイヤー名判定用）
  const txtWorker = await createWorker("jpn+eng", 1, {});
  const { data: { text: fullText } } = await txtWorker.recognize(image);
  await txtWorker.terminate();
  onProgress?.(100);

  const parsed = parseScoreboard(numText, fullText, players);
  return { players: parsed, rawText: fullText };
}

function parseScoreboard(numText: string, fullText: string, players: Player[]): OcrPlayerResult[] {
  // numTextから数字行を抽出（5個以上の数字グループがある行）
  const numLines = numText.split("\n")
    .map((l) => l.trim())
    .filter((l) => {
      const nums = l.match(/\d+/g);
      return nums && nums.length >= 5;
    });

  // チーム判定: numTextの単独数字行（チームスコア）を探して比較
  // 例: "6" (ブルーの得点) vs "4" (オレンジの得点)
  const singleNums = numText.split("\n")
    .map((l) => l.trim())
    .filter((l) => /^\d{1,2}$/.test(l))
    .map(Number);

  let winnerIsFirst = true; // デフォルト: 最初のチーム(ブルー)=WIN
  if (singleNums.length >= 2) {
    // 最初の単独数字がブルーのスコア、次がオレンジのスコア
    winnerIsFirst = singleNums[0] >= singleNums[1];
  } else {
    // フォールバック: fullTextの「勝者」位置で判定
    const lowerFull = fullText.toLowerCase();
    const bluePos = lowerFull.search(/blue|ブルー/);
    const orangePos = lowerFull.search(/orange|オレンジ/);
    const winnerPos = fullText.search(/勝者/);
    if (winnerPos !== -1 && bluePos !== -1 && orangePos !== -1) {
      winnerIsFirst = Math.abs(winnerPos - bluePos) < Math.abs(winnerPos - orangePos);
    }
  }

  // fullTextからプレイヤー名候補を抽出（登録プレイヤー名でマッチング）
  const results: OcrPlayerResult[] = [];

  numLines.slice(0, 4).forEach((line, i) => {
    const nums = (line.match(/\d+/g) ?? []).map(Number);
    // 先頭から: 得点, ゴール, アシスト, セーブ, シュート (, PING)
    const [score = 0, goals = 0, assists = 0, saves = 0, shots = 0] = nums;

    // チーム判定
    let team: "winner" | "loser" | null = null;
    if (numLines.length >= 4) {
      team = (i < 2) === winnerIsFirst ? "winner" : "loser";
    }

    // プレイヤー名をfullTextの対応行から探す
    const fullLines = fullText.split("\n").map((l) => l.trim()).filter(Boolean);
    const matched = findPlayerInLines(fullLines, players, results.map((r) => r.matchedPlayerId));

    results.push({
      name: matched?.name ?? `プレイヤー ${i + 1}`,
      matchedPlayerId: matched?.id ?? null,
      score,
      goals,
      assists,
      saves,
      shots,
      team,
    });
  });

  return results;
}

function findPlayerInLines(
  lines: string[],
  players: Player[],
  usedIds: (string | null)[]
): Player | null {
  for (const line of lines) {
    const lower = line.toLowerCase();
    for (const p of players) {
      if (usedIds.includes(p.id)) continue;
      const nameLower = p.name.toLowerCase();
      // 完全一致 or 部分一致（3文字以上のパーツ）
      if (lower.includes(nameLower)) return p;
      const parts = nameLower.split(/[\s_\-]+/);
      if (parts.some((part) => part.length >= 3 && lower.includes(part))) return p;
    }
  }
  return null;
}
