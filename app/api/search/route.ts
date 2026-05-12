import { spawn } from "child_process";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 10;

export interface SearchResult {
  id: string;
  title: string;
  duration: number;
  thumbnail: string;
  uploader: string;
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1", 10));

  if (!query) return NextResponse.json({ error: "query required" }, { status: 400 });

  const total = page * PAGE_SIZE;
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = page * PAGE_SIZE;

  return new Promise<NextResponse>((resolve) => {
    let settled = false;
    const settle = (v: NextResponse) => {
      if (!settled) { settled = true; resolve(v); }
    };

    const ytdlp = spawn("yt-dlp", [
      `ytsearch${total}:${query}`,
      "--print", "%(id)s|%(title)s|%(duration)s|%(thumbnail)s|%(uploader)s",
      "--no-download",
      "--no-warnings",
      "--flat-playlist",
      "--playlist-items", `${start}:${end}`,
      "--socket-timeout", "10",
    ]);

    const timer = setTimeout(() => {
      ytdlp.kill();
      settle(NextResponse.json({ error: "Search timeout" }, { status: 504 }));
    }, 40000);

    let stdout = "";
    let stderr = "";

    ytdlp.stdout.on("data", (data: Buffer) => { stdout += data.toString(); });
    ytdlp.stderr.on("data", (data: Buffer) => { stderr += data.toString(); });

    ytdlp.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0 && code !== null) {
        console.error("yt-dlp error:", stderr);
        settle(NextResponse.json({ error: "Search failed" }, { status: 500 }));
        return;
      }

      const results: SearchResult[] = stdout
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [id, title, duration, thumbnail, uploader] = line.split("|");
          return { id, title, duration: parseInt(duration) || 0, thumbnail, uploader };
        });

      settle(NextResponse.json(results));
    });
  });
}
