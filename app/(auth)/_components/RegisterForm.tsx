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
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

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
      <h1 className="authTitle">Create your account ✨</h1>
      <p className="authSub">
        Register to track shipments, view updates, and manage deliveries easily.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="field">
          <label>Full Name</label>
          <input placeholder="Sundar Dhakal" {...register("fullName")} />
          {errors.fullName && <div className="error">{errors.fullName.message}</div>}
        </div>

        <div className="field">
          <label>Email</label>
          <input type="email" placeholder="you@email.com" {...register("email")} />
          {errors.email && <div className="error">{errors.email.message}</div>}
        </div>

        <div className="field">
          <label>Phone</label>
          <input placeholder="98XXXXXXXX" {...register("phone")} />
          {errors.phone && <div className="error">{errors.phone.message}</div>}
        </div>

        <div className="field">
          <label>Password</label>
          <div className="inputRow">
            <input
              style={{ flex: 1 }}
              type={show1 ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
            />
            <button type="button" className="showBtn" onClick={() => setShow1((s) => !s)}>
              {show1 ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && <div className="error">{errors.password.message}</div>}
        </div>

        <div className="field">
          <label>Confirm Password</label>
          <div className="inputRow">
            <input
              style={{ flex: 1 }}
              type={show2 ? "text" : "password"}
              placeholder="••••••••"
              {...register("confirmPassword")}
            />
            <button type="button" className="showBtn" onClick={() => setShow2((s) => !s)}>
              {show2 ? "Hide" : "Show"}
            </button>
          </div>
          {errors.confirmPassword && <div className="error">{errors.confirmPassword.message}</div>}
        </div>

        <button className="btn btnPrimary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Account"}
        </button>
      </form>

      <div className="authInfo">
        <div className="authInfoTitle">What you get with PathauNow</div>
        <p className="authInfoText">
          A user-friendly tracking experience with clear progress and dashboard access.
        </p>
        <div className="authPoints">
          <div className="authPoint">🕒 Track parcels anytime</div>
          <div className="authPoint">📍 Clear delivery stages</div>
          <div className="authPoint">📊 Dashboard ready for shipment history</div>
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
  );
}
