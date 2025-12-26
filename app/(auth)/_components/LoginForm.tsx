"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginValues } from "../schema";

export default function LoginForm() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    localStorage.setItem("pathaunow_token", "dummy-token");
    localStorage.setItem("pathaunow_user", JSON.stringify({ email: values.email }));
    router.push("/auth/dashboard");
  }

  return (
    <div className="authCard">
      <div className="authPad">
        <div className="authBadge">Secure Login</div>
        <h1 className="authTitle">Welcome back 👋</h1>
        <p className="authSub">
          Login to track parcels, view delivery updates, and manage your shipments.
        </p>

        <form className="authForm" onSubmit={handleSubmit(onSubmit)}>
          <div className="inputWrap">
            <div className="inputLabel">Email</div>
            <div className="inputBox">
              <span className="inputIcon">✉️</span>
              <input
                className="input"
                type="email"
                placeholder="you@email.com"
                {...register("email")}
              />
            </div>
            {errors.email && <div className="error">{errors.email.message}</div>}
          </div>

          <div className="inputWrap">
            <div className="inputLabel">Password</div>
            <div className="inputBox">
              <span className="inputIcon">🔒</span>
              <input
                className="input"
                type={show ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
              />
              <button
                type="button"
                className="iconBtn"
                onClick={() => setShow((s) => !s)}
                aria-label="Toggle password visibility"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <div className="error">{errors.password.message}</div>}
          </div>

          <button className="authBtn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="authDivider">PathauNow</div>

        <div className="authInfo">
          <div className="authInfoTitle">Why PathauNow?</div>
          <p className="authInfoText">
            A clean and reliable tracking experience—designed for transparency from pickup to delivery.
          </p>

          <div className="authPoints">
            <div className="authPoint"><span>📦</span> <b>Real-time status</b> updates for every shipment</div>
            <div className="authPoint"><span>🚚</span> <b>Clear delivery stages</b> with timeline-ready design</div>
            <div className="authPoint"><span>🔔</span> <b>Updates ready</b> for notifications and alerts</div>
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
    </div>
  );
}
