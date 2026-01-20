"use client";

import { login, register } from "../api/auth";

export async function handleRegister(registrationData: any) {
  try {
    const result = await register(registrationData);

    if (result.success) {
      return { success: true, message: result.message || "Registration successful", data: result.data };
    }

    return { success: false, message: result.message || "Registration failed" };
  } catch (error: any) {
    return { success: false, message: error.message || "Registration failed" };
  }
}

export async function handleLogin(loginData: any) {
  try {
    const result = await login(loginData);
    
    if (result.success) {
      return {
        success: true,
        message: result.message || "Login successful",
        data: result.data,
        token: result.token,
      };
    }

    return { success: false, message: result.message || "Login failed" };
  } catch (error: any) {
    return { success: false, message: error.message || "Login failed" };
  }
}
