"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchSetting, updateSetting } from "@/lib/db";

export function useSettings() {
  const [minMatches, setMinMatches] = useState(3);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSetting("ranking_min_matches").then((val) => {
      if (val !== null) setMinMatches(parseInt(val, 10) || 3);
    });
  }, []);

  const saveMinMatches = useCallback(async (value: number) => {
    const clamped = Math.max(1, value);
    setMinMatches(clamped);
    setSaving(true);
    try {
      await updateSetting("ranking_min_matches", String(clamped));
    } finally {
      setSaving(false);
    }
  }, []);

  return { minMatches, saving, saveMinMatches };
}
