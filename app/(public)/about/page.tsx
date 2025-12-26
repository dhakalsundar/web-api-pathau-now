import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="container section">
      <div className="card">
        <div className="cardPad">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Image src="/logo.png" alt="PathauNow" width={54} height={54} priority />
            <div>
              <h1 style={{ margin: 0, fontSize: 28, letterSpacing: "-.2px" }}>About PathauNow</h1>
              <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>
                Parcel & courier tracking platform
              </p>
            </div>
          </div>

          <hr className="hr" />

          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            <b>PathauNow</b> is built to make parcel delivery transparent and easy.
            Customers can track shipments using a Tracking ID and view real-time delivery status updates.
            For courier operations, it supports a structured delivery flow such as pickup, hub processing,
            transit updates, and delivery confirmation.
          </p>

          <div className="grid3" style={{ marginTop: 14 }}>
            <div className="feature">
              <h3>Mission</h3>
              <p>Make deliveries simple, visible, and reliable for everyone.</p>
            </div>
            <div className="feature">
              <h3>What users get</h3>
              <p>Tracking, status timeline, and a clean dashboard experience.</p>
            </div>
            <div className="feature">
              <h3>Future scope</h3>
              <p>Notifications, rider updates, admin tools, and analytics.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
