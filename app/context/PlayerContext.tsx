"use client";

import { createContext, useContext, useRef, useState, useEffect, useCallback, RefObject } from "react";
import type { SearchResult } from "../api/search/route";

interface PlayerContextType {
  currentTrack: SearchResult | null;
  playing: boolean;
  loading: boolean;
  currentTime: number;
  duration: number;
  audioRef: RefObject<HTMLAudioElement | null>;
  playTrack: (track: SearchResult) => void;
  togglePlay: () => void;
  seek: (clientX: number, rect: DOMRect) => void;
  clearTrack: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<SearchResult | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const urlCache = useRef(new Map<string, string>());

  const playTrack = useCallback(async (track: SearchResult) => {
    if (currentTrack?.id === track.id) {
      audioRef.current?.paused ? audioRef.current.play() : audioRef.current?.pause();
      return;
    }
    setCurrentTrack(track);
    setLoading(true);
    try {
      let streamUrl = urlCache.current.get(track.id);
      if (!streamUrl) {
        const res = await fetch(`/api/stream?id=${track.id}`);
        const data = await res.json();
        streamUrl = data.url as string;
        urlCache.current.set(track.id, streamUrl);
      }
      if (audioRef.current) {
        audioRef.current.src = streamUrl;
        audioRef.current.play();
      }
    } finally {
      setLoading(false);
    }
  }, [currentTrack]);

  const togglePlay = useCallback(() => {
    audioRef.current?.paused ? audioRef.current.play() : audioRef.current?.pause();
  }, []);

  const seek = useCallback((clientX: number, rect: DOMRect) => {
    if (!audioRef.current || !duration) return;
    audioRef.current.currentTime = ((clientX - rect.left) / rect.width) * duration;
  }, [duration]);

  const clearTrack = useCallback(() => {
    audioRef.current?.pause();
    setCurrentTrack(null);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const updateMediaSession = useCallback(() => {
    if (!currentTrack || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.uploader,
      artwork: [{ src: currentTrack.thumbnail, sizes: "480x360", type: "image/jpeg" }],
    });
    navigator.mediaSession.setActionHandler("play", () => audioRef.current?.play());
    navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause());
  }, [currentTrack]);

  useEffect(() => {
    updateMediaSession();
  }, [updateMediaSession]);

  return (
    <PlayerContext.Provider value={{ currentTrack, playing, loading, currentTime, duration, audioRef, playTrack, togglePlay, seek, clearTrack }}>
      {children}
      <audio
        ref={audioRef}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration ?? 0)}
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
