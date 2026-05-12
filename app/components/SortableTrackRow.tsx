import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDuration } from "../lib/format";
import { DragIcon, TrashIcon } from "./icons";
import type { SearchResult } from "../api/search/route";

type Props = {
  track: SearchResult;
  isActive: boolean;
  onPlay: () => void;
  onRemove: (e: React.MouseEvent) => void;
};

export default function SortableTrackRow({ track, isActive, onPlay, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: track.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        display: "flex", alignItems: "center", gap: 12,
        padding: "8px 16px",
        background: isActive ? "rgba(91,63,255,0.05)" : "transparent",
        cursor: "pointer",
      }}
      onClick={onPlay}
    >
      <button
        {...attributes}
        {...listeners}
        style={{ flexShrink: 0, background: "transparent", border: "none", cursor: "grab", padding: 0, display: "flex", marginLeft: -6 }}
        aria-label="드래그하여 순서 변경"
      >
        <DragIcon />
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={track.thumbnail || undefined}
        alt={track.title}
        className="flex-shrink-0 object-cover"
        style={{ width: 52, height: 40, borderRadius: 8, background: "#E8E6F0" }}
      />

      <div className="flex-1 min-w-0">
        <p
          className="truncate"
          style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3, lineHeight: 1.2, color: isActive ? "#5B3FFF" : "#141318", margin: 0 }}
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
        onClick={onRemove}
        style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer" }}
        title="삭제"
      >
        <TrashIcon />
      </button>
    </div>
  );
}
