import Image from "next/image";
import AdminLoginForm from "../_components/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="container authBg" style={{ paddingTop: 28 }}>
      <div className="hero" style={{ alignItems: "center" }}>
        <div>
          <div className="heroCard">
            <h2 className="heroTitle">Admin Portal</h2>
            <p className="heroText">Monitor shipments, manage couriers and review delivery timelines.</p>
            <div style={{ marginTop: 12 }}>
              <AdminLoginForm />
            </div>
          </div>
        </div>

        <div>
          <div className="heroCard" style={{ textAlign: "center" }}>
            <Image src="/file.svg" alt="Shipments" width={220} height={140} priority />
            <h3 style={{ marginTop: 12, fontWeight: 950 }}>Overview at a glance</h3>
            <p className="heroText">Quick access to recent shipments, active couriers and alerts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
