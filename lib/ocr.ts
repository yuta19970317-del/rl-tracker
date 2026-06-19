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

export async function recognizeScoreboard(
  image: File | Blob,
  players: Player[],
  onProgress?: (pct: number) => void
): Promise<OcrResult> {
  const worker = await createWorker("eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  const { data: { text } } = await worker.recognize(image);
  await worker.terminate();

  const parsed = parseScoreboard(text, players);
  return { players: parsed, rawText: text };
}

function parseScoreboard(text: string, players: Player[]): OcrPlayerResult[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const results: OcrPlayerResult[] = [];

  let currentTeam: "winner" | "loser" | null = null;

  for (const line of lines) {
    const lower = line.toLowerCase();

    // チーム判定
    if (lower.includes("blue") || lower.includes("ブルー") || lower.includes("勝者") || lower.includes("winner")) {
      currentTeam = "winner";
      continue;
    }
    if (lower.includes("orange") || lower.includes("オレンジ") || lower.includes("敗者") || lower.includes("loser")) {
      currentTeam = "loser";
      continue;
    }

    // 数字を5個以上含む行をスタッツ行とみなす
    const nums = line.match(/\d+/g);
    if (!nums || nums.length < 4) continue;

    // プレイヤー名マッチング（既知のプレイヤー名が含まれるか）
    const matched = players.find((p) =>
      line.toLowerCase().includes(p.name.toLowerCase()) ||
      p.name.toLowerCase().split(/\s+/).some((part) => part.length > 2 && line.toLowerCase().includes(part.toLowerCase()))
    );

    // 数値は末尾から得点・ゴール・アシスト・セーブ・シュート・PINGの順で並ぶことが多い
    // PINGを除いた最初の5つを使う（PINGは通常最後）
    const statNums = nums.slice(0, 5).map(Number);
    const [score, goals, assists, saves, shots] = statNums;

    // 名前部分（数字を除いた先頭部分）
    const nameCandidate = line.replace(/\d+/g, "").replace(/[|[\]()]/g, "").trim();

    results.push({
      name: matched?.name ?? nameCandidate,
      matchedPlayerId: matched?.id ?? null,
      score: score ?? 0,
      goals: goals ?? 0,
      assists: assists ?? 0,
      saves: saves ?? 0,
      shots: shots ?? 0,
      team: currentTeam,
    });

    // 4人見つかったら終了
    if (results.length >= 4) break;
  }

  return results;
}
