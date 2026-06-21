"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchSetting, upsertSetting } from "@/lib/db";

const SETTING_KEY = "plague_excluded";

export function usePlagueTargets() {
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const excludedIdsRef = useRef<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ref を state と同期させる
  excludedIdsRef.current = excludedIds;

  useEffect(() => {
    let cancelled = false;
    fetchSetting(SETTING_KEY).then((val) => {
      if (cancelled) return;
      if (val) {
        try {
          const parsed = JSON.parse(val);
          setExcludedIds(parsed);
          excludedIdsRef.current = parsed;
        } catch { /* ignore */ }
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const toggle = useCallback(async (playerId: string) => {
    // ref から常に最新の値を取得
    const current = excludedIdsRef.current;
    const next = current.includes(playerId)
      ? current.filter((id) => id !== playerId)
      : [...current, playerId];

    // 即座に UI 反映
    setExcludedIds(next);
    excludedIdsRef.current = next;

    setError(null);
    setSaving(true);
    try {
      await upsertSetting(SETTING_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("plague_excluded save failed:", e);
      setError("保存に失敗しました");
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
