"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterValues } from "../schema";
import { handleRegister } from "@/lib/actions/auth-action";

export default function RegisterForm() {
  const router = useRouter();

  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterValues) {
    setError("");

    try {
      const result = await handleRegister(values);

      if (!result.success) {
       console.log(result.message);
      }

      startTransition(() => {
        router.push("/login");
      });
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    }
  }

  return (
    <div className="authCard">
      <h1 className="authTitle">Create your account ✨</h1>
      <p className="authSub">
        Register to track shipments, view updates, and manage deliveries easily.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        {error && <div className="error">{error}</div>}

        <div className="field">
          <label>First Name</label>
          <input placeholder="Sundar" {...register("firstName")} />
          {errors.firstName && <div className="error">{errors.firstName.message}</div>}
        </div>

        <div className="field">
          <label>Last Name</label>
          <input placeholder="Dhakal" {...register("lastName")} />
          {errors.lastName && <div className="error">{errors.lastName.message}</div>}
        </div>

        <div className="field">
          <label>Email</label>
          <input type="email" placeholder="you@email.com" {...register("email")} />
          {errors.email && <div className="error">{errors.email.message}</div>}
        </div>

        <div className="field">
          <label>Phone</label>
          <input placeholder="98XXXXXXXX" {...register("phoneNumber")} />
          {errors.phoneNumber && (
            <div className="error">{errors.phoneNumber.message}</div>
          )}
        </div>

        <div className="field">
          <label>Password</label>
          <div className="inputRow">
            <input
              type={show1 ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
            />
            <button type="button" onClick={() => setShow1(!show1)}>
              {show1 ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && <div className="error">{errors.password.message}</div>}
        </div>

        <div className="field">
          <label>Confirm Password</label>
          <div className="inputRow">
            <input
              type={show2 ? "text" : "password"}
              placeholder="••••••••"
              {...register("confirmPassword")}
            />
            <button type="button" onClick={() => setShow2(!show2)}>
              {show2 ? "Hide" : "Show"}
            </button>
          </div>
          {errors.confirmPassword && (
            <div className="error">{errors.confirmPassword.message}</div>
          )}
        </div>

        <button
          className="btn btnPrimary"
          type="submit"
          disabled={isSubmitting || isPending}
        >
          {isSubmitting || isPending ? "Creating..." : "Create Account"}
        </button>
      </form>

      <div className="authFooterLink">
        Already have an account? <Link href="/login">Login</Link>
        <br />
        <Link href="/" style={{ color: "var(--muted)" }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
