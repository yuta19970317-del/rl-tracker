"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchSetting, upsertSetting } from "@/lib/db";

const SETTING_KEY = "plague_excluded";

export function usePlagueTargets() {
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSetting(SETTING_KEY).then((val) => {
      if (val) {
        try { setExcludedIds(JSON.parse(val)); } catch { /* ignore */ }
      }
      setLoading(false);
    });
  }, []);

  const toggle = useCallback(async (playerId: string) => {
    const next = excludedIds.includes(playerId)
      ? excludedIds.filter((id) => id !== playerId)
      : [...excludedIds, playerId];
    setExcludedIds(next);
    setSaving(true);
    try {
      await upsertSetting(SETTING_KEY, JSON.stringify(next));
    } finally {
      setSaving(false);
    }
  }, [excludedIds]);

  const isTarget = useCallback(
    (playerId: string) => !excludedIds.includes(playerId),
    [excludedIds]
  );

  return { excludedIds, isTarget, toggle, loading, saving };
}
