"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchSetting, upsertSetting } from "@/lib/db";

const SETTING_KEY = "plague_excluded";

export function usePlagueTargets() {
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSetting(SETTING_KEY).then((val) => {
      if (cancelled) return;
      if (val) {
        try { setExcludedIds(JSON.parse(val)); } catch { /* ignore */ }
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const toggle = useCallback(async (playerId: string) => {
    // 関数型更新で最新の state を使う
    let next: string[] = [];
    setExcludedIds((prev) => {
      next = prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId];
      return next;
    });

    setError(null);
    setSaving(true);
    try {
      await upsertSetting(SETTING_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("plague_excluded save failed:", e);
      setError("保存に失敗しました");
      // ロールバックしない（UIはそのまま、次回リロードで DB 値に戻る）
    } finally {
      setSaving(false);
    }
  }, []);

  const isTarget = useCallback(
    (playerId: string) => !excludedIds.includes(playerId),
    [excludedIds]
  );

  return { excludedIds, isTarget, toggle, loading, saving, error };
}
