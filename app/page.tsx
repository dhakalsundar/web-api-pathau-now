import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="pageCenter">
      <div className="cardWide">
        <div className="space">
          <div className="badge">Sprint 1 • Web API Frontend (UI)</div>
          <div className="badge">PathauNow</div>
        </div>

        <div style={{ marginTop: 14 }} className="row">
          <Image src="/logo.png" alt="PathauNow Logo" width={72} height={72} priority />
          <div>
            <h1 className="h1">Track parcels. Deliver faster.</h1>
            <p className="muted">
              PathauNow is a courier tracking platform. This Sprint 1 build includes
              required pages and Zod-validated forms (UI only).
            </p>
          </div>
        </div>

        <div className="btnRow">
          <Link className="btn" href="/register">Get Started</Link>
          <Link className="btnSecondary" href="/login">Login</Link>
          <Link className="btnGhost" href="/about">Learn More</Link>
        </div>

        <hr className="hr" />

        <div className="grid2">
          <div className="mini">
            <h2 className="h2">Easy Login/Register</h2>
            <p className="muted">Validated forms using Zod + React Hook Form.</p>
          </div>
          <div className="mini">
            <h2 className="h2">Dashboard (Dummy)</h2>
            <p className="muted">Redirect after login/register to /auth/dashboard.</p>
          </div>
        </div>

        <p className="small" style={{ marginTop: 14 }}>
          Note: Sprint 1 uses a dummy token in localStorage. Sprint 2 will connect real Web APIs.
        </p>
      </div>
    </div>
  );
}
