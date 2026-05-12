"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoIcon, EyeIcon } from "../components/icons";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.replace("/");
    } else {
      setError("비밀번호가 틀렸습니다");
      setPassword("");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ padding: "60px 24px 32px", background: "linear-gradient(180deg, #FAFAF7 0%, #F4EFFF 100%)" }}
    >
      <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 14 }}>
        <LogoIcon size={44} />
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#141318", letterSpacing: -0.8, lineHeight: 1.2, margin: 0 }}>
          좋은 음악으로<br />다시 만나요
        </h1>
        <p style={{ fontSize: 14, color: "#5C5A66", letterSpacing: -0.2, margin: 0 }}>
          비밀번호를 입력해 YT Music에 접속하세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 14 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#5C5A66", fontWeight: 600, letterSpacing: -0.2 }}>비밀번호</span>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#FFFFFF", borderRadius: 14, padding: "0 14px", height: 52,
              border: "1px solid rgba(20,19,24,0.08)",
              boxShadow: "0 1px 0 rgba(20,19,24,0.02)",
            }}
          >
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              autoFocus
              style={{
                flex: 1, height: "100%", border: "none", outline: "none",
                background: "transparent", fontSize: 16, color: "#141318",
                fontFamily: "inherit", letterSpacing: -0.2,
              }}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, display: "flex", color: "#9A98A6" }}
            >
              <EyeIcon open={show} />
            </button>
          </div>
        </label>

        {error && (
          <p style={{ fontSize: 12, color: "#FF4B5C", paddingLeft: 4, margin: 0 }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          style={{
            marginTop: 8, height: 54, borderRadius: 14, border: "none",
            background: password && !loading ? "#5B3FFF" : "#C9C3E0",
            color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: -0.2,
            cursor: password && !loading ? "pointer" : "default",
            boxShadow: password && !loading ? "0 8px 22px rgba(91,63,255,0.28)" : "none",
            transition: "all 0.18s",
          }}
        >
          {loading ? "확인 중…" : "입장"}
        </button>
      </form>
    </div>
  );
}
