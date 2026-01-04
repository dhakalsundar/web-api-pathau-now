import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="authBg">
      <div className="authTop">
        <Link href="/" className="brand" style={{ gap: 10 }}>
          <Image src="/logo.png" alt="PathauNow" width={42} height={42} priority />
          <div>
            <div className="brandTitle">PathauNow</div>
            <div className="brandSub">Secure portal</div>
          </div>
        </Link>
      </div>

      <div className="authCenter">{children}</div>
    </div>
  );
}
