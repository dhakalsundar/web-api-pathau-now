"use client";

import Image from "next/image";
import Link from "next/link";

export default function SplashHome() {
  return (
    <div style={wrap}>
      <div style={glow1} />
      <div style={glow2} />

      <div style={card}>
        <div style={{ display: "grid", placeItems: "center", gap: 14 }}>
          <Image src="/logo.png" alt="PathauNow" width={110} height={110} priority />
          <div style={{ textAlign: "center" }}>
            <h1 style={title}>PathauNow</h1>
            <p style={sub}>
              Parcel & Courier Tracking made simple.
              <br />
              Track deliveries with confidence.
            </p>
          </div>

          <div style={{ width: "100%", display: "grid", gap: 10, marginTop: 10 }}>
            <Link href="/login" style={btnPrimary}>Login</Link>
            <Link href="/register" style={btnSecondary}>Create Account</Link>
          </div>

          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
            Powered by PathauNow • Fast • Reliable • Secure
          </div>
        </div>
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: 18,
  background:
    "radial-gradient(900px 520px at 20% 10%, rgba(245,124,0,.22), transparent 60%)," +
    "radial-gradient(850px 480px at 80% 0%, rgba(255,183,77,.20), transparent 60%)," +
    "linear-gradient(180deg, #0b1220, #101a33)",
  color: "#eef2ff",
  position: "relative",
  overflow: "hidden",
};

const glow1: React.CSSProperties = {
  position: "absolute",
  inset: -50,
  background: "radial-gradient(circle at 30% 25%, rgba(245,124,0,.24), transparent 45%)",
  filter: "blur(8px)",
  pointerEvents: "none",
};

const glow2: React.CSSProperties = {
  position: "absolute",
  inset: -50,
  background: "radial-gradient(circle at 75% 10%, rgba(76,110,245,.18), transparent 48%)",
  filter: "blur(8px)",
  pointerEvents: "none",
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  borderRadius: 24,
  padding: 22,
  border: "1px solid rgba(255,255,255,.14)",
  background: "linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.05))",
  boxShadow: "0 24px 70px rgba(0,0,0,.45)",
  zIndex: 2,
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 34,
  letterSpacing: 0.3,
  fontWeight: 900,
};

const sub: React.CSSProperties = {
  margin: "8px 0 0",
  opacity: 0.8,
  lineHeight: 1.55,
};

const btnPrimary: React.CSSProperties = {
  textAlign: "center",
  padding: "12px 14px",
  borderRadius: 14,
  fontWeight: 900,
  color: "#111",
  background: "linear-gradient(180deg, #ffb74d, #f57c00)",
  border: "0",
};

const btnSecondary: React.CSSProperties = {
  textAlign: "center",
  padding: "12px 14px",
  borderRadius: 14,
  fontWeight: 900,
  color: "#eef2ff",
  background: "transparent",
  border: "1px solid rgba(255,255,255,.18)",
};
