"use client";

import { useEffect, useState } from "react";

const UNLOCK_KEY = "mls_parent_unlocked_at";
const UNLOCK_WINDOW_MS = 5 * 60 * 1000;

export function useParentGate() {
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(UNLOCK_KEY);
    const isRecent = stored ? Date.now() - Number(stored) < UNLOCK_WINDOW_MS : false;
    setUnlocked(isRecent);
    setChecked(true);
  }, []);

  function unlock() {
    sessionStorage.setItem(UNLOCK_KEY, String(Date.now()));
    setUnlocked(true);
  }

  return { unlocked, checked, unlock };
}
