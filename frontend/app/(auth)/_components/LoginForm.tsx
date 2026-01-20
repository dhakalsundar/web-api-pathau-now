"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginValues } from "../schema";
import { handleLogin } from "@/lib/actions/auth-action";
import { setAuthCookies } from "@/lib/cookies";


export default function LoginForm() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginValues) {
    setError("");

    const result = await handleLogin(values);

    if (!result.success) {
      setError(result.message || "Login failed");
      return;
    }

    setAuthCookies(result.token, result.data);
    router.push("/auth/dashboard");
    

  }

  return (
    <div className="authCard">
      <h1 className="authTitle">Welcome back 👋</h1>
      <p className="authSub">
        Login to track parcels, view delivery updates, and access your dashboard.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        {error && <div className="error">{error}</div>}

        <div className="field">
          <label>Email</label>
          <input type="email" placeholder="you@email.com" {...register("email")} />
          {errors.email && <div className="error">{errors.email.message}</div>}
        </div>

        <div className="field">
          <label>Password</label>
          <div className="inputRow">
            <input
              style={{ flex: 1 }}
              type={show ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
            />
            <button
              type="button"
              className="showBtn"
              onClick={() => setShow((s) => !s)}
              aria-label="Toggle password"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && <div className="error">{errors.password.message}</div>}
        </div>

        <button className="btn btnPrimary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="authInfo">
        <div className="authInfoTitle">Why PathauNow?</div>
        <p className="authInfoText">
          Transparent parcel tracking—from pickup to delivery—built with a clean, simple experience.
        </p>
        <div className="authPoints">
          <div className="authPoint">📦 Real-time status updates</div>
          <div className="authPoint">🚚 Clear delivery stages</div>
          <div className="authPoint">🔒 Secure dashboard access</div>
        </div>
      </div>

      <div className="authFooterLink">
        Don’t have an account? <Link href="/register">Sign up</Link>
        <br />
        <Link href="/" style={{ textDecoration: "none", color: "var(--muted)" }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
