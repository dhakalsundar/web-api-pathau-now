"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/lib/services";
import { setAuthCookies } from "@/lib/cookies";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin123!");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authService.login(email, password);
      console.log("Login result:", result);

      // Check if user is admin
      if (result.user?.role !== 'ADMIN') {
        setError("Access denied. Admin privileges required.");
        setLoading(false);
        return;
      }

      if (result.tokens?.accessToken && result.user) {
        setAuthCookies(result.tokens.accessToken, result.user);
      }

      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
      setLoading(false);
    }
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
      <p className="authSub">Sign in with your admin account to access the dashboard.</p>

      <form onSubmit={submit} aria-live="polite">
        {error && <div className="error" role="alert">{error}</div>}

        <div className="field">
          <label htmlFor="admin-email">Email</label>
          <input 
            id="admin-email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="admin@example.com"
            disabled={loading}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="admin-password">Password</label>
          <div className="inputRow">
            <input
              id="admin-password"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              required
            />
            <button 
              type="button" 
              className="showBtn" 
              onClick={() => setShow((s) => !s)} 
              aria-label="Toggle password"
              disabled={loading}
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button 
            className="btn btnPrimary" 
            type="submit"
            disabled={loading}
          >
            {loading ? " Signing in..." : " Sign in"}
          </button>
          <button 
            type="button" 
            className="btn" 
            onClick={() => { 
              setEmail("admin@example.com"); 
              setPassword("Admin123!"); 
            }}
            disabled={loading}
          >
            Autofill
          </button>
        </div>

        <div className="authInfo" style={{ marginTop: 12 }}>
          <div className="authInfoTitle">Default Admin Credentials</div>
          <p className="authInfoText">
            Email: <b>admin@example.com</b><br/>
            Password: <b>Admin123!</b><br/>
            <small style={{ marginTop: 6, display: "block", color: "#999" }}>Change these credentials after first login in production.</small>
          </p>
        </div>
      </form>
    </div>
  );
}
