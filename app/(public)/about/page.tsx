import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="pageCenter">
      <div className="cardWide">
        <div className="row">
          <Image src="/logo.png" alt="PathauNow Logo" width={52} height={52} priority />
          <div>
            <h1 className="h1">About PathauNow</h1>
            <p className="muted">
              PathauNow is a parcel & courier tracking system. Sprint 1 focuses on
              frontend pages and form validation using Zod.
            </p>
          </div>
        </div>

        <hr className="hr" />

        <div className="grid2">
          <div className="mini">
            <h2 className="h2">Sprint 1</h2>
            <p className="muted">
              Home, Login, Register, Dashboard routes + UI + Zod validation.
            </p>
          </div>
          <div className="mini">
            <h2 className="h2">Next Sprint</h2>
            <p className="muted">
              Connect login/register to Web API endpoints and build tracking features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
