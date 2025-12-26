import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header style={wrap}>
      <div className="container" style={inner}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/logo.png" alt="PathauNow Logo" width={36} height={36} priority />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 900, letterSpacing: 0.3 }}>PathauNow</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Parcel & Courier Tracking</div>
          </div>
        </Link>

        <nav style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Link href="/about" style={linkStyle}>About</Link>
          <Link href="/login" className="btnSecondary">Login</Link>
          <Link href="/register" className="btn">Register</Link>
        </nav>
      </div>
    </header>
  );
}

const wrap: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 20,
  backdropFilter: "blur(10px)",
  background: "rgba(7,12,22,.55)",
  borderBottom: "1px solid rgba(255,255,255,.12)",
};

const inner: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 0",
};

const linkStyle: React.CSSProperties = {
  opacity: 0.9,
};
