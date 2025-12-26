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
      router.replace("/login"); // ✅ protected
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
    <div style={dashWrap}>
      <div style={dashCard}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Image src="/logo.png" alt="PathauNow" width={44} height={44} priority />
            <div>
              <div style={{ fontWeight: 900, fontSize: 20 }}>Dashboard</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Welcome to PathauNow</div>
            </div>
          </div>

          <button onClick={logout} style={btnOutline}>Logout</button>
        </div>

        <div style={{ marginTop: 14, padding: 14, borderRadius: 16, border: "1px solid #e6e8ee" }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Your Profile</div>
          <div style={{ color: "#475569" }}><b>Name:</b> {user?.fullName ?? "N/A"}</div>
          <div style={{ color: "#475569" }}><b>Email:</b> {user?.email ?? "N/A"}</div>
          <div style={{ color: "#475569" }}><b>Phone:</b> {user?.phone ?? "N/A"}</div>
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          <button disabled style={btnDisabled}>Track Parcel (Coming Soon)</button>
          <button disabled style={btnDisabled}>Create Shipment (Coming Soon)</button>
        </div>

        <div style={{ marginTop: 12, textAlign: "center" }}>
          <Link href="/" style={{ fontSize: 13, opacity: 0.75 }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

const dashWrap: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: 18,
  background: "linear-gradient(180deg, #fbfbfe, #f4f6fb)",
};

const dashCard: React.CSSProperties = {
  width: "100%",
  maxWidth: 520,
  borderRadius: 22,
  border: "1px solid #e6e8ee",
  background: "#fff",
  padding: 18,
  boxShadow: "0 18px 45px rgba(2,6,23,.10)",
};

const btnOutline: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid #e6e8ee",
  background: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const btnDisabled: React.CSSProperties = {
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid #e6e8ee",
  background: "#f8fafc",
  fontWeight: 900,
  opacity: 0.7,
  cursor: "not-allowed",
};
