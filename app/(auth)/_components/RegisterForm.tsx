"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterValues } from "../schema";

export default function RegisterForm() {
  const router = useRouter();
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterValues) {
    localStorage.setItem("pathaunow_token", "dummy-token");
    localStorage.setItem(
      "pathaunow_user",
      JSON.stringify({ fullName: values.fullName, email: values.email, phone: values.phone })
    );
    router.push("/auth/dashboard");
  }

  return (
    <div className="authCard">
      <div className="authPad">
        <div className="authBadge">Create Account</div>
        <h1 className="authTitle">Join PathauNow ✨</h1>
        <p className="authSub">
          Create your account to track deliveries, access your dashboard, and manage shipments smoothly.
        </p>

        <form className="authForm" onSubmit={handleSubmit(onSubmit)}>
          <div className="inputWrap">
            <div className="inputLabel">Full Name</div>
            <div className="inputBox">
              <span className="inputIcon">👤</span>
              <input className="input" placeholder="Sundar Dhakal" {...register("fullName")} />
            </div>
            {errors.fullName && <div className="error">{errors.fullName.message}</div>}
          </div>

          <div className="inputWrap">
            <div className="inputLabel">Email</div>
            <div className="inputBox">
              <span className="inputIcon">✉️</span>
              <input className="input" type="email" placeholder="you@email.com" {...register("email")} />
            </div>
            {errors.email && <div className="error">{errors.email.message}</div>}
          </div>

          <div className="inputWrap">
            <div className="inputLabel">Phone</div>
            <div className="inputBox">
              <span className="inputIcon">📞</span>
              <input className="input" placeholder="98XXXXXXXX" {...register("phone")} />
            </div>
            {errors.phone && <div className="error">{errors.phone.message}</div>}
          </div>

          <div className="inputWrap">
            <div className="inputLabel">Password</div>
            <div className="inputBox">
              <span className="inputIcon">🔒</span>
              <input
                className="input"
                type={show1 ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
              />
              <button type="button" className="iconBtn" onClick={() => setShow1((s) => !s)}>
                {show1 ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <div className="error">{errors.password.message}</div>}
          </div>

          <div className="inputWrap">
            <div className="inputLabel">Confirm Password</div>
            <div className="inputBox">
              <span className="inputIcon">✅</span>
              <input
                className="input"
                type={show2 ? "text" : "password"}
                placeholder="••••••••"
                {...register("confirmPassword")}
              />
              <button type="button" className="iconBtn" onClick={() => setShow2((s) => !s)}>
                {show2 ? "Hide" : "Show"}
              </button>
            </div>
            {errors.confirmPassword && <div className="error">{errors.confirmPassword.message}</div>}
          </div>

          <button className="authBtn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="authDivider">PathauNow</div>

        <div className="authInfo">
          <div className="authInfoTitle">What you get</div>
          <p className="authInfoText">
            A smoother delivery experience—track progress, view shipment history, and get status updates.
          </p>

          <div className="authPoints">
            <div className="authPoint"><span>🕒</span> <b>Track anytime</b> with a simple Tracking ID</div>
            <div className="authPoint"><span>📍</span> <b>Clear stages</b> like pickup, transit, delivered</div>
            <div className="authPoint"><span>📊</span> <b>Your dashboard</b> ready for future features</div>
          </div>
        </div>

        <div className="authFooterLink">
          Already have an account? <Link href="/login">Login</Link>
          <br />
          <Link href="/" style={{ textDecoration: "none", color: "var(--muted)" }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
