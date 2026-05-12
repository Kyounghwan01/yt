import { spawn } from "child_process";
import { copyFileSync, existsSync } from "fs";
import { NextRequest, NextResponse } from "next/server";

function cookiesArgs(): string[] {
  const src = process.env.COOKIES_PATH ?? "/etc/secrets/cookies.txt";
  if (!existsSync(src)) return [];
  const tmp = "/tmp/cookies.txt";
  try { copyFileSync(src, tmp); } catch { return ["--cookies", src]; }
  return ["--cookies", tmp];
}

const cache = new Map<string, { url: string; expiresAt: number }>();

function parseExpiry(url: string): number {
  const match = url.match(/[?&]expire=(\d+)/);
  if (match) {
    return parseInt(match[1], 10) * 1000 - 5 * 60 * 1000;
  }
  return Date.now() + 5 * 60 * 60 * 1000;
}

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get("id");
  if (!videoId) return NextResponse.json({ error: "id required" }, { status: 400 });

  const cached = cache.get(videoId);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ url: cached.url });
  }

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  return new Promise<NextResponse>((resolve) => {
    const ytdlp = spawn("yt-dlp", [
      ...cookiesArgs(),
      "-f", "bestaudio[ext=m4a]/bestaudio/best",
      "--get-url",
      "--no-warnings",
      url,
    ]);

    let audioUrl = "";
    let stderr = "";

    ytdlp.on("error", (err) => {
      console.error("yt-dlp spawn error:", err.message);
      resolve(NextResponse.json({ error: "yt-dlp not found" }, { status: 500 }));
    });

    ytdlp.stdout.on("data", (data: Buffer) => { audioUrl += data.toString(); });
    ytdlp.stderr.on("data", (data: Buffer) => { stderr += data.toString(); });

    ytdlp.on("close", (code) => {
      if (code !== 0 || !audioUrl.trim()) {
        console.error("yt-dlp error:", stderr);
        resolve(NextResponse.json({ error: "Stream fetch failed" }, { status: 500 }));
        return;
      }
      const streamUrl = audioUrl.trim().split("\n")[0];
      cache.set(videoId, { url: streamUrl, expiresAt: parseExpiry(streamUrl) });
      resolve(NextResponse.json({ url: streamUrl }));
    });
  });
}
