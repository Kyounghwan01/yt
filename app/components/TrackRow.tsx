import { formatDuration } from "../lib/format";
import { BookmarkIcon } from "./icons";
import type { SearchResult } from "../api/search/route";

type Props = {
  track: SearchResult;
  active: boolean;
  saved: boolean;
  onPlay: () => void;
  onToggleSave: (e: React.MouseEvent) => void;
};

export default function TrackRow({ track, active, saved, onPlay, onToggleSave }: Props) {
  return (
    <div
      className="flex items-center gap-3"
      style={{ padding: "8px 16px", background: active ? "rgba(91,63,255,0.05)" : "transparent", cursor: "pointer" }}
      onClick={onPlay}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={track.thumbnail || undefined}
        alt={track.title}
        className="flex-shrink-0 object-cover"
        style={{ width: 56, height: 42, borderRadius: 8, background: "#E8E6F0" }}
      />

      <div className="flex-1 min-w-0">
        <p
          className="truncate"
          style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3, lineHeight: 1.2, color: active ? "#5B3FFF" : "#141318", margin: 0 }}
        >
          {track.title}
        </p>
        <p className="truncate" style={{ fontSize: 12, color: "#5C5A66", letterSpacing: -0.1, marginTop: 3, marginBottom: 0 }}>
          {track.uploader}
          <span style={{ color: "#9A98A6", margin: "0 4px" }}>·</span>
          <span style={{ color: "#9A98A6" }}>{formatDuration(track.duration)}</span>
        </p>
      </div>

      <button
        onClick={onToggleSave}
        className="flex items-center gap-1 flex-shrink-0"
        style={{
          height: 30, padding: saved ? "0 10px 0 8px" : "0 10px",
          borderRadius: 15,
          border: saved ? "none" : "1px solid rgba(20,19,24,0.08)",
          background: saved ? "#EFEBFF" : "#FFFFFF",
          color: saved ? "#5B3FFF" : "#5C5A66",
          fontSize: 12, fontWeight: 700, letterSpacing: -0.2, cursor: "pointer",
        }}
      >
        <BookmarkIcon filled={saved} size={14} />
        {saved ? "저장됨" : "Save"}
      </button>
    </div>
  );
}
