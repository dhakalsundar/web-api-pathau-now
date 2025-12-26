import Link from "next/link";

export default function HomePage() {
  return (
    <div className="page">
      <div className="card">
        <h1 className="h1">PathauNow</h1>
        <p className="muted">
          Parcel & courier tracking system (Sprint 1 dummy home).
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <Link className="btn" href="/login">Login</Link>
          <Link className="btn secondary" href="/register">Register</Link>
          <Link className="btn ghost" href="/about">About</Link>
        </div>
      </div>
    </div>
  );
}
