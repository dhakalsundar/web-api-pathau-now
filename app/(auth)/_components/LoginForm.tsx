"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginValues } from "../schema";

export default function LoginForm() {
  const router = useRouter();

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
    <form onSubmit={handleSubmit(onSubmit)} className="card">
      <div className="badge">Login • Sprint 1</div>
      <h1 className="h1" style={{ marginTop: 10 }}>Welcome Back</h1>
      <p className="muted">Login to manage your courier tracking.</p>

      <div className="field">
        <label>Email</label>
        <input type="email" placeholder="   " {...register("email")} />
        {errors.email && <div className="error">{errors.email.message}</div>}
      </div>

      <div className="field">
        <label>Password</label>
        <input type="password" placeholder="    " {...register("password")} />
        {errors.password && <div className="error">{errors.password.message}</div>}
      </div>

      <button className="btn" disabled={isSubmitting} style={{ width: "100%", marginTop: 16 }}>
        {isSubmitting ? "Logging in..." : "Login"}
      </button>

      <p className="muted" style={{ marginTop: 12 }}>
        New user? <Link href="/register" style={{ textDecoration: "underline" }}>Create account</Link>
      </p>
    </form>
  );
}
