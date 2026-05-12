"use client";

import { usePlayer } from "../context/PlayerContext";
import { formatDuration } from "../lib/format";
import { PlayIcon, PauseIcon } from "./icons";

export default function Player() {
  const { currentTrack, playing, loading, currentTime, duration, togglePlay, seek } = usePlayer();

  if (!currentTrack) return null;

  const progress = duration ? currentTime / duration : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50" style={{ padding: "0 8px 26px" }}>
      <div
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderRadius: 18,
          border: "1px solid rgba(20,19,24,0.08)",
          boxShadow: "0 12px 30px rgba(20,19,24,0.10)",
          overflow: "hidden",
        }}
      >
        {/* Track row */}
        <div className="flex items-center gap-2.5" style={{ padding: "10px 12px 8px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentTrack.thumbnail || undefined}
            alt={currentTrack.title}
            className="flex-shrink-0 object-cover"
            style={{ width: 44, height: 33, borderRadius: 8 }}
          />
          <div className="flex-1 min-w-0">
            <p className="truncate" style={{ fontSize: 13.5, fontWeight: 700, color: "#141318", letterSpacing: -0.3, lineHeight: 1.2, margin: 0 }}>
              {currentTrack.title}
            </p>
            <p className="truncate" style={{ fontSize: 11, color: "#5C5A66", letterSpacing: -0.1, marginTop: 2, marginBottom: 0 }}>
              {currentTrack.uploader}
            </p>
          </div>
          {loading ? (
            <div
              className="animate-spin flex-shrink-0"
              style={{ width: 40, height: 40, borderRadius: 20, border: "2px solid rgba(20,19,24,0.08)", borderTopColor: "#5B3FFF" }}
            />
          ) : (
            <button
              onClick={togglePlay}
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: 40, height: 40, borderRadius: 20, border: "none", background: "#141318", color: "#fff", cursor: "pointer" }}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
          )}
        </div>

        {/* Progress bar + time */}
        <div style={{ padding: "0 12px 10px" }}>
          <div className="flex items-center gap-2" style={{ fontSize: 11, color: "#9A98A6", fontVariantNumeric: "tabular-nums" }}>
            <span style={{ flexShrink: 0 }}>{formatDuration(Math.floor(currentTime))}</span>
            <div
              onClick={(e) => seek(e.clientX, e.currentTarget.getBoundingClientRect())}
              className="flex-1 relative cursor-pointer"
              style={{ height: 12, display: "flex", alignItems: "center" }}
            >
              <div style={{ position: "absolute", inset: "4px 0", borderRadius: 4, background: "rgba(20,19,24,0.10)" }} />
              <div
                style={{
                  position: "absolute", left: 0, top: 4, bottom: 4,
                  width: `${progress * 100}%`, borderRadius: 4,
                  background: "linear-gradient(90deg, #5B3FFF 0%, #FF6F91 100%)",
                  transition: "width 0.2s linear",
                }}
              />
            </div>
            <span style={{ flexShrink: 0 }}>{formatDuration(Math.floor(duration))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
