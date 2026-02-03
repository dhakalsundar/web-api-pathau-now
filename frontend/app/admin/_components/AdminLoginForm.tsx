"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("123456");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Development-only fixed admin credentials (insecure for production)
    if (email === "admin@gmail.com" && password === "123456") {
      try {
        // Mark the session as admin
        localStorage.setItem("isAdmin", "true");
        router.push("/admin/dashboard");
      } catch (err) {
        setError("Unable to sign in — please allow local storage.");
      }
      return;
    }

    setError("Invalid admin credentials. Use admin@gmail.com / 123456");
  }

  return (
    <div className="authCard adminAuthCard">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <Image src="/logo.png" alt="PathauNow" width={40} height={40} priority />
        <div>
          <div className="brandTitle">PathauNow Admin</div>
          <div className="brandSub" style={{ marginTop: 2 }}>Admin Portal — Courier Operations</div>
        </div>
      </div>

      <h1 className="authTitle">Admin Sign in</h1>
      <p className="authSub">Use admin@gmail.com and password <b>123456</b> to sign in (dev only).</p>

      <form onSubmit={submit} aria-live="polite">
        {error && <div className="error" role="alert">{error}</div>}

        <div className="field">
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="admin-password">Password</label>
          <div className="inputRow">
            <input
              id="admin-password"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="showBtn" onClick={() => setShow((s) => !s)} aria-label="Toggle password">
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button className="btn btnPrimary" type="submit">🔐 Sign in</button>
          <button type="button" className="btn" onClick={() => { setEmail("admin@gmail.com"); setPassword("123456"); }}>
            Autofill
          </button>
        </div>

        <div className="authInfo" style={{ marginTop: 12 }}>
          <div className="authInfoTitle">Note</div>
          <p className="authInfoText">This admin login uses a fixed development credential. Do not use in production.</p>
        </div>
      </form>
    </div>
  );
}
