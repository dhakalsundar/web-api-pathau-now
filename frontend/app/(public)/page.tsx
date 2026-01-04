
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container section">
      <div className="hero">
        <div className="heroCard">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Image src="/logo.png" alt="PathauNow" width={54} height={54} priority />
            <div>
              <div className="pill" style={{ display: "inline-flex" }}>Sprint 1 • UI + Zod Validation</div>
            </div>
          </div>

          <h1 className="heroTitle" style={{ marginTop: 14 }}>
            Track your parcel <br /> with confidence.
          </h1>

          <p className="heroText">
            PathauNow helps users track parcels and courier deliveries. This Sprint 1 build includes
            Home, Login, Register, and Dashboard with Zod form validation.
          </p>

          <div className="pills">
            <span className="pill">Fast UI</span>
            <span className="pill">Zod Validation</span>
            <span className="pill">Next.js App Router</span>
            <span className="pill">Component Separation</span>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <Link className="btn btnPrimary" href="/register">Create Account</Link>
            <Link className="btn" href="/login">Login</Link>
            <Link className="btn btnGhost" href="/about">Learn More</Link>
          </div>
        </div>

        <div className="heroCard" style={{ display: "grid", gap: 12 }}>
          <div className="feature">
            <h3>Login / Register</h3>
            <p>Clean forms, field errors, and password match validation with Zod.</p>
          </div>
          <div className="feature">
            <h3>Dashboard (Dummy)</h3>
            <p>After login/register you land on <b>/auth/dashboard</b> (Sprint 1 requirement).</p>
          </div>
          <div className="feature">
            <h3>Next Sprint</h3>
            <p>Connect to real Web API endpoints and implement tracking page.</p>
          </div>
        </div>
      </div>

      <div className="grid3">
        <div className="feature">
          <h3>4+ Routes</h3>
          <p>Home, Login, Register, Dashboard, About.</p>
        </div>
        <div className="feature">
          <h3>UI Like a Website</h3>
          <p>Light theme, orange brand, cards, spacing, responsive.</p>
        </div>
        <div className="feature">
          <h3>Ready for Web API</h3>
          <p>Sprint 2 can plug in POST /login and POST /register easily.</p>
        </div>
      </div>
    </div>
  );
}
