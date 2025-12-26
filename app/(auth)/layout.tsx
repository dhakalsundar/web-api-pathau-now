import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="authBg">
      <div className="authTop">
        <Link href="/" className="authBrand">
          <Image src="/logo.png" alt="PathauNow" width={42} height={42} priority />
          <div>
            <div className="authBrandTitle">PathauNow</div>
            <div className="authBrandSub">Track parcels. Deliver with trust.</div>
          </div>
        </Link>
      </div>

      <div className="authCenter">{children}</div>
    </div>
  );
}
