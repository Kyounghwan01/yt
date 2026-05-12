"use client";

import { useState, useEffect, useCallback } from "react";
import type { SearchResult } from "../api/search/route";

const STORAGE_KEY = "yt-music-saved";

export function useSavedTracks() {
  const [saved, setSaved] = useState<SearchResult[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (tracks: SearchResult[]) => {
    setSaved(tracks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
  };

  const saveTrack = useCallback((track: SearchResult) => {
    setSaved((prev) => {
      if (prev.some((t) => t.id === track.id)) return prev;
      const next = [track, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeTrack = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.filter((t) => t.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isSaved = useCallback(
    (id: string) => saved.some((t) => t.id === id),
    [saved]
  );

  const reorderTracks = useCallback((from: number, to: number) => {
    setSaved((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { saved, saveTrack, removeTrack, isSaved, reorderTracks };
}
