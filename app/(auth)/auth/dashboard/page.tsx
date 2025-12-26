"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = { fullName?: string; email?: string; phone?: string } | null;

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const token = localStorage.getItem("pathaunow_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    const u = localStorage.getItem("pathaunow_user");
    setUser(u ? JSON.parse(u) : null);
  }, [router]);

  function logout() {
    localStorage.removeItem("pathaunow_token");
    localStorage.removeItem("pathaunow_user");
    router.push("/login");
  }

  return (
    <div className="container">
      <div className="dashWrap">
        <div className="dashCard">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Image src="/logo.png" alt="PathauNow" width={44} height={44} priority />
              <div>
                <div style={{ fontWeight: 950, fontSize: 20 }}>Dashboard</div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>Welcome to PathauNow</div>
              </div>
            </div>

            <button className="btn" onClick={logout}>Logout</button>
          </div>

          <div className="dashGrid">
            <div className="tile">
              <h3>Your Profile</h3>
              <p><b>Name:</b> {user?.fullName ?? "N/A"}</p>
              <p><b>Email:</b> {user?.email ?? "N/A"}</p>
              <p><b>Phone:</b> {user?.phone ?? "N/A"}</p>
            </div>

            <div className="tile">
              <h3>Track Parcel</h3>
              <p>Tracking ID search will be connected to Web API next.</p>
              <button className="btn btnGhost" disabled style={{ width: "100%", marginTop: 10, opacity: .6 }}>
                Coming soon
              </button>
            </div>

            <div className="tile">
              <h3>Delivery Updates</h3>
              <p>Status timeline and notifications will be added later.</p>
              <button className="btn btnGhost" disabled style={{ width: "100%", marginTop: 10, opacity: .6 }}>
                Coming soon
              </button>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 14 }}>
            <Link href="/" style={{ color: "var(--muted)" }}>← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
