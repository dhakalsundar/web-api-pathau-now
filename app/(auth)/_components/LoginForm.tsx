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
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    localStorage.setItem("pathaunow_token", "dummy-token");
    localStorage.setItem("pathaunow_user", JSON.stringify({ email: values.email }));

    router.push("/auth/dashboard");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card">
      <h1 className="h1">Login</h1>
      <p className="muted">Welcome back to PathauNow</p>

      <div className="field">
        <label>Email</label>
        <input type="email" placeholder="you@email.com" {...register("email")} />
        {errors.email && <span className="error">{errors.email.message}</span>}
      </div>

      <div className="field">
        <label>Password</label>
        <input type="password" placeholder="    " {...register("password")} />
        {errors.password && <span className="error">{errors.password.message}</span>}
      </div>

      <button className="btn" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </button>

      <p className="muted">
        Don’t have an account? <Link className="link" href="/register">Create one</Link>
      </p>
    </form>
  );
}
