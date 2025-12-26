import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="container" style={{ paddingTop: 18 }}>
      <div className="tile" style={{ borderRadius: 26, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image src="/logo.png" alt="PathauNow" width={54} height={54} priority />
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 950 }}>About PathauNow</h1>
            <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>
              Parcel & courier tracking made simple and transparent.
            </p>
          </div>
        </div>

        <p style={{ marginTop: 14, color: "var(--muted)", lineHeight: 1.7 }}>
          PathauNow helps customers track parcels using a Tracking ID and view delivery progress
          clearly. The platform is designed to connect with a Web API in future sprints to show
          shipment history, delivery stages, and status notifications.
        </p>
      </div>
    </div>
  );
}
