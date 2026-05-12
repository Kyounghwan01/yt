"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSavedTracks } from "../hooks/useSavedTracks";
import { usePlayer } from "../context/PlayerContext";
import SortableTrackRow from "../components/SortableTrackRow";
import { BackIcon, DragIcon, PlayIcon, EmptyBookmarkIcon } from "../components/icons";
import type { SearchResult } from "../api/search/route";

export default function SavedPage() {
  const { saved, removeTrack, reorderTracks } = useSavedTracks();
  const { playTrack, currentTrack, audioRef, clearTrack } = usePlayer();

  const savedRef = useRef<SearchResult[]>(saved);
  const currentTrackRef = useRef<SearchResult | null>(currentTrack);
  const playTrackRef = useRef(playTrack);

  useEffect(() => { savedRef.current = saved; }, [saved]);
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
  useEffect(() => { playTrackRef.current = playTrack; }, [playTrack]);

  // Auto-play next track when current ends
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => {
      const list = savedRef.current;
      const cur = currentTrackRef.current;
      if (!cur || list.length === 0) return;
      const next = list[list.findIndex((t) => t.id === cur.id) + 1];
      if (next) playTrackRef.current(next);
    };
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [audioRef]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorderTracks(
      saved.findIndex((t) => t.id === active.id),
      saved.findIndex((t) => t.id === over.id)
    );
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (currentTrack?.id === id) clearTrack();
    removeTrack(id);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAF7" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-1" style={{ padding: "8px 8px 6px", background: "#FAFAF7" }}>
        <Link href="/" style={{ width: 40, height: 40, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
          <BackIcon />
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#141318", letterSpacing: -0.6, margin: 0 }}>보관함</h1>
      </div>

      {/* Hero card */}
      <div style={{ padding: "4px 16px 14px" }}>
        <div style={{ borderRadius: 18, padding: 18, background: "linear-gradient(135deg, #5B3FFF 0%, #FF6F91 100%)", color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.85, letterSpacing: 0.4 }}>저장한 곡</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, letterSpacing: -0.5 }}>{saved.length}곡</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
            {saved.length === 0 ? "아직 저장한 곡이 없어요" : `최근 추가 · ${saved[saved.length - 1]?.uploader}`}
          </div>

          <div style={{ position: "absolute", right: -10, bottom: -10, display: "flex", gap: 4 }}>
            {saved.slice(0, 4).map((t, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={t.id} src={t.thumbnail} alt={t.title} style={{ width: 56, height: 42, borderRadius: 8, objectFit: "cover", marginTop: i * 6, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }} />
            ))}
          </div>

          {saved.length > 0 && (
            <button
              onClick={() => playTrack(saved[0])}
              style={{ marginTop: 14, height: 38, padding: "0 16px", borderRadius: 19, background: "#fff", color: "#5B3FFF", border: "none", fontSize: 13, fontWeight: 700, letterSpacing: -0.2, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <PlayIcon size={14} color="#5B3FFF" /> 전체 재생
            </button>
          )}
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(20,19,24,0.08)", margin: "0 16px" }} />

      {/* Track list */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 92 }}>
        {saved.length === 0 ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: "80px 24px", textAlign: "center" }}>
            <EmptyBookmarkIcon size={56} />
            <p style={{ fontSize: 14, color: "#5C5A66", fontWeight: 600, marginTop: 12, marginBottom: 0 }}>아직 저장한 곡이 없어요</p>
            <p style={{ fontSize: 12, color: "#9A98A6", marginTop: 4, marginBottom: 0 }}>검색 화면에서 Save 버튼으로 추가해 보세요.</p>
            <Link href="/" style={{ marginTop: 16, fontSize: 13, fontWeight: 600, color: "#5B3FFF", textDecoration: "none" }}>검색하러 가기</Link>
          </div>
        ) : (
          <div style={{ paddingTop: 6 }}>
            <div className="flex items-center gap-1" style={{ padding: "4px 16px 6px", fontSize: 11, color: "#9A98A6" }}>
              <DragIcon size={14} /> 길게 눌러서 순서를 바꿀 수 있어요
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={saved.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                {saved.map((track) => (
                  <SortableTrackRow
                    key={track.id}
                    track={track}
                    isActive={currentTrack?.id === track.id}
                    onPlay={() => playTrack(track)}
                    onRemove={(e) => handleRemove(e, track.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>
    </div>
  );
}
