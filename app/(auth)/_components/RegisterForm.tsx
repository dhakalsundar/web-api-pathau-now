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
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
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
    <form onSubmit={handleSubmit(onSubmit)} className="card">
      <h1 className="h1">Register</h1>
      <p className="muted">Create your PathauNow account</p>

      <div className="field">
        <label>Full Name</label>
        <input placeholder=" " {...register("fullName")} />
        {errors.fullName && <span className="error">{errors.fullName.message}</span>}
      </div>

      <div className="field">
        <label>Email</label>
        <input type="email" placeholder="   " {...register("email")} />
        {errors.email && <span className="error">{errors.email.message}</span>}
      </div>

      <div className="field">
        <label>Phone</label>
        <input placeholder="    " {...register("phone")} />
        {errors.phone && <span className="error">{errors.phone.message}</span>}
      </div>

      <div className="field">
        <label>Password</label>
        <input type="password" placeholder="••••••••" {...register("password")} />
        {errors.password && <span className="error">{errors.password.message}</span>}
      </div>

      <div className="field">
        <label>Confirm Password</label>
        <input type="password" placeholder="••••••••" {...register("confirmPassword")} />
        {errors.confirmPassword && (
          <span className="error">{errors.confirmPassword.message}</span>
        )}
      </div>

      <button className="btn" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Account"}
      </button>

      <p className="muted">
        Already have an account? <Link className="link" href="/login">Login</Link>
      </p>
    </form>
  );
}
