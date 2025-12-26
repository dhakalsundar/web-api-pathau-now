import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container">
      <div className="splashWrap">
        <div className="splashCard">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Image src="/logo.png" alt="PathauNow" width={64} height={64} priority />
            <span className="badge">Track • Deliver • Trust</span>
          </div>

          <h1 className="splashTitle">Track your parcels with confidence.</h1>
          <p className="splashSub">
            PathauNow is a parcel & courier tracking platform that helps users follow deliveries
            from pickup to final drop-off with clear status updates and a simple dashboard.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            <Link className="btn btnPrimary" href="/login">Login</Link>
            <Link className="btn" href="/register">Create account</Link>
            <Link className="btn btnGhost" href="/about">Learn more</Link>
          </div>

          <div className="quickGrid">
            <div className="tile">
              <h3>📦 Real-time status</h3>
              <p>Clear tracking stages designed for easy understanding.</p>
            </div>
            <div className="tile">
              <h3>🚚 Courier-friendly</h3>
              <p>Built to support pickup, hub, transit and delivery flow.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
