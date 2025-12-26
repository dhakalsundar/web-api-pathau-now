"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="pageCenter">
      <div className="cardWide">
        <div className="space">
          <div className="row">
            <Image src="/logo.png" alt="PathauNow Logo" width={54} height={54} priority />
            <div>
              <h1 className="h1">Dashboard</h1>
              <p className="muted" style={{ margin: 0 }}>
                Dummy dashboard (Sprint 1)
              </p>
            </div>
          </div>

          <button className="btnSecondary" onClick={logout}>Logout</button>
        </div>

        <hr className="hr" />

        <div className="grid2">
          <div className="mini">
            <h2 className="h2">User Profile</h2>
            <p className="muted"><b>Name:</b> {user?.fullName ?? "N/A"}</p>
            <p className="muted"><b>Email:</b> {user?.email ?? "N/A"}</p>
            <p className="muted"><b>Phone:</b> {user?.phone ?? "N/A"}</p>
          </div>

          <div className="mini">
            <h2 className="h2">Quick Actions</h2>
            <p className="muted">Tracking feature will be added in Sprint 2.</p>

            <div className="btnRow">
              <Link className="btnGhost" href="/">Go Home</Link>
              <Link className="btnSecondary" href="/about">About</Link>
            </div>
          </div>
        </div>

        <p className="small" style={{ marginTop: 14 }}>
          Sprint 1 uses localStorage to simulate login. In Sprint 2 you will connect real Web API login/register.
        </p>
      </div>
    </div>
  );
}
