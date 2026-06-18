import type { Match } from "@/types";

export type MatchFormData = Omit<Match, "id" | "createdAt">;

export function validateMatch(data: MatchFormData): string[] {
  const errors: string[] = [];

  if (!data.date) errors.push("試合日を入力してください");

  const allIds = [...data.winners, ...data.losers];
  if (allIds.some((id) => !id)) errors.push("全プレイヤーを選択してください");

  const uniqueIds = new Set(allIds.filter(Boolean));
  if (uniqueIds.size < 4) errors.push("同じプレイヤーを複数選択することはできません");

  return errors;
}
