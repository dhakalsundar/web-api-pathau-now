"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterValues } from "../schema";

export default function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterValues) {
    // Sprint 1: dummy register
    localStorage.setItem("pathaunow_token", "dummy-token");
    localStorage.setItem(
      "pathaunow_user",
      JSON.stringify({ fullName: values.fullName, email: values.email, phone: values.phone })
    );
    router.push("/auth/dashboard");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card">
      <div className="badge">Register • Sprint 1</div>
      <h1 className="h1" style={{ marginTop: 10 }}>Create Account</h1>
      <p className="muted">Join PathauNow and start tracking parcels.</p>

      <div className="field">
        <label>Full Name</label>
        <input placeholder="    " {...register("fullName")} />
        {errors.fullName && <div className="error">{errors.fullName.message}</div>}
      </div>

      <div className="field">
        <label>Email</label>
        <input type="email" placeholder="   " {...register("email")} />
        {errors.email && <div className="error">{errors.email.message}</div>}
      </div>

      <div className="field">
        <label>Phone</label>
        <input placeholder="    " {...register("phone")} />
        {errors.phone && <div className="error">{errors.phone.message}</div>}
      </div>

      <div className="grid2">
        <div className="field" style={{ marginTop: 0 }}>
          <label>Password</label>
          <input type="password" placeholder="  " {...register("password")} />
          {errors.password && <div className="error">{errors.password.message}</div>}
        </div>

        <div className="field" style={{ marginTop: 0 }}>
          <label>Confirm</label>
          <input type="password" placeholder="  " {...register("confirmPassword")} />
          {errors.confirmPassword && <div className="error">{errors.confirmPassword.message}</div>}
        </div>
      </div>

      <button className="btn" disabled={isSubmitting} style={{ width: "100%", marginTop: 16 }}>
        {isSubmitting ? "Creating..." : "Create Account"}
      </button>

      <p className="muted" style={{ marginTop: 12 }}>
        Already have an account?{" "}
        <Link href="/login" style={{ textDecoration: "underline" }}>Login</Link>
      </p>
    </form>
  );
}
