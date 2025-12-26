import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pageCenter">
      <div style={{ width: "100%", maxWidth: 460 }}>
        <Link href="/" style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
          <Image src="/logo.png" alt="PathauNow Logo" width={44} height={44} priority />
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>PathauNow</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Auth Portal</div>
          </div>
        </Link>

        {children}

        <p className="small" style={{ marginTop: 12, textAlign: "center" }}>
          © {new Date().getFullYear()} PathauNow
        </p>
      </div>
    </div>
  );
}
