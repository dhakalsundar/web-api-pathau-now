import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="header">
      <div className="container headerInner">
        <Link href="/" className="brand">
          <Image src="/logo.png" alt="PathauNow" width={38} height={38} priority />
          <div>
            <div className="brandTitle">PathauNow</div>
            <div className="brandSub">Parcel & Courier Tracking</div>
          </div>
        </Link>

        <nav className="nav">
          <Link className="btn btnGhost" href="/about">About</Link>
          <Link className="btn" href="/login">Login</Link>
          <Link className="btn btnPrimary" href="/register">Sign up</Link>
        </nav>
      </div>
    </header>
  );
}
