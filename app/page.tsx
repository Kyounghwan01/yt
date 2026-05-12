"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import type { SearchResult } from "./api/search/route";
import { useSavedTracks } from "./hooks/useSavedTracks";
import { usePlayer } from "./context/PlayerContext";
import TrackRow from "./components/TrackRow";
import { LogoIcon, SearchIcon, CloseIcon, LibraryIcon } from "./components/icons";

const PAGE_SIZE = 10;

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const pageRef = useRef(1);
  const activeQueryRef = useRef("");
  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { playTrack, currentTrack } = usePlayer();
  const { saveTrack, removeTrack, isSaved } = useSavedTracks();

  const fetchPage = useCallback(async (q: string, page: number): Promise<SearchResult[]> => {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&page=${page}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }, []);

  const search = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    activeQueryRef.current = q;
    pageRef.current = 1;
    setSearching(true);
    setHasMore(false);
    setResults([]);

    try {
      const items = await fetchPage(q, 1);
      if (activeQueryRef.current !== q) return;
      setResults(items);
      setHasMore(items.length >= PAGE_SIZE);
    } catch {
      if (activeQueryRef.current === q) setResults([]);
    } finally {
      if (activeQueryRef.current === q) setSearching(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore) return;
    const q = activeQueryRef.current;
    if (!q) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;

    try {
      const items = await fetchPage(q, nextPage);
      if (activeQueryRef.current !== q) return;
      pageRef.current = nextPage;
      setResults((prev) => {
        const seen = new Set(prev.map((t) => t.id));
        return [...prev, ...items.filter((t) => !seen.has(t.id))];
      });
      setHasMore(items.length >= PAGE_SIZE);
    } catch {
      // keep existing results on error
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, fetchPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAF7" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10"
        style={{ background: "#FAFAF7", borderBottom: "1px solid rgba(20,19,24,0.08)", paddingTop: 8, paddingBottom: 8 }}
      >
        <div className="flex items-center justify-between" style={{ padding: "0 16px 10px" }}>
          <div className="flex items-center gap-2">
            <LogoIcon size={28} />
            <span style={{ fontSize: 20, fontWeight: 800, color: "#141318", letterSpacing: -0.6 }}>YT Music</span>
          </div>
          <Link
            href="/saved"
            className="flex items-center gap-1.5"
            style={{ border: "1px solid rgba(20,19,24,0.08)", borderRadius: 18, padding: "7px 12px", fontSize: 13, fontWeight: 600, color: "#141318", letterSpacing: -0.2, textDecoration: "none" }}
          >
            <LibraryIcon size={16} />
            보관함
          </Link>
        </div>

        <form onSubmit={search} className="flex gap-2" style={{ padding: "0 16px" }}>
          <div
            className="flex-1 flex items-center gap-2"
            style={{ background: "#FFFFFF", borderRadius: 12, padding: "0 12px", height: 42, border: "1px solid rgba(20,19,24,0.08)" }}
          >
            <SearchIcon size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="곡, 아티스트 검색 (예: 박효신)"
              style={{ flex: 1, height: "100%", border: "none", outline: "none", background: "transparent", fontSize: 14, color: "#141318", fontFamily: "inherit", letterSpacing: -0.2 }}
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                <CloseIcon size={16} />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={searching}
            style={{ height: 42, padding: "0 16px", borderRadius: 12, border: "none", background: "#141318", color: "#fff", fontSize: 13, fontWeight: 600, letterSpacing: -0.2, cursor: searching ? "default" : "pointer", opacity: searching ? 0.5 : 1 }}
          >
            {searching ? "검색중" : "검색"}
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 92 }}>
        {searching && (
          <div className="flex flex-col items-center justify-center" style={{ height: 240, gap: 12 }}>
            <div className="animate-spin" style={{ width: 28, height: 28, borderRadius: 14, border: "2px solid rgba(20,19,24,0.08)", borderTopColor: "#5B3FFF" }} />
            <p style={{ color: "#9A98A6", fontSize: 13, margin: 0 }}>YouTube 검색 중… (10~20초 소요)</p>
          </div>
        )}

        {!searching && results.length === 0 && (
          <div className="flex flex-col items-center justify-center" style={{ height: 240, gap: 8 }}>
            <SearchIcon size={40} color="#9A98A6" />
            <p style={{ color: "#9A98A6", fontSize: 13, margin: 0 }}>검색어를 입력해 음악을 찾아보세요</p>
          </div>
        )}

        {!searching && results.length > 0 && (
          <div className="flex items-baseline justify-between" style={{ padding: "14px 16px 6px" }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#141318", letterSpacing: -0.4 }}>검색 결과</span>
            <span style={{ fontSize: 12, color: "#9A98A6" }}>{results.length}건</span>
          </div>
        )}

        {!searching && results.map((track) => (
          <TrackRow
            key={track.id}
            track={track}
            active={currentTrack?.id === track.id}
            saved={isSaved(track.id)}
            onPlay={() => playTrack(track)}
            onToggleSave={(e) => { e.stopPropagation(); if (isSaved(track.id)) removeTrack(track.id); else saveTrack(track); }}
          />
        ))}

        <div ref={sentinelRef} className="flex items-center justify-center" style={{ padding: "20px 0" }}>
          {loadingMore && (
            <div className="flex items-center gap-1.5" style={{ color: "#9A98A6", fontSize: 12 }}>
              <div className="animate-spin" style={{ width: 14, height: 14, borderRadius: 7, border: "2px solid rgba(20,19,24,0.08)", borderTopColor: "#5B3FFF" }} />
              불러오는 중…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
