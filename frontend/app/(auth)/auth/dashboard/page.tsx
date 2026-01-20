"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { clearAuthCookies, readAuthFromCookies } from "@/lib/cookies";
import { handleTrackCourier, handleTrackParcel } from "@/lib/actions/tracking-action";

type User = { fullName?: string; email?: string; phone?: string } | null;
type TrackMode = "parcel" | "courier";

function safeDate(v: any) {
  if (!v) return "";
  const d = new Date(String(v));
  if (!Number.isNaN(d.getTime())) return d.toLocaleString();
  return String(v);
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User>(null);
  const [mode, setMode] = useState<TrackMode>("parcel");

  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const { token, user } = readAuthFromCookies();
    if (!token) router.replace("/login");
    setUser(user);
  }, [router]);

  const modeLabel = useMemo(() => (mode === "parcel" ? "Parcel" : "Courier"), [mode]);
  const modeEmoji = useMemo(() => (mode === "parcel" ? "📦" : "🚚"), [mode]);

  const status = result?.status || result?.currentStatus || result?.state || "—";
  const displayId = result?.trackingId || trackingId || "—";
  const history = Array.isArray(result?.history) ? result.history : [];

  function logout() {
    clearAuthCookies();
    router.push("/login");
  }

  async function onTrack() {
    const id = trackingId.trim();
    setError("");
    setResult(null);

    if (!id) {
      setError("Please enter a Tracking ID.");
      return;
    }

    setLoading(true);
    try {
      const res = mode === "parcel" ? await handleTrackParcel(id) : await handleTrackCourier(id);

      if (!res.success) {
        setError(res.message || "Tracking failed. Please try again.");
        return;
      }

      setResult(res.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashBg">
      {/* Top Header (same style as your other pages) */}
      <div className="header">
        <div className="container headerInner">
          <div className="brand">
            <Image src="/logo.png" alt="PathauNow" width={38} height={38} priority />
            <div>
              <div className="brandTitle">PathauNow Dashboard</div>
              <div className="brandSub">Parcel & Courier Tracking • Web API Connected</div>
            </div>
          </div>

          <div className="nav">
            <button className="btn btnGhost" onClick={() => router.push("/")}>
              Home
            </button>
            <button className="btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="container">
        <div className="dashHero">
          <div className="dashHeroLeft">
            <div className="dashWelcome">
              <div className="dashAvatar">{(user?.fullName?.[0] || "U").toUpperCase()}</div>
              <div>
                <div className="dashTitle">Welcome, {user?.fullName || "User"} 👋</div>
                <div className="dashSubTitle">
                  Token stored in <b>cookies</b> + auto-attached with Axios interceptor.
                </div>
              </div>
            </div>

            <div className="dashKpis">
              <div className="kpiCard">
                <div className="kpiTop">
                  <span className="kpiIcon">🔒</span>
                  <span className="kpiLabel">Auth</span>
                </div>
                <div className="kpiValue">Connected</div>
                <div className="kpiHint">Register • Login • Token</div>
              </div>

              <div className="kpiCard">
                <div className="kpiTop">
                  <span className="kpiIcon">📦</span>
                  <span className="kpiLabel">Parcel</span>
                </div>
                <div className="kpiValue">Tracking</div>
                <div className="kpiHint">Search by ID</div>
              </div>

              <div className="kpiCard">
                <div className="kpiTop">
                  <span className="kpiIcon">🚚</span>
                  <span className="kpiLabel">Courier</span>
                </div>
                <div className="kpiValue">Tracking</div>
                <div className="kpiHint">Search by ID</div>
              </div>
            </div>
          </div>

          <div className="dashHeroRight">
            <div className="miniCard">
              <div className="miniTitle">Profile</div>
              <div className="miniRow">
                <span className="miniLabel">Name</span>
                <span className="miniValue">{user?.fullName || "N/A"}</span>
              </div>
              <div className="miniRow">
                <span className="miniLabel">Email</span>
                <span className="miniValue">{user?.email || "N/A"}</span>
              </div>
              <div className="miniRow">
                <span className="miniLabel">Phone</span>
                <span className="miniValue">{user?.phone || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking Area */}
        <div className="dashTrackCard">
          <div className="dashTrackHeader">
            <div>
              <div className="dashTrackTitle">
                {modeEmoji} {modeLabel} Tracking
              </div>
              <div className="dashTrackSub">
                Enter Tracking ID to see live delivery status and timeline.
              </div>
            </div>

            <div className="dashTabs">
              <button
                type="button"
                className={`dashTab ${mode === "parcel" ? "active" : ""}`}
                onClick={() => setMode("parcel")}
              >
                📦 Parcel
              </button>
              <button
                type="button"
                className={`dashTab ${mode === "courier" ? "active" : ""}`}
                onClick={() => setMode("courier")}
              >
                🚚 Courier
              </button>
            </div>
          </div>

          <div className="dashTrackBody">
            <div className="dashInputRow">
              <input
                className="dashInput"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder={mode === "parcel" ? "Example: PK-10293" : "Example: CR-44210"}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onTrack();
                }}
              />
              <button className="btn btnPrimary" onClick={onTrack} disabled={loading}>
                {loading ? "Tracking..." : "Track"}
              </button>
            </div>

            {error && <div className="dashAlert">{error}</div>}

            {!error && !result && (
              <div className="dashHint">
                Tip: If backend tracking endpoint is not added yet, you may get <b>404</b>. The UI is ready.
              </div>
            )}

            {/* Result */}
            <div className="dashResult">
              <div className="dashResultTop">
                <div>
                  <div className="dashResultId">Tracking ID: {displayId}</div>
                  <div className="dashResultMeta">
                    Type: <b>{modeLabel}</b>
                  </div>
                </div>

                <div className={`dashStatus ${result ? "ok" : ""}`}>
                  <span className="statusDot" />
                  <span>{status}</span>
                </div>
              </div>

              <div className="dashTimelineTitle">Tracking History</div>

              {!result ? (
                <div className="dashEmpty">
                  <div className="dashEmptyIcon">🔎</div>
                  <div className="dashEmptyText">Enter a Tracking ID to see timeline updates.</div>
                </div>
              ) : history.length === 0 ? (
                <div className="dashEmpty">
                  <div className="dashEmptyIcon">🗂️</div>
                  <div className="dashEmptyText">
                    Backend returned no history.
                    <div className="dashEmptySmall">
                      Recommended response: <code>{`{ trackingId, status, history: [] }`}</code>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="dashTimeline">
                  {history.map((h: any, idx: number) => (
                    <div key={idx} className="timelineItem">
                      <div className="timelineRail">
                        <div className="timelineDot" />
                        <div className="timelineLine" />
                      </div>

                      <div className="timelineCard">
                        <div className="timelineTop">
                          <div className="timelineTitle">{h.stage || h.status || "Update"}</div>
                          <div className="timelineTime">{safeDate(h.time || h.date)}</div>
                        </div>

                        <div className="timelineMeta">
                          {h.location ? `📍 ${h.location}` : "—"}
                        </div>

                        {h.note && <div className="timelineNote">{h.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dashFooter">
          <span className="brandSub">
            Built for Web API Development • Clean UI + Proper API Flow
          </span>
          <Link href="/" className="brandSub" style={{ fontWeight: 900 }}>
            Back to Home →
          </Link>
        </div>
      </div>
    </div>
  );
}
